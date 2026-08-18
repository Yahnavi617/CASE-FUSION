import React, { useMemo, useState } from 'react';
import './Personnel.css';

const TEAM_MEMBERS = [
  {
    id: '883-XRAY',
    name: 'Arthur Pendleton',
    role: 'Supervisor',
    cases: 12,
    status: 'Online',
    avatar: 'AP',
  },
  {
    id: '442-DELTA',
    name: 'Sarah Jenkins',
    role: 'Investigator',
    cases: 4,
    status: 'Away',
    avatar: 'SJ',
  },
  {
    id: '991-ECHO',
    name: 'Marcus Vance',
    role: 'Analyst',
    cases: 8,
    status: 'Offline',
    avatar: 'MV',
  },
];

function Personnel({
  onBack,
  onNewInvestigation,
  onOpenSettings,
  onOpenReports,
  onOpenInvestigations,
  onOpenAlerts,
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [menuOpen, setMenuOpen] = useState(null);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return TEAM_MEMBERS.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        member.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const handleFilter = () => {
    const filters = ['All', 'Online', 'Away', 'Offline'];
    const currentIndex = filters.indexOf(activeFilter);
    const nextIndex = (currentIndex + 1) % filters.length;

    setActiveFilter(filters[nextIndex]);
  };

  const handleMenu = (memberId) => {
    setMenuOpen((current) =>
      current === memberId ? null : memberId
    );
  };

  const handleViewProfile = (member) => {
    alert(`Viewing profile of ${member.name}`);
    setMenuOpen(null);
  };

  const handleViewCases = (member) => {
    alert(
      `${member.name} has ${member.cases} active cases.`
    );
    setMenuOpen(null);
  };

  const handleContact = (member) => {
    alert(`Message sent to ${member.name}`);
    setMenuOpen(null);
  };

  return (
    <div className="personnel-page">
      <div className="personnel-content">

        {/* =====================================================
            BACK BUTTON
            ===================================================== */}

        <div className="personnel-topbar">
          <button
            type="button"
            className="personnel-back-button"
            onClick={onBack}
          >
            <span className="back-arrow">←</span>
            <span>Back</span>
          </button>
        </div>

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="personnel-header">

          <div className="personnel-title-area">
            <h1>Investigation Team</h1>
            <p>
              Manage investigators, analysts and supervisors.
            </p>
          </div>

          <div className="personnel-header-actions">

            {/* SEARCH */}
            <div className="personnel-search">
              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search personnel..."
                aria-label="Search personnel"
              />
            </div>

            {/* FILTER */}
            <button
              type="button"
              className={`filter-button ${
                activeFilter !== 'All'
                  ? 'filter-active'
                  : ''
              }`}
              onClick={handleFilter}
              title={`Current filter: ${activeFilter}`}
              aria-label={`Filter personnel. Current filter: ${activeFilter}`}
            >
              <span className="filter-lines">
                <i />
                <i />
                <i />
              </span>
            </button>

          </div>
        </div>

        {/* =====================================================
            ACTIVE FILTER
            ===================================================== */}

        {activeFilter !== 'All' && (
          <div className="personnel-filter-info">
            <span>
              Showing: <strong>{activeFilter}</strong>
            </span>

            <button
              type="button"
              onClick={() => setActiveFilter('All')}
            >
              Clear filter
            </button>
          </div>
        )}

        {/* =====================================================
            TEAM TABLE
            ===================================================== */}

        <section className="personnel-card">

          {/* TABLE HEADER */}

          <div className="personnel-table-head">

            <div>NAME</div>

            <div>ROLE</div>

            <div>ACTIVE CASES</div>

            <div>STATUS</div>

            <div>ACTIONS</div>

          </div>

          {/* TABLE BODY */}

          <div className="personnel-table-body">

            {filteredMembers.length === 0 ? (

              <div className="personnel-empty">
                <div>
                  <strong>No personnel found</strong>
                  <span>
                    Try changing your search or filter.
                  </span>
                </div>
              </div>

            ) : (

              filteredMembers.map((member) => (

                <div
                  className="personnel-row"
                  key={member.id}
                >

                  {/* =================================================
                      NAME
                      ================================================= */}

                  <div className="personnel-name-cell">

                    <div className="personnel-avatar">
                      {member.avatar}
                    </div>

                    <div className="personnel-name-info">

                      <strong>
                        {member.name}
                      </strong>

                      <span>
                        ID: {member.id}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      ROLE
                      ================================================= */}

                  <div className="personnel-role-cell">

                    <span
                      className={`role-badge role-${member.role
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {member.role}
                    </span>

                  </div>

                  {/* =================================================
                      ACTIVE CASES
                      ================================================= */}

                  <div className="personnel-cases">
                    {member.cases}
                  </div>

                  {/* =================================================
                      STATUS
                      ================================================= */}

                  <div className="personnel-status-cell">

                    <span
                      className={`status-indicator status-${member.status.toLowerCase()}`}
                    />

                    <span
                      className={`status-text status-text-${member.status.toLowerCase()}`}
                    >
                      {member.status}
                    </span>

                  </div>

                  {/* =================================================
                      ACTIONS
                      ================================================= */}

                  <div className="personnel-actions">

                    <button
                      type="button"
                      className="personnel-more"
                      onClick={() =>
                        handleMenu(member.id)
                      }
                      aria-label={`Actions for ${member.name}`}
                      aria-expanded={
                        menuOpen === member.id
                      }
                    >
                      ⋮
                    </button>

                    {menuOpen === member.id && (

                      <div className="personnel-action-menu">

                        <button
                          type="button"
                          onClick={() =>
                            handleViewProfile(member)
                          }
                        >
                          View Profile
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewCases(member)
                          }
                        >
                          View Cases
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleContact(member)
                          }
                        >
                          Contact
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

        {/* =====================================================
            FOOTER INFO
            ===================================================== */}

        <div className="personnel-footer">

          <span>
            Showing {filteredMembers.length} of{' '}
            {TEAM_MEMBERS.length} personnel
          </span>

          {activeFilter !== 'All' && (
            <span>
              Filter: {activeFilter}
            </span>
          )}

        </div>

      </div>
    </div>
  );
}

export default Personnel;