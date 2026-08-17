import { useEffect, useMemo, useState } from 'react';
import { getCases } from '../services/api';

function Dashboard({
  onNewInvestigation,
  onOpenCase,
}) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================
  // SEARCH / FILTER / SORT
  // =========================

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('all');

  const [sortOption, setSortOption] =
    useState('newest');

  // =========================
  // LOAD CASES
  // =========================

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      setError('');

      const data = await getCases();

      setCases(
        Array.isArray(data?.cases)
          ? data.cases
          : []
      );
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
  }

  // =========================
  // DASHBOARD METRICS
  // =========================

  const analyzedCases = useMemo(
    () =>
      cases.filter(
        (item) =>
          item?.status === 'analyzed'
      ).length,
    [cases]
  );

  const uploadedCases = useMemo(
    () =>
      cases.filter(
        (item) =>
          item?.status === 'uploaded'
      ).length,
    [cases]
  );

  const priorityLeads = useMemo(
    () =>
      cases.reduce(
        (total, item) =>
          total +
          Number(item?.leadCount || 0),
        0
      ),
    [cases]
  );

  const analysisRate = useMemo(() => {
    if (!cases.length) {
      return 0;
    }

    return Math.round(
      (analyzedCases / cases.length) * 100
    );
  }, [cases.length, analyzedCases]);

  // =========================
  // FILTER + SEARCH + SORT
  // =========================

  const filteredCases = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    const matchingCases = cases.filter(
      (item) => {
        const name =
          String(item?.name || '')
            .toLowerCase();

        const caseId =
          String(item?.caseId || '')
            .toLowerCase();

        const matchesSearch =
          !search ||
          name.includes(search) ||
          caseId.includes(search);

        const matchesStatus =
          statusFilter === 'all' ||
          item?.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

    return [...matchingCases].sort(
      (a, b) => {
        switch (sortOption) {
          case 'oldest': {
            const dateA = a?.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

            const dateB = b?.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

            return dateA - dateB;
          }

          case 'leads-high':
            return (
              Number(b?.leadCount || 0) -
              Number(a?.leadCount || 0)
            );

          case 'leads-low':
            return (
              Number(a?.leadCount || 0) -
              Number(b?.leadCount || 0)
            );

          case 'newest':
          default: {
            const dateA = a?.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

            const dateB = b?.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

            return dateB - dateA;
          }
        }
      }
    );
  }, [
    cases,
    searchTerm,
    statusFilter,
    sortOption,
  ]);

  // =========================
  // HELPERS
  // =========================

  function clearFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setSortOption('newest');
  }

  function formatDate(date) {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '—';
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  }

  function formatStatus(status) {
    if (!status) {
      return 'Unknown';
    }

    return String(status)
      .charAt(0)
      .toUpperCase() +
      String(status).slice(1);
  }

  return (
    <div className="app dashboard-app">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="topbar dashboard-topbar">
        <div className="brand">
          <div className="brand-mark">
            C
          </div>

          <div>
            <h1>CASEFUSION</h1>

            <p>
              Investigation Intelligence Platform
            </p>
          </div>
        </div>

        <button
          type="button"
          className="new-case-btn"
          onClick={onNewInvestigation}
        >
          <span className="new-case-plus">
            +
          </span>

          <span>
            New Investigation
          </span>
        </button>
      </header>

      {/* =====================================================
          MAIN DASHBOARD
      ====================================================== */}

      <main className="dashboard">
        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <div>
              <p className="section-label">
                COMMAND CENTER
              </p>

              <h2>
                Investigation Dashboard
              </h2>

              <p className="hero-text">
                Analyze cross-source intelligence,
                track investigations, and surface
                high-priority leads.
              </p>
            </div>

            <div className="hero-status">
              <span className="hero-status-dot" />

              <div>
                <strong>
                  Intelligence System
                </strong>

                <small>
                  Ready for investigation
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        ==================================================== */}

        <section
          className="stats-grid dashboard-stats-grid"
          aria-label="Investigation statistics"
        >
          <div className="stat-card dashboard-stat-card">
            <div className="stat-card-top">
              <span>
                TOTAL CASES
              </span>

              <div className="stat-icon">
                ◫
              </div>
            </div>

            <strong>
              {cases.length}
            </strong>

            <small>
              Investigations created
            </small>
          </div>

          <div className="stat-card dashboard-stat-card">
            <div className="stat-card-top">
              <span>
                ANALYZED CASES
              </span>

              <div className="stat-icon stat-icon-success">
                ✓
              </div>
            </div>

            <strong>
              {analyzedCases}
            </strong>

            <small>
              {analysisRate}% of all cases analyzed
            </small>
          </div>

          <div className="stat-card dashboard-stat-card">
            <div className="stat-card-top">
              <span>
                PRIORITY LEADS
              </span>

              <div className="stat-icon stat-icon-lead">
                !
              </div>
            </div>

            <strong>
              {priorityLeads}
            </strong>

            <small>
              Leads identified across cases
            </small>
          </div>
        </section>

        {/* ===================================================
            QUICK STATUS OVERVIEW
        ==================================================== */}

        <section className="dashboard-overview-strip">
          <div className="overview-strip-item">
            <div className="overview-strip-indicator analyzed" />

            <div>
              <span>
                ANALYZED
              </span>

              <strong>
                {analyzedCases}
              </strong>
            </div>
          </div>

          <div className="overview-strip-item">
            <div className="overview-strip-indicator uploaded" />

            <div>
              <span>
                AWAITING ANALYSIS
              </span>

              <strong>
                {uploadedCases}
              </strong>
            </div>
          </div>

          <div className="overview-strip-item">
            <div className="overview-strip-indicator leads" />

            <div>
              <span>
                LEAD DENSITY
              </span>

              <strong>
                {cases.length
                  ? (
                      priorityLeads /
                      cases.length
                    ).toFixed(1)
                  : '0.0'}
                <small>
                  {' '}
                  leads/case
                </small>
              </strong>
            </div>
          </div>

          <div className="overview-strip-item">
            <div className="overview-strip-indicator system" />

            <div>
              <span>
                PLATFORM STATUS
              </span>

              <strong>
                Operational
              </strong>
            </div>
          </div>
        </section>

        {/* ===================================================
            INVESTIGATIONS
        ==================================================== */}

        <section className="investigations dashboard-investigations">
          <div className="section-heading dashboard-section-heading">
            <div>
              <p className="section-label">
                CASE MANAGEMENT
              </p>

              <h3>
                Recent Investigations
              </h3>

              <p className="section-description">
                Search, filter, and open your
                investigation workspace.
              </p>
            </div>

            <button
              type="button"
              className="view-all-btn dashboard-refresh-btn"
              onClick={loadCases}
              disabled={loading}
            >
              <span
                className={
                  loading
                    ? 'refresh-icon refresh-spinning'
                    : 'refresh-icon'
                }
              >
                ↻
              </span>

              {loading
                ? 'Refreshing'
                : 'Refresh'}
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="dashboard-error"
              role="alert"
            >
              <span className="dashboard-error-icon">
                !
              </span>

              <div>
                <strong>
                  Unable to load investigations
                </strong>

                <p>
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadCases}
                disabled={loading}
              >
                Retry
              </button>
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="dashboard-loading dashboard-loading-enhanced">
              <div className="loading-spinner" />

              <div>
                <strong>
                  Loading investigations
                </strong>

                <span>
                  Syncing case intelligence...
                </span>
              </div>
            </div>
          )}

          {/* =================================================
              EMPTY — NO CASES
          ================================================== */}

          {!loading &&
            cases.length === 0 && (
              <div className="empty-state dashboard-empty-state">
                <div className="empty-icon">
                  +
                </div>

                <div className="empty-state-label">
                  NO ACTIVE INVESTIGATIONS
                </div>

                <h3>
                  Start your first investigation
                </h3>

                <p>
                  Create an investigation by
                  uploading the required datasets.
                  CaseFusion will organize the
                  intelligence and surface relevant
                  leads.
                </p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={onNewInvestigation}
                >
                  <span>+</span>
                  Create Investigation
                </button>
              </div>
            )}

          {/* =================================================
              CONTROLS
          ================================================== */}

          {!loading &&
            cases.length > 0 && (
              <>
                <div className="case-controls dashboard-case-controls">
                  <div className="case-search">
                    <span
                      className="case-search-icon"
                      aria-hidden="true"
                    >
                      ⌕
                    </span>

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                      placeholder="Search investigations or Case ID..."
                      aria-label="Search investigations"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        className="clear-search"
                        onClick={() =>
                          setSearchTerm('')
                        }
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div
                    className="case-filters"
                    aria-label="Case status filters"
                  >
                    <button
                      type="button"
                      className={`case-filter-btn ${
                        statusFilter === 'all'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setStatusFilter('all')
                      }
                    >
                      All
                      <span>
                        {cases.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`case-filter-btn ${
                        statusFilter === 'analyzed'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setStatusFilter(
                          'analyzed'
                        )
                      }
                    >
                      Analyzed
                      <span>
                        {analyzedCases}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`case-filter-btn ${
                        statusFilter === 'uploaded'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setStatusFilter(
                          'uploaded'
                        )
                      }
                    >
                      Uploaded
                      <span>
                        {uploadedCases}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="case-sort-row dashboard-sort-row">
                  <div className="case-results-info dashboard-results-info">
                    <span>
                      Showing{' '}
                      <strong>
                        {filteredCases.length}
                      </strong>{' '}
                      of{' '}
                      <strong>
                        {cases.length}
                      </strong>{' '}
                      investigations
                    </span>
                  </div>

                  <div className="dashboard-sort-wrapper">
                    <label
                      htmlFor="case-sort"
                      className="case-sort-label"
                    >
                      SORT BY
                    </label>

                    <select
                      id="case-sort"
                      className="case-sort-select"
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target.value
                        )
                      }
                    >
                      <option value="newest">
                        Newest first
                      </option>

                      <option value="oldest">
                        Oldest first
                      </option>

                      <option value="leads-high">
                        Most leads
                      </option>

                      <option value="leads-low">
                        Least leads
                      </option>
                    </select>
                  </div>
                </div>

                {(searchTerm ||
                  statusFilter !== 'all' ||
                  sortOption !== 'newest') && (
                  <div className="dashboard-active-filters">
                    <span>
                      Filters active
                    </span>

                    {searchTerm && (
                      <span className="active-filter-chip">
                        Search: {searchTerm}
                      </span>
                    )}

                    {statusFilter !== 'all' && (
                      <span className="active-filter-chip">
                        Status:{' '}
                        {formatStatus(
                          statusFilter
                        )}
                      </span>
                    )}

                    {sortOption !== 'newest' && (
                      <span className="active-filter-chip">
                        Sorted
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </>
            )}

          {/* =================================================
              FILTERED EMPTY
          ================================================== */}

          {!loading &&
            cases.length > 0 &&
            filteredCases.length === 0 && (
              <div className="empty-state filtered-empty-state dashboard-empty-state">
                <div className="empty-icon">
                  ⌕
                </div>

                <div className="empty-state-label">
                  NO MATCHES
                </div>

                <h3>
                  No matching investigations
                </h3>

                <p>
                  We couldn't find a case matching
                  your current search or status
                  filter.
                </p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {/* =================================================
              CASE LIST
          ================================================== */}

          {!loading &&
            filteredCases.length > 0 && (
              <div className="cases-list dashboard-cases-list">
                {filteredCases.map(
                  (item, index) => {
                    const status =
                      item?.status ||
                      'unknown';

                    const leadCount = Number(
                      item?.leadCount || 0
                    );

                    return (
                      <button
                        type="button"
                        className="case-row dashboard-case-row"
                        key={
                          item?.caseId ||
                          `${item?.name || 'case'}-${index}`
                        }
                        onClick={() =>
                          item?.caseId &&
                          onOpenCase(
                            item.caseId
                          )
                        }
                      >
                        <div className="case-row-main">
                          <div
                            className={`case-status-dot ${
                              status ===
                              'analyzed'
                                ? 'case-dot-analyzed'
                                : 'case-dot-uploaded'
                            }`}
                          />

                          <div className="case-primary-info">
                            <div className="case-title-line">
                              <h4>
                                {item?.name ||
                                  'Untitled Investigation'}
                              </h4>

                              {status ===
                                'analyzed' && (
                                <span className="case-ready-badge">
                                  ANALYZED
                                </span>
                              )}
                            </div>

                            <span className="case-id">
                              {item?.caseId ||
                                'No Case ID'}
                            </span>
                          </div>
                        </div>

                        <div className="case-row-meta">
                          <div>
                            <span>
                              STATUS
                            </span>

                            <strong
                              className={
                                status ===
                                'analyzed'
                                  ? 'case-analyzed'
                                  : 'case-uploaded'
                              }
                            >
                              {formatStatus(
                                status
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              LEADS
                            </span>

                            <strong
                              className={
                                leadCount > 0
                                  ? 'case-leads-value'
                                  : ''
                              }
                            >
                              {leadCount}
                            </strong>
                          </div>

                          <div>
                            <span>
                              CREATED
                            </span>

                            <strong>
                              {formatDate(
                                item?.createdAt
                              )}
                            </strong>
                          </div>

                          <div className="case-arrow">
                            →
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;