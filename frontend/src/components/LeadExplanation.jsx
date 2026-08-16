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

  return (
    <div className="lead-explanation-overlay">
      <div className="lead-explanation-modal">

        <div className="lead-explanation-header">
          <div>
            <p className="section-label">
              LEAD ANALYSIS
            </p>

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
          >
            ×
          </button>
        </div>

        <div className="lead-summary">
          <div>
            <span className="lead-summary-label">
              ENTITY
            </span>

            <strong>
              {lead.label}
            </strong>
          </div>

          <div>
            <span className="lead-summary-label">
              SCORE
            </span>

            <strong className="lead-score">
              {lead.score}/100
            </strong>
          </div>
        </div>

        {loading && (
          <div className="explanation-state">
            Loading evidence...
          </div>
        )}

        {error && (
          <div className="explanation-error">
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="explanation-content">

            <div className="explanation-section">
              <p className="section-label">
                KEY SIGNALS
              </p>

              <div className="explanation-signals">
                {Object.entries(
                  data.signals || lead.signals || {}
                ).map(([key, value]) => (
                  <div
                    className="explanation-signal"
                    key={key}
                  >
                    <span>
                      {key}
                    </span>

                    <strong>
                      {Math.round(
                        Number(value) * 100
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="explanation-section">
              <p className="section-label">
                EVIDENCE
              </p>

              <div className="evidence-list">
                {(data.reasons ||
                  lead.reasons ||
                  []).map(
                  (reason, index) => (
                    <div
                      className="evidence-item"
                      key={index}
                    >
                      <span className="evidence-number">
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      <p>
                        {reason}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {data.explanation && (
              <div className="explanation-section">
                <p className="section-label">
                  ANALYST SUMMARY
                </p>

                <p className="analyst-summary">
                  {data.explanation}
                </p>
              </div>
            )}
          </div>
        )}

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