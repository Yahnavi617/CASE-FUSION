const API_BASE_URL = 'http://localhost:5000/api';

export async function createCase({
  caseName,
  cdr,
  bank,
  social,
  entities,
}) {
  const formData = new FormData();

  formData.append('caseName', caseName);
  formData.append('cdr', cdr);
  formData.append('bank', bank);
  formData.append('social', social);
  formData.append('entities', entities);

  const response = await fetch(
    `${API_BASE_URL}/cases`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create investigation'
    );
  }

  return data;
}

export async function getCase(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch investigation'
    );
  }

  return data;
}

export async function analyzeCase(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/analyze`,
    {
      method: 'POST',
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to analyze investigation'
    );
  }

  return data;
}

export async function getLeads(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/leads`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch case leads'
    );
  }

  return data;
}

export async function getLeadWhy(
  caseId,
  leadId
) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/leads/${leadId}/why`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch lead explanation'
    );
  }

  return data;
}
export async function getCases() {
  const response = await fetch(
    `${API_BASE_URL}/cases`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch investigations'
    );
  }

  return data;
}
export async function getCaseNetwork(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/network`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch case network'
    );
  }

  return data;
}