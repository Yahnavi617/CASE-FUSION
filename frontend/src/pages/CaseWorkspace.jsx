import { useEffect, useState } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import LeadExplanation from '../components/LeadExplanation';

import {
  getCase,
  getLeads,
  analyzeCase,
} from '../services/api';

function CaseWorkspace({ caseId, onBack }) {
  const [caseInfo, setCaseInfo] = useState(null);
  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);

  const [error, setError] = useState('');

  useEffect(() => {
    loadCase();
  }, [caseId]);

  async function loadCase() {
    try {
      setLoading(true);
      setError('');

      const caseResponse = await getCase(caseId);

      setCaseInfo(caseResponse.case);

      if (caseResponse.case.status === 'analyzed') {
        const leadsResponse = await getLeads(caseId);

        setLeads(leadsResponse.leads || []);
      } else {
        setLeads([]);
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

      const response = await analyzeCase(caseId);

      setLeads(response.leads || []);

      setCaseInfo((previous) => ({
        ...previous,
        status: 'analyzed',
        analyzedAt: new Date().toISOString(),
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

  if (loading) {
    return (
      <div className="workspace-page">
        <div className="workspace-loading">
          Loading investigation...
        </div>
      </div>
    );
  }

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
    caseInfo?.status === 'analyzed';

  return (
    <div className="workspace-page">

      {/* =========================
          WORKSPACE HEADER
      ========================== */}

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
            className={`workspace-status ${
              isAnalyzed
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


      {/* =========================
          ERROR MESSAGE
      ========================== */}

      {error && (
        <div className="workspace-message">
          {error}
        </div>
      )}


      {/* =========================
          CASE STATS
      ========================== */}

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


      {/* =========================
          NETWORK GRAPH
      ========================== */}

      {isAnalyzed && leads.length > 0 && (
        <section className="main-network-section">

          <NetworkGraph
            caseId={caseId}
            selectedLead={leads[0]}
          />

        </section>
      )}


      {/* =========================
          PRIORITY LEADS
      ========================== */}

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

          {isAnalyzed && (
            <span className="lead-count">
              {leads.length} leads
            </span>
          )}

        </div>


        {/* =========================
            NOT ANALYZED
        ========================== */}

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


        {/* =========================
            NO LEADS
        ========================== */}

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


        {/* =========================
            LEAD LIST
        ========================== */}

        {isAnalyzed &&
          leads.length > 0 && (
            <div className="leads-list">

              {leads.map((lead, index) => {

                const score =
                  Number(lead.score) || 0;

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
                  lead.signals || {};

                return (
                  <div
                    className="lead-card"
                    key={lead.id}
                  >

                    <div className="lead-rank">
                      #{index + 1}
                    </div>

                    <div className="lead-main">

                      {/* =====================
                          LEAD HEADER
                      ====================== */}

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

                        </div>


                        {/* SCORE */}

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
                                width: `${Math.min(
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


                      {/* =====================
                          SIGNALS
                      ====================== */}

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


                      {/* =====================
                          REASONS
                      ====================== */}

                      {lead.reasons?.length > 0 && (
                        <div className="lead-reasons">

                          <span>
                            KEY SIGNALS
                          </span>

                          <ul>

                            {lead.reasons
                              .slice(0, 2)
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


                      {/* =====================
                          VIEW WHY
                      ====================== */}

                      <div className="lead-actions">

                        <button
                          type="button"
                          className="why-button"
                          onClick={() =>
                            handleViewWhy(lead)
                          }
                        >
                          View Why →
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </section>


      {/* =========================
          LEAD EXPLANATION
      ========================== */}

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