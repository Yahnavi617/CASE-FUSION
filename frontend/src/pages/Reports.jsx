import { useMemo, useState } from 'react';
import './Reports.css';

function Reports({
  onBack,
  onOpenCase,
}) {
  const [selectedType, setSelectedType] = useState(null);
  const [filter, setFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    {
      id: 'summary',
      number: '01',
      title: 'Summary',
      icon: '▣',
      description: 'Investigation overview and key findings.',
      color: 'blue',
    },
    {
      id: 'evidence',
      number: '02',
      title: 'Evidence',
      icon: '▤',
      description: 'Evidence analysis and supporting intelligence.',
      color: 'cyan',
    },
    {
      id: 'lead',
      number: '03',
      title: 'Lead',
      icon: '⌕',
      description: 'Priority leads and investigator insights.',
      color: 'purple',
    },
    {
      id: 'network',
      number: '04',
      title: 'Network',
      icon: '⌘',
      description: 'Entity relationships and network intelligence.',
      color: 'green',
    },
    {
      id: 'timeline',
      number: '05',
      title: 'Timeline',
      icon: '⌁',
      description: 'Chronology of investigation activity.',
      color: 'orange',
    },
  ];

  const reports = [
    {
      id: 1,
      name: 'Op-ECLIPSE_03_Summary.pdf',
      caseId: 'CF-2023-08A',
      type: 'Summary',
      createdBy: 'A. Mercer',
      status: 'Finalized',
    },
    {
      id: 2,
      name: 'Node_Analysis_Vanguard.pdf',
      caseId: 'CF-2023-11B',
      type: 'Network',
      createdBy: 'T. Vance',
      status: 'Draft',
    },
    {
      id: 3,
      name: 'Financial_Trace_Kovak.pdf',
      caseId: 'CF-2023-04C',
      type: 'Evidence',
      createdBy: 'System',
      status: 'Finalized',
    },
    {
      id: 4,
      name: 'Chronology_Subject_Zero.pdf',
      caseId: 'CF-2023-11B',
      type: 'Timeline',
      createdBy: 'T. Vance',
      status: 'Failed',
    },
    {
      id: 5,
      name: 'POI_Profile_JDoe.pdf',
      caseId: 'CF-2023-09D',
      type: 'Lead',
      createdBy: 'A. Mercer',
      status: 'Finalized',
    },
  ];

  const filteredReports = useMemo(() => {
    if (filter === 'All') {
      return reports;
    }

    return reports.filter(
      (report) => report.status === filter
    );
  }, [filter]);

  const handleGenerateReport = () => {
    if (selectedType) {
      alert(
        `${selectedType.title} report generation selected.`
      );
      return;
    }

    alert('Select a report type first.');
  };

  const handleReportTypeClick = (type) => {
    setSelectedType(type);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
  };

  const handleCaseClick = (caseId) => {
    if (onOpenCase) {
      onOpenCase(caseId);
    }
  };

  return (
    <div className="reports-page">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <header className="reports-page-header">

        <div className="reports-heading">

          <div className="reports-breadcrumb">
            CASEFUSION
            <span>/</span>
            REPORTS
          </div>

          <h1>
            Investigation Reports
          </h1>

          <p>
            Manage and generate comprehensive
            intelligence dossiers.
          </p>

        </div>

        <div className="reports-header-actions">

          {onBack && (
            <button
              type="button"
              className="reports-back-button"
              onClick={onBack}
            >
              ← Back
            </button>
          )}

          <button
            type="button"
            className="generate-report-button"
            onClick={handleGenerateReport}
          >
            <span>⊞</span>
            Generate Report
          </button>

        </div>

      </header>


      {/* =========================
          REPORT TYPE CARDS
      ========================== */}

      <section className="report-types">

        {reportTypes.map((type) => (
          <button
            type="button"
            key={type.id}
            className={`
              report-type-card
              report-type-${type.color}
              ${
                selectedType?.id === type.id
                  ? 'report-type-selected'
                  : ''
              }
            `}
            onClick={() =>
              handleReportTypeClick(type)
            }
          >

            <div className="report-type-top">

              <span className="report-type-icon">
                {type.icon}
              </span>

              <span className="report-type-number">
                {type.number}
              </span>

            </div>

            <div className="report-type-title">
              {type.title}
            </div>

            <div className="report-type-description">
              {type.description}
            </div>

          </button>
        ))}

      </section>


      {/* =========================
          PREVIOUS REPORTS
      ========================== */}

      <section className="previous-reports">

        <div className="previous-reports-header">

          <div className="previous-reports-title">
            Previous Reports
          </div>

          <div className="reports-filter-area">

            <button
              type="button"
              className="reports-filter-button"
              onClick={() =>
                setFilterOpen(
                  (current) => !current
                )
              }
            >
              <span>≡</span>
              Filter
            </button>

            {filterOpen && (
              <div className="reports-filter-menu">

                {[
                  'All',
                  'Finalized',
                  'Draft',
                  'Failed',
                ].map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      filter === option
                        ? 'active'
                        : ''
                    }
                    onClick={() => {
                      setFilter(option);
                      setFilterOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}

              </div>
            )}

          </div>

        </div>


        {/* TABLE */}

        <div className="reports-table-wrapper">

          <table className="reports-table">

            <thead>
              <tr>
                <th>Report Name</th>
                <th>Case</th>
                <th>Type</th>
                <th>Created By</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="reports-empty"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="report-row"
                    onClick={() =>
                      handleReportClick(report)
                    }
                  >

                    <td>
                      <div className="report-name">

                        <span className="report-file-icon">
                          ▧
                        </span>

                        <span>
                          {report.name}
                        </span>

                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="report-case-link"
                        onClick={(event) => {
                          event.stopPropagation();

                          handleCaseClick(
                            report.caseId
                          );
                        }}
                      >
                        {report.caseId}
                      </button>
                    </td>

                    <td>
                      <span className="report-type-value">
                        {report.type}
                      </span>
                    </td>

                    <td>
                      <span className="report-created-by">
                        {report.createdBy}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`
                          report-status
                          report-status-${report.status.toLowerCase()}
                        `}
                      >
                        <span className="report-status-dot" />
                        {report.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        <div className="reports-footer">
          Showing {filteredReports.length} of{' '}
          {reports.length} reports
        </div>

      </section>


      {/* =========================
          REPORT PREVIEW MODAL
      ========================== */}

      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={handleCloseReport}
        >

          <div
            className="report-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="report-modal-close"
              onClick={handleCloseReport}
            >
              ×
            </button>

            <div className="report-modal-icon">
              ▧
            </div>

            <div className="report-modal-content">

              <span className="report-modal-label">
                REPORT
              </span>

              <h2>
                {selectedReport.name}
              </h2>

              <div className="report-modal-grid">

                <div>
                  <span>CASE</span>
                  <strong>
                    {selectedReport.caseId}
                  </strong>
                </div>

                <div>
                  <span>TYPE</span>
                  <strong>
                    {selectedReport.type}
                  </strong>
                </div>

                <div>
                  <span>CREATED BY</span>
                  <strong>
                    {selectedReport.createdBy}
                  </strong>
                </div>

                <div>
                  <span>STATUS</span>
                  <strong>
                    {selectedReport.status}
                  </strong>
                </div>

              </div>

              <div className="report-modal-actions">

                <button
                  type="button"
                  className="report-modal-secondary"
                  onClick={handleCloseReport}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="report-modal-primary"
                  onClick={() =>
                    alert(
                      'Report opening is ready to connect with your backend/PDF viewer.'
                    )
                  }
                >
                  Open Report →
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Reports;