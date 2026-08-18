import './Alerts.css';
import { useMemo, useState } from 'react';

const signals = [
  {
    severity: 'critical',
    signal: 'Call followed by large fund transfer',
    rule: 'RULE-FIN-092',
    entity: 'Target Alpha (UID: 902)',
    time: '10 mins ago',
    icon: '↗',
  },
  {
    severity: 'high',
    signal: 'Cross-case device reuse',
    rule: 'RULE-TECH-044',
    entity: 'IMEI - ***8921',
    time: '1 hr ago',
    icon: '▯',
  },
  {
    severity: 'medium',
    signal: 'Coordinated digital activity',
    rule: 'RULE-NET-112',
    entity: 'Cluster B (4 Nodes)',
    time: '3 hrs ago',
    icon: '⌘',
  },
  {
    severity: 'medium',
    signal: 'Unusual login geolocation',
    rule: 'RULE-GEO-005',
    entity: 'User Access Portal',
    time: '5 hrs ago',
    icon: '◉',
  },
];

function Icon({ children, className = '' }) {
  return <span className={`alerts-icon ${className}`}>{children}</span>;
}

function Alerts({
  onBack,
  onNavigate,
  onOpenSignal,
}) {
  const [activeTab, setActiveTab] = useState('Active Triage');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [search, setSearch] = useState('');

  const filteredSignals = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return signals;

    return signals.filter((item) =>
      `${item.signal} ${item.rule} ${item.entity}`
        .toLowerCase()
        .includes(value)
    );
  }, [search]);

  const visibleSignals = filteredSignals.slice(0, visibleCount);

  function handleNavigate(page) {
    if (onNavigate) {
      onNavigate(page);
    }
  }

  function handleExport() {
    const csv = [
      ['Severity', 'Signal Pattern', 'Rule', 'Entity Focus', 'Time Detected'],
      ...filteredSignals.map((item) => [
        item.severity,
        item.signal,
        item.rule,
        item.entity,
        item.time,
      ]),
    ]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'casefusion-alerts.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="alerts-page">
      <header className="alerts-topbar">
        <button
          type="button"
          className="alerts-brand"
          onClick={() => onBack?.()}
          aria-label="Go to dashboard"
        >
          <span className="alerts-brand-mark">C</span>

          <span className="alerts-brand-copy">
            <strong>CASEFUSION</strong>
            <small>Investigative Intel</small>
          </span>
        </button>

        <div className="alerts-top-search">
          <Icon>⌕</Icon>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search intel..."
            aria-label="Search alerts"
          />
        </div>

        <nav className="alerts-main-nav" aria-label="Main navigation">
          <button onClick={() => handleNavigate('dashboard')}>Overview</button>
          <button onClick={() => handleNavigate('evidence')}>Evidence</button>
          <button onClick={() => handleNavigate('leads')}>Leads</button>
          <button onClick={() => handleNavigate('network')}>Network</button>
          <button onClick={() => handleNavigate('reports')}>Reports</button>
        </nav>

        <div className="alerts-header-actions">
          <button type="button" aria-label="Notifications">♧</button>
          <button type="button" aria-label="Help">?</button>
          <button type="button" className="alerts-avatar" aria-label="Profile">I</button>
        </div>
      </header>

      <aside className="alerts-sidebar">
        <div className="alerts-sidebar-brand">
          <div className="alerts-sidebar-title">CASEFUSION</div>
          <div className="alerts-sidebar-subtitle">Investigative Intel</div>
        </div>

        <button
          type="button"
          className="alerts-new-button"
          onClick={() => handleNavigate('new-investigation')}
        >
          <span>＋</span>
          New Investigation
        </button>

        <nav className="alerts-sidebar-nav" aria-label="Sidebar navigation">
          <button onClick={() => handleNavigate('dashboard')}>
            <span className="nav-symbol">▦</span>
            Home
          </button>

          <button onClick={() => handleNavigate('investigations')}>
            <span className="nav-symbol">▣</span>
            Cases
          </button>

          <button onClick={() => handleNavigate('visualizer')}>
            <span className="nav-symbol">⌘</span>
            Visualizer
          </button>

          <button className="active">
            <span className="nav-symbol">△</span>
            Alerts
          </button>

          <button onClick={() => handleNavigate('reports')}>
            <span className="nav-symbol">▤</span>
            Reports
          </button>

          <button onClick={() => handleNavigate('personnel')}>
            <span className="nav-symbol">♙</span>
            Personnel
          </button>

          <button onClick={() => handleNavigate('settings')}>
            <span className="nav-symbol">⚙</span>
            Settings
          </button>
        </nav>

        <button
          type="button"
          className="alerts-profile-link"
          onClick={() => handleNavigate('profile')}
        >
          <span>◎</span>
          Investigator Profile
        </button>
      </aside>

      <main className="alerts-content">
        <div className="alerts-page-heading">
          <div>
            <h1>Alerts</h1>
            <p>Review intelligence signals requiring investigator attention.</p>
          </div>

          <div className="alerts-page-actions">
            <button
              type="button"
              className={`alerts-outline-button ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen((value) => !value)}
            >
              <span>≡</span>
              Filter
            </button>

            <button
              type="button"
              className="alerts-outline-button"
              onClick={handleExport}
            >
              <span>⇩</span>
              Export
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="alerts-filter-panel">
            <label>
              Severity
              <select defaultValue="all">
                <option value="all">All severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </label>

            <label>
              Time
              <select defaultValue="all">
                <option value="all">All time</option>
                <option value="hour">Last hour</option>
                <option value="day">Last 24 hours</option>
              </select>
            </label>
          </div>
        )}

        <section className="alerts-stat-grid">
          <button type="button" className="alert-stat critical">
            <div className="stat-top">
              <span>CRITICAL SIGNALS</span>
              <b>◉</b>
            </div>
            <div className="stat-value-row">
              <strong>3</strong>
              <small>↑2</small>
            </div>
          </button>

          <button type="button" className="alert-stat high">
            <div className="stat-top">
              <span>HIGH PRIORITY</span>
              <b>△</b>
            </div>
            <div className="stat-value-row">
              <strong>12</strong>
              <small>−0</small>
            </div>
          </button>

          <button type="button" className="alert-stat medium">
            <div className="stat-top">
              <span>MEDIUM PRIORITY</span>
              <b>ⓘ</b>
            </div>
            <div className="stat-value-row">
              <strong>28</strong>
              <small>↓5</small>
            </div>
          </button>

          <button type="button" className="alert-stat resolved">
            <div className="stat-top">
              <span>RESOLVED (24H)</span>
              <b>✓</b>
            </div>
            <div className="stat-value-row">
              <strong>45</strong>
            </div>
          </button>
        </section>

        <section className="alerts-table-card">
          <div className="alerts-tabs">
            {['Active Triage', 'Assigned to Me', 'Archived'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="alerts-table-wrap">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Sev</th>
                  <th>Signal Pattern</th>
                  <th>Entity Focus</th>
                  <th>Time Detected</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleSignals.map((item) => (
                  <tr
                    key={`${item.rule}-${item.signal}`}
                    className="alert-row"
                    onClick={() => onOpenSignal?.(item)}
                  >
                    <td>
                      <span className={`severity-dot ${item.severity}`} />
                    </td>

                    <td>
                      <div className="signal-name">{item.signal}</div>
                      <div className="signal-rule">{item.rule}</div>
                    </td>

                    <td>
                      <div className={`entity-focus ${item.severity}`}>
                        <span>{item.icon}</span>
                        {item.entity}
                      </div>
                    </td>

                    <td className="time-detected">{item.time}</td>

                    <td>
                      <button
                        type="button"
                        className="alert-open-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenSignal?.(item);
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleSignals.length === 0 && (
                  <tr>
                    <td colSpan="5" className="alerts-empty">
                      No intelligence signals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {visibleCount < filteredSignals.length && (
            <button
              type="button"
              className="alerts-load-more"
              onClick={() => setVisibleCount((count) => count + 4)}
            >
              Load More Signals
              <span>⌄</span>
            </button>
          )}
        </section>
      </main>
    </div>
  );
}

export default Alerts;