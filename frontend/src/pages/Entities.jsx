import { useMemo, useState } from 'react';
import './Entities.css';

const initialEntities = [
  {
    id: 'ENT-8992-A',
    name: 'Rohan Mehta',
    type: 'Person',
    risk: 'High',
    cases: 3,
    relations: 14,
    activity: '2023-10-24 14:30Z',
    icon: '◉',
  },
  {
    id: 'ORG-4410-X',
    name: 'Apex Global Logistics',
    type: 'Organization',
    risk: 'High',
    cases: 5,
    relations: 32,
    activity: '2023-10-23 09:15Z',
    icon: '▦',
  },
  {
    id: 'ENT-7721-B',
    name: 'Elena Rostova',
    type: 'Person',
    risk: 'Medium',
    cases: 1,
    relations: 8,
    activity: '2023-10-20 18:45Z',
    icon: '●',
  },
  {
    id: 'VEH-1104-V',
    name: 'Mercedes G-Class (Black)',
    type: 'Vehicle',
    risk: 'Medium',
    cases: 2,
    relations: 4,
    activity: '2023-10-18 11:20Z',
    icon: '▣',
  },
  {
    id: 'ENT-3301-C',
    name: 'Dr. Arthur Vance',
    type: 'Person',
    risk: 'Low',
    cases: 1,
    relations: 12,
    activity: '2023-10-15 08:00Z',
    icon: '◉',
  },
];

function Entities({
  onNewInvestigation,
  onOpenInvestigations,
  onOpenReports,
  onOpenSettings,
  onOpenPersonnel,
  onOpenVisualizer,
}) {
  const [entities, setEntities] =
    useState(initialEntities);

  const [search, setSearch] =
    useState('');

  const [typeFilter, setTypeFilter] =
    useState('All');

  const [riskFilter, setRiskFilter] =
    useState('All');

  const [caseFilter, setCaseFilter] =
    useState('Any');

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedEntity, setSelectedEntity] =
    useState(null);

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const text = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !text ||
        entity.name
          .toLowerCase()
          .includes(text) ||
        entity.id
          .toLowerCase()
          .includes(text) ||
        entity.type
          .toLowerCase()
          .includes(text);

      const matchesType =
        typeFilter === 'All' ||
        entity.type === typeFilter;

      const matchesRisk =
        riskFilter === 'All' ||
        entity.risk === riskFilter;

      const matchesCase =
        caseFilter === 'Any' ||
        (caseFilter === 'Active' &&
          entity.cases > 0) ||
        (caseFilter === 'Multiple' &&
          entity.cases > 1);

      return (
        matchesSearch &&
        matchesType &&
        matchesRisk &&
        matchesCase
      );
    });
  }, [
    entities,
    search,
    typeFilter,
    riskFilter,
    caseFilter,
  ]);

  function handleAddEntity() {
    const newEntity = {
      id: `ENT-${Math.floor(
        1000 + Math.random() * 9000
      )}-N`,
      name: 'New Entity',
      type: 'Person',
      risk: 'Low',
      cases: 0,
      relations: 0,
      activity: 'Just now',
      icon: '◉',
    };

    setEntities((prev) => [
      newEntity,
      ...prev,
    ]);

    setSelectedEntity(newEntity);
  }

  function handleExport() {
    const headers = [
      'Entity Name',
      'Entity ID',
      'Type',
      'Risk',
      'Cases',
      'Relations',
      'Last Activity',
    ];

    const rows = filteredEntities.map(
      (entity) => [
        entity.name,
        entity.id,
        entity.type,
        entity.risk,
        entity.cases,
        entity.relations,
        entity.activity,
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      'casefusion-entities.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function handleDeleteEntity(id) {
    setEntities((prev) =>
      prev.filter(
        (entity) => entity.id !== id
      )
    );

    setSelectedEntity(null);
  }

  return (
    <div className="cf-entities-page">

      {/* MOBILE SIDEBAR OVERLAY */}

      {sidebarOpen && (
        <button
          className="cf-entities-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close menu"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`cf-entities-sidebar ${
          sidebarOpen
            ? 'cf-entities-sidebar-open'
            : ''
        }`}
      >

        <div className="cf-entities-brand">

          <div className="cf-brand-logo">
            C
          </div>

          <div>
            <strong>
              CASEFUSION
            </strong>

            <span>
              Investigative Intel
            </span>
          </div>

        </div>

        <button
          className="cf-entities-new-case"
          onClick={() => {
            setSidebarOpen(false);
            onNewInvestigation?.();
          }}
        >
          <span>＋</span>
          New Investigation
        </button>

        <nav className="cf-entities-nav">

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>⌂</span>
            Home
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false);
              onOpenInvestigations?.();
            }}
          >
            <span>▣</span>
            Cases
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false);
              onOpenVisualizer?.();
            }}
          >
            <span>⌘</span>
            Visualizer
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false);
              onOpenReports?.();
            }}
          >
            <span>▥</span>
            Reports
          </button>

          <button
            className="cf-nav-active"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <span>♙</span>
            Personnel
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false);
              onOpenSettings?.();
            }}
          >
            <span>⚙</span>
            Settings
          </button>

        </nav>

      </aside>

      {/* MAIN */}

      <main className="cf-entities-main">

        {/* TOP BAR */}

        <header className="cf-entities-topbar">

          <button
            className="cf-entities-hamburger"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="cf-entities-tabs">

            <button>
              Overview
            </button>

            <button>
              Evidence
            </button>

            <button>
              Leads
            </button>

            <button className="active">
              Network
            </button>

            <button>
              Reports
            </button>

          </nav>

          <div className="cf-entities-global-search">
            <span>⌕</span>
            <input
              placeholder="Global Search..."
            />
          </div>

          <div className="cf-entities-top-icons">
            <button>♧</button>
            <button>?</button>
            <div className="cf-profile-circle">
              I
            </div>
          </div>

        </header>

        {/* CONTENT */}

        <section className="cf-entities-content">

          <div className="cf-entities-heading">

            <div>
              <h1>
                Entities
              </h1>

              <p>
                Manage and investigate
                entities identified across
                cases.
              </p>
            </div>

            <div className="cf-entities-heading-actions">

              <button
                className="cf-export-button"
                onClick={handleExport}
              >
                ↓&nbsp; Export
              </button>

              <button
                className="cf-add-entity-button"
                onClick={handleAddEntity}
              >
                ＋&nbsp; Add Entity
              </button>

            </div>

          </div>

          {/* FILTER BAR */}

          <div className="cf-entity-filters">

            <div className="cf-entity-search">

              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
                placeholder="Search entities by name, ID, or alias..."
              />

            </div>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >
              <option value="All">
                Type: All
              </option>

              <option value="Person">
                Person
              </option>

              <option value="Organization">
                Organization
              </option>

              <option value="Vehicle">
                Vehicle
              </option>
            </select>

            <select
              value={riskFilter}
              onChange={(event) => {
                setRiskFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >
              <option value="All">
                Risk: All
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>

            <select
              value={caseFilter}
              onChange={(event) => {
                setCaseFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >
              <option value="Any">
                Case: Any
              </option>

              <option value="Active">
                Case: Active
              </option>

              <option value="Multiple">
                Multiple Cases
              </option>
            </select>

            <button
              className="cf-filter-settings"
              title="More filters"
            >
              ☷
            </button>

          </div>

          {/* ENTITY TABLE */}

          <section className="cf-entities-table-card">

            <div className="cf-table-scroll">

              <table className="cf-entities-table">

                <thead>

                  <tr>

                    <th className="cf-check-cell">
                      <input
                        type="checkbox"
                      />
                    </th>

                    <th>
                      Entity Name
                    </th>

                    <th>
                      Entity ID
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Risk
                    </th>

                    <th>
                      Cases
                    </th>

                    <th>
                      Rel.
                    </th>

                    <th>
                      Last Activity
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredEntities.length ===
                    0 && (

                    <tr>

                      <td
                        colSpan="9"
                        className="cf-empty-entities"
                      >
                        No entities found.
                      </td>

                    </tr>

                  )}

                  {filteredEntities.map(
                    (entity) => (

                      <tr
                        key={entity.id}
                        onClick={() =>
                          setSelectedEntity(
                            entity
                          )
                        }
                      >

                        <td
                          className="cf-check-cell"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <input
                            type="checkbox"
                          />
                        </td>

                        <td>

                          <div className="cf-entity-name">

                            <span className="cf-entity-avatar">
                              {entity.icon}
                            </span>

                            <strong>
                              {entity.name}
                            </strong>

                          </div>

                        </td>

                        <td>
                          <span className="cf-entity-id">
                            {entity.id}
                          </span>
                        </td>

                        <td>

                          <span className="cf-entity-type">
                            <span>
                              {entity.type ===
                              'Person'
                                ? '♙'
                                : entity.type ===
                                  'Vehicle'
                                ? '▣'
                                : '▦'}
                            </span>

                            {entity.type}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`cf-entity-risk cf-risk-${entity.risk.toLowerCase()}`}
                          >
                            {entity.risk}
                          </span>

                        </td>

                        <td>
                          {entity.cases}
                        </td>

                        <td>
                          {entity.relations}
                        </td>

                        <td>
                          <span className="cf-entity-activity">
                            {entity.activity}
                          </span>
                        </td>

                        <td>

                          <button
                            className="cf-entity-action"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedEntity(
                                entity
                              );
                            }}
                          >
                            Open
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* TABLE FOOTER */}

            <div className="cf-entities-footer">

              <span>
                Showing 1 to{' '}
                {filteredEntities.length}{' '}
                of 128 entities
              </span>

              <div className="cf-pagination">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      Math.max(
                        1,
                        currentPage - 1
                      )
                    )
                  }
                >
                  ‹
                </button>

                <span>
                  Page {currentPage} of 26
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        26,
                        currentPage + 1
                      )
                    )
                  }
                >
                  ›
                </button>

              </div>

            </div>

          </section>

        </section>

      </main>


      {/* ENTITY DETAIL MODAL */}

      {selectedEntity && (

        <div
          className="cf-entity-modal-backdrop"
          onClick={() =>
            setSelectedEntity(null)
          }
        >

          <div
            className="cf-entity-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="cf-modal-close"
              onClick={() =>
                setSelectedEntity(null)
              }
            >
              ×
            </button>

            <div className="cf-modal-avatar">
              {selectedEntity.icon}
            </div>

            <h2>
              {selectedEntity.name}
            </h2>

            <span className="cf-modal-id">
              {selectedEntity.id}
            </span>

            <div className="cf-modal-grid">

              <div>
                <label>
                  Type
                </label>

                <strong>
                  {selectedEntity.type}
                </strong>
              </div>

              <div>
                <label>
                  Risk
                </label>

                <strong
                  className={`cf-modal-risk-${selectedEntity.risk.toLowerCase()}`}
                >
                  {selectedEntity.risk}
                </strong>
              </div>

              <div>
                <label>
                  Cases
                </label>

                <strong>
                  {selectedEntity.cases}
                </strong>
              </div>

              <div>
                <label>
                  Relations
                </label>

                <strong>
                  {selectedEntity.relations}
                </strong>
              </div>

            </div>

            <div className="cf-modal-actions">

              <button
                onClick={() =>
                  setSelectedEntity(null)
                }
              >
                Close
              </button>

              <button
                className="danger"
                onClick={() =>
                  handleDeleteEntity(
                    selectedEntity.id
                  )
                }
              >
                Remove Entity
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Entities;