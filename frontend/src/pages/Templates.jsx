import { useMemo, useState } from 'react';
import './Templates.css';

function Templates({
  onBack,
  onNewInvestigation,
  onOpenInvestigations,
  onOpenAlerts,
  onOpenReports,
  onOpenSettings,
}) {
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Financial Fraud',
      icon: '▤',
      iconClass: 'template-blue',
      description:
        'Standard schema for tracing illicit financial flows and anomalous transaction patterns.',
      sources: ['SWIFT Logs', 'Banking API'],
      lastUsed: '2h ago',
    },
    {
      id: 2,
      name: 'Telecommunications',
      icon: '◉',
      iconClass: 'template-orange',
      description:
        'Call detail record (CDR) analysis, cell tower mapping, and proximity correlations.',
      sources: ['Carrier Data', 'GPS Exif'],
      lastUsed: '1d ago',
    },
    {
      id: 3,
      name: 'Cyber Intrusion',
      icon: '◉',
      iconClass: 'template-green',
      description:
        'Incident response framework for threat actor attribution and network anomaly detection.',
      sources: ['SIEM Logs', 'PCAP', 'EDR'],
      lastUsed: '3d ago',
    },
    {
      id: 4,
      name: 'OSINT Profile',
      icon: '◉',
      iconClass: 'template-purple',
      description:
        'Open-source intelligence gathering for individual or corporate entity profiling.',
      sources: ['Social Media API', 'Public Records'],
      lastUsed: '1w ago',
    },
  ]);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return templates;
    }

    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.sources.some((source) =>
          source.toLowerCase().includes(query)
        )
      );
    });
  }, [search, templates]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleCreateTemplate() {
    const name = window.prompt('Enter template name:');

    if (!name?.trim()) {
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: name.trim(),
      icon: '✦',
      iconClass: 'template-purple',
      description:
        'Custom investigation workflow and data extraction schema.',
      sources: ['Custom Data'],
      lastUsed: 'Just now',
    };

    setTemplates((current) => [
      newTemplate,
      ...current,
    ]);
  }

  function handleUseTemplate(template) {
    if (onNewInvestigation) {
      onNewInvestigation(template);
      return;
    }

    window.alert(
      `${template.name} template selected.`
    );
  }

  function handleDeleteTemplate(templateId) {
    const confirmed = window.confirm(
      'Delete this template?'
    );

    if (!confirmed) {
      return;
    }

    setTemplates((current) =>
      current.filter(
        (template) => template.id !== templateId
      )
    );
  }

  return (
    <div className="templates-page">

      {/* =========================
          MOBILE / DRAWER SIDEBAR
      ========================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="templates-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`templates-sidebar ${
          sidebarOpen
            ? 'templates-sidebar-open'
            : ''
        }`}
      >
        <div className="templates-brand">
          <div className="templates-brand-icon">
            C
          </div>

          <div>
            <strong>CASEFUSION</strong>
            <span>INVESTIGATIVE INTEL</span>
          </div>
        </div>

        <button
          type="button"
          className="templates-sidebar-close"
          onClick={closeSidebar}
        >
          ×
        </button>

        <button
          type="button"
          className="templates-new-button"
          onClick={() => {
            closeSidebar();
            onNewInvestigation?.();
          }}
        >
          <span>＋</span>
          New Investigation
        </button>

        <nav className="templates-sidebar-nav">

          <button
            type="button"
            className="templates-nav-item"
            onClick={() => {
              closeSidebar();
              onBack?.();
            }}
          >
            <span className="templates-nav-icon">
              ▦
            </span>
            Home
          </button>

          <button
            type="button"
            className="templates-nav-item"
            onClick={() => {
              closeSidebar();
              onOpenInvestigations?.();
            }}
          >
            <span className="templates-nav-icon">
              ▣
            </span>
            Cases
          </button>

          <button
            type="button"
            className="templates-nav-item"
            onClick={closeSidebar}
          >
            <span className="templates-nav-icon">
              ⌘
            </span>
            Visualizer
          </button>

          <button
            type="button"
            className="templates-nav-item"
            onClick={() => {
              closeSidebar();
              onOpenAlerts?.();
            }}
          >
            <span className="templates-nav-icon">
              △
            </span>
            Alerts
          </button>

          <button
            type="button"
            className="templates-nav-item"
            onClick={() => {
              closeSidebar();
              onOpenReports?.();
            }}
          >
            <span className="templates-nav-icon">
              ▥
            </span>
            Reports
          </button>

          <button
            type="button"
            className="templates-nav-item"
            onClick={closeSidebar}
          >
            <span className="templates-nav-icon">
              ♧
            </span>
            Personnel
          </button>

          <button
            type="button"
            className="templates-nav-item"
            onClick={() => {
              closeSidebar();
              onOpenSettings?.();
            }}
          >
            <span className="templates-nav-icon">
              ⚙
            </span>
            Settings
          </button>

        </nav>
      </aside>


      {/* =========================
          MAIN
      ========================== */}

      <main className="templates-main">

        <header className="templates-topbar">

          <div className="templates-topbar-left">

            <button
              type="button"
              className="templates-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="templates-mobile-title">
              CASEFUSION
            </div>

          </div>

          <nav className="templates-top-nav">

            <button
              type="button"
              onClick={onBack}
            >
              Overview
            </button>

            <button type="button">
              Evidence
            </button>

            <button type="button">
              Leads
            </button>

            <button type="button">
              Network
            </button>

            <button
              type="button"
              onClick={onOpenReports}
            >
              Reports
            </button>

          </nav>

        </header>


        {/* =========================
            PAGE HEADER
        ========================== */}

        <section className="templates-content">

          <div className="templates-page-header">

            <div>
              <h1>Case Templates</h1>

              <p>
                Manage standardized workflows and
                data extraction schemas.
              </p>
            </div>

            <div className="templates-header-actions">

              <div className="templates-search">

                <span>⌕</span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search templates..."
                  aria-label="Search templates"
                />

              </div>

              <button
                type="button"
                className="templates-create-button"
                onClick={handleCreateTemplate}
              >
                <span>＋</span>
                Create Template
              </button>

            </div>

          </div>


          {/* =========================
              TABLE
          ========================== */}

          <section className="templates-table-card">

            <div className="templates-table-wrapper">

              <table className="templates-table">

                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Description</th>
                    <th>Data Sources</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTemplates.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="templates-empty"
                      >
                        No templates found.
                      </td>
                    </tr>
                  )}

                  {filteredTemplates.map(
                    (template) => (
                      <tr
                        key={template.id}
                        className="template-row"
                      >

                        <td>

                          <div className="template-name-cell">

                            <div
                              className={`template-icon ${template.iconClass}`}
                            >
                              {template.icon}
                            </div>

                            <strong>
                              {template.name}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <p className="template-description">
                            {template.description}
                          </p>

                        </td>


                        <td>

                          <div className="template-sources">

                            {template.sources.map(
                              (source) => (
                                <span
                                  key={source}
                                  className="template-source-badge"
                                >
                                  {source}
                                </span>
                              )
                            )}

                          </div>

                        </td>


                        <td>
                          <span className="template-last-used">
                            {template.lastUsed}
                          </span>
                        </td>


                        <td>

                          <div className="template-actions">

                            <button
                              type="button"
                              className="template-use-button"
                              onClick={() =>
                                handleUseTemplate(
                                  template
                                )
                              }
                            >
                              Use
                            </button>

                            <button
                              type="button"
                              className="template-more-button"
                              onClick={() =>
                                handleDeleteTemplate(
                                  template.id
                                )
                              }
                              title="Delete template"
                              aria-label={`Delete ${template.name}`}
                            >
                              ×
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="templates-footer">
              Showing {filteredTemplates.length} of{' '}
              {templates.length} templates
            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Templates;