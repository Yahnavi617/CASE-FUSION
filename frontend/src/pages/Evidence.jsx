import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getEvidence,
  verifyEvidence,
} from '../services/api';

function Evidence() {
  const [evidence, setEvidence] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [caseFilter, setCaseFilter] =
    useState('all');

  const [sourceFilter, setSourceFilter] =
    useState('all');

  const [selectedEvidence, setSelectedEvidence] =
    useState(null);

  const [verifying, setVerifying] =
    useState(false);

  /* =====================================================
     LOAD EVIDENCE
     ===================================================== */

  async function loadEvidence() {
    try {
      setLoading(true);
      setError('');

      const response =
        await getEvidence();

      const rows =
        Array.isArray(response)
          ? response
          : response?.evidence ||
            response?.data ||
            [];

      setEvidence(rows);

      setSelectedEvidence(
        rows[0] || null
      );
    } catch (err) {
      console.error(
        'Failed to load evidence:',
        err
      );

      setError(
        err.message ||
        'Failed to load evidence.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  /* =====================================================
     FILTER OPTIONS
     ===================================================== */

  const cases = useMemo(() => {
    const values =
      evidence
        .map(
          (item) =>
            item.caseId
        )
        .filter(Boolean);

    return [
      ...new Set(values),
    ];
  }, [evidence]);

  const sources = useMemo(() => {
    const values =
      evidence
        .map(
          (item) =>
            item.source
        )
        .filter(Boolean);

    return [
      ...new Set(values),
    ];
  }, [evidence]);

  /* =====================================================
     FILTERED EVIDENCE
     ===================================================== */

  const filteredEvidence =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return evidence.filter(
        (item) => {

          const matchesSearch =
            !query ||
            [
              item.evidenceId,
              item.source,
              item.type,
              item.relatedEntity,
              item.caseName,
              item.caseId,
              item.rawPreview,
            ]
              .join(' ')
              .toLowerCase()
              .includes(query);

          const matchesCase =
            caseFilter === 'all' ||
            item.caseId === caseFilter;

          const matchesSource =
            sourceFilter === 'all' ||
            item.source === sourceFilter;

          return (
            matchesSearch &&
            matchesCase &&
            matchesSource
          );
        }
      );
    }, [
      evidence,
      search,
      caseFilter,
      sourceFilter,
    ]);

  /* =====================================================
     SELECT FIRST FILTERED ITEM
     ===================================================== */

  useEffect(() => {
    if (!filteredEvidence.length) {
      setSelectedEvidence(null);
      return;
    }

    const stillVisible =
      filteredEvidence.some(
        (item) =>
          item.evidenceId ===
          selectedEvidence?.evidenceId
      );

    if (!stillVisible) {
      setSelectedEvidence(
        filteredEvidence[0]
      );
    }
  }, [
    filteredEvidence,
    selectedEvidence,
  ]);

  /* =====================================================
     VERIFY
     ===================================================== */

  async function handleVerify() {
    if (
      !selectedEvidence ||
      selectedEvidence.status ===
        'verified'
    ) {
      return;
    }

    try {
      setVerifying(true);
      setError('');

      const response =
        await verifyEvidence(
          selectedEvidence.evidenceId
        );

      const updated =
        response?.evidence ||
        response?.data ||
        response;

      setEvidence(
        (previous) =>
          previous.map(
            (item) =>
              item.evidenceId ===
              selectedEvidence.evidenceId
                ? {
                    ...item,
                    ...updated,
                    status:
                      updated?.status ||
                      'verified',
                  }
                : item
          )
      );

      setSelectedEvidence(
        (previous) => ({
          ...previous,
          ...updated,
          status:
            updated?.status ||
            'verified',
        })
      );
    } catch (err) {
      console.error(
        'Evidence verification failed:',
        err
      );

      setError(
        err.message ||
        'Failed to verify evidence.'
      );
    } finally {
      setVerifying(false);
    }
  }

  /* =====================================================
     EXPORT
     ===================================================== */

  function handleExport() {
    if (!filteredEvidence.length) {
      return;
    }

    const headers = [
      'Evidence ID',
      'Source',
      'Type',
      'Related Entity',
      'Case',
      'Timestamp',
      'Status',
    ];

    const rows =
      filteredEvidence.map(
        (item) => [
          item.evidenceId || '',
          item.source || '',
          item.type || '',
          item.relatedEntity || '',
          item.caseName || item.caseId || '',
          item.timestamp || '',
          item.status || '',
        ]
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
                (value) =>
                  `"${String(value)
                    .replace(
                      /"/g,
                      '""'
                    )}"`
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
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      'casefusion-evidence.csv';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /* =====================================================
     FORMATTERS
     ===================================================== */

  function formatTimestamp(value) {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date
      .toISOString()
      .replace('T', ' ')
      .replace('.000Z', 'Z');
  }

  function getSourceIcon(source) {
    if (source === 'Bank') {
      return '▥';
    }

    if (source === 'CDR') {
      return '⌕';
    }

    if (source === 'Social') {
      return '◉';
    }

    return '◌';
  }

  function getStatusClass(status) {
    return String(status || '')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <section className="evidence-vault-page">
        <div className="evidence-vault-loading">
          Loading evidence vault...
        </div>
      </section>
    );
  }

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <section className="evidence-vault-page">

      {/* ================================================
          HEADER
          ================================================ */}

      <div className="evidence-vault-heading">

        <div>
          <p className="evidence-vault-eyebrow">
            INVESTIGATIVE INTEL
          </p>

          <h1>
            Evidence Vault
          </h1>

          <p className="evidence-vault-description">
            Search, review and organize
            intelligence collected across
            investigations.
          </p>
        </div>

      </div>


      {/* ================================================
          ERROR
          ================================================ */}

      {error && (
        <div className="evidence-vault-error">
          {error}
        </div>
      )}


      {/* ================================================
          TOOLBAR
          ================================================ */}

      <div className="evidence-vault-toolbar">

        <div className="evidence-search-box">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search evidence..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={caseFilter}
          onChange={(event) =>
            setCaseFilter(
              event.target.value
            )
          }
          className="evidence-filter-select"
        >
          <option value="all">
            Case: All
          </option>

          {cases.map(
            (caseId) => (
              <option
                key={caseId}
                value={caseId}
              >
                {caseId}
              </option>
            )
          )}

        </select>


        <select
          value={sourceFilter}
          onChange={(event) =>
            setSourceFilter(
              event.target.value
            )
          }
          className="evidence-filter-select"
        >
          <option value="all">
            Source: All
          </option>

          {sources.map(
            (source) => (
              <option
                key={source}
                value={source}
              >
                {source}
              </option>
            )
          )}

        </select>


        <button
          type="button"
          className="evidence-filter-button"
          onClick={() => {
            setSearch('');
            setCaseFilter('all');
            setSourceFilter('all');
          }}
        >
          ☰ More Filters
        </button>

      </div>


      {/* ================================================
          MAIN AREA
          ================================================ */}

      <div className="evidence-vault-layout">

        {/* ==============================================
            TABLE
            ============================================== */}

        <div className="evidence-table-panel">

          <div className="evidence-table-wrapper">

            <table className="evidence-table">

              <thead>
                <tr>
                  <th>
                    EVIDENCE ID
                  </th>

                  <th>
                    SOURCE
                  </th>

                  <th>
                    TYPE
                  </th>

                  <th>
                    RELATED ENTITY
                  </th>

                  <th>
                    CASE
                  </th>

                  <th>
                    TIMESTAMP
                  </th>

                  <th>
                    STATUS
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredEvidence.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="evidence-empty-cell"
                    >
                      No evidence matches
                      the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredEvidence.map(
                    (item) => {

                      const selected =
                        selectedEvidence?.evidenceId ===
                        item.evidenceId;

                      return (
                        <tr
                          key={
                            item.evidenceId
                          }
                          className={
                            selected
                              ? 'evidence-row-selected'
                              : ''
                          }
                          onClick={() =>
                            setSelectedEvidence(
                              item
                            )
                          }
                        >

                          <td>
                            <span className="evidence-id">
                              {item.evidenceId}
                            </span>
                          </td>

                          <td>
                            <span className="evidence-source">
                              <span className="evidence-source-icon">
                                {
                                  getSourceIcon(
                                    item.source
                                  )
                                }
                              </span>

                              {item.source}
                            </span>
                          </td>

                          <td>
                            {item.type}
                          </td>

                          <td>
                            <strong className="evidence-entity">
                              {
                                item.relatedEntity ||
                                'Unknown'
                              }
                            </strong>
                          </td>

                          <td>
                            <span className="evidence-case-name">
                              {
                                item.caseName ||
                                item.caseId
                              }
                            </span>
                          </td>

                          <td>
                            <span className="evidence-timestamp">
                              {
                                formatTimestamp(
                                  item.timestamp
                                )
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={`evidence-status evidence-status-${getStatusClass(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ==============================================
            DETAILS
            ============================================== */}

        <aside className="evidence-details-panel">

          <div className="evidence-details-heading">
            Evidence Details
          </div>

          {!selectedEvidence ? (
            <div className="evidence-details-empty">
              Select an evidence record
              to inspect its details.
            </div>
          ) : (
            <>

              <div className="evidence-details-top">

                <span className="evidence-details-id">
                  {
                    selectedEvidence.evidenceId
                  }
                </span>

                <span
                  className={`evidence-status evidence-status-${getStatusClass(
                    selectedEvidence.status
                  )}`}
                >
                  {
                    selectedEvidence.status
                  }
                </span>

              </div>


              <h2>
                {
                  selectedEvidence.detailTitle ||
                  selectedEvidence.type
                }
              </h2>


              <p className="evidence-details-summary">
                {
                  selectedEvidence.description ||
                  'Evidence record collected during the investigation.'
                }
              </p>


              <div className="evidence-detail-grid">

                <div>
                  <span>
                    SOURCE
                  </span>

                  <strong>
                    {selectedEvidence.source}
                  </strong>
                </div>

                <div>
                  <span>
                    DATE ACQUIRED
                  </span>

                  <strong>
                    {
                      selectedEvidence.timestamp
                        ? new Date(
                            selectedEvidence.timestamp
                          ).toLocaleDateString(
                            'en-US'
                          )
                        : '—'
                    }
                  </strong>
                </div>

              </div>


              <div className="evidence-detail-block">

                <span>
                  RELATED ENTITY
                </span>

                <strong>
                  {
                    selectedEvidence.relatedEntity ||
                    'Unknown'
                  }
                </strong>

              </div>


              <div className="evidence-detail-block">

                <span>
                  RAW DATA PREVIEW
                </span>

                <pre>
                  {
                    selectedEvidence.rawPreview ||
                    'No raw preview available.'
                  }
                </pre>

              </div>


              <div className="evidence-details-actions">

                <button
                  type="button"
                  className="evidence-export-button"
                  onClick={
                    handleExport
                  }
                >
                  EXPORT
                </button>

                <button
                  type="button"
                  className="evidence-verify-button"
                  onClick={
                    handleVerify
                  }
                  disabled={
                    verifying ||
                    selectedEvidence.status ===
                      'Verified'
                  }
                >
                  {
                    verifying
                      ? 'VERIFYING...'
                      : selectedEvidence.status ===
                        'Verified'
                        ? 'VERIFIED'
                        : 'VERIFY'
                  }
                </button>

              </div>

            </>
          )}

        </aside>

      </div>

    </section>
  );
}

export default Evidence;