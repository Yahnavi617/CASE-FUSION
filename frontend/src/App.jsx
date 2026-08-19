import './App.css';
import { useEffect, useRef, useState } from 'react';

import logo from './assets/logo.jpeg';

import Dashboard from './pages/Dashboard';
import Investigations from './pages/Investigations';
import NewInvestigation from './pages/NewInvestigation';
import CaseWorkspace from './pages/CaseWorkspace';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Reports from './pages/Reports';

/* ==========================================
   TEMPLATES PAGE
   ========================================== */
import Templates from './pages/Templates';

/* ==========================================
   PERSONNEL PAGE
   ========================================== */
import Personnel from './pages/Personnel';

/* ==========================================
   ENTITIES PAGE
   ========================================== */
import Entities from './pages/Entities';


/* ==========================================
   SETTINGS PAGE
   ========================================== */

function SettingsPage({
  theme,
  onThemeToggle,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState('Profile');

  const isDark = theme === 'dark';

  const settingsColors = {
    bg: isDark ? '#080d16' : '#f4f7fb',
    panel: isDark ? '#0f1727' : '#ffffff',
    panelAlt: isDark ? '#111d2e' : '#f8faff',
    border: isDark ? '#24324a' : '#d6deeb',
    text: isDark ? '#f4f7ff' : '#152238',
    muted: isDark ? '#8798b6' : '#61708a',
    input: isDark ? '#111d2e' : '#ffffff',
    button: isDark ? '#172337' : '#eef2f8',
  };

  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [caseActivity, setCaseActivity] = useState(true);
  const [saved, setSaved] = useState(false);

  const saveChanges = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  const panelStyle = {
    background: settingsColors.panel,
    border: `1px solid ${settingsColors.border}`,
    borderRadius: 4,
    padding: 22,
    boxSizing: 'border-box',
  };

  return (
    <div
      className="cf-settings-page"
      style={{
        minHeight: 'calc(100vh - 86px)',
        width: '100%',
        boxSizing: 'border-box',
        padding: '34px clamp(22px, 5vw, 72px) 70px',
        background: settingsColors.bg,
        color: settingsColors.text,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 28,
          }}
        >

          <div>

            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.18em',
                color: settingsColors.muted,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              CASEFUSION / SYSTEM
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(30px, 4vw, 42px)',
                lineHeight: 1.1,
              }}
            >
              System Settings
            </h1>

            <p
              style={{
                margin: '10px 0 0',
                color: '#8fa3c5',
                fontSize: 15,
              }}
            >
              Manage investigator profile,
              alerts and appearance.
            </p>

          </div>

          <button
            type="button"
            onClick={onBack}
            style={{
              border: '1px solid #33445f',
              background: settingsColors.button,
              color: settingsColors.text,
              borderRadius: 6,
              padding: '11px 18px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ← Back
          </button>

        </div>


        {/* SETTINGS GRID */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '190px minmax(0, 1fr)',
            gap: 14,
            alignItems: 'start',
          }}
        >

          {/* SETTINGS TABS */}

          <aside
            style={{
              ...panelStyle,
              padding: 8,
            }}
          >

            {[
              'Profile',
              'Notifications',
              'Appearance',
              'Security',
            ].map((tab) => (

              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 0,
                  borderLeft:
                    activeTab === tab
                      ? '2px solid #b9a6ff'
                      : '2px solid transparent',
                  background:
                    activeTab === tab
                      ? '#252d3d'
                      : 'transparent',
                  color:
                    activeTab === tab
                      ? '#f3f5ff'
                      : '#a7b5ce',
                  padding: '12px 12px',
                  cursor: 'pointer',
                  fontSize: 14,
                  borderRadius: 2,
                }}
              >
                {tab}
              </button>

            ))}

          </aside>


          {/* SETTINGS CONTENT */}

          <div
            style={{
              display: 'grid',
              gap: 14,
            }}
          >

            {/* PROFILE */}

            {activeTab === 'Profile' && (
              <>

                <section style={panelStyle}>

                  <h2
                    style={{
                      margin: '0 0 6px',
                      fontSize: 18,
                    }}
                  >
                    Investigator Profile
                  </h2>

                  <p
                    style={{
                      margin: '0 0 18px',
                      color: settingsColors.muted,
                      fontSize: 13,
                    }}
                  >
                    Manage your operational
                    identity and contact details.
                  </p>

                  <div
                    style={{
                      height: 1,
                      background: settingsColors.border,
                      marginBottom: 20,
                    }}
                  />

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '110px minmax(0, 1fr) minmax(0, 1fr)',
                      gap: 18,
                      alignItems: 'start',
                    }}
                  >

                    <div>

                      <div
                        style={{
                          width: 74,
                          height: 74,
                          borderRadius: 8,
                          background: isDark
                            ? '#1a2940'
                            : '#edf3fb',
                          border:
                            `1px solid ${settingsColors.border}`,
                          display: 'grid',
                          placeItems: 'center',
                          color: '#39b9ff',
                          fontSize: 25,
                          fontWeight: 700,
                        }}
                      >
                        A
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: '#9b87ff',
                        }}
                      >
                        Investigator
                      </div>

                    </div>


                    {[
                      [
                        'Full Name',
                        'Arthur Hastings',
                      ],
                      [
                        'Codename / ID',
                        'OPR-7742',
                      ],
                      [
                        'Operational Role',
                        'Senior Analyst',
                      ],
                      [
                        'Secure Email',
                        'a.hastings@casefusion.int',
                      ],
                    ].map(
                      ([label, value]) => (

                        <label
                          key={label}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            gridColumn:
                              label ===
                                'Operational Role' ||
                              label ===
                                'Secure Email'
                                ? 'span 2'
                                : 'auto',
                          }}
                        >

                          <span
                            style={{
                              fontSize: 11,
                              letterSpacing: '0.12em',
                              color: settingsColors.muted,
                              textTransform: 'uppercase',
                            }}
                          >
                            {label}
                          </span>

                          <input
                            defaultValue={value}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              height: 40,
                              padding: '0 12px',
                              borderRadius: 4,
                              border:
                                `1px solid ${settingsColors.border}`,
                              background: settingsColors.input,
                              color: settingsColors.text,
                              outline: 'none',
                            }}
                          />

                        </label>

                      )
                    )}

                  </div>


                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 14,
                      marginTop: 22,
                    }}
                  >

                    {saved && (
                      <span
                        style={{
                          color: '#35d49a',
                          fontSize: 13,
                        }}
                      >
                        Changes saved
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={saveChanges}
                      style={{
                        border:
                          `1px solid ${settingsColors.border}`,
                        background: settingsColors.button,
                        color: settingsColors.text,
                        borderRadius: 4,
                        padding: '10px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      Save Changes
                    </button>

                  </div>

                </section>


                {/* ALERT PREFERENCES */}

                <section style={panelStyle}>

                  <h2
                    style={{
                      margin: '0 0 6px',
                      fontSize: 18,
                    }}
                  >
                    Alert Preferences
                  </h2>

                  <p
                    style={{
                      margin: '0 0 18px',
                      color: settingsColors.muted,
                      fontSize: 13,
                    }}
                  >
                    Configure automated
                    signals for case updates
                    and system events.
                  </p>

                  <div
                    style={{
                      height: 1,
                      background: settingsColors.border,
                      marginBottom: 4,
                    }}
                  />

                  {[
                    [
                      'Critical Alerts',
                      'Immediate notifications for high-priority case updates and breaches.',
                      criticalAlerts,
                      setCriticalAlerts,
                    ],
                    [
                      'Case Activity Summary',
                      'Daily digest of modifications to your assigned investigations.',
                      caseActivity,
                      setCaseActivity,
                    ],
                  ].map(
                    ([
                      title,
                      description,
                      enabled,
                      setter,
                    ]) => (

                      <div
                        key={title}
                        style={{
                          minHeight: 78,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 20,
                          borderBottom:
                            '1px solid #24324a',
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                            }}
                          >
                            {title}
                          </div>

                          <div
                            style={{
                              color: settingsColors.muted,
                              fontSize: 12,
                              marginTop: 5,
                            }}
                          >
                            {description}
                          </div>

                        </div>


                        <button
                          type="button"
                          aria-pressed={enabled}
                          onClick={() => setter(!enabled)}
                          style={{
                            width: 48,
                            height: 26,
                            padding: 3,
                            border: 0,
                            borderRadius: 20,
                            background:
                              enabled
                                ? '#b8a4ff'
                                : '#334158',
                            cursor: 'pointer',
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent:
                              enabled
                                ? 'flex-end'
                                : 'flex-start',
                          }}
                        >

                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: '#fff',
                              boxShadow:
                                '0 2px 5px rgba(0,0,0,.35)',
                            }}
                          />

                        </button>

                      </div>

                    )
                  )}

                </section>

              </>
            )}


            {/* NOTIFICATIONS */}

            {activeTab === 'Notifications' && (
              <section style={panelStyle}>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                  }}
                >
                  Notifications
                </h2>

                <p
                  style={{
                    color: settingsColors.muted,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Notification preferences are
                  controlled through the alert
                  switches in the Profile settings.
                </p>

              </section>
            )}


            {/* APPEARANCE */}

            {activeTab === 'Appearance' && (
              <section style={panelStyle}>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                  }}
                >
                  Appearance
                </h2>

                <p
                  style={{
                    color: settingsColors.muted,
                    fontSize: 13,
                  }}
                >
                  Switch the entire CASE-FUSION
                  interface between dark and
                  light mode.
                </p>

                <button
                  type="button"
                  onClick={onThemeToggle}
                  style={{
                    marginTop: 10,
                    border:
                      `1px solid ${settingsColors.border}`,
                    background: settingsColors.button,
                    color: settingsColors.text,
                    borderRadius: 5,
                    padding: '11px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Current theme:{' '}
                  {theme === 'dark'
                    ? 'Dark'
                    : 'Light'}{' '}
                  — Toggle
                </button>

              </section>
            )}


            {/* SECURITY */}

            {activeTab === 'Security' && (
              <section style={panelStyle}>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                  }}
                >
                  Security
                </h2>

                <p
                  style={{
                    color: settingsColors.muted,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Your current CASE-FUSION
                  session is active. Logout
                  remains available from the
                  investigator profile menu.
                </p>

              </section>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}


/* =====================================================
   MAIN APP
   ===================================================== */

function App() {

  const [user, setUser] = useState(null);

  const [page, setPage] = useState('dashboard');

  const [selectedCaseId, setSelectedCaseId] =
    useState(null);

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('casefusion_theme') ||
      'dark'
    );
  });

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [, setSettingsOpen] = useState(false);

  const profileRef = useRef(null);


  /* =====================================================
     LOGIN
     ===================================================== */

  useEffect(() => {

    const storedUser =
      localStorage.getItem('casefusion_user');

    if (storedUser) {

      try {

        const parsedUser =
          JSON.parse(storedUser);

        if (
          parsedUser &&
          typeof parsedUser === 'object'
        ) {

          setUser(parsedUser);
          setPage('dashboard');

        } else {

          localStorage.removeItem(
            'casefusion_user'
          );

        }

      } catch (error) {

        console.error(
          'Invalid saved login session:',
          error
        );

        localStorage.removeItem(
          'casefusion_user'
        );

      }

      return;
    }


    const sessionUser =
      sessionStorage.getItem(
        'casefusion_user'
      );

    if (sessionUser) {

      try {

        const parsedUser =
          JSON.parse(sessionUser);

        if (
          parsedUser &&
          typeof parsedUser === 'object'
        ) {

          setUser(parsedUser);
          setPage('dashboard');

        } else {

          sessionStorage.removeItem(
            'casefusion_user'
          );

        }

      } catch (error) {

        console.error(
          'Invalid session login:',
          error
        );

        sessionStorage.removeItem(
          'casefusion_user'
        );

      }

    }

  }, []);


  /* =====================================================
     THEME
     ===================================================== */

  useEffect(() => {

    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem(
      'casefusion_theme',
      theme
    );

  }, [theme]);


  /* =====================================================
     CLOSE PROFILE DROPDOWN
     ===================================================== */

  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {

        setProfileOpen(false);

      }

    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );

    };

  }, []);


  /* =====================================================
     LOGIN
     ===================================================== */

  function handleLogin(loggedInUser) {

    if (!loggedInUser) {
      return;
    }

    setUser(loggedInUser);
    setPage('dashboard');
    setSelectedCaseId(null);

  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  function handleLogout() {

    localStorage.removeItem(
      'casefusion_user'
    );

    sessionStorage.removeItem(
      'casefusion_user'
    );

    setUser(null);
    setPage('dashboard');
    setSelectedCaseId(null);
    setProfileOpen(false);

  }


  /* =====================================================
     NAVIGATION
     ===================================================== */

  function handleNewInvestigation() {

    setPage('new-investigation');
    setSelectedCaseId(null);
    setProfileOpen(false);

  }


  function handleOpenInvestigations() {

    setPage('investigations');
    setSelectedCaseId(null);
    setProfileOpen(false);

  }


  function handleOpenAlerts() {

    setPage('alerts');
    setSelectedCaseId(null);
    setProfileOpen(false);

  }


  function handleOpenReports() {

    setPage('reports');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(false);

  }


  function handleOpenSettings() {

    setPage('settings');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(true);

  }


  /* =====================================================
     TEMPLATES NAVIGATION
     ===================================================== */

  function handleOpenTemplates() {

    setPage('templates');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(false);

  }


  /* =====================================================
     PERSONNEL NAVIGATION
     ===================================================== */

  function handleOpenPersonnel() {

    setPage('personnel');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(false);

  }


  /* =====================================================
     ENTITIES NAVIGATION
     ===================================================== */

  function handleOpenEntities() {

    setPage('entities');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(false);

  }


  function handleBackToDashboard() {

    setPage('dashboard');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(false);

  }


  function handleBackFromSettings() {

    setPage('dashboard');
    setSelectedCaseId(null);
    setProfileOpen(false);
    setSettingsOpen(false);

  }


  /* =====================================================
     ALERT NAVIGATION
     ===================================================== */

  function handleAlertsNavigation(destination) {

    switch (destination) {

      case 'dashboard':
        handleBackToDashboard();
        break;

      case 'investigations':
        handleOpenInvestigations();
        break;

      case 'new-investigation':
        handleNewInvestigation();
        break;

      case 'alerts':
        handleOpenAlerts();
        break;

      case 'reports':
        handleOpenReports();
        break;

      case 'settings':
        handleOpenSettings();
        break;

      case 'templates':
        handleOpenTemplates();
        break;

      case 'personnel':
        handleOpenPersonnel();
        break;

      case 'entities':
        handleOpenEntities();
        break;

      default:
        break;
    }

  }


  /* =====================================================
     OPEN CASE
     ===================================================== */

  function handleOpenCase(caseData) {

    if (!caseData) {

      console.error(
        'Cannot open case: no case data received.'
      );

      return;
    }


    let actualCaseId = caseData;


    if (
      typeof caseData === 'object'
    ) {

      actualCaseId =
        caseData.caseId ||
        caseData.id ||
        caseData._id ||
        caseData.case?.caseId ||
        caseData.case?.id ||
        caseData.case?._id ||
        null;

    }


    if (
      actualCaseId &&
      typeof actualCaseId === 'object'
    ) {

      actualCaseId =
        actualCaseId.$oid ||
        actualCaseId.toString?.() ||
        null;

    }


    if (!actualCaseId) {

      console.error(
        'Cannot open case: valid case ID not found.',
        caseData
      );

      return;
    }


    actualCaseId = String(actualCaseId);


    console.log(
      'Opening case with ID:',
      actualCaseId
    );


    setSelectedCaseId(actualCaseId);

    setPage('case');

  }


  /* =====================================================
     CASE CREATED
     ===================================================== */

  function handleCaseCreated(newCase) {

    if (newCase?.caseId) {

      setSelectedCaseId(
        newCase.caseId
      );

      setPage('case');

      return;

    }

    setPage('dashboard');
    setSelectedCaseId(null);

  }


  /* =====================================================
     THEME
     ===================================================== */

  function handleThemeToggle() {

    setTheme(
      (currentTheme) =>
        currentTheme === 'dark'
          ? 'light'
          : 'dark'
    );

  }


  /* =====================================================
     PROFILE
     ===================================================== */

  function handleProfileToggle() {

    setProfileOpen(
      (current) => !current
    );

  }


  /* =====================================================
     LOGIN SCREEN
     ===================================================== */

  if (!user) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }


  /* =====================================================
     ALERTS
     ===================================================== */

  if (page === 'alerts') {

    return (
      <div className={`theme-${theme}`}>

        <Alerts
          onBack={handleBackToDashboard}
          onNavigate={handleAlertsNavigation}
        />

      </div>
    );

  }


  /* =====================================================
     MAIN APPLICATION
     ===================================================== */

  return (
    <div
      className={`casefusion-app-shell theme-${theme}`}
    >

      {/* ================================================
          GLOBAL HEADER
          ================================================ */}

      <header className="global-header">

        <button
          type="button"
          className="global-brand"
          onClick={handleBackToDashboard}
          aria-label="Go to CASE-FUSION dashboard"
        >

          {/* ============================================
              CASE-FUSION LOGO
              ============================================ */}

          <img
            src={logo}
            alt="CASE-FUSION logo"
            className="global-brand-logo"
          />

          <span className="global-brand-text">

            <strong>
              CASE-FUSION
            </strong>

            <small>
              Investigation Intelligence
            </small>

          </span>

        </button>


        {/* HEADER RIGHT */}

        <div className="global-header-right">

          {/* THEME */}

          <button
            type="button"
            className="theme-toggle-button"
            onClick={handleThemeToggle}
            aria-label={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            title={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
          >
            {theme === 'dark'
              ? '☀'
              : '☾'}
          </button>


          {/* PROFILE */}

          <div
            className="global-profile-wrapper"
            ref={profileRef}
          >

            <button
              type="button"
              className="global-avatar-button"
              onClick={handleProfileToggle}
              aria-label="Open investigator profile"
              aria-expanded={profileOpen}
            >

              <span className="global-avatar">

                {user.name
                  ?.charAt(0)
                  .toUpperCase() ||
                  'I'}

              </span>

            </button>


            {profileOpen && (

              <div className="profile-dropdown">

                <div className="profile-dropdown-header">

                  <div className="profile-dropdown-avatar">

                    {user.name
                      ?.charAt(0)
                      .toUpperCase() ||
                      'I'}

                  </div>

                  <div className="profile-dropdown-info">

                    <strong>
                      {user.name ||
                        'Investigator'}
                    </strong>

                    <span>
                      {user.role ||
                        'Intelligence Analyst'}
                    </span>

                  </div>

                </div>


                <div className="profile-dropdown-divider" />


                <div className="profile-dropdown-status">

                  <span className="status-dot" />

                  <span>
                    System Online
                  </span>

                </div>


                <button
                  type="button"
                  className="profile-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        </div>

      </header>


      {/* ================================================
          MAIN
          ================================================ */}

      <main className="global-main">


        {/* DASHBOARD */}

        {page === 'dashboard' && (

          <Dashboard
            onNewInvestigation={
              handleNewInvestigation
            }

            onOpenInvestigations={
              handleOpenInvestigations
            }

            onOpenCase={
              handleOpenCase
            }

            onOpenAlerts={
              handleOpenAlerts
            }

            onOpenReports={
              handleOpenReports
            }

            onOpenSettings={
              handleOpenSettings
            }

            onOpenTemplates={
              handleOpenTemplates
            }

            onOpenPersonnel={
              handleOpenPersonnel
            }

            onOpenEntities={
              handleOpenEntities
            }
          />

        )}


        {/* INVESTIGATIONS */}

        {page === 'investigations' && (

          <Investigations
            onBack={
              handleBackToDashboard
            }

            onNewInvestigation={
              handleNewInvestigation
            }

            onOpenCase={
              handleOpenCase
            }

            onOpenAlerts={
              handleOpenAlerts
            }

            onOpenReports={
              handleOpenReports
            }

            onOpenTemplates={
              handleOpenTemplates
            }
          />

        )}


        {/* NEW INVESTIGATION */}

        {page === 'new-investigation' && (

          <NewInvestigation
            onBack={
              handleBackToDashboard
            }

            onCreated={
              handleCaseCreated
            }
          />

        )}


        {/* CASE WORKSPACE */}

        {page === 'case' &&
          selectedCaseId && (

            <CaseWorkspace
              caseId={
                selectedCaseId
              }

              onBack={
                handleBackToDashboard
              }
            />

          )}


        {/* SETTINGS */}

        {page === 'settings' && (

          <SettingsPage
            theme={theme}
            onThemeToggle={
              handleThemeToggle
            }
            onBack={
              handleBackFromSettings
            }
          />

        )}


        {/* REPORTS */}

        {page === 'reports' && (

          <Reports
            onBack={
              handleBackToDashboard
            }

            onOpenCase={
              handleOpenCase
            }
          />

        )}


        {/* TEMPLATES */}

        {page === 'templates' && (

          <Templates

            onBack={
              handleBackToDashboard
            }

            onDashboard={
              handleBackToDashboard
            }

            onInvestigations={
              handleOpenInvestigations
            }

            onAlerts={
              handleOpenAlerts
            }

            onReports={
              handleOpenReports
            }

            onSettings={
              handleOpenSettings
            }

            onNewInvestigation={
              handleNewInvestigation
            }

          />

        )}


        {/* PERSONNEL */}

        {page === 'personnel' && (

          <Personnel

            onBack={
              handleBackToDashboard
            }

            onNewInvestigation={
              handleNewInvestigation
            }

            onOpenSettings={
              handleOpenSettings
            }

            onOpenReports={
              handleOpenReports
            }

            onOpenInvestigations={
              handleOpenInvestigations
            }

            onOpenAlerts={
              handleOpenAlerts
            }

          />

        )}


        {/* ENTITIES */}

        {page === 'entities' && (

          <Entities

            onNewInvestigation={
              handleNewInvestigation
            }

            onOpenInvestigations={
              handleOpenInvestigations
            }

            onOpenReports={
              handleOpenReports
            }

            onOpenSettings={
              handleOpenSettings
            }

            onOpenPersonnel={
              handleOpenPersonnel
            }

            onOpenVisualizer={
              handleBackToDashboard
            }

          />

        )}

      </main>

    </div>
  );
}

export default App;