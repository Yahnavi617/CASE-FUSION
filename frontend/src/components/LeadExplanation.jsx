import { useEffect, useState } from 'react';
import { getLeadWhy } from '../services/api';

function LeadExplanation({ caseId, lead, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExplanation();
  }, [caseId, lead?.id]);

  async function loadExplanation() {
    if (!caseId || !lead?.id) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setData(null);

      const result = await getLeadWhy(
        caseId,
        lead.id
      );

      setData(result);
    } catch (err) {
      console.error(
        'Failed to load lead explanation:',
        err
      );

      setError(
        err.message ||
          'Failed to load lead explanation.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!lead) {
    return null;
  }

  const signals =
    data?.signals ||
    lead.signals ||
    {};

  const reasons =
    data?.reasons ||
    lead.reasons ||
    [];

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

  function formatSignalName(key) {
    const names = {
      financial: 'Financial',
      communication: 'Communication',
      crossSource: 'Cross-source',
      temporal: 'Temporal',
      centrality: 'Centrality',
    };

    return (
      names[key] ||
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) =>
          char.toUpperCase()
        )
    );
  }

  return (
    <div
      className="lead-explanation-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="lead-explanation-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="lead-explanation-header">

          <div>

            <div className="lead-modal-heading-row">
              <p className="section-label">
                LEAD ANALYSIS
              </p>

              <span
                className={`lead-modal-risk risk-${riskClass}`}
              >
                {riskLevel}
              </span>
            </div>

            <h3>
              Why this lead?
            </h3>

            <p className="lead-explanation-subtitle">
              Evidence supporting the prioritization
              of this entity.
            </p>

          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close explanation"
          >
            ×
          </button>

        </div>

        {/* =================================================
            ENTITY SUMMARY
        ================================================= */}

        <div className="lead-summary">

          <div className="lead-summary-entity">

            <span className="lead-summary-label">
              ENTITY
            </span>

            <strong>
              {lead.label}
            </strong>

            <small>
              {lead.id}
            </small>

          </div>

          <div className="lead-summary-score">

            <span className="lead-summary-label">
              PRIORITY SCORE
            </span>

            <strong>
              {score}
              <small>/100</small>
            </strong>

            <div className="modal-score-bar">
              <div
                className={`modal-score-fill score-${riskClass}`}
                style={{
                  width: `${Math.min(
                    Math.max(score, 0),
                    100
                  )}%`,
                }}
              />
            </div>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="explanation-state">

            <div className="explanation-loading-dot">
              ...
            </div>

            <strong>
              Loading evidence
            </strong>

            <span>
              Retrieving supporting intelligence...
            </span>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="explanation-error">

            <strong>
              Unable to load evidence
            </strong>

            <span>
              {error}
            </span>

          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {data && !loading && (
          <div className="explanation-content">

            {/* =================================================
                SIGNALS
            ================================================= */}

            <div className="explanation-section">

              <div className="explanation-section-heading">

                <div>
                  <p className="section-label">
                    KEY SIGNALS
                  </p>

                  <h4>
                    Scoring Breakdown
                  </h4>
                </div>

                <span>
                  0–100
                </span>

              </div>

              <div className="explanation-signals">

                {Object.entries(signals).map(
                  ([key, value]) => {

                    const percentage = Math.min(
                      Math.max(
                        Number(value) * 100,
                        0
                      ),
                      100
                    );

                    return (
                      <div
                        className="explanation-signal"
                        key={key}
                      >

                        <div className="explanation-signal-top">

                          <span>
                            {formatSignalName(key)}
                          </span>

                          <strong>
                            {Math.round(
                              percentage
                            )}
                          </strong>

                        </div>

                        <div className="explanation-signal-bar">

                          <div
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* =================================================
                EVIDENCE
            ================================================= */}

            <div className="explanation-section">

              <div className="explanation-section-heading">

                <div>
                  <p className="section-label">
                    EVIDENCE
                  </p>

                  <h4>
                    Why it was prioritized
                  </h4>
                </div>

                <span>
                  {reasons.length}{' '}
                  signals
                </span>

              </div>

              <div className="evidence-list">

                {reasons.length > 0 ? (
                  reasons.map(
                    (reason, index) => (
                      <div
                        className="evidence-item"
                        key={index}
                      >

                        <span className="evidence-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        <p>
                          {reason}
                        </p>

                      </div>
                    )
                  )
                ) : (
                  <div className="evidence-empty">
                    No supporting evidence
                    was returned.
                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                ANALYST SUMMARY
            ================================================= */}

            {data.explanation && (
              <div className="explanation-section">

                <div className="explanation-section-heading">

                  <div>
                    <p className="section-label">
                      ANALYST SUMMARY
                    </p>

                    <h4>
                      Overall Assessment
                    </h4>
                  </div>

                </div>

                <p className="analyst-summary">
                  {data.explanation}
                </p>

              </div>
            )}

          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="lead-explanation-footer">

          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}

export default LeadExplanation;