import { useEffect, useMemo, useState } from 'react';
import { getCases } from '../services/api';
import './Dashboard.css';

function Dashboard({
  onNewInvestigation,
  onOpenInvestigations,
  onOpenCase,
  onOpenAlerts,
  onOpenReports,
  onOpenSettings,
  onOpenTemplates,
  onOpenPersonnel,
  onOpenEntities,
}) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ==========================================
     LOAD CASES
     ========================================== */

  async function loadCases() {
    try {
      setLoading(true);
      setError('');

      const data = await getCases();

      const list = Array.isArray(data)
        ? data
        : data?.cases ||
          data?.data ||
          [];

      setCases(list);
    } catch (err) {
      console.error(
        'Failed to load investigations:',
        err
      );

      setError(
        err.message ||
          'Failed to load investigations.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);


  /* ==========================================
     DASHBOARD STATS
     ========================================== */

  const dashboardStats = useMemo(() => {
    const total = cases.length;

    const analyzed = cases.filter((item) => {
      const status = String(
        item.status ||
          item.caseStatus ||
          ''
      ).toLowerCase();

      return (
        status === 'analyzed' ||
        status === 'complete' ||
        status === 'completed'
      );
    }).length;


    const priorityLeads =
      cases.reduce(
        (totalLeads, item) => {
          const leads =
            item.leads ||
            item.priorityLeads ||
            item.leadCount ||
            [];

          if (Array.isArray(leads)) {
            return (
              totalLeads +
              leads.length
            );
          }

          if (
            typeof leads === 'number'
          ) {
            return (
              totalLeads +
              leads
            );
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


  /* ==========================================
     RECENT CASES
     ========================================== */

  const recentCases = useMemo(() => {
    return cases.slice(0, 5);
  }, [cases]);


  /* ==========================================
     HELPERS
     ========================================== */

  const formatDate = (value) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
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

    if (
      Array.isArray(leads)
    ) {
      return leads.length;
    }

    if (
      typeof leads === 'number'
    ) {
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


  const getStatusClass = (
    status
  ) => {
    const value =
      String(status).toLowerCase();

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


  const getRiskClass = (
    risk
  ) => {
    const value =
      String(risk).toLowerCase();

    if (
      value.includes('high')
    ) {
      return 'cf-risk-high';
    }

    if (
      value.includes('medium')
    ) {
      return 'cf-risk-medium';
    }

    return 'cf-risk-low';
  };


  /* ==========================================
     STAT CARD ACTIONS
     ========================================== */

  const handleStatCardClick = (
    type
  ) => {

    if (
      type === 'active' ||
      type === 'review'
    ) {
      setSidebarOpen(false);

      onOpenInvestigations?.();

      return;
    }


    if (
      type === 'leads'
    ) {

      document
        .getElementById(
          'cf-recent-investigations'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

      return;
    }


    if (
      type === 'alerts'
    ) {

      setSidebarOpen(false);

      onOpenAlerts?.();
    }
  };


  /* ==========================================
     RENDER
     ========================================== */

  return (
    <div className="cf-dashboard">

      {/* =====================================
          MOBILE / SLIDE SIDEBAR
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="cf-sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      <aside
        className={`cf-sidebar ${
          sidebarOpen
            ? 'cf-sidebar-open'
            : ''
        }`}
      >

        <button
          type="button"
          className="cf-sidebar-close"
          aria-label="Close navigation menu"
          onClick={() =>
            setSidebarOpen(false)
          }
        >
          ×
        </button>


        {/* NEW INVESTIGATION */}

        <button
          type="button"
          className="cf-new-investigation"
          onClick={() => {

            setSidebarOpen(false);

            onNewInvestigation?.();

          }}
        >

          <span className="cf-plus">
            ＋
          </span>

          <span>
            New Investigation
          </span>

        </button>


        {/* SIDEBAR NAVIGATION */}

        <nav className="cf-sidebar-nav">

          {/* HOME */}

          <button
            type="button"
            className="cf-nav-item cf-nav-active"
            onClick={() =>
              setSidebarOpen(false)
            }
          >

            <span className="cf-nav-icon">
              ⌂
            </span>

            <span>
              Home
            </span>

          </button>


          {/* CASES */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenInvestigations?.();

            }}
          >

            <span className="cf-nav-icon">
              ▣
            </span>

            <span>
              Cases
            </span>

          </button>


          {/* ==================================
              NEW: ENTITIES
          =================================== */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenEntities?.();

            }}
          >

            <span className="cf-nav-icon">
              ◉
            </span>

            <span>
              Entities
            </span>

          </button>


          {/* VISUALIZER */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() =>
              setSidebarOpen(false)
            }
          >

            <span className="cf-nav-icon">
              ⌘
            </span>

            <span>
              Visualizer
            </span>

          </button>


          {/* ALERTS */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenAlerts?.();

            }}
          >

            <span className="cf-nav-icon">
              △
            </span>

            <span>
              Alerts
            </span>

          </button>


          {/* REPORTS */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenReports?.();

            }}
          >

            <span className="cf-nav-icon">
              ▥
            </span>

            <span>
              Reports
            </span>

          </button>


          {/* PERSONNEL */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenPersonnel?.();

            }}
          >

            <span className="cf-nav-icon">
              ♧
            </span>

            <span>
              Personnel
            </span>

          </button>


          {/* SETTINGS */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenSettings?.();

            }}
          >

            <span className="cf-nav-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>

          </button>


          {/* =================================
              TEMPLATES
          ================================== */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => {

              setSidebarOpen(false);

              onOpenTemplates?.();

            }}
          >

            <span className="cf-nav-icon">
              ▤
            </span>

            <span>
              Templates
            </span>

          </button>

        </nav>

      </aside>


      {/* =====================================
          MAIN AREA
      ====================================== */}

      <main className="cf-main">


        {/* TOP BAR */}

        <header className="cf-topbar">

          <div className="cf-topbar-left">

            {/* HAMBURGER */}

            <button
              type="button"
              className="cf-hamburger-button"
              aria-label="Open navigation menu"
              aria-expanded={
                sidebarOpen
              }
              onClick={() =>
                setSidebarOpen(true)
              }
            >

              <span />
              <span />
              <span />

            </button>


            {/* TOP NAV */}

            <nav className="cf-top-tabs">

              <button
                type="button"
                className="cf-top-tab cf-top-tab-active"
              >
                Overview
              </button>

              <button
                type="button"
                className="cf-top-tab"
              >
                Evidence
              </button>

              <button
                type="button"
                className="cf-top-tab"
              >
                Leads
              </button>

              <button
                type="button"
                className="cf-top-tab"
              >
                Network
              </button>

              <button
                type="button"
                className="cf-top-tab"
                onClick={() =>
                  onOpenReports?.()
                }
              >
                Reports
              </button>

            </nav>

          </div>


          {/* SEARCH */}

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

          </div>

        </header>


        {/* =====================================
            CONTENT
        ====================================== */}

        <section className="cf-content">


          {/* PAGE HEADING */}

          <div className="cf-page-heading">

            <h1>
              Investigation Dashboard
            </h1>

            <p>
              Monitor active investigations,
              high-priority leads and
              critical intelligence signals.
            </p>

          </div>


          {/* ===================================
              STAT CARDS
          ==================================== */}

          <div className="cf-stat-grid">


            {/* ACTIVE */}

            <button
              type="button"
              className="cf-stat-card cf-stat-active"
              onClick={() =>
                handleStatCardClick(
                  'active'
                )
              }
            >

              <div className="cf-stat-top">

                <span>
                  ACTIVE INVESTIGATIONS
                </span>

                <div className="cf-stat-icon cf-icon-green">
                  ◫
                </div>

              </div>

              <strong>
                {loading
                  ? '—'
                  : dashboardStats.total}
              </strong>

              <span className="cf-stat-hint">
                Open investigations →
              </span>

            </button>


            {/* REVIEW */}

            <button
              type="button"
              className="cf-stat-card cf-stat-review"
              onClick={() =>
                handleStatCardClick(
                  'review'
                )
              }
            >

              <div className="cf-stat-top">

                <span>
                  REQUIRES REVIEW
                </span>

                <div className="cf-stat-icon cf-icon-yellow">
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

              <span className="cf-stat-hint">
                Review cases →
              </span>

            </button>


            {/* LEADS */}

            <button
              type="button"
              className="cf-stat-card cf-stat-leads"
              onClick={() =>
                handleStatCardClick(
                  'leads'
                )
              }
            >

              <div className="cf-stat-top">

                <span>
                  PRIORITY LEADS
                </span>

                <div className="cf-stat-icon cf-icon-cyan">
                  ◎
                </div>

              </div>

              <strong>
                {loading
                  ? '—'
                  : dashboardStats.priorityLeads}
              </strong>

              <span className="cf-stat-hint">
                View lead activity →
              </span>

            </button>


            {/* ALERTS */}

            <button
              type="button"
              className="cf-stat-card cf-stat-critical"
              onClick={() =>
                handleStatCardClick(
                  'alerts'
                )
              }
            >

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

              <span className="cf-stat-hint">
                View priority alerts →
              </span>

            </button>

          </div>


          {/* ===================================
              LOWER GRID
          ==================================== */}

          <div className="cf-dashboard-grid">


            {/* =================================
                RECENT INVESTIGATIONS
            ================================== */}

            <section
              id="cf-recent-investigations"
              className="cf-panel cf-investigations-panel"
            >

              <div className="cf-panel-header">

                <h2>
                  Recent Investigations
                </h2>

                <button
                  type="button"
                  className="cf-view-all"
                  onClick={
                    onOpenInvestigations
                  }
                >

                  VIEW ALL

                  <span>
                    →
                  </span>

                </button>

              </div>


              {/* TABLE */}

              <div className="cf-table-wrapper">

                <table className="cf-table">

                  <thead>

                    <tr>

                      <th>
                        Case
                      </th>

                      <th>
                        Case ID
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Risk
                      </th>

                      <th>
                        Leads
                      </th>

                      <th>
                        Last Updated
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {/* LOADING */}

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


                    {/* ERROR */}

                    {!loading &&
                      error && (

                        <tr>

                          <td
                            colSpan="7"
                            className="cf-table-message cf-table-error"
                          >
                            {error}
                          </td>

                        </tr>

                      )}


                    {/* EMPTY */}

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


                    {/* CASES */}

                    {!loading &&
                      !error &&
                      recentCases.map(
                        (
                          item,
                          index
                        ) => {

                          const status =
                            getStatus(
                              item
                            );

                          const risk =
                            getRisk(
                              item
                            );

                          const caseId =
                            getCaseId(
                              item
                            );

                          return (

                            <tr
                              key={
                                caseId ||
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
                                    {
                                      getCaseName(
                                        item
                                      )
                                    }
                                  </span>

                                </div>

                              </td>


                              <td>

                                <span className="cf-case-id">
                                  {caseId}
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
                                {
                                  getLeadCount(
                                    item
                                  )
                                }
                              </td>


                              <td>
                                {
                                  formatDate(
                                    getLastUpdated(
                                      item
                                    )
                                  )
                                }
                              </td>


                              <td>

                                <button
                                  type="button"
                                  className="cf-action-button"
                                  onClick={() => {

                                    if (
                                      caseId &&
                                      caseId !== '—'
                                    ) {

                                      onOpenCase?.(
                                        caseId
                                      );

                                    }

                                  }}
                                >
                                  Open
                                </button>

                              </td>

                            </tr>

                          );

                        }
                      )}

                  </tbody>

                </table>

              </div>

            </section>


            {/* =================================
                RIGHT COLUMN
            ================================== */}

            <div className="cf-right-column">


              {/* PRIORITY ALERTS */}

              <section
                id="cf-priority-alerts"
                className="cf-panel cf-alert-panel"
                onClick={() =>
                  onOpenAlerts?.()
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {

                  if (
                    event.key ===
                      'Enter' ||
                    event.key ===
                      ' '
                  ) {

                    event.preventDefault();

                    onOpenAlerts?.();

                  }

                }}
              >

                <div className="cf-panel-header">

                  <h2>

                    <span className="cf-alert-title-icon">
                      △
                    </span>

                    Priority Alerts

                  </h2>

                </div>


                <div className="cf-alert-list">


                  {/* HIGH */}

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
                      Call followed by large
                      fund transfer
                    </strong>

                    <span className="cf-alert-case">
                      ▱ Case: Loot
                    </span>

                  </div>


                  {/* MEDIUM */}

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
                      Unusual login location
                      detected
                    </strong>

                    <span className="cf-alert-case">
                      ▱ Case: Enigma
                    </span>

                  </div>

                </div>

              </section>


              {/* =================================
                  RECENT ACTIVITY
              ================================== */}

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


              {/* =================================
                  TEMPLATES QUICK CARD
              ================================== */}

              <section
                className="cf-panel cf-template-quick-card"
              >

                <div className="cf-panel-header">

                  <h2>
                    Case Templates
                  </h2>

                  <button
                    type="button"
                    className="cf-view-all"
                    onClick={
                      onOpenTemplates
                    }
                  >
                    VIEW ALL →
                  </button>

                </div>

                <p className="cf-template-description">
                  Use standardized investigation
                  workflows and data schemas.
                </p>

                <button
                  type="button"
                  className="cf-template-button"
                  onClick={
                    onOpenTemplates
                  }
                >
                  Open Case Templates
                </button>

              </section>


            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;