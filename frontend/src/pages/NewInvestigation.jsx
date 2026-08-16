import { useRef, useState } from 'react';
import { createCase } from '../services/api';

function NewInvestigation({ onBack, onCreated }) {
  const [caseName, setCaseName] = useState('');

  const [files, setFiles] = useState({
    cdr: null,
    bank: null,
    social: null,
    entities: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCase, setCreatedCase] = useState(null);

  const cdrRef = useRef(null);
  const bankRef = useRef(null);
  const socialRef = useRef(null);
  const entitiesRef = useRef(null);

  function handleFileChange(type, event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed.');
      event.target.value = '';
      return;
    }

    setError('');
    setSuccess('');
    setCreatedCase(null);

    setFiles((previous) => ({
      ...previous,
      [type]: file,
    }));
  }

  const fileItems = [
    {
      key: 'cdr',
      title: 'CDR Data',
      description: 'Call detail records',
      ref: cdrRef,
    },
    {
      key: 'bank',
      title: 'Bank Data',
      description: 'Financial transactions',
      ref: bankRef,
    },
    {
      key: 'social',
      title: 'Social Data',
      description: 'Social activity records',
      ref: socialRef,
    },
    {
      key: 'entities',
      title: 'Entities',
      description: 'Known case entities',
      ref: entitiesRef,
    },
  ];

  const allFilesSelected =
    files.cdr &&
    files.bank &&
    files.social &&
    files.entities;

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');
    setCreatedCase(null);

    if (!caseName.trim()) {
      setError('Please enter a case name.');
      return;
    }

    if (!allFilesSelected) {
      setError('Please upload all four CSV files.');
      return;
    }

    try {
      setLoading(true);

      const data = await createCase({
        caseName: caseName.trim(),
        cdr: files.cdr,
        bank: files.bank,
        social: files.social,
        entities: files.entities,
      });

      console.log('Case created successfully:', data);

      setCreatedCase(data.case);
      onCreated(data.case);

      setSuccess(
        `Investigation created successfully: ${data.case.caseId}`
      );
    } catch (err) {
      console.error('Create investigation error:', err);

      setError(
        err.message ||
          'Something went wrong while creating the investigation.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="new-investigation-page">
      <div className="page-header">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>

        <div>
          <p className="section-label">NEW CASE</p>

          <h2>New Investigation</h2>

          <p className="page-description">
            Create an investigation by providing the required
            intelligence datasets.
          </p>
        </div>
      </div>

      <form
        className="investigation-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="form-message error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="form-message success-message">
            {success}
          </div>
        )}

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">01</span>

            <div>
              <h3>Investigation Details</h3>

              <p>
                Give this investigation a name so it can be
                identified later.
              </p>
            </div>
          </div>

          <label className="input-label">
            Case Name

            <input
              type="text"
              value={caseName}
              onChange={(event) => {
                setCaseName(event.target.value);
                setError('');
                setSuccess('');
                setCreatedCase(null);
              }}
              placeholder="e.g. Financial Network Investigation"
              disabled={loading}
            />
          </label>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">02</span>

            <div>
              <h3>Upload Intelligence Data</h3>

              <p>
                Upload all four CSV files required for analysis.
              </p>
            </div>
          </div>

          <div className="upload-grid">
            {fileItems.map((item) => {
              const selectedFile = files[item.key];

              return (
                <div
                  className={`upload-card ${
                    selectedFile ? 'uploaded' : ''
                  }`}
                  key={item.key}
                >
                  <input
                    ref={item.ref}
                    type="file"
                    accept=".csv"
                    hidden
                    disabled={loading}
                    onChange={(event) =>
                      handleFileChange(
                        item.key,
                        event
                      )
                    }
                  />

                  <div className="upload-icon">
                    {selectedFile ? '✓' : '↑'}
                  </div>

                  <div className="upload-info">
                    <h4>{item.title}</h4>

                    <p>{item.description}</p>

                    {selectedFile && (
                      <span className="file-name">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="choose-file-btn"
                    disabled={loading}
                    onClick={() =>
                      item.ref.current?.click()
                    }
                  >
                    {selectedFile
                      ? 'Change'
                      : 'Choose CSV'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {createdCase && (
          <section className="case-created-card">
            <div className="case-created-icon">
              ✓
            </div>

            <div>
              <p className="case-created-label">
                INVESTIGATION CREATED
              </p>

              <h3>{createdCase.name}</h3>

              <p>
                Case ID:{' '}
                <strong>{createdCase.caseId}</strong>
              </p>

              <p>
                Status:{' '}
                <strong>{createdCase.status}</strong>
              </p>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-button"
            disabled={
              !allFilesSelected ||
              !caseName.trim() ||
              loading
            }
          >
            {loading
              ? 'Creating Investigation...'
              : 'Create Investigation →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewInvestigation;