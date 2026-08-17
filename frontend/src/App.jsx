import './App.css';
import { useEffect, useState } from 'react';

import Dashboard from './pages/Dashboard';
import NewInvestigation from './pages/NewInvestigation';
import CaseWorkspace from './pages/CaseWorkspace';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  const [page, setPage] = useState('dashboard');

  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    // Check for a persistent login first.
    // This is created only when "Remember me" is selected.
    const storedUser = localStorage.getItem('casefusion_user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
          setPage('dashboard');
        } else {
          localStorage.removeItem('casefusion_user');
        }
      } catch (error) {
        console.error('Invalid saved login session:', error);

        localStorage.removeItem('casefusion_user');
      }

      return;
    }

    // Check sessionStorage for a session-only login.
    // This is used when "Remember me" is NOT selected.
    const sessionUser = sessionStorage.getItem('casefusion_user');

    if (sessionUser) {
      try {
        const parsedUser = JSON.parse(sessionUser);

        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
          setPage('dashboard');
        } else {
          sessionStorage.removeItem('casefusion_user');
        }
      } catch (error) {
        console.error('Invalid session login:', error);

        sessionStorage.removeItem('casefusion_user');
      }
    }
  }, []);

  function handleLogin(loggedInUser) {
    if (!loggedInUser) {
      return;
    }

    setUser(loggedInUser);

    setPage('dashboard');

    setSelectedCaseId(null);
  }

  function handleLogout() {
    // Remove both types of login storage.
    // This guarantees that Logout always returns the user
    // to the Login screen.
    localStorage.removeItem('casefusion_user');

    sessionStorage.removeItem('casefusion_user');

    setUser(null);

    setPage('dashboard');

    setSelectedCaseId(null);
  }

  function handleNewInvestigation() {
    setPage('new-investigation');

    setSelectedCaseId(null);
  }

  function handleBackToDashboard() {
    setPage('dashboard');

    setSelectedCaseId(null);
  }

  function handleOpenCase(caseId) {
    if (!caseId) {
      return;
    }

    setSelectedCaseId(caseId);

    setPage('case');
  }

  function handleCaseCreated(newCase) {
    if (newCase?.caseId) {
      setSelectedCaseId(newCase.caseId);

      setPage('case');

      return;
    }

    setPage('dashboard');

    setSelectedCaseId(null);
  }

  /*
   * USER IS NOT LOGGED IN
   *
   * Always show the Login screen.
   */
  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  /*
   * USER IS LOGGED IN
   *
   * Show the protected CASE-FUSION workspace.
   */
  return (
    <div className="casefusion-app-shell">
      <header className="global-header">
        <button
          type="button"
          className="global-brand"
          onClick={handleBackToDashboard}
          aria-label="Go to CASE-FUSION dashboard"
        >
          <span className="global-brand-mark">
            C
          </span>

          <span className="global-brand-text">
            <strong>
              CASE-FUSION
            </strong>

            <small>
              Investigation Intelligence
            </small>
          </span>
        </button>

        <div className="global-header-right">
          <div
            className="global-status"
            title="CASE-FUSION system status"
          >
            <span className="status-dot" />

            System Online
          </div>

          <div className="global-user">
            <div className="global-avatar">
              {user.name
                ?.charAt(0)
                .toUpperCase() || 'I'}
            </div>

            <div className="global-user-info">
              <strong>
                {user.name || 'Investigator'}
              </strong>

              <span>
                {user.role ||
                  'Intelligence Analyst'}
              </span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="global-main">
        {page === 'dashboard' && (
          <Dashboard
            onNewInvestigation={
              handleNewInvestigation
            }
            onOpenCase={
              handleOpenCase
            }
          />
        )}

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

        {page === 'case' &&
          selectedCaseId && (
            <CaseWorkspace
              caseId={selectedCaseId}
              onBack={
                handleBackToDashboard
              }
            />
          )}
      </main>
    </div>
  );
}

export default App;