


import { useEffect, useMemo, useState } from 'react';

const SAMPLE_EVIDENCE = [
    {
        id: 'EV-001',
        type: 'CDR',
        icon: '☎',
        title: 'Call Detail Record',
        source: 'Telecom Provider',
        entity: 'Person A',
        relatedCase: 'CASE-20260817-1485',
        timestamp: '2026-08-17 14:32:18',
        description:
            'Outgoing call from Person A to Person C during the identified fraud window.',
        risk: 'High',
        status: 'Correlated',
    },
    {
        id: 'EV-002',
        type: 'BANK',
        icon: '₹',
        title: 'Bank Transaction',
        source: 'Bank Statement',
        entity: 'Person C',
        relatedCase: 'CASE-20260817-1485',
        timestamp: '2026-08-17 14:37:44',
        description:
            '₹1,80,000 received shortly after the relevant communication event.',
        risk: 'High',
        status: 'Correlated',
    },
    {
        id: 'EV-003',
        type: 'IPDR',
        icon: '◉',
        title: 'IPDR Session',
        source: 'Internet Provider',
        entity: 'Person C',
        relatedCase: 'CASE-20260817-1485',
        timestamp: '2026-08-17 14:41:06',
        description:
            'IP activity associated with a device already observed in another investigation.',
        risk: 'Medium',
        status: 'Correlated',
    },
    {
        id: 'EV-004',
        type: 'SOCIAL',
        icon: '◎',
        title: 'Social Media Activity',
        source: 'Social Activity Log',
        entity: 'Person B',
        relatedCase: 'CASE-20260817-1485',
        timestamp: '2026-08-17 14:46:21',
        description:
            'Public activity observed shortly after a financial event.',
        risk: 'Medium',
        status: 'Reviewed',
    },
    {
        id: 'EV-005',
        type: 'DEVICE',
        icon: '▣',
        title: 'Shared Device Fingerprint',
        source: 'Device Intelligence',
        entity: 'Person B',
        relatedCase: 'CASE-20260816-1992',
        timestamp: '2026-08-17 15:02:09',
        description:
            'Device fingerprint matches an entity appearing in another investigation.',
        risk: 'High',
        status: 'Cross-case',
    },
    {
        id: 'EV-006',
        type: 'IMAGE',
        icon: '▧',
        title: 'CCTV Image',
        source: 'Uploaded Evidence',
        entity: 'Person A',
        relatedCase: 'CASE-20260817-1485',
        timestamp: '2026-08-17 15:16:37',
        description:
            'Reference image uploaded by the investigating officer for review.',
        risk: 'Medium',
        status: 'Uploaded',
    },
];

const SAMPLE_TIMELINE = [
    {
        time: '14:32:18',
        date: '17 Aug 2026',
        type: 'CALL',
        title: 'Communication detected',
        text: 'Person A contacted Person C.',
        source: 'CDR',
        level: 'high',
    },
    {
        time: '14:37:44',
        date: '17 Aug 2026',
        type: 'BANK',
        title: 'Financial activity detected',
        text: '₹1,80,000 transferred to Person C.',
        source: 'Bank',
        level: 'high',
    },
    {
        time: '14:41:06',
        date: '17 Aug 2026',
        type: 'IPDR',
        title: 'IPDR session detected',
        text: 'Associated device became active.',
        source: 'IPDR',
        level: 'medium',
    },
    {
        time: '14:46:21',
        date: '17 Aug 2026',
        type: 'SOCIAL',
        title: 'Social activity detected',
        text: 'Related account activity observed.',
        source: 'Social',
        level: 'medium',
    },
    {
        time: '15:02:09',
        date: '17 Aug 2026',
        type: 'DEVICE',
        title: 'Cross-case device match',
        text: 'Device fingerprint matches another case.',
        source: 'Device',
        level: 'high',
    },
    {
        time: '15:16:37',
        date: '17 Aug 2026',
        type: 'EVIDENCE',
        title: 'Evidence uploaded',
        text: 'CCTV reference image added to the case.',
        source: 'Evidence Vault',
        level: 'low',
    },
];

const SAMPLE_CONNECTIONS = [
    {
        id: 'CON-001',
        caseA: 'CASE-20260817-1485',
        caseB: 'CASE-20260816-1992',
        entityA: 'Person B',
        entityB: 'Person C',
        connection: 'Shared Device',
        identifier: 'DEV-9281',
        strength: 'High',
        sources: ['CDR', 'IPDR', 'Device'],
        reason:
            'Both investigations contain activity associated with the same device fingerprint.',
        firstObserved: '17 Aug 2026 15:02:09',
    },
    {
        id: 'CON-002',
        caseA: 'CASE-20260817-1485',
        caseB: 'CASE-20260816-7779',
        entityA: 'Person A',
        entityB: 'Person D',
        connection: 'Financial Relationship',
        identifier: 'ACCT-4408',
        strength: 'Medium',
        sources: ['Bank'],
        reason:
            'Financial records indicate activity involving the same destination account.',
        firstObserved: '17 Aug 2026 14:37:44',
    },
    {
        id: 'CON-003',
        caseA: 'CASE-20260817-1485',
        caseB: 'CASE-20260816-3005',
        entityA: 'Person C',
        entityB: 'Person E',
        connection: 'Communication Link',
        identifier: '+91-98XXXX421',
        strength: 'Medium',
        sources: ['CDR'],
        reason:
            'Communication records indicate contact between entities appearing in separate cases.',
        firstObserved: '16 Aug 2026 21:18:11',
    },
];

const SAMPLE_ALERTS = [
    {
        id: 'ALT-001',
        severity: 'HIGH',
        title: 'Call followed by large fund transfer',
        time: '14:37:44',
        description:
            'A financial transfer occurred approximately 5 minutes after a relevant communication event.',
        sources: ['CDR', 'BANK'],
    },
    {
        id: 'ALT-002',
        severity: 'HIGH',
        title: 'Cross-case device reuse',
        time: '15:02:09',
        description:
            'Device fingerprint associated with this case also appears in another investigation.',
        sources: ['DEVICE', 'IPDR'],
    },
    {
        id: 'ALT-003',
        severity: 'MEDIUM',
        title: 'Coordinated digital activity',
        time: '14:46:21',
        description:
            'Social activity occurred within the defined investigation window.',
        sources: ['SOCIAL', 'BANK'],
    },
];

const SAMPLE_STATEMENTS = [
    {
        id: 'ACC-A',
        name: 'Person A',
        role: 'Accused 01',
        statement:
            'I was at home during the relevant period and did not communicate with Person C.',
        recordedAt: '17 Aug 2026 16:20',
        officer: 'Inspector Sharma',
        claims: {
            Location: 'Home',
            Communication: 'Denies contact',
            Transaction: 'No knowledge',
            Device: 'Personal device',
        },
    },
    {
        id: 'ACC-B',
        name: 'Person B',
        role: 'Accused 02',
        statement:
            'I was travelling during the relevant period and contacted Person C regarding a personal matter.',
        recordedAt: '17 Aug 2026 16:42',
        officer: 'Inspector Sharma',
        claims: {
            Location: 'Travelling',
            Communication: 'Confirms contact',
            Transaction: 'No knowledge',
            Device: 'Shared device',
        },
    },
];

const SAMPLE_EVIDENCE_MATRIX = [
    {
        evidence: 'EV-001 — CDR Call',
        personA: 'Contradicts',
        personB: 'Supports',
    },
    {
        evidence: 'EV-002 — ₹1.8L Transfer',
        personA: 'Unclear',
        personB: 'Contradicts',
    },
    {
        evidence: 'EV-003 — IPDR Session',
        personA: 'Unclear',
        personB: 'Supports',
    },
    {
        evidence: 'EV-005 — Shared Device',
        personA: 'Contradicts',
        personB: 'Contradicts',
    },
];

const SAMPLE_MAP_POINTS = [
    {
        x: 20,
        y: 72,
        title: 'Cell Tower A',
        type: 'CDR',
        time: '14:32',
    },
    {
        x: 43,
        y: 54,
        title: 'ATM / Transaction',
        type: 'BANK',
        time: '14:37',
    },
    {
        x: 67,
        y: 36,
        title: 'IPDR Location',
        type: 'IPDR',
        time: '14:41',
    },
    {
        x: 82,
        y: 62,
        title: 'Social Activity Zone',
        type: 'SOCIAL',
        time: '14:46',
    },
];

function formatNow() {
    return new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function Badge({ children, tone = 'default' }) {
    return (
        <span className={`intel-badge intel-badge-${tone}`}>
            {children}
        </span>
    );
}

function SectionHeader({ eyebrow, title, description, right }) {
    return (
        <div className="intel-section-header">
            <div>
                {eyebrow && <div className="intel-eyebrow">{eyebrow}</div>}
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            {right}
        </div>
    );
}

export default function InvestigationIntel({ caseId = 'CASE-20260817-1485' }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [search, setSearch] = useState('');
    const [evidenceFilter, setEvidenceFilter] = useState('ALL');
    const [timelineFilter, setTimelineFilter] = useState('ALL');
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [savedFilters, setSavedFilters] = useState([
        'High Risk Financial',
        'Cross-Case Connections',
    ]);
    const [filterName, setFilterName] = useState('');
    const [activity, setActivity] = useState([
        {
            id: 1,
            user: 'System',
            action: 'Analysis completed',
            time: formatNow(),
            icon: '✓',
        },
        {
            id: 2,
            user: 'Investigator',
            action: 'Opened investigation workspace',
            time: formatNow(),
            icon: '◉',
        },
    ]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [reportGenerated, setReportGenerated] = useState(false);

    const [selectedStatement, setSelectedStatement] = useState(null);
    const [statementView, setStatementView] = useState('comparison');
    const [filterType, setFilterType] = useState(
        'High Risk + Cross Case'
    );
    const [reportType, setReportType] = useState('full');

    useEffect(() => {
        const timer = setInterval(() => {
            setActivity((prev) => {
                if (prev.length > 8) return prev;
                return [
                    ...prev,
                    {
                        id: Date.now(),
                        user: 'System',
                        action: 'Investigation workspace synchronized',
                        time: formatNow(),
                        icon: '↻',
                    },
                ];
            });
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    function logActivity(action, user = 'Investigator') {
        setActivity((prev) => [
            {
                id: Date.now(),
                user,
                action,
                time: formatNow(),
                icon: '•',
            },
            ...prev,
        ]);
    }

    function handleEvidenceClick(item) {
        setSelectedEvidence(item);
        logActivity(`Viewed evidence ${item.id}`);
    }

    function handleConnectionClick(item) {
        setSelectedConnection(item);
        logActivity(`Opened cross-case connection ${item.id}`);
    }

    function handleStatementClick(statement) {
        setSelectedStatement(statement);

        logActivity(
            `Opened statement of ${statement.name}`
        );
    }

    function handleStatementViewChange(event) {
        setStatementView(event.target.value);

        logActivity(
            `Changed statement view to ${event.target.value}`
        );
    }

    function handleReportTypeChange(event) {
        setReportType(event.target.value);

        logActivity(
            `Changed report type to ${event.target.value}`
        );
    }

    function handleUpload(event) {
        const files = Array.from(event.target.files || []);

        const mapped = files.map((file) => ({
            id: `UP-${Date.now()}-${file.name}`,
            name: file.name,
            type: file.type || 'Unknown',
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            uploadedAt: formatNow(),
        }));

        setUploadedFiles((prev) => [...mapped, ...prev]);
        logActivity(`${mapped.length} evidence file(s) uploaded`);
    }

    function saveFilter() {
        const value = filterName.trim();

        if (!value) return;

        if (!savedFilters.includes(value)) {
            setSavedFilters((prev) => [...prev, value]);
        }

        setFilterName('');
        logActivity(`Created custom filter "${value}"`);
    }

    function generateReport() {
        setReportGenerated(true);
        logActivity('Generated investigation intelligence report');
    }

    const filteredEvidence = useMemo(() => {
        return SAMPLE_EVIDENCE.filter((item) => {
            const matchesType =
                evidenceFilter === 'ALL' || item.type === evidenceFilter;

            const query = search.trim().toLowerCase();

            const matchesSearch =
                !query ||
                item.id.toLowerCase().includes(query) ||
                item.title.toLowerCase().includes(query) ||
                item.entity.toLowerCase().includes(query) ||
                item.source.toLowerCase().includes(query);

            return matchesType && matchesSearch;
        });
    }, [evidenceFilter, search]);

    const filteredTimeline = useMemo(() => {
        if (timelineFilter === 'ALL') return SAMPLE_TIMELINE;

        return SAMPLE_TIMELINE.filter(
            (item) => item.type === timelineFilter
        );
    }, [timelineFilter]);

    const filteredAlerts = useMemo(() => {
        if (severityFilter === 'ALL') return SAMPLE_ALERTS;

        return SAMPLE_ALERTS.filter(
            (item) => item.severity === severityFilter
        );
    }, [severityFilter]);

    const tabs = [
        ['overview', 'Overview'],
        ['evidence', 'Evidence'],
        ['network', 'Cross-Case'],
        ['timeline', 'Timeline'],
        ['map', 'Geo Analysis'],
        ['alerts', 'Alerts'],
        ['statements', 'Statements'],
        ['vault', 'Evidence Vault'],
        ['filters', 'Custom Filters'],
        ['activity', 'Activity'],
        ['report', 'Report'],
    ];

    return (
        <section className="investigation-intel">
            <style>{`
        .investigation-intel {
          --ii-bg: #080b13;
          --ii-panel: #0d121d;
          --ii-panel-2: #111827;
          --ii-border: rgba(148, 163, 184, .15);
          --ii-text: #f4f7ff;
          --ii-muted: #8290ab;
          --ii-purple: #7161ff;
          --ii-purple-2: #8b7cff;
          --ii-green: #4ade9b;
          --ii-yellow: #e8bb65;
          --ii-red: #ff6d7d;
          width: 100%;
          margin-top: 28px;
          color: var(--ii-text);
        }

        .intel-shell {
          border: 1px solid var(--ii-border);
          background:
            radial-gradient(circle at 90% 0%, rgba(113,97,255,.10), transparent 30%),
            linear-gradient(180deg, #0b101a, #080b13);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 70px rgba(0,0,0,.25);
        }

        .intel-top {
          padding: 24px 26px 18px;
          border-bottom: 1px solid var(--ii-border);
        }

        .intel-title-row {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:20px;
        }

        .intel-eyebrow {
          color:#8c7fff;
          font-size:10px;
          letter-spacing:2px;
          text-transform:uppercase;
          font-weight:800;
          margin-bottom:7px;
        }

        .intel-top h1,
        .intel-section-header h2 {
          margin:0;
          color:#f7f8ff;
        }

        .intel-top h1 {
          font-size:22px;
        }

        .intel-top p,
        .intel-section-header p {
          color:var(--ii-muted);
          margin:7px 0 0;
          font-size:13px;
        }

        .intel-case-pill {
          border:1px solid var(--ii-border);
          background:#0b111c;
          border-radius:10px;
          padding:10px 13px;
          font-size:11px;
          color:#aeb8ce;
        }

        .intel-case-pill strong {
          color:#fff;
          display:block;
          margin-bottom:3px;
        }

        .intel-tabs {
          display:flex;
          gap:5px;
          padding:10px 14px;
          overflow-x:auto;
          border-bottom:1px solid var(--ii-border);
          background:#0a0f18;
        }

        .intel-tab {
          border:1px solid transparent;
          color:#8e9ab4;
          background:transparent;
          padding:9px 12px;
          border-radius:8px;
          white-space:nowrap;
          cursor:pointer;
          font-size:11px;
          font-weight:700;
        }

        .intel-tab:hover {
          color:#fff;
          background:#111827;
        }

        .intel-tab.active {
          color:#fff;
          border-color:rgba(113,97,255,.55);
          background:rgba(113,97,255,.13);
        }

        .intel-content {
          padding:24px;
        }

        .intel-section-header {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:20px;
          margin-bottom:20px;
        }

        .intel-section-header h2 {
          font-size:19px;
        }

        .intel-actions {
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }

        .intel-button {
          border:1px solid var(--ii-border);
          background:#101725;
          color:#cbd4e7;
          padding:9px 13px;
          border-radius:8px;
          cursor:pointer;
          font-size:11px;
          font-weight:700;
        }

        .intel-button:hover {
          border-color:rgba(113,97,255,.5);
          color:#fff;
        }

        .intel-button.primary {
          border-color:transparent;
          background:linear-gradient(135deg,#7565ff,#6354e8);
          color:#fff;
        }

        .intel-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:12px;
        }

        .intel-card {
          border:1px solid var(--ii-border);
          background:rgba(13,18,29,.82);
          border-radius:12px;
          padding:17px;
        }

        .intel-card-label {
          color:#7d8ba7;
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:1.2px;
          font-weight:800;
        }

        .intel-card-value {
          font-size:25px;
          font-weight:800;
          margin-top:9px;
          color:#fff;
        }

        .intel-card-note {
          color:#77849d;
          font-size:11px;
          margin-top:4px;
        }

        .intel-two {
          display:grid;
          grid-template-columns:1.2fr .8fr;
          gap:14px;
          margin-top:14px;
        }

        .intel-list {
          display:flex;
          flex-direction:column;
          gap:9px;
        }

        .intel-row {
          border:1px solid var(--ii-border);
          background:#0b111b;
          border-radius:10px;
          padding:13px;
          cursor:pointer;
          transition:.15s ease;
        }

        .intel-row:hover {
          border-color:rgba(113,97,255,.45);
          transform:translateY(-1px);
        }

        .intel-row-top {
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:flex-start;
        }

        .intel-row-title {
          font-weight:750;
          color:#edf1fb;
          font-size:13px;
        }

        .intel-row-meta {
          display:flex;
          flex-wrap:wrap;
          gap:7px;
          margin-top:7px;
          color:#77849d;
          font-size:10px;
        }

        .intel-badge {
          display:inline-flex;
          align-items:center;
          border:1px solid var(--ii-border);
          border-radius:999px;
          padding:4px 7px;
          font-size:9px;
          font-weight:800;
          letter-spacing:.4px;
          text-transform:uppercase;
        }

        .intel-badge-high {
          color:#ff8b98;
          background:rgba(255,109,125,.08);
          border-color:rgba(255,109,125,.22);
        }

        .intel-badge-medium {
          color:#edc66d;
          background:rgba(232,187,101,.08);
          border-color:rgba(232,187,101,.22);
        }

        .intel-badge-low,
        .intel-badge-success {
          color:#5ce3a4;
          background:rgba(74,222,155,.07);
          border-color:rgba(74,222,155,.20);
        }

        .intel-badge-default {
          color:#9eabc3;
          background:#101725;
        }

        .intel-search {
          width:100%;
          box-sizing:border-box;
          border:1px solid var(--ii-border);
          background:#090e17;
          color:#fff;
          border-radius:9px;
          padding:11px 13px;
          outline:none;
          margin-bottom:12px;
        }

        .intel-search:focus {
          border-color:rgba(113,97,255,.7);
          box-shadow:0 0 0 3px rgba(113,97,255,.08);
        }

        .intel-filter-line {
          display:flex;
          gap:7px;
          flex-wrap:wrap;
          margin-bottom:15px;
        }

        .intel-filter {
          border:1px solid var(--ii-border);
          background:#0b111b;
          color:#8f9cb4;
          border-radius:8px;
          padding:7px 10px;
          cursor:pointer;
          font-size:10px;
          font-weight:750;
        }

        .intel-filter.active {
          color:#fff;
          border-color:rgba(113,97,255,.6);
          background:rgba(113,97,255,.12);
        }

        .intel-table-wrap {
          overflow:auto;
          border:1px solid var(--ii-border);
          border-radius:11px;
        }

        .intel-table {
          width:100%;
          border-collapse:collapse;
          min-width:720px;
        }

        .intel-table th {
          text-align:left;
          padding:11px 13px;
          background:#0b111b;
          color:#72809b;
          font-size:9px;
          letter-spacing:1px;
          text-transform:uppercase;
        }

        .intel-table td {
          padding:12px 13px;
          border-top:1px solid var(--ii-border);
          color:#b9c3d8;
          font-size:11px;
        }

        .intel-table td strong {
          color:#eef1fa;
        }

        .intel-timeline {
          position:relative;
          margin-left:8px;
          padding-left:27px;
        }

        .intel-timeline::before {
          content:'';
          position:absolute;
          left:5px;
          top:5px;
          bottom:5px;
          width:1px;
          background:linear-gradient(#7161ff,rgba(113,97,255,.05));
        }

        .intel-timeline-item {
          position:relative;
          padding-bottom:19px;
        }

        .intel-timeline-dot {
          position:absolute;
          left:-27px;
          top:3px;
          width:11px;
          height:11px;
          border-radius:50%;
          background:#7161ff;
          box-shadow:0 0 0 4px rgba(113,97,255,.10);
        }

        .intel-timeline-item.high .intel-timeline-dot {
          background:#ff6678;
        }

        .intel-timeline-item.medium .intel-timeline-dot {
          background:#e8b95e;
        }

        .intel-timeline-card {
          border:1px solid var(--ii-border);
          background:#0b111b;
          border-radius:10px;
          padding:13px;
        }

        .intel-timeline-time {
          color:#8f7fff;
          font-size:10px;
          font-weight:800;
        }

        .intel-timeline-title {
          margin-top:5px;
          font-size:13px;
          font-weight:750;
        }

        .intel-timeline-text {
          color:#8390aa;
          font-size:11px;
          margin-top:4px;
        }

        .intel-map {
          position:relative;
          height:430px;
          overflow:hidden;
          border:1px solid var(--ii-border);
          border-radius:13px;
          background:
            linear-gradient(rgba(113,97,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(113,97,255,.06) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%,rgba(61,80,120,.20),transparent 60%),
            #080d16;
          background-size:45px 45px,45px 45px,100% 100%;
        }

        .intel-road {
          position:absolute;
          height:2px;
          background:rgba(145,158,187,.18);
          transform-origin:left center;
        }

        .road1 { width:70%; left:5%; top:58%; transform:rotate(-17deg); }
        .road2 { width:60%; left:30%; top:22%; transform:rotate(53deg); }
        .road3 { width:65%; left:16%; top:77%; transform:rotate(-43deg); }

        .intel-map-point {
          position:absolute;
          transform:translate(-50%,-50%);
          cursor:pointer;
        }

        .intel-map-dot {
          width:14px;
          height:14px;
          border-radius:50%;
          background:#7161ff;
          border:3px solid rgba(113,97,255,.18);
          box-shadow:0 0 20px rgba(113,97,255,.65);
        }

        .intel-map-label {
          position:absolute;
          top:21px;
          left:50%;
          transform:translateX(-50%);
          white-space:nowrap;
          background:#0b111b;
          border:1px solid var(--ii-border);
          padding:6px 8px;
          border-radius:7px;
          font-size:9px;
          color:#b8c2d8;
        }

        .intel-alert {
          border:1px solid var(--ii-border);
          background:#0b111b;
          border-radius:11px;
          padding:15px;
          display:flex;
          gap:13px;
          align-items:flex-start;
        }

        .intel-alert-icon {
          width:32px;
          height:32px;
          border-radius:8px;
          display:grid;
          place-items:center;
          background:rgba(255,109,125,.10);
          color:#ff7b89;
          font-weight:900;
          flex:none;
        }

        .intel-alert h3 {
          margin:0;
          font-size:13px;
        }

        .intel-alert p {
          color:#8491aa;
          font-size:11px;
          margin:6px 0;
          line-height:1.5;
        }

        .intel-statement-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:13px;
        }

        .intel-statement {
          border:1px solid var(--ii-border);
          border-radius:12px;
          background:#0b111b;
          padding:17px;
        }

        .intel-person {
          font-size:15px;
          font-weight:800;
        }

        .intel-role {
          color:#8b7fff;
          font-size:10px;
          margin-top:3px;
        }

        .intel-quote {
          color:#aeb8cc;
          font-size:12px;
          line-height:1.7;
          margin:16px 0;
          padding:12px;
          border-left:2px solid #7161ff;
          background:rgba(113,97,255,.04);
        }

        .intel-claims {
          display:flex;
          flex-direction:column;
          gap:7px;
        }

        .intel-claim {
          display:flex;
          justify-content:space-between;
          gap:10px;
          border-bottom:1px solid var(--ii-border);
          padding-bottom:7px;
          color:#8c99b0;
          font-size:10px;
        }

        .intel-claim strong {
          color:#dfe5f2;
          font-weight:650;
          text-align:right;
        }

        .intel-upload {
          border:1px dashed rgba(113,97,255,.45);
          background:rgba(113,97,255,.035);
          border-radius:12px;
          padding:30px;
          text-align:center;
          margin-bottom:15px;
        }

        .intel-upload input {
          display:none;
        }

        .intel-upload-title {
          font-size:14px;
          font-weight:800;
          margin-bottom:5px;
        }

        .intel-upload-text {
          color:#7f8ba3;
          font-size:11px;
          margin-bottom:14px;
        }

        .intel-filter-builder {
          display:grid;
          grid-template-columns:1fr 1fr auto;
          gap:9px;
          margin-bottom:17px;
        }

        .intel-input {
          border:1px solid var(--ii-border);
          background:#090e17;
          color:#fff;
          border-radius:8px;
          padding:10px;
          outline:none;
        }

        .intel-saved-filter {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:13px;
          background:#0b111b;
          border:1px solid var(--ii-border);
          border-radius:9px;
          margin-bottom:7px;
          color:#bdc6d8;
          font-size:11px;
        }

        .intel-activity {
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .intel-activity-row {
          display:grid;
          grid-template-columns:34px 1fr auto;
          gap:11px;
          align-items:center;
          border:1px solid var(--ii-border);
          background:#0b111b;
          padding:12px;
          border-radius:9px;
        }

        .intel-activity-icon {
          width:30px;
          height:30px;
          display:grid;
          place-items:center;
          border-radius:8px;
          color:#9b8fff;
          background:rgba(113,97,255,.10);
        }

        .intel-activity-main {
          font-size:11px;
          color:#b8c2d5;
        }

        .intel-activity-main strong {
          color:#fff;
        }

        .intel-activity-time {
          color:#66738b;
          font-size:9px;
        }

        .intel-report {
          border:1px solid var(--ii-border);
          border-radius:13px;
          background:#0b111b;
          padding:25px;
        }

        .intel-report-head {
          display:flex;
          justify-content:space-between;
          gap:20px;
          border-bottom:1px solid var(--ii-border);
          padding-bottom:18px;
          margin-bottom:18px;
        }

        .intel-report h3 {
          margin:0 0 5px;
          font-size:18px;
        }

        .intel-report-section {
          margin-top:20px;
        }

        .intel-report-section h4 {
          color:#8c7fff;
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:1.2px;
          margin:0 0 8px;
        }

        .intel-report-section p,
        .intel-report-section li {
          color:#9aa7bd;
          font-size:11px;
          line-height:1.7;
        }

        .intel-empty {
          padding:30px;
          text-align:center;
          color:#758199;
          border:1px dashed var(--ii-border);
          border-radius:10px;
        }

        .intel-modal-backdrop {
          position:fixed;
          inset:0;
          z-index:9999;
          background:rgba(2,5,10,.76);
          backdrop-filter:blur(8px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
        }

        .intel-modal {
          width:min(650px,100%);
          max-height:85vh;
          overflow:auto;
          border:1px solid rgba(148,163,184,.18);
          border-radius:15px;
          background:#0b111b;
          box-shadow:0 30px 100px rgba(0,0,0,.55);
        }

        .intel-modal-head {
          padding:18px 20px;
          display:flex;
          justify-content:space-between;
          gap:15px;
          border-bottom:1px solid var(--ii-border);
        }

        .intel-modal-head h3 {
          margin:0;
          font-size:16px;
        }

        .intel-modal-body {
          padding:20px;
        }

        .intel-detail-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:9px;
        }

        .intel-detail {
          padding:11px;
          background:#090e17;
          border:1px solid var(--ii-border);
          border-radius:8px;
        }

        .intel-detail span {
          display:block;
          color:#6e7b94;
          font-size:9px;
          text-transform:uppercase;
          margin-bottom:4px;
        }

        .intel-detail strong {
          color:#dce3f2;
          font-size:11px;
        }

        @media(max-width:900px) {
          .intel-grid { grid-template-columns:1fr 1fr; }
          .intel-two { grid-template-columns:1fr; }
          .intel-statement-grid { grid-template-columns:1fr; }
          .intel-filter-builder { grid-template-columns:1fr; }
        }

        @media(max-width:600px) {
          .intel-content { padding:15px; }
          .intel-grid { grid-template-columns:1fr; }
          .intel-title-row { flex-direction:column; }
          .intel-detail-grid { grid-template-columns:1fr; }
        }

        .intel-input {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--ii-border);
  border-radius: 8px;
  outline: none;
  background: #0b111b;
  color: #cbd4e7;
  font-size: 10px;
}

.intel-input:focus {
  border-color: rgba(113, 97, 255, .65);
}

.intel-statement-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 14px;
}

.intel-statement-toolbar > span {
  color: #687792;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
}

.intel-statement {
  cursor: pointer;
  transition:
    border-color .2s ease,
    background .2s ease,
    transform .2s ease;
}

.intel-statement:hover {
  border-color: rgba(113, 97, 255, .45);
  background: #101725;
  transform: translateY(-1px);
}

@media (max-width: 650px) {
  .intel-statement-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .intel-input {
    width: 100%;
  }
}
      `}</style>

            <div className="intel-shell">
                <div className="intel-top">
                    <div className="intel-title-row">
                        <div>
                            <div className="intel-eyebrow">
                                INVESTIGATION INTELLIGENCE
                            </div>
                            <h1>Digital Evidence & Correlation</h1>
                            <p>
                                Unified analysis across telecom, banking, social,
                                device and investigative evidence.
                            </p>
                        </div>

                        <div className="intel-case-pill">
                            <strong>{caseId}</strong>
                            Active Investigation
                        </div>
                    </div>
                </div>

                <div className="intel-tabs">
                    {tabs.map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            className={`intel-tab ${activeTab === id ? 'active' : ''
                                }`}
                            onClick={() => {
                                setActiveTab(id);
                                logActivity(`Opened ${label} module`);
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="intel-content">
                    {activeTab === 'overview' && (
                        <>
                            <SectionHeader
                                eyebrow="COMMAND CENTER"
                                title="Investigation Intelligence"
                                description="Cross-source signals, relationships, alerts and evidence."
                                right={
                                    <Badge tone="success">
                                        Analysis Ready
                                    </Badge>
                                }
                            />

                            <div className="intel-grid">
                                <div className="intel-card">
                                    <div className="intel-card-label">
                                        Evidence Items
                                    </div>
                                    <div className="intel-card-value">
                                        {SAMPLE_EVIDENCE.length}
                                    </div>
                                    <div className="intel-card-note">
                                        Across 6 digital sources
                                    </div>
                                </div>

                                <div className="intel-card">
                                    <div className="intel-card-label">
                                        Cross-Case Links
                                    </div>
                                    <div className="intel-card-value">
                                        {SAMPLE_CONNECTIONS.length}
                                    </div>
                                    <div className="intel-card-note">
                                        Relationships detected
                                    </div>
                                </div>

                                <div className="intel-card">
                                    <div className="intel-card-label">
                                        Active Alerts
                                    </div>
                                    <div className="intel-card-value">
                                        {SAMPLE_ALERTS.length}
                                    </div>
                                    <div className="intel-card-note">
                                        Require investigator review
                                    </div>
                                </div>

                                <div className="intel-card">
                                    <div className="intel-card-label">
                                        Digital Events
                                    </div>
                                    <div className="intel-card-value">
                                        {SAMPLE_TIMELINE.length}
                                    </div>
                                    <div className="intel-card-note">
                                        Reconstructed timeline
                                    </div>
                                </div>
                            </div>

                            <div className="intel-two">
                                <div className="intel-card">
                                    <SectionHeader
                                        eyebrow="PRIORITY SIGNALS"
                                        title="Recent Alerts"
                                        right={
                                            <button
                                                className="intel-button"
                                                onClick={() => setActiveTab('alerts')}
                                            >
                                                View all
                                            </button>
                                        }
                                    />

                                    <div className="intel-list">
                                        {SAMPLE_ALERTS.map((alert) => (
                                            <div
                                                className="intel-row"
                                                key={alert.id}
                                                onClick={() => {
                                                    setActiveTab('alerts');
                                                    logActivity(`Reviewed ${alert.id}`);
                                                }}
                                            >
                                                <div className="intel-row-top">
                                                    <div className="intel-row-title">
                                                        {alert.title}
                                                    </div>
                                                    <Badge
                                                        tone={
                                                            alert.severity === 'HIGH'
                                                                ? 'high'
                                                                : 'medium'
                                                        }
                                                    >
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                                <div className="intel-row-meta">
                                                    <span>{alert.id}</span>
                                                    <span>{alert.time}</span>
                                                    <span>{alert.sources.join(' + ')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="intel-card">
                                    <SectionHeader
                                        eyebrow="CORRELATION"
                                        title="Key Relationships"
                                        right={
                                            <button
                                                className="intel-button"
                                                onClick={() => setActiveTab('network')}
                                            >
                                                Explore
                                            </button>
                                        }
                                    />

                                    <div className="intel-list">
                                        {SAMPLE_CONNECTIONS.map((connection) => (
                                            <div
                                                className="intel-row"
                                                key={connection.id}
                                                onClick={() =>
                                                    handleConnectionClick(connection)
                                                }
                                            >
                                                <div className="intel-row-title">
                                                    {connection.connection}
                                                </div>
                                                <div className="intel-row-meta">
                                                    <span>{connection.entityA}</span>
                                                    <span>↔</span>
                                                    <span>{connection.entityB}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'evidence' && (
                        <>
                            <SectionHeader
                                eyebrow="EVIDENCE EXPLORER"
                                title="Multi-Source Evidence"
                                description="Search and inspect CDR, IPDR, banking and social intelligence."
                                right={
                                    <Badge tone="success">
                                        {filteredEvidence.length} records
                                    </Badge>
                                }
                            />

                            <input
                                className="intel-search"
                                placeholder="Search evidence, entity, source or evidence ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <div className="intel-filter-line">
                                {[
                                    'ALL',
                                    'CDR',
                                    'IPDR',
                                    'BANK',
                                    'SOCIAL',
                                    'DEVICE',
                                    'IMAGE',
                                ].map((filter) => (
                                    <button
                                        key={filter}
                                        className={`intel-filter ${evidenceFilter === filter ? 'active' : ''
                                            }`}
                                        onClick={() => setEvidenceFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="intel-list">
                                {filteredEvidence.map((item) => (
                                    <div
                                        className="intel-row"
                                        key={item.id}
                                        onClick={() => handleEvidenceClick(item)}
                                    >
                                        <div className="intel-row-top">
                                            <div>
                                                <div className="intel-row-title">
                                                    <span style={{ marginRight: 8 }}>
                                                        {item.icon}
                                                    </span>
                                                    {item.title}
                                                </div>

                                                <div className="intel-row-meta">
                                                    <span>{item.id}</span>
                                                    <span>{item.type}</span>
                                                    <span>{item.source}</span>
                                                    <span>{item.timestamp}</span>
                                                </div>
                                            </div>

                                            <Badge
                                                tone={
                                                    item.risk === 'High'
                                                        ? 'high'
                                                        : item.risk === 'Medium'
                                                            ? 'medium'
                                                            : 'success'
                                                }
                                            >
                                                {item.risk}
                                            </Badge>
                                        </div>

                                        <div
                                            style={{
                                                color: '#7e8ba5',
                                                fontSize: 11,
                                                marginTop: 10,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {item.description}
                                        </div>
                                    </div>
                                ))}

                                {!filteredEvidence.length && (
                                    <div className="intel-empty">
                                        No evidence matches the selected filters.
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'network' && (
                        <>
                            <SectionHeader
                                eyebrow="ENTITY RESOLUTION"
                                title="Cross-Case Connections"
                                description="Click a relationship to inspect exactly why two investigations are connected."
                            />

                            <div className="intel-list">
                                {SAMPLE_CONNECTIONS.map((item) => (
                                    <div
                                        className="intel-row"
                                        key={item.id}
                                        onClick={() => handleConnectionClick(item)}
                                    >
                                        <div className="intel-row-top">
                                            <div>
                                                <div className="intel-row-title">
                                                    {item.entityA}
                                                    <span
                                                        style={{
                                                            color: '#7161ff',
                                                            margin: '0 8px',
                                                        }}
                                                    >
                                                        ↔
                                                    </span>
                                                    {item.entityB}
                                                </div>

                                                <div className="intel-row-meta">
                                                    <span>{item.caseA}</span>
                                                    <span>↔</span>
                                                    <span>{item.caseB}</span>
                                                    <span>{item.connection}</span>
                                                </div>
                                            </div>

                                            <Badge
                                                tone={
                                                    item.strength === 'High'
                                                        ? 'high'
                                                        : 'medium'
                                                }
                                            >
                                                {item.strength}
                                            </Badge>
                                        </div>

                                        <div
                                            style={{
                                                color: '#8a96ad',
                                                fontSize: 11,
                                                marginTop: 10,
                                            }}
                                        >
                                            Identifier: {item.identifier}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'timeline' && (
                        <>
                            <SectionHeader
                                eyebrow="DIGITAL FOOTPRINT"
                                title="Chronological Activity Timeline"
                                description="Reconstructed sequence of communications, financial, IPDR and social activity."
                            />

                            <div className="intel-filter-line">
                                {[
                                    'ALL',
                                    'CALL',
                                    'BANK',
                                    'IPDR',
                                    'SOCIAL',
                                    'DEVICE',
                                    'EVIDENCE',
                                ].map((filter) => (
                                    <button
                                        key={filter}
                                        className={`intel-filter ${timelineFilter === filter ? 'active' : ''
                                            }`}
                                        onClick={() => setTimelineFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="intel-timeline">
                                {filteredTimeline.map((item, index) => (
                                    <div
                                        className={`intel-timeline-item ${item.level}`}
                                        key={`${item.time}-${index}`}
                                    >
                                        <div className="intel-timeline-dot" />

                                        <div className="intel-timeline-card">
                                            <div className="intel-timeline-time">
                                                {item.date} · {item.time}
                                            </div>

                                            <div className="intel-timeline-title">
                                                {item.title}
                                            </div>

                                            <div className="intel-timeline-text">
                                                {item.text}
                                            </div>

                                            <div className="intel-row-meta">
                                                <span>{item.source}</span>
                                                <Badge
                                                    tone={
                                                        item.level === 'high'
                                                            ? 'high'
                                                            : item.level === 'medium'
                                                                ? 'medium'
                                                                : 'success'
                                                    }
                                                >
                                                    {item.level}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'map' && (
                        <>
                            <SectionHeader
                                eyebrow="GEOSPATIAL ANALYSIS"
                                title="Digital Footprint Map"
                                description="Illustrative locations reconstructed from telecom, IPDR and transaction activity."
                                right={
                                    <Badge tone="success">
                                        {SAMPLE_MAP_POINTS.length} locations
                                    </Badge>
                                }
                            />

                            <div className="intel-map">
                                <div className="intel-road road1" />
                                <div className="intel-road road2" />
                                <div className="intel-road road3" />

                                {SAMPLE_MAP_POINTS.map((point) => (
                                    <div
                                        className="intel-map-point"
                                        key={point.title}
                                        style={{
                                            left: `${point.x}%`,
                                            top: `${point.y}%`,
                                        }}
                                        title={`${point.title} — ${point.time}`}
                                    >
                                        <div className="intel-map-dot" />
                                        <div className="intel-map-label">
                                            {point.title} · {point.time}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="intel-card"
                                style={{ marginTop: 13 }}
                            >
                                <div className="intel-card-label">
                                    Movement Interpretation
                                </div>

                                <div
                                    style={{
                                        color: '#9aa7bd',
                                        fontSize: 11,
                                        lineHeight: 1.7,
                                        marginTop: 9,
                                    }}
                                >
                                    Activity progresses from a telecom interaction
                                    to a financial event and subsequent IPDR/social
                                    activity. Locations shown are demonstration
                                    records and should be replaced with verified
                                    investigation data.
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'alerts' && (
                        <>
                            <SectionHeader
                                eyebrow="AUTOMATED ALERTS"
                                title="Suspicious Pattern Detection"
                                description="Cross-domain patterns that may require investigator review."
                            />

                            <div className="intel-filter-line">
                                {['ALL', 'HIGH', 'MEDIUM'].map((filter) => (
                                    <button
                                        key={filter}
                                        className={`intel-filter ${severityFilter === filter ? 'active' : ''
                                            }`}
                                        onClick={() => setSeverityFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="intel-list">
                                {filteredAlerts.map((alert) => (
                                    <div className="intel-alert" key={alert.id}>
                                        <div className="intel-alert-icon">!</div>

                                        <div style={{ flex: 1 }}>
                                            <div className="intel-row-top">
                                                <h3>{alert.title}</h3>

                                                <Badge
                                                    tone={
                                                        alert.severity === 'HIGH'
                                                            ? 'high'
                                                            : 'medium'
                                                    }
                                                >
                                                    {alert.severity}
                                                </Badge>
                                            </div>

                                            <p>{alert.description}</p>

                                            <div className="intel-row-meta">
                                                <span>{alert.id}</span>
                                                <span>{alert.time}</span>
                                                <span>
                                                    Sources: {alert.sources.join(' + ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'statements' && (
                        <>
                            <SectionHeader
                                eyebrow="INVESTIGATIVE STATEMENTS"
                                title="Accused Statements"
                                description="Statements are maintained separately from evidence records."
                            />

                            <div className="intel-statement-toolbar">
                                <span>STATEMENT VIEW</span>

                                <select
                                    className="intel-input"
                                    value={statementView}
                                    onChange={handleStatementViewChange}
                                >
                                    <option value="comparison">
                                        Statement Comparison
                                    </option>

                                    <option value="evidence">
                                        Evidence vs Accused
                                    </option>

                                    <option value="claims">
                                        Claim Breakdown
                                    </option>
                                </select>
                            </div>

                            <div className="intel-statement-grid">
                                {SAMPLE_STATEMENTS.map((person) => (
                                    <div
                                        className="intel-statement"
                                        key={person.id}
                                        onClick={() => handleStatementClick(person)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                event.preventDefault();
                                                handleStatementClick(person);
                                            }
                                        }}
                                    >
                                        <div className="intel-person">
                                            {person.name}
                                        </div>

                                        <div className="intel-role">
                                            {person.role}
                                        </div>

                                        <div className="intel-quote">
                                            “{person.statement}”
                                        </div>

                                        <div className="intel-claims">
                                            {Object.entries(person.claims).map(
                                                ([key, value]) => (
                                                    <div
                                                        className="intel-claim"
                                                        key={key}
                                                    >
                                                        <span>{key}</span>
                                                        <strong>{value}</strong>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className="intel-row-meta">
                                            <span>
                                                Recorded: {person.recordedAt}
                                            </span>
                                            <span>
                                                Officer: {person.officer}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 18 }}>
                                <SectionHeader
                                    eyebrow="COMPARATIVE ANALYSIS"
                                    title="Statement Comparison"
                                    description="Potential inconsistencies are surfaced for investigator review."
                                />

                                <div className="intel-table-wrap">
                                    <table className="intel-table">
                                        <thead>
                                            <tr>
                                                <th>Evidence / Claim</th>
                                                <th>Person A</th>
                                                <th>Person B</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {[
                                                ['Location', 'Home', 'Travelling'],
                                                [
                                                    'Communication',
                                                    'Denies contact',
                                                    'Confirms contact',
                                                ],
                                                [
                                                    'Transaction',
                                                    'No knowledge',
                                                    'No knowledge',
                                                ],
                                                [
                                                    'Device',
                                                    'Personal device',
                                                    'Shared device',
                                                ],
                                            ].map((row) => (
                                                <tr key={row[0]}>
                                                    <td>
                                                        <strong>{row[0]}</strong>
                                                    </td>
                                                    <td>{row[1]}</td>
                                                    <td>{row[2]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div
                                    className="intel-card"
                                    style={{ marginTop: 12 }}
                                >
                                    <Badge tone="medium">
                                        3 Potential Inconsistencies
                                    </Badge>

                                    <div
                                        style={{
                                            color: '#8996ad',
                                            fontSize: 11,
                                            marginTop: 9,
                                        }}
                                    >
                                        These are analytical observations and require
                                        investigator verification. They are not
                                        conclusions of guilt.
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 18 }}>
                                <SectionHeader
                                    eyebrow="EVIDENCE CORRELATION"
                                    title="Evidence ↔ Accused Matrix"
                                    description="Shows how available evidence relates to each accused."
                                />

                                <div className="intel-table-wrap">
                                    <table className="intel-table">
                                        <thead>
                                            <tr>
                                                <th>Evidence</th>
                                                <th>Person A</th>
                                                <th>Person B</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {SAMPLE_EVIDENCE_MATRIX.map((row) => (
                                                <tr key={row.evidence}>
                                                    <td>
                                                        <strong>{row.evidence}</strong>
                                                    </td>
                                                    <td>{row.personA}</td>
                                                    <td>{row.personB}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'vault' && (
                        <>
                            <SectionHeader
                                eyebrow="EVIDENCE MANAGEMENT"
                                title="Evidence Vault"
                                description="Secure workspace for images, videos, documents and investigative material."
                            />

                            <div className="intel-upload">
                                <div className="intel-upload-title">
                                    Upload Investigation Evidence
                                </div>

                                <div className="intel-upload-text">
                                    Images, videos, PDFs, statements, reports and
                                    supporting documents.
                                </div>

                                <label className="intel-button primary">
                                    + Choose Files
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,.pdf,.csv,.txt,.doc,.docx"
                                        onChange={handleUpload}
                                    />
                                </label>
                            </div>

                            <div className="intel-list">
                                {uploadedFiles.map((file) => (
                                    <div className="intel-row" key={file.id}>
                                        <div className="intel-row-top">
                                            <div className="intel-row-title">
                                                {file.name}
                                            </div>

                                            <Badge tone="success">
                                                Uploaded
                                            </Badge>
                                        </div>

                                        <div className="intel-row-meta">
                                            <span>{file.type}</span>
                                            <span>{file.size}</span>
                                            <span>{file.uploadedAt}</span>
                                        </div>
                                    </div>
                                ))}

                                {uploadedFiles.length === 0 && (
                                    <div className="intel-empty">
                                        No additional files uploaded yet.
                                        <br />
                                        Demo evidence records are already available
                                        in the Evidence Explorer.
                                    </div>
                                )}
                            </div>

                            <div
                                className="intel-card"
                                style={{ marginTop: 14 }}
                            >
                                <div className="intel-card-label">
                                    Chain of Custody
                                </div>

                                <div
                                    style={{
                                        color: '#8a96ad',
                                        fontSize: 11,
                                        lineHeight: 1.7,
                                        marginTop: 8,
                                    }}
                                >
                                    Evidence should retain source, uploader,
                                    timestamp, case association and integrity
                                    information before being treated as verified
                                    investigative material.
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'filters' && (
                        <>
                            <SectionHeader
                                eyebrow="INVESTIGATOR WORKSPACE"
                                title="Custom Investigation Filters"
                                description="Create reusable filters according to investigative requirements."
                            />

                            <div className="intel-filter-builder">
                                <input
                                    className="intel-input"
                                    placeholder="Filter name..."
                                    value={filterName}
                                    onChange={(e) =>
                                        setFilterName(e.target.value)
                                    }
                                />

                                <select
                                    className="intel-input"
                                    value={filterType}
                                    onChange={(event) => {
                                        setFilterType(event.target.value);

                                        logActivity(
                                            `Selected investigation filter "${event.target.value}"`
                                        );
                                    }}
                                >
                                    <option>High Risk + Cross Case</option>
                                    <option>Financial Evidence</option>
                                    <option>Recent Activity</option>
                                    <option>Device Linked Cases</option>
                                    <option>Communication + Financial</option>
                                    <option>Cross-Source Activity</option>
                                    <option>Shared Device Cases</option>
                                    <option>Evidence Uploaded Today</option>
                                </select>

                                <button
                                    className="intel-button primary"
                                    onClick={saveFilter}
                                >
                                    Save Filter
                                </button>
                            </div>

                            <div className="intel-list">
                                {savedFilters.map((filter, index) => (
                                    <div
                                        className="intel-saved-filter"
                                        key={`${filter}-${index}`}
                                    >
                                        <span>★ {filter}</span>

                                        <Badge tone="success">
                                            Saved
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <>
                            <SectionHeader
                                eyebrow="AUDIT TRAIL"
                                title="Investigation Activity"
                                description="Timestamped record of investigator and system actions."
                                right={
                                    <Badge tone="success">
                                        Live
                                    </Badge>
                                }
                            />

                            <div className="intel-activity">
                                {activity.map((item) => (
                                    <div
                                        className="intel-activity-row"
                                        key={item.id}
                                    >
                                        <div className="intel-activity-icon">
                                            {item.icon}
                                        </div>

                                        <div className="intel-activity-main">
                                            <strong>{item.user}</strong>
                                            <br />
                                            {item.action}
                                        </div>

                                        <div className="intel-activity-time">
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'report' && (
                        <>
                            <SectionHeader
                                eyebrow="ACTIONABLE INTELLIGENCE"
                                title="Investigation Report"
                                description="Structured report generated from available analytical signals."

                                right={
                                    <div className="intel-actions">
                                        <select
                                            className="intel-input"
                                            value={reportType}
                                            onChange={handleReportTypeChange}
                                        >
                                            <option value="full">
                                                Full Investigation Report
                                            </option>

                                            <option value="evidence">
                                                Evidence Report
                                            </option>

                                            <option value="statements">
                                                Statements Comparison
                                            </option>

                                            <option value="cross-case">
                                                Cross-Case Intelligence
                                            </option>
                                        </select>

                                        <button
                                            className="intel-button primary"
                                            onClick={generateReport}
                                        >
                                            {reportGenerated
                                                ? 'Report Generated ✓'
                                                : 'Generate Report'}
                                        </button>
                                    </div>
                                }
                            />

                            <div className="intel-report">
                                <div className="intel-report-head">
                                    <div>
                                        <h3>
                                            CASE-FUSION Intelligence Report
                                        </h3>

                                        <div
                                            style={{
                                                color: '#77849b',
                                                fontSize: 10,
                                            }}
                                        >
                                            {caseId}
                                        </div>
                                    </div>

                                    <Badge tone="success">
                                        Analytical Draft
                                    </Badge>
                                </div>

                                <div className="intel-report-section">
                                    <h4>Case Overview</h4>

                                    <p>
                                        This investigation contains correlated
                                        telecom, banking, IPDR, social and device
                                        activity. The platform reconstructed a
                                        chronological digital footprint and
                                        identified multiple cross-domain signals.
                                    </p>
                                </div>

                                <div className="intel-report-section">
                                    <h4>Key Findings</h4>

                                    <ul>
                                        <li>
                                            A relevant call was followed by a
                                            significant financial transaction.
                                        </li>

                                        <li>
                                            A device fingerprint appears in another
                                            investigation.
                                        </li>

                                        <li>
                                            Social activity occurred within the
                                            defined investigation window.
                                        </li>

                                        <li>
                                            Multiple relationships between entities
                                            were detected across data sources.
                                        </li>
                                    </ul>
                                </div>

                                <div className="intel-report-section">
                                    <h4>Evidence Summary</h4>

                                    <p>
                                        CDR: 1 relevant record · Bank: 1 relevant
                                        transaction · IPDR: 1 session · Social: 1
                                        activity record · Device: 1 cross-case
                                        match · Image: 1 uploaded reference.
                                    </p>
                                </div>

                                <div className="intel-report-section">
                                    <h4>Cross-Case Intelligence</h4>

                                    <p>
                                        Three relationships were identified,
                                        including shared device, financial and
                                        communication relationships.
                                    </p>
                                </div>

                                <div className="intel-report-section">
                                    <h4>Investigator Review</h4>

                                    <p>
                                        Findings represent analytical signals
                                        generated from available records and must
                                        be verified against source evidence before
                                        operational or legal conclusions are made.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedEvidence && (
                <div
                    className="intel-modal-backdrop"
                    onClick={() => setSelectedEvidence(null)}
                >
                    <div
                        className="intel-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="intel-modal-head">
                            <div>
                                <div className="intel-eyebrow">
                                    EVIDENCE DETAILS
                                </div>
                                <h3>{selectedEvidence.title}</h3>
                            </div>

                            <button
                                className="intel-button"
                                onClick={() => setSelectedEvidence(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="intel-modal-body">
                            <div className="intel-detail-grid">
                                <div className="intel-detail">
                                    <span>Evidence ID</span>
                                    <strong>{selectedEvidence.id}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Type</span>
                                    <strong>{selectedEvidence.type}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Source</span>
                                    <strong>{selectedEvidence.source}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Entity</span>
                                    <strong>{selectedEvidence.entity}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Case</span>
                                    <strong>
                                        {selectedEvidence.relatedCase}
                                    </strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Timestamp</span>
                                    <strong>
                                        {selectedEvidence.timestamp}
                                    </strong>
                                </div>
                            </div>

                            <div
                                className="intel-card"
                                style={{ marginTop: 12 }}
                            >
                                <div className="intel-card-label">
                                    Description
                                </div>

                                <div
                                    style={{
                                        color: '#a9b4c8',
                                        fontSize: 12,
                                        lineHeight: 1.7,
                                        marginTop: 8,
                                    }}
                                >
                                    {selectedEvidence.description}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    marginTop: 12,
                                }}
                            >
                                <Badge
                                    tone={
                                        selectedEvidence.risk === 'High'
                                            ? 'high'
                                            : 'medium'
                                    }
                                >
                                    {selectedEvidence.risk} Risk
                                </Badge>

                                <Badge tone="success">
                                    {selectedEvidence.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {selectedConnection && (
                <div
                    className="intel-modal-backdrop"
                    onClick={() => setSelectedConnection(null)}
                >
                    <div
                        className="intel-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="intel-modal-head">
                            <div>
                                <div className="intel-eyebrow">
                                    CROSS-CASE CONNECTION
                                </div>
                                <h3>
                                    {selectedConnection.entityA}
                                    <span style={{ color: '#7161ff', margin: '0 8px' }}>
                                        ↔
                                    </span>
                                    {selectedConnection.entityB}
                                </h3>
                            </div>

                            <button
                                className="intel-button"
                                onClick={() => setSelectedConnection(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="intel-modal-body">
                            <div className="intel-detail-grid">
                                <div className="intel-detail">
                                    <span>Case A</span>
                                    <strong>{selectedConnection.caseA}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Case B</span>
                                    <strong>{selectedConnection.caseB}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Connection</span>
                                    <strong>{selectedConnection.connection}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Strength</span>
                                    <strong>{selectedConnection.strength}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Identifier</span>
                                    <strong>{selectedConnection.identifier}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>First Observed</span>
                                    <strong>{selectedConnection.firstObserved}</strong>
                                </div>
                            </div>

                            <div className="intel-card" style={{ marginTop: 12 }}>
                                <div className="intel-card-label">
                                    Why These Cases Are Connected
                                </div>

                                <div
                                    style={{
                                        color: '#a9b4c8',
                                        fontSize: 12,
                                        lineHeight: 1.7,
                                        marginTop: 8,
                                    }}
                                >
                                    {selectedConnection.reason}
                                </div>
                            </div>

                            <div className="intel-card" style={{ marginTop: 12 }}>
                                <div className="intel-card-label">
                                    Corroborating Sources
                                </div>

                                <div
                                    className="intel-row-meta"
                                    style={{ marginTop: 10 }}
                                >
                                    {selectedConnection.sources.map((source) => (
                                        <Badge key={source} tone="success">
                                            {source}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedStatement && (
                <div
                    className="intel-modal-backdrop"
                    onClick={() => setSelectedStatement(null)}
                >
                    <div
                        className="intel-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="intel-modal-head">
                            <div>
                                <div className="intel-eyebrow">
                                    ACCUSED STATEMENT
                                </div>
                                <h3>{selectedStatement.name}</h3>
                            </div>

                            <button
                                className="intel-button"
                                onClick={() => setSelectedStatement(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="intel-modal-body">
                            <div className="intel-detail-grid">
                                <div className="intel-detail">
                                    <span>Role</span>
                                    <strong>{selectedStatement.role}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Recorded At</span>
                                    <strong>{selectedStatement.recordedAt}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Recording Officer</span>
                                    <strong>{selectedStatement.officer}</strong>
                                </div>

                                <div className="intel-detail">
                                    <span>Case</span>
                                    <strong>{caseId}</strong>
                                </div>
                            </div>

                            <div className="intel-card" style={{ marginTop: 12 }}>
                                <div className="intel-card-label">
                                    Recorded Statement
                                </div>

                                <div
                                    style={{
                                        marginTop: 9,
                                        color: '#a9b4c8',
                                        fontSize: 12,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    “{selectedStatement.statement}”
                                </div>
                            </div>

                            <div className="intel-card" style={{ marginTop: 12 }}>
                                <div className="intel-card-label">
                                    Claimed Facts
                                </div>

                                <div className="intel-list" style={{ marginTop: 9 }}>
                                    {Object.entries(
                                        selectedStatement.claims || {}
                                    ).map(([key, value]) => (
                                        <div className="intel-row" key={key}>
                                            <div className="intel-row-top">
                                                <strong>{key}</strong>

                                                <span
                                                    style={{
                                                        color: '#a9b4c8',
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {value}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="intel-card" style={{ marginTop: 12 }}>
                                <Badge tone="medium">
                                    Analytical Review Required
                                </Badge>

                                <p
                                    style={{
                                        color: '#8996ad',
                                        fontSize: 11,
                                        lineHeight: 1.6,
                                        marginTop: 9,
                                    }}
                                >
                                    Statement observations are analytical
                                    signals only and must be verified against
                                    source evidence and official records.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}