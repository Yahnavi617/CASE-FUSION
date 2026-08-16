import { useState } from 'react';
import './App.css';

import Dashboard from './pages/Dashboard';
import NewInvestigation from './pages/NewInvestigation';
import CaseWorkspace from './pages/CaseWorkspace';

function App() {
  const [page, setPage] = useState('dashboard');
  const [caseId, setCaseId] = useState(null);

  function handleNewInvestigation() {
    setPage('new-investigation');
  }

  function handleCaseCreated(createdCase) {
    setCaseId(createdCase.caseId);
    setPage('workspace');
  }

  function handleBackToDashboard() {
    setCaseId(null);
    setPage('dashboard');
  }

  if (page === 'new-investigation') {
    return (
      <NewInvestigation
        onBack={handleBackToDashboard}
        onCreated={handleCaseCreated}
      />
    );
  }

  if (page === 'workspace' && caseId) {
    return (
      <CaseWorkspace
        caseId={caseId}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <Dashboard
  onNewInvestigation={handleNewInvestigation}
  onOpenCase={(selectedCaseId) => {
    setCaseId(selectedCaseId);
    setPage('workspace');
  }}
/>
  );
}

export default App;