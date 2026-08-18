import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import NetworkGraph from '../components/NetworkGraph';
import LeadExplanation from '../components/LeadExplanation';
import Evidence from './Evidence';

import {
  getCase,
  getLeads,
  analyzeCase,
} from '../services/api';


function CaseWorkspace({
  caseId,
  onBack,
}) {
  const [caseInfo, setCaseInfo] =
    useState(null);

  const [leads, setLeads] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [selectedLead, setSelectedLead] =
    useState(null);

  const [networkLead, setNetworkLead] =
    useState(null);

  const [error, setError] =
    useState('');

  const [riskFilter, setRiskFilter] =
    useState('all');

  const [scoreSort, setScoreSort] =
    useState('high-to-low');
    const [activeTab, setActiveTab] =
  useState('leads');


  /* =====================================================
     LOAD CASE
     ===================================================== */

  useEffect(() => {
    loadCase();
  }, [caseId]);


  async function loadCase() {
    try {
      setLoading(true);
      setError('');

      const caseResponse =
        await getCase(caseId);

      setCaseInfo(
        caseResponse.case
      );

      if (
        caseResponse.case.status ===
        'analyzed'
      ) {
        const leadsResponse =
          await getLeads(caseId);

        const loadedLeads =
          leadsResponse.leads || [];

        setLeads(
          loadedLeads
        );

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


  /* =====================================================
     ANALYZE CASE
     ===================================================== */

  async function handleAnalyze() {
    try {
      setAnalyzing(true);
      setError('');

      const response =
        await analyzeCase(caseId);

      const analyzedLeads =
        response.leads || [];

      setLeads(
        analyzedLeads
      );

      setNetworkLead(
        analyzedLeads[0] || null
      );

      setCaseInfo(
        (previous) => ({
          ...previous,

          status: 'analyzed',

          analyzedAt:
            new Date().toISOString(),

          leadCount:
            response.count,
        })
      );
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


  /* =====================================================
     LEAD ACTIONS
     ===================================================== */

  function handleViewWhy(
    lead
  ) {
    setSelectedLead(lead);
  }


  function closeLeadWhy() {
    setSelectedLead(null);
  }


  function handleNetworkSelect(
    lead
  ) {
    setNetworkLead(lead);
  }


  /* =====================================================
     DERIVED DATA
     ===================================================== */

  const riskSummary =
    useMemo(() => {
      const summary = {
        high: 0,
        medium: 0,
        low: 0,
      };

      leads.forEach(
        (lead) => {
          const score =
            Number(lead.score) || 0;

          if (score >= 80) {
            summary.high += 1;
          } else if (
            score >= 50
          ) {
            summary.medium += 1;
          } else {
            summary.low += 1;
          }
        }
      );

      return summary;
    }, [leads]);


  const averageScore =
    useMemo(() => {
      if (!leads.length) {
        return 0;
      }

      const total =
        leads.reduce(
          (sum, lead) =>
            sum +
            (Number(
              lead.score
            ) || 0),
          0
        );

      return Math.round(
        total / leads.length
      );
    }, [leads]);


  const topLead =
    useMemo(() => {
      if (!leads.length) {
        return null;
      }

      return [...leads].sort(
        (a, b) =>
          (Number(b.score) || 0) -
          (Number(a.score) || 0)
      )[0];
    }, [leads]);


  const strongestSignal =
    useMemo(() => {
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

      leads.forEach(
        (lead) => {
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
          ] +=
            Number(
              signals.crossSource ||
                0
            );

          signalTotals.Temporal +=
            Number(
              signals.temporal || 0
            );

          signalTotals.Centrality +=
            Number(
              signals.centrality || 0
            );
        }
      );

      return (
        Object.entries(
          signalTotals
        ).sort(
          (a, b) =>
            b[1] - a[1]
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

    const rows =
      leads.map(
        (lead) => {
          const score =
            Number(lead.score) ||
            0;

          const risk =
            score >= 80
              ? 'High'
              : score >= 50
                ? 'Medium'
                : 'Low';

          const signals =
            lead.signals || {};

          const reasons =
            (
              lead.reasons ||
              []
            ).join(' | ');

          return [
            lead.id || '',
            lead.label || '',
            score,
            risk,

            Math.round(
              Number(
                signals.financial ||
                  0
              ) * 100
            ),

            Math.round(
              Number(
                signals.communication ||
                  0
              ) * 100
            ),

            Math.round(
              Number(
                signals.crossSource ||
                  0
              ) * 100
            ),

            Math.round(
              Number(
                signals.temporal ||
                  0
              ) * 100
            ),

            Math.round(
              Number(
                signals.centrality ||
                  0
              ) * 100
            ),

            reasons,
          ];
        }
      );

    const csv =
      [
        headers,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) => {
                  const text =
                    String(
                      value
                    ).replace(
                      /"/g,
                      '""'
                    );

                  return `"${text}"`;
                }
              )
              .join(',')
        )
        .join('\n');

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        'a'
      );

    link.href = url;

    link.download =
      `${
        caseInfo?.caseId ||
        'case'
      }-leads.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  }


  /* =====================================================
     FILTER + SORT
     ===================================================== */

  const displayedLeads =
    useMemo(() => {
      const filtered =
        leads.filter(
          (lead) => {
            const score =
              Number(
                lead.score
              ) || 0;

            if (
              riskFilter ===
              'high'
            ) {
              return score >= 80;
            }

            if (
              riskFilter ===
              'medium'
            ) {
              return (
                score >= 50 &&
                score < 80
              );
            }

            if (
              riskFilter ===
              'low'
            ) {
              return score < 50;
            }

            return true;
          }
        );

      return [
        ...filtered,
      ].sort(
        (a, b) => {
          const scoreA =
            Number(a.score) ||
            0;

          const scoreB =
            Number(b.score) ||
            0;

          if (
            scoreSort ===
            'low-to-high'
          ) {
            return (
              scoreA - scoreB
            );
          }

          return (
            scoreB - scoreA
          );
        }
      );
    }, [
      leads,
      riskFilter,
      scoreSort,
    ]);


  /* =====================================================
     FEATURED LEAD
     ===================================================== */

  const featuredLead =
    displayedLeads[0] ||
    topLead ||
    null;


  const secondaryLeads =
    displayedLeads
      .filter(
        (lead) =>
          lead.id !==
          featuredLead?.id
      )
      .slice(0, 3);


  /* =====================================================
     HELPERS
     ===================================================== */

  function getRisk(score) {
    const numericScore =
      Number(score) || 0;

    if (
      numericScore >= 80
    ) {
      return {
        label: 'HIGH RISK',
        className: 'high',
      };
    }

    if (
      numericScore >= 50
    ) {
      return {
        label: 'MEDIUM RISK',
        className: 'medium',
      };
    }

    return {
      label: 'LOW RISK',
      className: 'low',
    };
  }


  function getSignalValue(
    signals,
    key
  ) {
    return Math.round(
      Number(
        signals?.[key] || 0
      ) * 100
    );
  }


  function getSignalClass(
    value
  ) {
    if (value >= 80) {
      return 'danger';
    }

    if (value >= 50) {
      return 'warning';
    }

    return 'safe';
  }


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

  if (
    error &&
    !caseInfo
  ) {
    return (
      <div className="workspace-page">
        <div className="workspace-error">

          <h2>
            Unable to load investigation
          </h2>

          <p>
            {error}
          </p>

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


  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="workspace-page">


      {/* =================================================
          EXISTING WORKSPACE HEADER
          ================================================= */}

<header className="workspace-header">

  <div className="workspace-header-left">

    <button
      type="button"
      className="workspace-case-button"
      onClick={onBack}
    >
      CASE: {caseInfo?.name || 'CASE'}
    </button>

  </div>

  <nav className="workspace-tabs">

    <button
      type="button"
      className={
        activeTab === 'overview'
          ? 'active'
          : ''
      }
      onClick={() =>
        setActiveTab('overview')
      }
    >
      Overview
    </button>

    <button
      type="button"
      className={
        activeTab === 'evidence'
          ? 'active'
          : ''
      }
      onClick={() =>
        setActiveTab('evidence')
      }
    >
      Evidence
    </button>

    <button
      type="button"
      className={
        activeTab === 'leads'
          ? 'active'
          : ''
      }
      onClick={() =>
        setActiveTab('leads')
      }
    >
      Leads
    </button>

    <button
      type="button"
      className={
        activeTab === 'network'
          ? 'active'
          : ''
      }
      onClick={() =>
        setActiveTab('network')
      }
    >
      Network
    </button>

    <button
      type="button"
      className={
        activeTab === 'reports'
          ? 'active'
          : ''
      }
      onClick={() =>
        setActiveTab('reports')
      }
    >
      Reports
    </button>

  </nav>

</header>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="workspace-inline-error">
          {error}
        </div>
      )}


      {/* =================================================
          LEADS PAGE
          ================================================= */}

      {activeTab === 'leads' && (
  <section className="priority-leads-page">
        {/* =================================================
            PAGE HEADING
            ================================================= */}

        <div className="priority-leads-heading">

          <div>

            <div className="priority-leads-eyebrow">
              CASE INTELLIGENCE
            </div>

            <h2>
              Priority Leads
            </h2>

            <p>
              Entities ranked by the
              CASEFUSION scoring engine.
            </p>

          </div>


          {isAnalyzed &&
            leads.length > 0 && (
              <div className="priority-leads-actions">

                <span className="priority-lead-count">
                  {leads.length} leads
                </span>

                <button
                  type="button"
                  className="priority-export-button"
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
          <div className="priority-empty-state">

            <div className="priority-empty-icon">
              ⚡
            </div>

            <h3>
              Analysis has not been run
            </h3>

            <p>
              Run the scoring engine
              to identify and rank
              suspicious case entities.
            </p>

            <button
              type="button"
              className="priority-analyze-button"
              onClick={
                handleAnalyze
              }
              disabled={
                analyzing
              }
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
            <div className="priority-empty-state">

              <div className="priority-empty-icon">
                ✓
              </div>

              <h3>
                No leads identified
              </h3>

              <p>
                The analysis completed
                but did not return any
                case entities.
              </p>

            </div>
          )}


        {/* =================================================
            ANALYZED LEADS
            ================================================= */}

        {isAnalyzed &&
          leads.length > 0 && (
            <>

              {/* -------------------------------------------
                  FILTERS
              ------------------------------------------- */}

              <div className="priority-lead-toolbar">

                <div className="priority-risk-filters">

                  <span>
                    RISK
                  </span>

                  {[
                    ['all', 'All'],
                    ['high', 'High Risk'],
                    ['medium', 'Medium Risk'],
                    ['low', 'Low Risk'],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          riskFilter ===
                          value
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          setRiskFilter(
                            value
                          )
                        }
                      >
                        {label}
                      </button>
                    )
                  )}

                </div>


                <label className="priority-sort">

                  <span>
                    SORT
                  </span>

                  <select
                    value={
                      scoreSort
                    }
                    onChange={(
                      event
                    ) =>
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


              {/* -------------------------------------------
                  RESULTS INFO
              ------------------------------------------- */}

              <div className="priority-results-info">

                <span>
                  Showing{' '}
                  <strong>
                    {displayedLeads.length}
                  </strong>{' '}
                  of{' '}
                  <strong>
                    {leads.length}
                  </strong>{' '}
                  leads
                </span>

                <span>
                  {riskSummary.high}{' '}
                  high risk
                </span>

              </div>


              {/* -------------------------------------------
                  FILTER EMPTY
              ------------------------------------------- */}

              {displayedLeads.length ===
                0 && (
                <div className="priority-filter-empty">

                  <h3>
                    No leads match
                    this filter
                  </h3>

                  <p>
                    Try selecting
                    another risk level.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setRiskFilter(
                        'all'
                      )
                    }
                  >
                    Show All Leads
                  </button>

                </div>
              )}


              {/* -------------------------------------------
                  FEATURED + SECONDARY
              ------------------------------------------- */}

              {displayedLeads.length >
                0 && (
                <div className="priority-lead-layout">


                  {/* =======================================
                      FEATURED LEAD
                  ======================================= */}

                  {featuredLead && (
                    <article
                      className={`featured-lead-card risk-${getRisk(
                        featuredLead.score
                      ).className} ${
                        networkLead?.id ===
                        featuredLead.id
                          ? 'network-selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleNetworkSelect(
                          featuredLead
                        )
                      }
                    >

                      <div className="featured-lead-main">

                        <div className="featured-lead-header">

                          <div>

                            <div className="featured-lead-name-row">

                              <h3>
                                {
                                  featuredLead.label
                                }
                              </h3>

                              <span
                                className={`featured-risk-badge risk-${getRisk(
                                  featuredLead.score
                                ).className}`}
                              >
                                ⚠{' '}
                                {
                                  getRisk(
                                    featuredLead.score
                                  ).label
                                }
                              </span>

                            </div>

                            <p className="featured-lead-subtitle">
                              {featuredLead.reasons?.[0] ||
                                'Priority entity identified by the scoring engine.'}
                            </p>

                          </div>

                        </div>


                        {/* ---------------------------------
                            REASONS
                        --------------------------------- */}

                        <div className="featured-reasons">

                          {featuredLead.reasons?.length >
                          0 ? (
                            featuredLead.reasons
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  reason,
                                  index
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="featured-reason"
                                  >

                                    <span>
                                      {index ===
                                      0
                                        ? '▣'
                                        : index ===
                                            1
                                          ? '⌁'
                                          : '◉'}
                                    </span>

                                    <p>
                                      {
                                        reason
                                      }
                                    </p>

                                  </div>
                                )
                              )
                          ) : (
                            <div className="featured-reason">
                              <span>
                                ◉
                              </span>

                              <p>
                                No additional
                                reasons were
                                returned.
                              </p>
                            </div>
                          )}

                        </div>

                      </div>


                      {/* =================================
                          FEATURED SCORE PANEL
                      ================================= */}

                      <aside className="featured-score-panel">

                        <div className="featured-score-heading">

                          <span>
                            THREAT SCORE
                          </span>

                          <strong>
                            {Number(
                              featuredLead.score
                            ) || 0}
                          </strong>

                        </div>


                        <div className="featured-signal-list">

                          {[
                            [
                              'Financial',
                              'financial',
                            ],
                            [
                              'Communication',
                              'communication',
                            ],
                            [
                              'Cross-source',
                              'crossSource',
                            ],
                            [
                              'Temporal',
                              'temporal',
                            ],
                            [
                              'Centrality',
                              'centrality',
                            ],
                          ].map(
                            ([
                              label,
                              key,
                            ]) => {
                              const value =
                                getSignalValue(
                                  featuredLead.signals,
                                  key
                                );

                              return (
                                <div
                                  className="featured-signal-row"
                                  key={key}
                                >

                                  <span>
                                    {label}
                                  </span>

                                  <div className="featured-signal-bar">
                                    <div
                                      className={`featured-signal-fill ${getSignalClass(
                                        value
                                      )}`}
                                      style={{
                                        width: `${Math.min(
                                          Math.max(
                                            value,
                                            0
                                          ),
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>

                                  <strong>
                                    {value}
                                  </strong>

                                </div>
                              );
                            }
                          )}

                        </div>


                        <div className="featured-score-footer">

                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              handleViewWhy(
                                featuredLead
                              );
                            }}
                          >
                            VIEW WHY →
                          </button>

                        </div>

                      </aside>

                    </article>
                  )}


                  {/* =======================================
                      SECONDARY LEADS
                  ======================================= */}

                  <div className="secondary-leads-grid">

                    {secondaryLeads.map(
                      (lead, index) => {
                        const risk =
                          getRisk(
                            lead.score
                          );

                        return (
                          <article
                            key={
                              `${lead.id || 'lead'}-${index}`
                            }
                            className={`secondary-lead-card risk-${risk.className} ${
                              networkLead?.id ===
                              lead.id
                                ? 'network-selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleNetworkSelect(
                                lead
                              )
                            }
                          >

                            <div className="secondary-lead-top">

                              <div>

                                <h3>
                                  {
                                    lead.label
                                  }
                                </h3>

                                <p>
                                  {lead.reasons?.[0] ||
                                    'Peripheral Node'}
                                </p>

                              </div>

                              <strong className="secondary-lead-score">
                                {
                                  Number(
                                    lead.score
                                  ) || 0
                                }
                              </strong>

                            </div>


                            <div className="secondary-score-label">
                              SCORE
                            </div>


                            <div className="secondary-lead-divider" />


                            <div className="secondary-lead-bottom">

                              <span>
                                ↄ{' '}
                                {
                                  (
                                    lead.reasons ||
                                    []
                                  ).length
                                } Signals
                              </span>

                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  handleViewWhy(
                                    lead
                                  );
                                }}
                              >
                                INSPECT
                              </button>

                            </div>

                          </article>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </>
          )}

      </section>
      )}


      {/* =================================================
          EVIDENCE
          ================================================= */}

      {activeTab === 'evidence' && (
        <Evidence />
      )}


      {/* =================================================
          NETWORK
          ================================================= */}

      {activeTab === 'network' && (
  <section className="standalone-network-section">

    <NetworkGraph
      caseId={caseId}
      selectedLead={networkLead}
    />

  </section>
)}


      {/* =================================================
          LEAD EXPLANATION
          ================================================= */}

      {selectedLead && (
        <LeadExplanation
          caseId={caseId}
          lead={selectedLead}
          onClose={
            closeLeadWhy
          }
        />
      )}

    </div>
  );
}


export default CaseWorkspace;