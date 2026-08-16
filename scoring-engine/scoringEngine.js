const fs = require('fs');

// ---------- CSV helper ----------
function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim().split('\n');

  const headers = raw[0].split(',').map(h => h.trim());

  return raw.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = values[i] ? values[i].trim() : '';
    });

    return obj;
  });
}


// ---------- Build entity map from Entities.csv ----------
function buildEntityMap(entityRows) {

  const entityMap = {};

  entityRows.forEach(row => {

    if (!row.entity_id) {
      return;
    }

    entityMap[row.entity_id] = {

      label: row.label || `Entity ${row.entity_id}`,

      phone: row.phone || '',

      account: row.account || '',

      handle: row.handle || '',

      knownSuspect:
        String(row.known_suspect).toLowerCase() === 'true'

    };

  });

  return entityMap;
}


// ---------- Fraud window ----------
const FRAUD_WINDOW = {
  start: new Date('2026-08-14T08:00:00'),
  end: new Date('2026-08-14T12:00:00'),
};


function inWindow(ts) {

  const t = new Date(
    ts.replace(' ', 'T')
  );

  return t >= FRAUD_WINDOW.start &&
         t <= FRAUD_WINDOW.end;
}


// ---------- Scoring weights ----------
const WEIGHTS = {
  financial: 0.25,
  communication: 0.20,
  crossSource: 0.20,
  temporal: 0.20,
  centrality: 0.15,
};


// ---------- Main scoring function ----------
function computeLeads({
  cdrRows,
  bankRows,
  socialRows,
  entityMap
}) {

  const ids = Object.keys(entityMap);


  const accountToId = {};
  const phoneToId = {};

  ids.forEach(id => {
    accountToId[entityMap[id].account] = id;
    phoneToId[entityMap[id].phone] = id;
  });


  const results = ids.map(id => {

    const e = entityMap[id];

    const reasons = [];


    // =====================================================
    // 1. FINANCIAL ANOMALY
    // =====================================================

    const inboundInWindow = bankRows.filter(
      t =>
        t.to_account === e.account &&
        inWindow(t.timestamp)
    );


    const totalInWindow = inboundInWindow.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );


    // ₹20 lakh = maximum financial score
    const financial = Math.min(
      1,
      totalInWindow / 2000000
    );


    if (totalInWindow > 0) {
      reasons.push(
        `Received ₹${(
          totalInWindow / 100000
        ).toFixed(1)}L within the fraud window`
      );
    }


    // =====================================================
    // 2. COMMUNICATION STRENGTH
    // =====================================================

    const windowCalls = cdrRows.filter(
      c =>
        (
          c.caller === e.phone ||
          c.receiver === e.phone
        ) &&
        inWindow(c.timestamp)
    );


    const baselineCalls = cdrRows.filter(
      c =>
        (
          c.caller === e.phone ||
          c.receiver === e.phone
        ) &&
        !inWindow(c.timestamp)
    );


    const spikeRatio =
      windowCalls.length /
      (baselineCalls.length + 1);


    const communication =
      Math.min(
        1,
        spikeRatio / 3
      );


    if (windowCalls.length >= 1) {
      reasons.push(
        `${windowCalls.length} calls during the fraud window`
      );
    }


    // =====================================================
    // 3. CROSS-SOURCE EVIDENCE
    // =====================================================

    const socialInWindow = socialRows.filter(
      s =>
        s.handle === e.handle &&
        inWindow(s.timestamp)
    );


    let sourcesHit = 0;


    if (inboundInWindow.length > 0) {
      sourcesHit++;
    }


    if (windowCalls.length > 0) {
      sourcesHit++;
    }


    if (socialInWindow.length > 0) {
      sourcesHit++;
    }


    let crossSource = sourcesHit / 3;


    // ---------- Shared device detection ----------

    const myDevices = socialRows
      .filter(
        s => s.handle === e.handle
      )
      .map(
        s => s.device_id
      );


    const sharesDevice = socialRows.some(
      s =>
        s.handle !== e.handle &&
        myDevices.includes(s.device_id) &&
        ids.some(
          o =>
            entityMap[o].handle === s.handle
        )
    );


    if (sharesDevice) {

      crossSource = Math.min(
        1,
        crossSource + 0.34
      );


      reasons.push(
        'Shares a device fingerprint with another case entity'
      );
    }


    // =====================================================
    // 4. TEMPORAL CORRELATION
    // =====================================================

    const allBank = bankRows.filter(
      t =>
        t.to_account === e.account ||
        t.from_account === e.account
    );


    const allSocial = socialRows.filter(
      s =>
        s.handle === e.handle
    );


    const allCalls = cdrRows.filter(
      c =>
        c.caller === e.phone ||
        c.receiver === e.phone
    );


    const totalActivity =
      allBank.length +
      allSocial.length +
      allCalls.length;


    const outboundInWindow = bankRows.filter(
      t =>
        t.from_account === e.account &&
        inWindow(t.timestamp)
    ).length;


    const windowActivity =
      inboundInWindow.length +
      outboundInWindow +
      socialInWindow.length +
      windowCalls.length;


    const temporal =
      totalActivity
        ? windowActivity / totalActivity
        : 0;


    if (
      totalActivity > 0 &&
      temporal < 0.3
    ) {
      reasons.push(
        'Most activity falls outside the fraud window — likely unrelated'
      );
    }


    // =====================================================
    // 5. NETWORK CENTRALITY
    // =====================================================

    const connectedIds = new Set();


    // ---------- Bank connections ----------

    bankRows.forEach(t => {

      if (
        t.from_account === e.account &&
        accountToId[t.to_account] &&
        accountToId[t.to_account] !== id
      ) {

        connectedIds.add(
          accountToId[t.to_account]
        );
      }


      if (
        t.to_account === e.account &&
        accountToId[t.from_account] &&
        accountToId[t.from_account] !== id
      ) {

        connectedIds.add(
          accountToId[t.from_account]
        );
      }

    });


    // ---------- CDR connections ----------

    cdrRows.forEach(c => {

      if (
        c.caller === e.phone &&
        phoneToId[c.receiver] &&
        phoneToId[c.receiver] !== id
      ) {

        connectedIds.add(
          phoneToId[c.receiver]
        );
      }


      if (
        c.receiver === e.phone &&
        phoneToId[c.caller] &&
        phoneToId[c.caller] !== id
      ) {

        connectedIds.add(
          phoneToId[c.caller]
        );
      }

    });


    const maxPossible =
      ids.length - 1;


    const centrality =
      maxPossible > 0
        ? Math.min(
            1,
            connectedIds.size / maxPossible
          )
        : 0;


    if (connectedIds.size >= 2) {
      reasons.push(
        `Directly connects ${connectedIds.size} other case entities`
      );
    }


    // =====================================================
    // FINAL WEIGHTED SCORE
    // =====================================================

    let rawScore =
      WEIGHTS.financial * financial +
      WEIGHTS.communication * communication +
      WEIGHTS.crossSource * crossSource +
      WEIGHTS.temporal * temporal +
      WEIGHTS.centrality * centrality;


    // =====================================================
    // KNOWN SUSPECT DISCOUNT
    // =====================================================

    if (e.knownSuspect) {

      rawScore *= 0.5;


      reasons.push(
        'Already known to investigators — deprioritized to surface new leads'
      );
    }


    // =====================================================
    // RESULT
    // =====================================================

    return {
      id,
      label: e.label,

      score: Math.round(
        rawScore * 100
      ),

      signals: {
        financial,
        communication,
        crossSource,
        temporal,
        centrality
      },

      reasons
    };

  });


  // Highest score first

  return results.sort(
    (a, b) => b.score - a.score
  );
}


// ---------- Export ----------
module.exports = {
  computeLeads,
  parseCSV,
  buildEntityMap
};