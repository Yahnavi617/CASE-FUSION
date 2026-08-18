import { useEffect, useMemo, useState } from 'react';
import { getCases } from '../services/api';
import './Dashboard.css';

function Dashboard({
  onNewInvestigation,
  onOpenInvestigations,
  onOpenCase,
}) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCases() {
    try {
      setLoading(true);
      setError('');

      const data = await getCases();

      const list = Array.isArray(data)
        ? data
        : data?.cases || data?.data || [];

      setCases(list);
    } catch (err) {
      console.error('Failed to load investigations:', err);
      setError(
        err.message || 'Failed to load investigations.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  const dashboardStats = useMemo(() => {
    const total = cases.length;

    const analyzed = cases.filter((item) => {
      const status = String(
        item.status || item.caseStatus || ''
      ).toLowerCase();

      return (
        status === 'analyzed' ||
        status === 'complete' ||
        status === 'completed'
      );
    }).length;

    const priorityLeads = cases.reduce(
      (totalLeads, item) => {
        const leads =
          item.leads ||
          item.priorityLeads ||
          item.leadCount ||
          [];

        if (Array.isArray(leads)) {
          return totalLeads + leads.length;
        }

        if (typeof leads === 'number') {
          return totalLeads + leads;
        }

        return totalLeads;
      },
      0
    );

    return {
      total,
      analyzed,
      priorityLeads,
    };
  }, [cases]);

  const recentCases = useMemo(() => {
    return cases.slice(0, 5);
  }, [cases]);

  const formatDate = (value) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCaseName = (item) => {
    return (
      item.caseName ||
      item.name ||
      item.title ||
      'Untitled Investigation'
    );
  };

  const getCaseId = (item) => {
    return (
      item.caseId ||
      item.id ||
      item._id ||
      '—'
    );
  };

  const getStatus = (item) => {
    return (
      item.status ||
      item.caseStatus ||
      'Uploaded'
    );
  };

  const getLeadCount = (item) => {
    const leads =
      item.leads ||
      item.priorityLeads ||
      item.leadCount;

    if (Array.isArray(leads)) {
      return leads.length;
    }

    if (typeof leads === 'number') {
      return leads;
    }

    return 0;
  };

  const getRisk = (item) => {
    const risk =
      item.risk ||
      item.riskLevel ||
      item.priority ||
      '';

    if (!risk) {
      return 'Low';
    }

    return String(risk);
  };

  const getLastUpdated = (item) => {
    return (
      item.updatedAt ||
      item.updated ||
      item.analyzedAt ||
      item.createdAt
    );
  };

  const getStatusClass = (status) => {
    const value = String(status).toLowerCase();

    if (
      value.includes('analy')
    ) {
      return 'cf-status-analyzed';
    }

    if (
      value.includes('archive')
    ) {
      return 'cf-status-archived';
    }

    return 'cf-status-uploaded';
  };

  const getRiskClass = (risk) => {
    const value = String(risk).toLowerCase();

    if (value.includes('high')) {
      return 'cf-risk-high';
    }

    if (value.includes('medium')) {
      return 'cf-risk-medium';
    }

    return 'cf-risk-low';
  };

  return (
    <div className="cf-dashboard">

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="cf-sidebar">

        <div className="cf-brand">
          <div className="cf-brand-icon">
            <span>♜</span>
          </div>

          <div>
            <div className="cf-brand-name">
              CASEFUSION
            </div>

            <div className="cf-brand-subtitle">
              Investigative Intel
            </div>
          </div>
        </div>

        <button
          type="button"
          className="cf-new-investigation"
          onClick={onNewInvestigation}
        >
          <span className="cf-plus">＋</span>
          <span>New Investigation</span>
        </button>

        <nav className="cf-sidebar-nav">

          <button
            type="button"
            className="cf-nav-item cf-nav-active"
          >
            <span className="cf-nav-icon">⌂</span>
            <span>Home</span>
          </button>

          <button
  type="button"
  className="cf-nav-item"
  onClick={onOpenInvestigations}
>
  <span className="cf-nav-icon">▣</span>
  <span>Cases</span>
</button>

          <button
            type="button"
            className="cf-nav-item"
          >
            <span className="cf-nav-icon">⌘</span>
            <span>Visualizer</span>
          </button>

          <button
            type="button"
            className="cf-nav-item"
          >
            <span className="cf-nav-icon">▥</span>
            <span>Reports</span>
          </button>

          <button
            type="button"
            className="cf-nav-item"
          >
            <span className="cf-nav-icon">♧</span>
            <span>Personnel</span>
          </button>

          <button
            type="button"
            className="cf-nav-item"
          >
            <span className="cf-nav-icon">⚙</span>
            <span>Settings</span>
          </button>

        </nav>

        <div className="cf-sidebar-profile">
          <div className="cf-profile-icon">
            ♙
          </div>

          <div>
            <div className="cf-profile-title">
              Investigator Profile
            </div>
          </div>
        </div>

      </aside>


      {/* =========================
          MAIN AREA
      ========================== */}

      <main className="cf-main">

        {/* TOP NAVIGATION */}

        <header className="cf-topbar">

          <nav className="cf-top-tabs">

            <button className="cf-top-tab cf-top-tab-active">
              Overview
            </button>

            <button className="cf-top-tab">
              Evidence
            </button>

            <button className="cf-top-tab">
              Leads
            </button>

            <button className="cf-top-tab">
              Network
            </button>

            <button className="cf-top-tab">
              Reports
            </button>

          </nav>

          <div className="cf-top-actions">

            <div className="cf-search">
              <span className="cf-search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search entity, ID, or keyword..."
              />
            </div>

            <button
              type="button"
              className="cf-icon-button"
              title="Notifications"
            >
              ♧
            </button>

            <button
              type="button"
              className="cf-icon-button"
              title="Help"
            >
              ?
            </button>

            <div className="cf-user-avatar">
              I
            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <section className="cf-content">

          <div className="cf-page-heading">

            <h1>
              Investigation Dashboard
            </h1>

            <p>
              Monitor active investigations,
              high-priority leads and critical
              intelligence signals.
            </p>

          </div>


          {/* =========================
              STAT CARDS
          ========================== */}

          <div className="cf-stat-grid">

            <div className="cf-stat-card">

              <div className="cf-stat-top">
                <span>
                  ACTIVE INVESTIGATIONS
                </span>

                <div className="cf-stat-icon cf-icon-purple">
                  ◫
                </div>
              </div>

              <strong>
                {loading
                  ? '—'
                  : dashboardStats.total}
              </strong>

            </div>


            <div className="cf-stat-card">

              <div className="cf-stat-top">
                <span>
                  REQUIRES REVIEW
                </span>

                <div className="cf-stat-icon cf-icon-gold">
                  ▣
                </div>
              </div>

              <strong>
                {loading
                  ? '—'
                  : Math.max(
                      dashboardStats.total -
                        dashboardStats.analyzed,
                      0
                    )}
              </strong>

            </div>


            <div className="cf-stat-card">

              <div className="cf-stat-top">
                <span>
                  PRIORITY LEADS
                </span>

                <div className="cf-stat-icon cf-icon-orange">
                  ◎
                </div>
              </div>

              <strong>
                {loading
                  ? '—'
                  : dashboardStats.priorityLeads}
              </strong>

            </div>


            <div className="cf-stat-card">

              <div className="cf-stat-top">
                <span>
                  CRITICAL ALERTS
                </span>

                <div className="cf-stat-icon cf-icon-red">
                  △
                </div>
              </div>

              <strong>
                2
              </strong>

            </div>

          </div>


          {/* =========================
              LOWER DASHBOARD
          ========================== */}

          <div className="cf-dashboard-grid">

            {/* RECENT INVESTIGATIONS */}

            <section className="cf-panel cf-investigations-panel">

              <div className="cf-panel-header">

                <h2>
                  Recent Investigations
                </h2>

                <button
  type="button"
  className="cf-view-all"
  onClick={onOpenInvestigations}
>
  VIEW ALL
  <span>→</span>
</button>

              </div>


              <div className="cf-table-wrapper">

                <table className="cf-table">

                  <thead>
                    <tr>
                      <th>Case</th>
                      <th>Case ID</th>
                      <th>Status</th>
                      <th>Risk</th>
                      <th>Leads</th>
                      <th>Last Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {loading && (
                      <tr>
                        <td
                          colSpan="7"
                          className="cf-table-message"
                        >
                          Loading investigations...
                        </td>
                      </tr>
                    )}

                    {!loading && error && (
                      <tr>
                        <td
                          colSpan="7"
                          className="cf-table-message cf-table-error"
                        >
                          {error}
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      !error &&
                      recentCases.length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="cf-table-message"
                          >
                            No investigations yet.
                          </td>
                        </tr>
                      )}

                    {!loading &&
                      !error &&
                      recentCases.map((item, index) => {

                        const status =
                          getStatus(item);

                        const risk =
                          getRisk(item);

                        return (
                          <tr
                            key={
                              getCaseId(item) ||
                              index
                            }
                          >

                            <td>
                              <div className="cf-case-name">

                                <span
                                  className={
                                    index === 0
                                      ? 'cf-case-dot cf-dot-active'
                                      : 'cf-case-dot'
                                  }
                                />

                                <span>
                                  {getCaseName(item)}
                                </span>

                              </div>
                            </td>


                            <td>
                              <span className="cf-case-id">
                                {getCaseId(item)}
                              </span>
                            </td>


                            <td>
                              <span
                                className={`cf-badge ${getStatusClass(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>


                            <td>
                              <span
                                className={`cf-badge ${getRiskClass(
                                  risk
                                )}`}
                              >
                                {risk}
                              </span>
                            </td>


                            <td>
                              {getLeadCount(item)}
                            </td>


                            <td>
                              {formatDate(
                                getLastUpdated(item)
                              )}
                            </td>


                            <td>
  <button
    type="button"
    className="cf-action-button"
    onClick={() => {
      const caseId = getCaseId(item);

      console.log('Opening case:', caseId);

      if (caseId && caseId !== '—') {
        onOpenCase?.(caseId);
      }
    }}
  >
    Open
  </button>
</td>

                          </tr>
                        );
                      })}

                  </tbody>

                </table>

              </div>

            </section>


            {/* RIGHT COLUMN */}

            <div className="cf-right-column">


              {/* PRIORITY ALERTS */}

              <section className="cf-panel cf-alert-panel">

                <div className="cf-panel-header">

                  <h2>
                    <span className="cf-alert-title-icon">
                      △
                    </span>

                    Priority Alerts
                  </h2>

                </div>


                <div className="cf-alert-list">

                  <div className="cf-alert cf-alert-high">

                    <div className="cf-alert-top">

                      <span className="cf-severity cf-severity-high">
                        High Severity
                      </span>

                      <span className="cf-alert-time">
                        14:37:44
                      </span>

                    </div>

                    <strong>
                      Call followed by large fund
                      transfer
                    </strong>

                    <span className="cf-alert-case">
                      ▱ Case: Loot
                    </span>

                  </div>


                  <div className="cf-alert cf-alert-medium">

                    <div className="cf-alert-top">

                      <span className="cf-severity cf-severity-medium">
                        Medium Severity
                      </span>

                      <span className="cf-alert-time">
                        11:12:05
                      </span>

                    </div>

                    <strong>
                      Unusual login location detected
                    </strong>

                    <span className="cf-alert-case">
                      ▱ Case: Enigma
                    </span>

                  </div>

                </div>

              </section>


              {/* RECENT ACTIVITY */}

              <section className="cf-panel cf-activity-panel">

                <div className="cf-panel-header">

                  <h2>
                    <span className="cf-activity-icon">
                      ◷
                    </span>

                    Recent Activity
                  </h2>

                </div>


                <div className="cf-activity-list">

                  <div className="cf-activity-item">

                    <span className="cf-activity-dot cf-activity-active" />

                    <div>
                      <strong>
                        Investigation analyzed
                      </strong>

                      <span>
                        Case: Loot • 10 mins ago
                      </span>
                    </div>

                  </div>


                  <div className="cf-activity-item">

                    <span className="cf-activity-dot" />

                    <div>
                      <strong>
                        Lead score updated
                      </strong>

                      <span>
                        Entity: John Doe • 1 hr ago
                      </span>
                    </div>

                  </div>


                  <div className="cf-activity-item">

                    <span className="cf-activity-dot" />

                    <div>
                      <strong>
                        Document parsed and indexed
                      </strong>

                      <span>
                        Source: DarkWeb • 3 hrs ago
                      </span>
                    </div>

                  </div>

                </div>

              </section>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;