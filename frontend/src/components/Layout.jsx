import { useState } from 'react';

/* ==========================================
   Reuses Dashboard.css — same classnames,
   same look, on every page.
   ========================================== */
import '../pages/Dashboard.css';

function Layout({
  active,
  onNewInvestigation,
  onOpenInvestigations,
  onOpenAlerts,
  onOpenReports,
  onOpenSettings,
  onOpenTemplates,
  onOpenPersonnel,
  onOpenEntities,
  onOpenDashboard,
  showTopTabs = true,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function go(action) {
    setSidebarOpen(false);
    action?.();
  }

  return (
    <div className="cf-dashboard">

      {/* =====================================
          MOBILE / SLIDE SIDEBAR
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="cf-sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`cf-sidebar ${sidebarOpen ? 'cf-sidebar-open' : ''}`}
      >

        <button
          type="button"
          className="cf-sidebar-close"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>

        {/* NEW INVESTIGATION */}

        <button
          type="button"
          className="cf-new-investigation"
          onClick={() => go(onNewInvestigation)}
        >
          <span className="cf-plus">＋</span>
          <span>New Investigation</span>
        </button>

        {/* SIDEBAR NAVIGATION */}

        <nav className="cf-sidebar-nav">

          {/* HOME */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'dashboard' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenDashboard)}
          >
            <span className="cf-nav-icon">⌂</span>
            <span>Home</span>
          </button>

          {/* CASES */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'investigations' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenInvestigations)}
          >
            <span className="cf-nav-icon">▣</span>
            <span>Cases</span>
          </button>

          {/* ENTITIES */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'entities' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenEntities)}
          >
            <span className="cf-nav-icon">◉</span>
            <span>Entities</span>
          </button>

          {/* VISUALIZER */}

          <button
            type="button"
            className="cf-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="cf-nav-icon">⌘</span>
            <span>Visualizer</span>
          </button>

          {/* ALERTS */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'alerts' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenAlerts)}
          >
            <span className="cf-nav-icon">△</span>
            <span>Alerts</span>
          </button>

          {/* REPORTS */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'reports' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenReports)}
          >
            <span className="cf-nav-icon">▥</span>
            <span>Reports</span>
          </button>

          {/* PERSONNEL */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'personnel' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenPersonnel)}
          >
            <span className="cf-nav-icon">♧</span>
            <span>Personnel</span>
          </button>

          {/* SETTINGS */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'settings' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenSettings)}
          >
            <span className="cf-nav-icon">⚙</span>
            <span>Settings</span>
          </button>

          {/* TEMPLATES */}

          <button
            type="button"
            className={`cf-nav-item ${
              active === 'templates' ? 'cf-nav-active' : ''
            }`}
            onClick={() => go(onOpenTemplates)}
          >
            <span className="cf-nav-icon">▤</span>
            <span>Templates</span>
          </button>

        </nav>

      </aside>

      {/* =====================================
          MAIN AREA
      ====================================== */}

      <main className="cf-main">

        {/* TOP BAR */}

        <header className="cf-topbar">

          <div className="cf-topbar-left">

            <button
              type="button"
              className="cf-hamburger-button"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>

            {showTopTabs && (
              <nav className="cf-top-tabs">
                <button
                  type="button"
                  className={`cf-top-tab ${
                    active === 'dashboard' ? 'cf-top-tab-active' : ''
                  }`}
                  onClick={() => go(onOpenDashboard)}
                >
                  Overview
                </button>

                <button type="button" className="cf-top-tab">
                  Evidence
                </button>

                <button type="button" className="cf-top-tab">
                  Leads
                </button>

                <button type="button" className="cf-top-tab">
                  Network
                </button>

                <button
                  type="button"
                  className={`cf-top-tab ${
                    active === 'reports' ? 'cf-top-tab-active' : ''
                  }`}
                  onClick={() => go(onOpenReports)}
                >
                  Reports
                </button>
              </nav>
            )}

          </div>

          {/* SEARCH */}

          <div className="cf-top-actions">
            <div className="cf-search">
              <span className="cf-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search entity, ID, or keyword..."
              />
            </div>
          </div>

        </header>

        {/* PAGE CONTENT — each page renders only its own content here */}

        {children}

      </main>

    </div>
  );
}

export default Layout;