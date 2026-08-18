import { useEffect, useMemo, useState } from 'react';
import { getCases } from '../services/api';
import './Investigations.css';
import './InvestigationIntel.css';

function Investigations({
  onBack,
  onNewInvestigation,
  onOpenCase,
}) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const casesPerPage = 3;

  /* =====================================================
     LOAD CASES
  ====================================================== */

  const loadCases = async () => {
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
        err?.message ||
          'Failed to load investigations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  /* =====================================================
     HELPERS
  ====================================================== */

  const getCaseName = (item) => {
    return (
      item?.caseName ||
      item?.name ||
      item?.title ||
      'Untitled Investigation'
    );
  };

  const getCaseId = (item) => {
    return (
      item?.caseId ||
      item?.id ||
      item?._id ||
      '—'
    );
  };

  const getStatus = (item) => {
    return (
      item?.status ||
      item?.caseStatus ||
      'Pending'
    );
  };

  const getRisk = (item) => {
    return (
      item?.risk ||
      item?.riskLevel ||
      item?.priority ||
      'Low'
    );
  };

  const getLeadCount = (item) => {
    const leads =
      item?.leads ||
      item?.priorityLeads ||
      item?.leadCount;

    if (Array.isArray(leads)) {
      return leads.length;
    }

    if (typeof leads === 'number') {
      return leads;
    }

    return 0;
  };

  const getCreatedDate = (item) => {
    return (
      item?.createdAt ||
      item?.created ||
      item?.dateCreated
    );
  };

  const getUpdatedDate = (item) => {
    return (
      item?.updatedAt ||
      item?.updated ||
      item?.lastUpdated ||
      item?.analyzedAt ||
      item?.createdAt
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

  const normalize = (value) =>
    String(value || '')
      .trim()
      .toLowerCase();

  /* =====================================================
     FILTERING
  ====================================================== */

  const filteredCases = useMemo(() => {
    const query = normalize(search);

    return cases.filter((item) => {
      const name = getCaseName(item);
      const id = getCaseId(item);
      const status = getStatus(item);
      const risk = getRisk(item);

      const matchesSearch =
        !query ||
        normalize(name).includes(query) ||
        normalize(id).includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        normalize(status) ===
          normalize(statusFilter);

      const matchesRisk =
        riskFilter === 'All' ||
        normalize(risk) ===
          normalize(riskFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk
      );
    });
  }, [
    cases,
    search,
    statusFilter,
    riskFilter,
  ]);

  /* =====================================================
     PAGINATION
  ====================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCases.length / casesPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    casesPerPage;

  const visibleCases =
    filteredCases.slice(
      startIndex,
      startIndex + casesPerPage
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    riskFilter,
  ]);

  /* =====================================================
     STATUS / RISK CLASSES
  ====================================================== */

  const statusClass = (status) => {
    const value = normalize(status);

    if (value.includes('analy')) {
      return 'inv-status-analyzed';
    }

    if (value.includes('pending')) {
      return 'inv-status-pending';
    }

    if (value.includes('archive')) {
      return 'inv-status-archived';
    }

    if (value.includes('upload')) {
      return 'inv-status-uploaded';
    }

    return 'inv-status-pending';
  };

  const riskClass = (risk) => {
    const value = normalize(risk);

    if (value.includes('high')) {
      return 'inv-risk-high';
    }

    if (value.includes('medium')) {
      return 'inv-risk-medium';
    }

    return 'inv-risk-low';
  };

  /* =====================================================
     BACK
  ====================================================== */

  const handleBack = () => {
    setSidebarOpen(false);

    if (typeof onBack === 'function') {
      onBack();
    }
  };

  /* =====================================================
     OPEN CASE
  ====================================================== */

  const handleOpenCase = (item) => {
    if (typeof onOpenCase !== 'function') {
      console.log(
        'Open investigation:',
        item
      );
      return;
    }

    const caseId = getCaseId(item);

    if (!caseId || caseId === '—') {
      console.error(
        'Cannot open investigation: Case ID not found.',
        item
      );
      return;
    }

    console.log(
      'Opening investigation:',
      caseId
    );

    onOpenCase(caseId);
  };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="inv-page">

      {/* =================================================
          SIDEBAR DRAWER
      ================================================== */}

      <aside
        className={`inv-drawer ${
          sidebarOpen
            ? 'inv-drawer-open'
            : ''
        }`}
        aria-hidden={!sidebarOpen}
      >

        <div className="inv-drawer-header">

          <div
            className="inv-brand"
            role="button"
            tabIndex={0}
            onClick={handleBack}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' ||
                event.key === ' '
              ) {
                event.preventDefault();
                handleBack();
              }
            }}
          >

            <div className="inv-brand-title">
              CASEFUSION
            </div>

            <div className="inv-brand-subtitle">
              Investigative Intel
            </div>

          </div>

          <button
            type="button"
            className="inv-drawer-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close navigation"
          >
            ×
          </button>

        </div>

        <button
          type="button"
          className="inv-new-button"
          onClick={() => {

            setSidebarOpen(false);

            if (
              typeof onNewInvestigation ===
              'function'
            ) {
              onNewInvestigation();
            }

          }}
        >

          <span className="inv-new-plus">
            ＋
          </span>

          <span>
            New Investigation
          </span>

        </button>

        <nav className="inv-sidebar-nav">

          <button
            type="button"
            className="inv-nav-item"
            onClick={handleBack}
          >
            <span>Home</span>
          </button>

          <button
            type="button"
            className="inv-nav-item inv-nav-active"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>Cases</span>
          </button>

          <button
            type="button"
            className="inv-nav-item"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>Visualizer</span>
          </button>

          <button
            type="button"
            className="inv-nav-item"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>Reports</span>
          </button>

          <button
            type="button"
            className="inv-nav-item"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>Personnel</span>
          </button>

          <button
            type="button"
            className="inv-nav-item"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>Settings</span>
          </button>

        </nav>

      </aside>

      {/* =================================================
          MAIN
      ================================================== */}

      <main
        className={`inv-main ${
          sidebarOpen
            ? 'inv-main-shifted'
            : ''
        }`}
      >

        {/* =================================================
            TOP BAR
        ================================================== */}

        <header className="inv-topbar">

          <button
            type="button"
            className="inv-hamburger"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >

            <span />
            <span />
            <span />

          </button>

          <div className="inv-top-search">

            <span>
              ⌕
            </span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search investigations..."
            />

          </div>

          <nav className="inv-top-nav">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              Evidence
            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              Leads
            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              Network
            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              Reports
            </button>

          </nav>

        </header>

        {/* =================================================
            CONTENT
        ================================================== */}

        <section className="inv-content">

          {/* =================================================
              PAGE HEADING + BACK BUTTON
          ================================================== */}

          <div className="inv-heading">

            <div className="inv-heading-left">

              <button
                type="button"
                className="inv-back-button"
                onClick={handleBack}
              >
                ← Back
              </button>

              <div>

                <h1>
                  Investigations
                </h1>

                <p>
                  Search and manage
                  investigation cases.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              FILTER BAR
          ================================================== */}

          <section className="inv-filter-panel">

            <div className="inv-filter-search">

              <span>
                ▽
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Filter cases by name or ID..."
              />

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="inv-filter-select"
            >

              <option value="All">
                Status: All
              </option>

              <option value="Analyzed">
                Status: Analyzed
              </option>

              <option value="Pending">
                Status: Pending
              </option>

              <option value="Archived">
                Status: Archived
              </option>

              <option value="Uploaded">
                Status: Uploaded
              </option>

            </select>

            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(
                  event.target.value
                )
              }
              className="inv-filter-select"
            >

              <option value="All">
                Risk: All
              </option>

              <option value="High">
                Risk: High
              </option>

              <option value="Medium">
                Risk: Medium
              </option>

              <option value="Low">
                Risk: Low
              </option>

            </select>

            <button
              type="button"
              className="inv-date-filter"
            >

              <span>
                □
              </span>

              <span>
                Date Range
              </span>

            </button>

          </section>

          {/* =================================================
              TABLE
          ================================================== */}

          <section className="inv-table-panel">

            <div className="inv-table-scroll">

              <table className="inv-table">

                <thead>

                  <tr>

                    <th>
                      Case Name
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
                      Priority Leads
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Last Updated
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading && (
                    <tr>

                      <td
                        colSpan="8"
                        className="inv-message"
                      >
                        Loading investigations...
                      </td>

                    </tr>
                  )}

                  {!loading &&
                    error && (
                      <tr>

                        <td
                          colSpan="8"
                          className="inv-message inv-error"
                        >
                          {error}
                        </td>

                      </tr>
                    )}

                  {!loading &&
                    !error &&
                    visibleCases.length ===
                      0 && (
                      <tr>

                        <td
                          colSpan="8"
                          className="inv-message"
                        >
                          No investigations
                          found.
                        </td>

                      </tr>
                    )}

                  {!loading &&
                    !error &&
                    visibleCases.map(
                      (item, index) => {

                        const name =
                          getCaseName(item);

                        const id =
                          getCaseId(item);

                        const status =
                          getStatus(item);

                        const risk =
                          getRisk(item);

                        const leads =
                          getLeadCount(item);

                        return (
                          <tr
                            key={
                              id !== '—'
                                ? id
                                : index
                            }
                          >

                            <td>

                              <span className="inv-case-name">
                                {name}
                              </span>

                            </td>

                            <td>

                              <span className="inv-case-id">
                                {id}
                              </span>

                            </td>

                            <td>

                              <span
                                className={`inv-status ${statusClass(
                                  status
                                )}`}
                              >

                                <span className="inv-status-dot" />

                                {status}

                              </span>

                            </td>

                            <td>

                              <span
                                className={`inv-risk ${riskClass(
                                  risk
                                )}`}
                              >
                                {risk}
                              </span>

                            </td>

                            <td className="inv-leads">
                              {leads}
                            </td>

                            <td>
                              {formatDate(
                                getCreatedDate(
                                  item
                                )
                              )}
                            </td>

                            <td>
                              {formatDate(
                                getUpdatedDate(
                                  item
                                )
                              )}
                            </td>

                            <td>

                              <button
                                type="button"
                                className="inv-open-button"
                                onClick={() =>
                                  handleOpenCase(
                                    item
                                  )
                                }
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

            {/* =================================================
                FOOTER / PAGINATION
            ================================================== */}

            <div className="inv-table-footer">

              <span>

                {filteredCases.length ===
                  0
                  ? 'Showing 0 cases'
                  : `Showing ${
                      startIndex + 1
                    } to ${Math.min(
                      startIndex +
                        casesPerPage,
                      filteredCases.length
                    )} of ${
                      filteredCases.length
                    } cases`}

              </span>

              <div className="inv-pagination">

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          page - 1,
                          1
                        )
                    )
                  }
                  aria-label="Previous page"
                >
                  ‹
                </button>

                <button
                  type="button"
                  disabled={
                    safeCurrentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          page + 1,
                          totalPages
                        )
                    )
                  }
                  aria-label="Next page"
                >
                  ›
                </button>

              </div>

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Investigations;