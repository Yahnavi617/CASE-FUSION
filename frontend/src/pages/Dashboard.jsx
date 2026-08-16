import { useEffect, useMemo, useState } from 'react';
import { getCases } from '../services/api';

function Dashboard({ onNewInvestigation, onOpenCase }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      setError('');

      const data = await getCases();

      setCases(data.cases || []);
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

  const analyzedCases = cases.filter(
    (item) => item.status === 'analyzed'
  ).length;

  const priorityLeads = cases.reduce(
    (total, item) =>
      total + (item.leadCount || 0),
    0
  );

  // NEW: filtered cases
  const filteredCases = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return cases.filter((item) => {
      const matchesSearch =
        !search ||
        item.name
          ?.toLowerCase()
          .includes(search) ||
        item.caseId
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    cases,
    searchTerm,
    statusFilter,
  ]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">C</div>

          <div>
            <h1>CASEFUSION</h1>

            <p>
              Investigation Intelligence Platform
            </p>
          </div>
        </div>

        <button
          className="new-case-btn"
          onClick={onNewInvestigation}
        >
          + New Investigation
        </button>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="section-label">
              OVERVIEW
            </p>

            <h2>
              Investigation Dashboard
            </h2>

            <p className="hero-text">
              Analyze cross-source intelligence and
              surface high-priority leads.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Cases</span>

            <strong>
              {cases.length}
            </strong>

            <small>
              Investigations created
            </small>
          </div>

          <div className="stat-card">
            <span>Analyzed Cases</span>

            <strong>
              {analyzedCases}
            </strong>

            <small>
              Cases completed
            </small>
          </div>

          <div className="stat-card">
            <span>Priority Leads</span>

            <strong>
              {priorityLeads}
            </strong>

            <small>
              Leads identified
            </small>
          </div>
        </section>

        <section className="investigations">
          <div className="section-heading">
            <div>
              <p className="section-label">
                CASES
              </p>

              <h3>
                Recent Investigations
              </h3>
            </div>

            <button
              className="view-all-btn"
              onClick={loadCases}
              disabled={loading}
            >
              {loading
                ? 'Loading...'
                : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {loading && (
            <div className="dashboard-loading">
              Loading investigations...
            </div>
          )}

          {!loading &&
            cases.length > 0 && (
              <>
                {/* =========================
                    SEARCH + FILTER
                ========================== */}

                <div className="case-controls">
                  <div className="case-search">
                    <span className="case-search-icon">
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

                  <div className="case-filters">
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
                    </button>
                  </div>
                </div>

                {/* =========================
                    FILTER RESULT COUNT
                ========================== */}

                <div className="case-results-info">
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

                  {(searchTerm ||
                    statusFilter !== 'all') && (
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </>
            )}

          {!loading &&
            cases.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  +
                </div>

                <h3>
                  No investigations yet
                </h3>

                <p>
                  Create your first investigation
                  by uploading the required
                  datasets.
                </p>

                <button
                  className="primary-btn"
                  onClick={
                    onNewInvestigation
                  }
                >
                  Create Investigation
                </button>
              </div>
            )}

          {!loading &&
            cases.length > 0 &&
            filteredCases.length === 0 && (
              <div className="empty-state filtered-empty-state">
                <div className="empty-icon">
                  ⌕
                </div>

                <h3>
                  No matching investigations
                </h3>

                <p>
                  Try changing your search or
                  status filter.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {!loading &&
            filteredCases.length > 0 && (
              <div className="cases-list">
                {filteredCases.map((item) => (
                  <button
                    className="case-row"
                    key={item.caseId}
                    onClick={() =>
                      onOpenCase(item.caseId)
                    }
                  >
                    <div className="case-row-main">
                      <div className="case-status-dot" />

                      <div>
                        <h4>
                          {item.name}
                        </h4>

                        <span>
                          {item.caseId}
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
                            item.status ===
                            'analyzed'
                              ? 'case-analyzed'
                              : 'case-uploaded'
                          }
                        >
                          {item.status}
                        </strong>
                      </div>

                      <div>
                        <span>
                          LEADS
                        </span>

                        <strong>
                          {item.leadCount || 0}
                        </strong>
                      </div>

                      <div>
                        <span>
                          CREATED
                        </span>

                        <strong>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString()
                            : '—'}
                        </strong>
                      </div>

                      <div className="case-arrow">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;