const path = require('path');

const {
  computeLeads,
  parseCSV
} = require('./scoringEngine');


// =====================================================
// ENTITY MAP
// =====================================================

const entityMap = {

  A: {
    label: 'Person A — primary suspect',
    phone: '9811100001',
    account: 'ACC1001',
    handle: '@rahul_a',
    knownSuspect: true
  },

  B: {
    label: 'Person B',
    phone: '9822200002',
    account: 'ACC1002',
    handle: '@b_handle'
  },

  C: {
    label: 'Person C',
    phone: '9833300003',
    account: 'ACC1003',
    handle: '@c_handle07'
  },

  D: {
    label: 'Person D',
    phone: '9844400004',
    account: 'ACC1004',
    handle: '@d_handle'
  },

  E: {
    label: 'Person E — decoy vendor',
    phone: '9855500005',
    account: 'ACC1005',
    handle: '@random_e'
  }

};


// =====================================================
// DATA LOCATION
// =====================================================

const dataPath = path.join(
  __dirname,
  '../data'
);


// =====================================================
// READ CSV FILES
// =====================================================

const cdrRows = parseCSV(
  path.join(
    dataPath,
    'CDR.csv'
  )
);


const bankRows = parseCSV(
  path.join(
    dataPath,
    'Bank.csv'
  )
);


const socialRows = parseCSV(
  path.join(
    dataPath,
    'Social.csv'
  )
);


// =====================================================
// RUN SCORING ENGINE
// =====================================================

const leads = computeLeads({
  cdrRows,
  bankRows,
  socialRows,
  entityMap
});


// =====================================================
// DISPLAY RESULTS
// =====================================================

console.log('\n======================================');

console.log(
  '       CASEFUSION — NEXT BEST LEADS'
);

console.log(
  '======================================\n'
);


leads.forEach((lead, index) => {

  console.log(
    `${index + 1}. ${lead.label}`
  );


  console.log(
    `   Priority: ${lead.score}/100`
  );


  console.log(
    '   Signals:',
    lead.signals
  );


  console.log(
    '   Why:'
  );


  lead.reasons.forEach(reason => {

    console.log(
      `      • ${reason}`
    );

  });


  console.log();

});