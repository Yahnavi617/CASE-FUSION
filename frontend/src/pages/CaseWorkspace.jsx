import { useEffect, useMemo, useState } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import LeadExplanation from '../components/LeadExplanation';
import InvestigationIntel from '../components/InvestigationIntel';
import { getCase, getLeads, analyzeCase, } from '../services/api';

function CaseWorkspace({ caseId, onBack }) {
  const [caseInfo, setCaseInfo] = useState(null);
  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedLead, setSelectedLead] =
    useState(null);

  const [networkLead, setNetworkLead] =
    useState(null);

  const [error, setError] = useState('');

  const [riskFilter, setRiskFilter] =
    useState('all');

  const [scoreSort, setScoreSort] =
    useState('high-to-low');

  useEffect(() => {
    loadCase();
  }, [caseId]);

  async function loadCase() {
    try {
      setLoading(true);
      setError('');

      const caseResponse =
        await getCase(caseId);

      setCaseInfo(caseResponse.case);

      if (
        caseResponse.case.status ===
        'analyzed'
      ) {
        const leadsResponse =
          await getLeads(caseId);

        const loadedLeads =
          leadsResponse.leads || [];

        setLeads(loadedLeads);

        setNetworkLead(
          loadedLeads[0] || null
        );
      } else {
        setLeads([]);
        setNetworkLead(null);
      }
    } catch (err) {
      console.error(
        'Failed to load case:',
        err
      );

      setError(
        err.message ||
        'Failed to load investigation.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    try {
      setAnalyzing(true);
      setError('');

      const response =
        await analyzeCase(caseId);

      const analyzedLeads =
        response.leads || [];

      setLeads(analyzedLeads);

      setNetworkLead(
        analyzedLeads[0] || null
      );

      setCaseInfo((previous) => ({
        ...previous,
        status: 'analyzed',
        analyzedAt:
          new Date().toISOString(),
        leadCount: response.count,
      }));
    } catch (err) {
      console.error(
        'Analysis failed:',
        err
      );

      setError(
        err.message ||
        'Failed to analyze case.'
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function handleViewWhy(lead) {
    setSelectedLead(lead);
  }

  function closeLeadWhy() {
    setSelectedLead(null);
  }

  function handleNetworkSelect(lead) {
    setNetworkLead(lead);
  }

  /* =====================================================
     DERIVED CASE INTELLIGENCE
     ===================================================== */

  const riskSummary = useMemo(() => {
    const summary = {
      high: 0,
      medium: 0,
      low: 0,
    };

    leads.forEach((lead) => {
      const score =
        Number(lead.score) || 0;

      if (score >= 80) {
        summary.high += 1;
      } else if (score >= 50) {
        summary.medium += 1;
      } else {
        summary.low += 1;
      }
    });

    return summary;
  }, [leads]);

  const averageScore = useMemo(() => {
    if (!leads.length) {
      return 0;
    }

    const total = leads.reduce(
      (sum, lead) =>
        sum +
        (Number(lead.score) || 0),
      0
    );

    return Math.round(
      total / leads.length
    );
  }, [leads]);

  const topLead = useMemo(() => {
    if (!leads.length) {
      return null;
    }

    return [...leads].sort(
      (a, b) =>
        (Number(b.score) || 0) -
        (Number(a.score) || 0)
    )[0];
  }, [leads]);

  const strongestSignal = useMemo(() => {
    if (!leads.length) {
      return '—';
    }

    const signalTotals = {
      Financial: 0,
      Communication: 0,
      'Cross-source': 0,
      Temporal: 0,
      Centrality: 0,
    };

    leads.forEach((lead) => {
      const signals =
        lead.signals || {};

      signalTotals.Financial +=
        Number(
          signals.financial || 0
        );

      signalTotals.Communication +=
        Number(
          signals.communication || 0
        );

      signalTotals[
        'Cross-source'
      ] += Number(
        signals.crossSource || 0
      );

      signalTotals.Temporal +=
        Number(
          signals.temporal || 0
        );

      signalTotals.Centrality +=
        Number(
          signals.centrality || 0
        );
    });

    return (
      Object.entries(
        signalTotals
      ).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || '—'
    );
  }, [leads]);

  /* =====================================================
     CSV EXPORT
     ===================================================== */

  function handleExportLeads() {
    if (!leads.length) {
      return;
    }

    const headers = [
      'Entity ID',
      'Entity Name',
      'Score',
      'Risk',
      'Financial',
      'Communication',
      'Cross-source',
      'Temporal',
      'Centrality',
      'Reasons',
    ];

    const rows = leads.map((lead) => {
      const score =
        Number(lead.score) || 0;

      const risk =
        score >= 80
          ? 'High'
          : score >= 50
            ? 'Medium'
            : 'Low';

      const signals =
        lead.signals || {};

      const reasons =
        (lead.reasons || []).join(
          ' | '
        );

      return [
        lead.id || '',
        lead.label || '',
        score,
        risk,

        Math.round(
          Number(
            signals.financial || 0
          ) * 100
        ),

        Math.round(
          Number(
            signals.communication || 0
          ) * 100
        ),

        Math.round(
          Number(
            signals.crossSource || 0
          ) * 100
        ),

        Math.round(
          Number(
            signals.temporal || 0
          ) * 100
        ),

        Math.round(
          Number(
            signals.centrality || 0
          ) * 100
        ),

        reasons,
      ];
    });

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value).replace(
                /"/g,
                '""'
              );

            return `"${text}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `${caseInfo?.caseId || 'case'
      }-leads.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /* =====================================================
     FILTERED + SORTED LEADS
     ===================================================== */

  const displayedLeads =
    useMemo(() => {
      const filtered =
        leads.filter((lead) => {
          const score =
            Number(lead.score) || 0;

          if (
            riskFilter === 'high'
          ) {
            return score >= 80;
          }

          if (
            riskFilter === 'medium'
          ) {
            return (
              score >= 50 &&
              score < 80
            );
          }

          if (
            riskFilter === 'low'
          ) {
            return score < 50;
          }

          return true;
        });

      return [...filtered].sort(
        (a, b) => {
          const scoreA =
            Number(a.score) || 0;

          const scoreB =
            Number(b.score) || 0;

          if (
            scoreSort ===
            'low-to-high'
          ) {
            return scoreA - scoreB;
          }

          return scoreB - scoreA;
        }
      );
    }, [
      leads,
      riskFilter,
      scoreSort,
    ]);

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="workspace-page">
        <div className="workspace-loading">
          Loading investigation...
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error && !caseInfo) {
    return (
      <div className="workspace-page">
        <div className="workspace-error">
          <h2>
            Unable to load investigation
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="back-button"
            onClick={onBack}
          >
            ← Back to Investigations
          </button>
        </div>
      </div>
    );
  }

  const isAnalyzed =
    caseInfo?.status ===
    'analyzed';

  return (
    <div className="workspace-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="workspace-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={onBack}
          >
            ← All Investigations
          </button>

          <p className="section-label">
            CASE WORKSPACE
          </p>

          <h1>
            {caseInfo?.name}
          </h1>

          <div className="case-reference">
            {caseInfo?.caseId}
          </div>
        </div>

        <div className="workspace-actions">
          <span
            className={`workspace-status ${isAnalyzed
                ? 'status-analyzed'
                : 'status-uploaded'
              }`}
          >
            {caseInfo?.status}
          </span>

          {!isAnalyzed && (
            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing
                ? 'Analyzing...'
                : 'Analyze Case →'}
            </button>
          )}
        </div>
      </header>

      {/* =================================================
          ERROR MESSAGE
          ================================================= */}

      {error && (
        <div className="workspace-message">
          {error}
        </div>
      )}

      {/* =================================================
          CASE STATS
          ================================================= */}

      <section className="workspace-stats">

        <div className="workspace-stat">
          <span>
            CASE STATUS
          </span>

          <strong>
            {caseInfo?.status}
          </strong>
        </div>

        <div className="workspace-stat">
          <span>
            PRIORITY LEADS
          </span>

          <strong>
            {leads.length}
          </strong>
        </div>

        <div className="workspace-stat">
          <span>
            CREATED
          </span>

          <strong>
            {caseInfo?.createdAt
              ? new Date(
                caseInfo.createdAt
              ).toLocaleDateString()
              : '—'}
          </strong>
        </div>

        <div className="workspace-stat">
          <span>
            ANALYZED
          </span>

          <strong>
            {caseInfo?.analyzedAt
              ? new Date(
                caseInfo.analyzedAt
              ).toLocaleDateString()
              : '—'}
          </strong>
        </div>

      </section>

      {/* =================================================
          INTELLIGENCE SNAPSHOT
          ================================================= */}

      {isAnalyzed &&
        leads.length > 0 && (
          <section className="workspace-intelligence-strip">

            <div className="workspace-intelligence-item">
              <span>
                HIGH RISK
              </span>

              <strong className="intelligence-high">
                {riskSummary.high}
              </strong>

              <small>
                Score 80+
              </small>
            </div>

            <div className="workspace-intelligence-item">
              <span>
                MEDIUM RISK
              </span>

              <strong className="intelligence-medium">
                {riskSummary.medium}
              </strong>

              <small>
                Score 50–79
              </small>
            </div>

            <div className="workspace-intelligence-item">
              <span>
                AVERAGE SCORE
              </span>

              <strong>
                {averageScore}
              </strong>

              <small>
                Across all leads
              </small>
            </div>

            <div className="workspace-intelligence-item">
              <span>
                STRONGEST SIGNAL
              </span>

              <strong>
                {strongestSignal}
              </strong>

              <small>
                Aggregate signal
              </small>
            </div>

            <div className="workspace-intelligence-item">
              <span>
                TOP LEAD
              </span>

              <strong>
                {topLead?.label ||
                  '—'}
              </strong>

              <small>
                Score{' '}
                {Number(
                  topLead?.score || 0
                )}
              </small>
            </div>

          </section>
        )}

      {/* =================================================
          EVIDENCE SUMMARY
          ================================================= */}

      {isAnalyzed &&
        leads.length > 0 && (
          <section className="evidence-summary-section">

            <div className="evidence-summary-heading">
              <div>
                <p className="section-label">
                  CASE INTELLIGENCE
                </p>

                <h2>
                  Evidence Summary
                </h2>

                <p>
                  High-level signals derived
                  from the analyzed priority
                  leads.
                </p>
              </div>
            </div>

            <div className="evidence-summary-grid">

              <div className="evidence-summary-card">
                <span>
                  TOTAL LEADS
                </span>

                <strong>
                  {leads.length}
                </strong>

                <small>
                  Entities identified
                </small>
              </div>

              <div className="evidence-summary-card">
                <span>
                  HIGH RISK
                </span>

                <strong>
                  {riskSummary.high}
                </strong>

                <small>
                  Score 80 or above
                </small>
              </div>

              <div className="evidence-summary-card">
                <span>
                  MEDIUM RISK
                </span>

                <strong>
                  {riskSummary.medium}
                </strong>

                <small>
                  Score 50–79
                </small>
              </div>

              <div className="evidence-summary-card">
                <span>
                  AVERAGE SCORE
                </span>

                <strong>
                  {averageScore}
                </strong>

                <small>
                  Across all leads
                </small>
              </div>

            </div>

            <div className="evidence-signal-summary">

              <div>
                <span>
                  STRONGEST SIGNAL
                </span>

                <strong>
                  {strongestSignal}
                </strong>
              </div>

              <div>
                <span>
                  TOP LEAD
                </span>

                <strong>
                  {topLead?.label ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>
                  TOP SCORE
                </span>

                <strong>
                  {Number(
                    topLead?.score || 0
                  )}
                </strong>
              </div>

            </div>

          </section>
        )}

      {/* =================================================
          NETWORK
          ================================================= */}

      {isAnalyzed &&
        leads.length > 0 && (
          <section className="main-network-section">

            <div className="network-focus-bar">
              <div className="network-focus-heading">
                <span className="network-focus-label">
                  NETWORK FOCUS
                </span>

                <strong className="network-focus-name">
                  {networkLead?.label ||
                    leads[0]?.label ||
                    'Primary Entity'}
                </strong>
              </div>

              <small className="network-focus-description">
                Select a lead below to change the network focus.
              </small>
            </div>
            <NetworkGraph
              caseId={caseId}
              selectedLead={
                networkLead
              }
            />
            <InvestigationIntel caseId={caseId} />

          </section>
        )}

      {/* =================================================
          PRIORITY LEADS
          ================================================= */}

      <section className="leads-section">

        <div className="leads-heading">

          <div>
            <p className="section-label">
              INTELLIGENCE
            </p>

            <h2>
              Priority Leads
            </h2>

            <p>
              Entities ranked by the
              CaseFusion scoring engine.
            </p>
          </div>

          {isAnalyzed &&
            leads.length > 0 && (
              <div className="leads-heading-actions">

                <span className="lead-count">
                  {leads.length} leads
                </span>

                <button
                  type="button"
                  className="export-leads-button"
                  onClick={
                    handleExportLeads
                  }
                >
                  ↓ Export CSV
                </button>

              </div>
            )}

        </div>

        {/* =================================================
            NOT ANALYZED
            ================================================= */}

        {!isAnalyzed && (
          <div className="analysis-empty">

            <div className="analysis-icon">
              ⚡
            </div>

            <h3>
              Analysis has not been run
            </h3>

            <p>
              Run the scoring engine to
              identify and rank suspicious
              case entities.
            </p>

            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing
                ? 'Analyzing...'
                : 'Analyze Case →'}
            </button>

          </div>
        )}

        {/* =================================================
            NO LEADS
            ================================================= */}

        {isAnalyzed &&
          leads.length === 0 && (
            <div className="analysis-empty">

              <div className="analysis-icon">
                ✓
              </div>

              <h3>
                No leads identified
              </h3>

              <p>
                The analysis completed but
                did not return any case entities.
              </p>

            </div>
          )}

        {/* =================================================
            LEAD LIST
            ================================================= */}

        {isAnalyzed &&
          leads.length > 0 && (
            <>

              <div className="lead-controls">

                <div className="lead-risk-filters">

                  <span className="lead-control-label">
                    RISK
                  </span>

                  <button
                    type="button"
                    className={`lead-filter-button ${riskFilter === 'all'
                        ? 'active'
                        : ''
                      }`}
                    onClick={() =>
                      setRiskFilter('all')
                    }
                  >
                    All
                  </button>

                  <button
                    type="button"
                    className={`lead-filter-button ${riskFilter === 'high'
                        ? 'active'
                        : ''
                      }`}
                    onClick={() =>
                      setRiskFilter('high')
                    }
                  >
                    High Risk
                  </button>

                  <button
                    type="button"
                    className={`lead-filter-button ${riskFilter === 'medium'
                        ? 'active'
                        : ''
                      }`}
                    onClick={() =>
                      setRiskFilter('medium')
                    }
                  >
                    Medium Risk
                  </button>

                  <button
                    type="button"
                    className={`lead-filter-button ${riskFilter === 'low'
                        ? 'active'
                        : ''
                      }`}
                    onClick={() =>
                      setRiskFilter('low')
                    }
                  >
                    Low Risk
                  </button>

                </div>

                <label className="lead-sort-control">

                  <span className="lead-control-label">
                    SORT
                  </span>

                  <select
                    value={scoreSort}
                    onChange={(event) =>
                      setScoreSort(
                        event.target.value
                      )
                    }
                  >
                    <option value="high-to-low">
                      Score: High → Low
                    </option>

                    <option value="low-to-high">
                      Score: Low → High
                    </option>
                  </select>

                </label>

              </div>

              <div className="lead-results-info">
                Showing{' '}
                <strong>
                  {displayedLeads.length}
                </strong>{' '}
                of{' '}
                <strong>
                  {leads.length}
                </strong>{' '}
                leads
              </div>

              {displayedLeads.length === 0 && (
                <div className="analysis-empty">

                  <div className="analysis-icon">
                    —
                  </div>

                  <h3>
                    No leads match this filter
                  </h3>

                  <p>
                    Try selecting another
                    risk level.
                  </p>

                  <button
                    type="button"
                    className="analyze-button"
                    onClick={() =>
                      setRiskFilter('all')
                    }
                  >
                    Show All Leads
                  </button>

                </div>
              )}

              {displayedLeads.length > 0 && (
                <div className="leads-list">

                  {displayedLeads.map(
                    (lead, index) => {

                      const score =
                        Number(
                          lead.score
                        ) || 0;

                      const riskLevel =
                        score >= 80
                          ? 'HIGH RISK'
                          : score >= 50
                            ? 'MEDIUM RISK'
                            : 'LOW RISK';

                      const riskClass =
                        score >= 80
                          ? 'high'
                          : score >= 50
                            ? 'medium'
                            : 'low';

                      const signals =
                        lead.signals ||
                        {};

                      const isNetworkSelected =
                        networkLead?.id ===
                        lead.id;

                      return (
                        <div
                          className={`lead-card ${isNetworkSelected
                              ? 'lead-card-selected'
                              : ''
                            }`}
                          key={lead.id}
                          onClick={() =>
                            handleNetworkSelect(
                              lead
                            )
                          }
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                              'Enter' ||
                              event.key ===
                              ' '
                            ) {
                              event.preventDefault();

                              handleNetworkSelect(
                                lead
                              );
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >

                          <div className="lead-rank">
                            #{index + 1}
                          </div>

                          <div className="lead-main">

                            <div className="lead-top">

                              <div>

                                <span className="lead-id">
                                  {lead.id}
                                </span>

                                <h3>
                                  {lead.label}
                                </h3>

                                <span
                                  className={`lead-risk-badge risk-${riskClass}`}
                                >
                                  {riskLevel}
                                </span>

                                {isNetworkSelected && (
                                  <span className="network-focus-badge">
                                    NETWORK FOCUS
                                  </span>
                                )}

                              </div>

                              <div className="lead-score">

                                <span>
                                  SCORE
                                </span>

                                <strong>
                                  {score}
                                </strong>

                                <div className="lead-score-bar">

                                  <div
                                    className={`lead-score-fill score-${riskClass}`}
                                    style={{
                                      width:
                                        `${Math.min(
                                          Math.max(
                                            score,
                                            0
                                          ),
                                          100
                                        )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </div>

                            <div className="signal-grid">

                              <div>
                                <span>
                                  Financial
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      signals.financial ||
                                      0
                                    ) * 100
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Communication
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      signals.communication ||
                                      0
                                    ) * 100
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Cross-source
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      signals.crossSource ||
                                      0
                                    ) * 100
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Temporal
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      signals.temporal ||
                                      0
                                    ) * 100
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Centrality
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      signals.centrality ||
                                      0
                                    ) * 100
                                  )}
                                </strong>
                              </div>

                            </div>

                            {lead.reasons?.length >
                              0 && (
                                <div className="lead-reasons">

                                  <span>
                                    KEY SIGNALS
                                  </span>

                                  <ul>

                                    {lead.reasons
                                      .slice(
                                        0,
                                        2
                                      )
                                      .map(
                                        (
                                          reason,
                                          reasonIndex
                                        ) => (
                                          <li
                                            key={
                                              reasonIndex
                                            }
                                          >
                                            {reason}
                                          </li>
                                        )
                                      )}

                                  </ul>

                                </div>
                              )}

                            <div className="lead-actions">

                              <button
                                type="button"
                                className="why-button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  handleViewWhy(
                                    lead
                                  );
                                }}
                              >
                                View Why →
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </>
          )}

      </section>

      {/* =================================================
          LEAD EXPLANATION MODAL
          ================================================= */}

      {selectedLead && (
        <LeadExplanation
          caseId={caseId}
          lead={selectedLead}
          onClose={closeLeadWhy}
        />
      )}

    </div>
  );
}

export default CaseWorkspace;