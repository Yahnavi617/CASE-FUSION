import { useEffect, useState } from 'react';
import { getCases } from '../services/api';

function Dashboard({ onNewInvestigation, onOpenCase }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

            <strong>{cases.length}</strong>

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
            cases.length > 0 && (
              <div className="cases-list">
                {cases.map((item) => (
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