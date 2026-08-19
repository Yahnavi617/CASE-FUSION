import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import NetworkGraph from '../components/NetworkGraph';
import EntityRelationshipNetwork from '../components/EntityRelationshipNetwork';
import LeadExplanation from '../components/LeadExplanation';
import InvestigationIntel from '../components/InvestigationIntel';

import {
  getCase,
  getLeads,
  analyzeCase,
} from '../services/api';

import './CaseWorkspace.css';


function CaseWorkspace({
  caseId,
  onBack,
}) {
  const [caseInfo, setCaseInfo] = useState(null);
  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [networkLead, setNetworkLead] = useState(null);

  const [error, setError] = useState('');

  const [riskFilter, setRiskFilter] = useState('all');
  const [scoreSort, setScoreSort] = useState('high-to-low');

  const [activeTab, setActiveTab] = useState('overview');


  /* =====================================================
     LOAD CASE
  ===================================================== */

  useEffect(() => {
    if (!caseId) {
      setError('Case ID is missing.');
      setLoading(false);
      return;
    }

    loadCase();
  }, [caseId]);


  async function loadCase() {
    try {
      setLoading(true);
      setError('');

      const caseResponse = await getCase(caseId);

      const loadedCase = caseResponse?.case;

      if (!loadedCase) {
        throw new Error(
          'Case information was not returned.'
        );
      }

      setCaseInfo(loadedCase);

      if (
        String(loadedCase.status || '').toLowerCase() ===
        'analyzed'
      ) {
        const leadsResponse = await getLeads(caseId);

        const loadedLeads = Array.isArray(
          leadsResponse?.leads
        )
          ? leadsResponse.leads
          : [];

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
        err?.message ||
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
    if (analyzing) {
      return;
    }

    try {
      setAnalyzing(true);
      setError('');

      const response = await analyzeCase(caseId);

      const analyzedLeads = Array.isArray(
        response?.leads
      )
        ? response.leads
        : [];

      setLeads(analyzedLeads);

      setNetworkLead(
        analyzedLeads[0] || null
      );

      setCaseInfo((previous) => ({
        ...(previous || {}),
        status: 'analyzed',
        analyzedAt: new Date().toISOString(),
        leadCount:
          response?.count ??
          analyzedLeads.length,
      }));

      setActiveTab('leads');
    } catch (err) {
      console.error(
        'Analysis failed:',
        err
      );

      setError(
        err?.message ||
        'Failed to analyze case.'
      );
    } finally {
      setAnalyzing(false);
    }
  }


  /* =====================================================
     LEAD ACTIONS
  ===================================================== */

  function handleViewWhy(lead) {
    setSelectedLead(lead);
  }


  function closeLeadWhy() {
    setSelectedLead(null);
  }


  function handleNetworkSelect(lead) {
    setNetworkLead(lead);
    setActiveTab('network');
  }


  /* =====================================================
     RISK SUMMARY
  ===================================================== */

  const riskSummary = useMemo(() => {
    const summary = {
      high: 0,
      medium: 0,
      low: 0,
    };

    leads.forEach((lead) => {
      const score =
        Number(lead?.score) || 0;

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


  /* =====================================================
     FILTER + SORT LEADS
  ===================================================== */

  const displayedLeads = useMemo(() => {
    const filtered = leads.filter((lead) => {
      const score =
        Number(lead?.score) || 0;

      if (riskFilter === 'high') {
        return score >= 80;
      }

      if (riskFilter === 'medium') {
        return score >= 50 && score < 80;
      }

      if (riskFilter === 'low') {
        return score < 50;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const scoreA =
        Number(a?.score) || 0;

      const scoreB =
        Number(b?.score) || 0;

      return scoreSort === 'low-to-high'
        ? scoreA - scoreB
        : scoreB - scoreA;
    });
  }, [
    leads,
    riskFilter,
    scoreSort,
  ]);


  const featuredLead =
    displayedLeads[0] || null;

  const secondaryLeads =
    displayedLeads.slice(1, 4);


  /* =====================================================
     RISK HELPER
  ===================================================== */

  function getRisk(score) {
    const value =
      Number(score) || 0;

    if (value >= 80) {
      return {
        label: 'HIGH RISK',
        className: 'high',
      };
    }

    if (value >= 50) {
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


  /* =====================================================
     SIGNAL HELPERS
  ===================================================== */

  function getSignalValue(
    signals,
    key
  ) {
    const rawValue =
      Number(signals?.[key]);

    if (Number.isNaN(rawValue)) {
      return 0;
    }

    return Math.round(
      rawValue <= 1
        ? rawValue * 100
        : rawValue
    );
  }


  function getSignalClass(value) {
    if (value >= 80) {
      return 'danger';
    }

    if (value >= 50) {
      return 'warning';
    }

    return 'safe';
  }


  /* =====================================================
     EXPORT LEADS
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
        Number(lead?.score) || 0;

      const risk =
        score >= 80
          ? 'High'
          : score >= 50
            ? 'Medium'
            : 'Low';

      const signals =
        lead?.signals || {};

      return [
        lead?.id || '',
        lead?.label || '',
        score,
        risk,

        getSignalValue(
          signals,
          'financial'
        ),

        getSignalValue(
          signals,
          'communication'
        ),

        getSignalValue(
          signals,
          'crossSource'
        ),

        getSignalValue(
          signals,
          'temporal'
        ),

        getSignalValue(
          signals,
          'centrality'
        ),

        (
          lead?.reasons || []
        ).join(' | '),
      ];
    });

    const escapeCsv = (value) =>
      `"${String(
        value ?? ''
      ).replace(
        /"/g,
        '""'
      )}"`;

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCsv)
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
      `casefusion-${caseId}-leads.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }


  const isAnalyzed =
    String(
      caseInfo?.status || ''
    ).toLowerCase() ===
    'analyzed';


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


  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="workspace-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="workspace-header">

        <div className="workspace-header-left">

          <button
            type="button"
            className="workspace-back-button"
            onClick={onBack}
          >
            ← All Investigations
          </button>


          <div className="workspace-case-info">

            <span>
              CASE
            </span>

            <strong>
              {caseInfo?.name ||
                caseInfo?.caseName ||
                'Untitled Investigation'}
            </strong>

            <small>
              {caseInfo?.caseId ||
                caseId}
            </small>

          </div>

        </div>


        {/* =================================================
            TABS
        ================================================== */}

        <nav className="workspace-tabs">

          {[
            ['overview', 'Overview'],
            ['evidence', 'Evidence'],
            ['leads', 'Leads'],
            ['network', 'Network'],
            ['reports', 'Reports'],
          ].map(
            ([id, label]) => (
              <button
                key={id}
                type="button"
                className={
                  activeTab === id
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveTab(id)
                }
              >
                {label}
              </button>
            )
          )}

        </nav>

      </header>


      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="workspace-inline-error">
          {error}
        </div>
      )}


      {/* =================================================
          OVERVIEW
      ================================================== */}

      {activeTab === 'overview' && (
        <section className="workspace-overview">

          <div className="priority-leads-heading">

            <div>

              <div className="priority-leads-eyebrow">
                CASE INTELLIGENCE
              </div>

              <h1>
                Investigation Dashboard
              </h1>

              <p>
                Monitor evidence,
                relationships,
                priority leads and
                intelligence signals
                for this investigation.
              </p>

            </div>


            {!isAnalyzed && (
              <button
                type="button"
                className="priority-analyze-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing
                  ? 'Analyzing...'
                  : 'Analyze Case →'}
              </button>
            )}

          </div>


          {/* SUMMARY */}

          <div className="workspace-summary-grid">

            <div className="workspace-summary-card">

              <span>
                CASE STATUS
              </span>

              <strong>
                {caseInfo?.status ||
                  'Pending'}
              </strong>

            </div>


            <div className="workspace-summary-card">

              <span>
                TOTAL LEADS
              </span>

              <strong>
                {leads.length}
              </strong>

            </div>


            <div className="workspace-summary-card">

              <span>
                HIGH RISK
              </span>

              <strong className="danger-text">
                {riskSummary.high}
              </strong>

            </div>


            <div className="workspace-summary-card">

              <span>
                MEDIUM RISK
              </span>

              <strong className="warning-text">
                {riskSummary.medium}
              </strong>

            </div>

          </div>


          {/* INTELLIGENCE */}

          <div className="workspace-intel-card">

            <div>

              <div className="priority-leads-eyebrow">
                DIGITAL EVIDENCE & CORRELATION
              </div>

              <h2>
                Investigation Intelligence
              </h2>

              <p>
                Unified analysis across
                telecom, banking, social,
                device and investigative
                evidence.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setActiveTab('evidence')
              }
            >
              Open Intelligence →
            </button>

          </div>


          <InvestigationIntel
            caseId={caseId}
            defaultTab="overview"
          />

        </section>
      )}


      {/* =================================================
          EVIDENCE
      ================================================== */}

      {activeTab === 'evidence' && (
        <section className="workspace-module">

          <InvestigationIntel
            caseId={caseId}
            defaultTab="evidence"
          />

        </section>
      )}


      {/* =================================================
          LEADS
      ================================================== */}

      {activeTab === 'leads' && (
        <section className="priority-leads-page">

          <div className="priority-leads-heading">

            <div>

              <div className="priority-leads-eyebrow">
                CASE INTELLIGENCE
              </div>

              <h1>
                Priority Leads
              </h1>

              <p>
                Entities ranked by the
                CASEFUSION scoring engine.
              </p>

            </div>


            {isAnalyzed && (
              <div className="priority-leads-actions">

                <div className="priority-stat">

                  <strong>
                    {leads.length}
                  </strong>

                  <span>
                    Leads
                  </span>

                </div>


                <div className="priority-stat priority-stat-danger">

                  <strong>
                    {riskSummary.high}
                  </strong>

                  <span>
                    High Risk
                  </span>

                </div>


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


          {/* NOT ANALYZED */}

          {!isAnalyzed && (
            <div className="priority-empty-state">

              <div className="priority-empty-icon">
                ⚡
              </div>

              <h2>
                Analysis has not been run
              </h2>

              <p>
                Run the CASEFUSION scoring
                engine to identify and rank
                priority entities.
              </p>

              <button
                type="button"
                className="priority-analyze-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing
                  ? 'Analyzing...'
                  : 'Analyze Case →'}
              </button>

            </div>
          )}


          {/* ANALYZED */}

          {isAnalyzed && (
            <>

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
                          riskFilter === value
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


              {displayedLeads.length === 0 ? (

                <div className="priority-filter-empty">

                  <h2>
                    No leads found
                  </h2>

                  <p>
                    Try another risk filter.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setRiskFilter('all')
                    }
                  >
                    Show All
                  </button>

                </div>

              ) : (

                <div className="priority-lead-layout">

                  {/* FEATURED */}

                  {featuredLead && (
                    <article
                      className={`featured-lead-card risk-${
                        getRisk(
                          featuredLead.score
                        ).className
                      } ${
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

                          <div className="featured-lead-name-row">

                            <h2>
                              {featuredLead.label}
                            </h2>

                            <span
                              className={`featured-risk-badge risk-${
                                getRisk(
                                  featuredLead.score
                                ).className
                              }`}
                            >
                              {getRisk(
                                featuredLead.score
                              ).label}
                            </span>

                          </div>


                          <p className="featured-lead-subtitle">
                            {featuredLead
                              .reasons?.[0] ||
                              'Priority entity identified by the scoring engine.'}
                          </p>

                        </div>


                        <div className="featured-reasons">

                          {(
                            featuredLead.reasons ||
                            []
                          )
                            .slice(0, 4)
                            .map(
                              (
                                reason,
                                index
                              ) => (
                                <div
                                  className="featured-reason"
                                  key={index}
                                >

                                  <span>
                                    ◉
                                  </span>

                                  <p>
                                    {reason}
                                  </p>

                                </div>
                              )
                            )}

                        </div>

                      </div>


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
                            ([label, key]) => {

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
                                        width:
                                          `${Math.min(
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
                            onClick={(event) => {
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


                  {/* SECONDARY */}

                  <div className="secondary-leads-grid">

                    {secondaryLeads.map(
                      (lead) => {

                        const risk =
                          getRisk(
                            lead.score
                          );

                        return (
                          <article
                            key={lead.id}
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
                                  {lead.label}
                                </h3>

                                <p>
                                  {lead
                                    .reasons?.[0] ||
                                    'Priority entity'}
                                </p>

                              </div>


                              <strong className="secondary-lead-score">
                                {Number(
                                  lead.score
                                ) || 0}
                              </strong>

                            </div>


                            <div className="secondary-score-label">
                              SCORE
                            </div>


                            <div className="secondary-lead-divider" />


                            <div className="secondary-lead-bottom">

                              <span>
                                ◉{' '}
                                {(
                                  lead.reasons ||
                                  []
                                ).length}{' '}
                                Signals
                              </span>


                              <button
                                type="button"
                                onClick={(event) => {
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
          NETWORK
      ================================================== */}

      {activeTab === 'network' && (
        <section className="workspace-module">

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


            <small>
              Select a lead from Priority Leads
              to change the network focus.
            </small>

          </div>


          {isAnalyzed &&
          leads.length > 0 ? (

            <>
              {/* =================================================
                  OLD MAP / NETWORK
                  THIS STAYS
              ================================================== */}

              <NetworkGraph
                caseId={caseId}
                selectedLead={
                  networkLead
                }
              />


              {/* =================================================
                  NEW ENTITY RELATIONSHIP NETWORK
                  THIS APPEARS BELOW THE OLD MAP
              ================================================== */}

              <EntityRelationshipNetwork
                caseId={caseId}
                selectedLead={
                  networkLead
                }
              />

            </>

          ) : (

            <div className="priority-empty-state">

              <div className="priority-empty-icon">
                ◌
              </div>

              <h2>
                Network unavailable
              </h2>

              <p>
                Analyze the investigation first
                to generate network intelligence.
              </p>

              <button
                type="button"
                className="priority-analyze-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing
                  ? 'Analyzing...'
                  : 'Analyze Case →'}
              </button>

            </div>

          )}

        </section>
      )}


      {/* =================================================
          REPORTS
      ================================================== */}

      {activeTab === 'reports' && (
        <section className="workspace-module">

          <InvestigationIntel
            caseId={caseId}
            defaultTab="report"
          />

        </section>
      )}


      {/* =================================================
          LEAD EXPLANATION
      ================================================== */}

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