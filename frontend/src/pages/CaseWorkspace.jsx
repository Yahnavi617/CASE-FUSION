import NetworkGraph from '../components/NetworkGraph';
import { useEffect, useState } from 'react';
import {
  getCase,
  getLeads,
  analyzeCase,
  getLeadWhy,
} from '../services/api';

function CaseWorkspace({ caseId, onBack }) {
  const [caseInfo, setCaseInfo] = useState(null);
  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [leadWhy, setLeadWhy] = useState(null);
  const [loadingWhy, setLoadingWhy] = useState(false);

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
      }
    } catch (err) {
      console.error('Failed to load case:', err);

      setError(
        err.message || 'Failed to load investigation.'
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
      console.error('Analysis failed:', err);

      setError(
        err.message || 'Failed to analyze case.'
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleViewWhy(lead) {
    try {
      setSelectedLead(lead);
      setLeadWhy(null);
      setLoadingWhy(true);
      setError('');

      const response = await getLeadWhy(
        caseId,
        lead.id
      );

      setLeadWhy(response);
    } catch (err) {
      console.error('Failed to load lead explanation:', err);

      setError(
        err.message ||
          'Failed to load lead explanation.'
      );
    } finally {
      setLoadingWhy(false);
    }
  }

  function closeLeadWhy() {
    setSelectedLead(null);
    setLeadWhy(null);
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
          <h2>Unable to load investigation</h2>

          <p>{error}</p>

          <button
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
      <header className="workspace-header">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ← All Investigations
          </button>

          <p className="section-label">
            CASE WORKSPACE
          </p>

          <h1>{caseInfo?.name}</h1>

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

      {error && (
        <div className="workspace-message">
          {error}
        </div>
      )}

      <section className="workspace-stats">
        <div className="workspace-stat">
          <span>CASE STATUS</span>

          <strong>
            {caseInfo?.status}
          </strong>
        </div>

        <div className="workspace-stat">
          <span>PRIORITY LEADS</span>

          <strong>
            {leads.length}
          </strong>
        </div>

        <div className="workspace-stat">
          <span>CREATED</span>

          <strong>
            {caseInfo?.createdAt
              ? new Date(
                  caseInfo.createdAt
                ).toLocaleDateString()
              : '—'}
          </strong>
        </div>

        <div className="workspace-stat">
          <span>ANALYZED</span>

          <strong>
            {caseInfo?.analyzedAt
              ? new Date(
                  caseInfo.analyzedAt
                ).toLocaleDateString()
              : '—'}
          </strong>
        </div>
      </section>
      {isAnalyzed && leads.length > 0 && (
  <section className="main-network-section">
    <NetworkGraph
  caseId={caseId}
  selectedLead={leads[0]}
/>
  </section>
)}
      <section className="leads-section">
        <div className="leads-heading">
          <div>
            <p className="section-label">
              INTELLIGENCE
            </p>

            <h2>Priority Leads</h2>

            <p>
              Entities ranked by the CaseFusion scoring
              engine.
            </p>
          </div>

          {isAnalyzed && (
            <span className="lead-count">
              {leads.length} leads
            </span>
          )}
        </div>

        {!isAnalyzed && (
          <div className="analysis-empty">
            <div className="analysis-icon">
              ⚡
            </div>

            <h3>
              Analysis has not been run
            </h3>

            <p>
              Run the scoring engine to identify and rank
              suspicious case entities.
            </p>

            <button
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

        {isAnalyzed && leads.length === 0 && (
          <div className="analysis-empty">
            <div className="analysis-icon">
              ✓
            </div>

            <h3>No leads identified</h3>

            <p>
              The analysis completed but did not return
              any case entities.
            </p>
          </div>
        )}

        {isAnalyzed && leads.length > 0 && (
          <div className="leads-list">
            {leads.map((lead, index) => (
              <div
                className="lead-card"
                key={lead.id}
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

                      <h3>{lead.label}</h3>
                    </div>

                    <div className="lead-score">
                      <span>SCORE</span>

                      <strong>
                        {lead.score}
                      </strong>
                    </div>
                  </div>

                  <div className="signal-grid">
                    <div>
                      <span>Financial</span>

                      <strong>
                        {Math.round(
                          lead.signals.financial * 100
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Communication</span>

                      <strong>
                        {Math.round(
                          lead.signals.communication * 100
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Cross-source</span>

                      <strong>
                        {Math.round(
                          lead.signals.crossSource * 100
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Temporal</span>

                      <strong>
                        {Math.round(
                          lead.signals.temporal * 100
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Centrality</span>

                      <strong>
                        {Math.round(
                          lead.signals.centrality * 100
                        )}
                      </strong>
                    </div>
                  </div>

                  {lead.reasons?.length > 0 && (
                    <div className="lead-reasons">
                      <span>KEY SIGNALS</span>

                      <ul>
                        {lead.reasons
                          .slice(0, 2)
                          .map(
                            (reason, reasonIndex) => (
                              <li key={reasonIndex}>
                                {reason}
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  )}

                  <div className="lead-actions">
                    <button
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
            ))}
          </div>
        )}
      </section>

      {selectedLead && (
        <div
          className="why-overlay"
          onClick={closeLeadWhy}
        >
          <div
            className="why-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="why-modal-header">
              <div>
                <p className="section-label">
                  LEAD EXPLANATION
                </p>

                <h2>
                  {selectedLead.label}
                </h2>

                <span>
                  {selectedLead.id}
                </span>
              </div>

              <button
                className="close-why-button"
                onClick={closeLeadWhy}
              >
                ×
              </button>
            </div>

            {loadingWhy && (
              <div className="why-loading">
                Loading explanation...
              </div>
            )}

            {!loadingWhy && leadWhy && (
              <div className="why-content">
                <div className="why-score">
                  <span>RISK SCORE</span>

                  <strong>
                    {selectedLead.score}
                  </strong>
                </div>
                <NetworkGraph
  caseId={caseId}
  selectedLead={selectedLead}
/>

                <div className="why-section">
                  <h3>Why this lead?</h3>

                  {selectedLead.reasons?.length > 0 ? (
                    <ul>
                      {selectedLead.reasons.map(
                        (reason, index) => (
                          <li key={index}>
                            {reason}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>
                      No additional reasons were
                      returned.
                    </p>
                  )}
                </div>

                {leadWhy.signals && (
                  <div className="why-section">
                    <h3>Signal Breakdown</h3>

                    <div className="why-signal-grid">
                      {Object.entries(
                        leadWhy.signals
                      ).map(
                        ([signal, value]) => (
                          <div
                            key={signal}
                          >
                            <span>
                              {signal}
                            </span>

                            <strong>
                              {Math.round(
                                Number(value) * 100
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="why-section">
                  <h3>Scoring Interpretation</h3>

                  <p>
                    This lead was ranked using
                    financial, communication,
                    cross-source, temporal and
                    network signals.
                  </p>
                </div>
                <div className="why-section">
  <h3>Investigator Summary</h3>

  <div className="investigator-summary">
    <div className="summary-row">
      <span>Entity</span>
      <strong>{selectedLead.label}</strong>
    </div>

    <div className="summary-row">
      <span>Lead Score</span>
      <strong>{selectedLead.score}/100</strong>
    </div>

    <div className="summary-row">
      <span>Evidence Signals</span>
      <strong>
        {selectedLead.reasons?.length || 0}
      </strong>
    </div>
  </div>
</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseWorkspace;