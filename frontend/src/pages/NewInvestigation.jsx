import { useRef, useState } from 'react';
import { createCase } from '../services/api';

function NewInvestigation({
  onBack,
  onCreated,
}) {
  const [files, setFiles] = useState({
    cdr: null,
    bank: null,
    social: null,
    entities: null,
  });

  const [caseName, setCaseName] = useState(
    'Untitled Investigation'
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  const fileInputs = {
    cdr: useRef(null),
    bank: useRef(null),
    social: useRef(null),
    entities: useRef(null),
  };

  const uploadItems = [
    {
      key: 'cdr',
      title: 'CDR Data',
      description:
        'Upload call detail records and communication logs.',
      icon: '☎',
      accent: 'cdr',
    },
    {
      key: 'bank',
      title: 'Bank Data',
      description:
        'Upload financial transactions and banking logs.',
      icon: '▤',
      accent: 'bank',
    },
    {
      key: 'social',
      title: 'Social Data',
      description:
        'Import social media intelligence and network exports.',
      icon: '⌘',
      accent: 'social',
    },
    {
      key: 'entities',
      title: 'Entities',
      description:
        'Upload known entities, aliases, and watchlists.',
      icon: '♙',
      accent: 'entities',
    },
  ];

  const uploadedCount = Object.values(files).filter(
    Boolean
  ).length;

  function formatFileSize(bytes) {
    if (!bytes) {
      return '0 KB';
    }

    if (bytes < 1024 * 1024) {
      return `${Math.max(
        1,
        Math.round(bytes / 1024)
      )} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function handleFileChange(
    key,
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setSuccess('');

    if (
      !file.name
        .toLowerCase()
        .endsWith('.csv')
    ) {
      setError(
        `${file.name} is not a CSV file. Please choose a CSV file.`
      );

      event.target.value = '';
      return;
    }

    setFiles((previous) => ({
      ...previous,
      [key]: file,
    }));
  }

  function removeFile(key) {
    setFiles((previous) => ({
      ...previous,
      [key]: null,
    }));

    if (fileInputs[key].current) {
      fileInputs[key].current.value = '';
    }

    setError('');
    setSuccess('');
  }

  async function handleReview() {
    setError('');
    setSuccess('');

    const missing = uploadItems
      .filter((item) => !files[item.key])
      .map((item) => item.title);

    if (missing.length > 0) {
      setError(
        `Please upload all four datasets before continuing. Missing: ${missing.join(
          ', '
        )}.`
      );
      return;
    }

    if (!caseName.trim()) {
      setError(
        'Investigation name is required.'
      );
      return;
    }

    try {
      setCreating(true);

      /*
       * Existing backend expects:
       * cdr
       * bank
       * social
       * entities
       *
       * and caseName.
       */

      const response = await createCase({
        caseName: caseName.trim(),
        cdr: files.cdr,
        bank: files.bank,
        social: files.social,
        entities: files.entities,
      });

      setSuccess(
        response?.message ||
          'Investigation created successfully.'
      );

      if (onCreated) {
        onCreated(response);
      }
    } catch (err) {
      console.error(
        'Failed to create investigation:',
        err
      );

      setError(
        err?.message ||
          'Failed to create investigation.'
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="new-investigation-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header className="new-investigation-header">

        <div>
          <div className="new-investigation-kicker">
            CASEFUSION / NEW CASE
          </div>

          <h1>
            New Investigation
          </h1>

          <p>
            Initialize case parameters and
            upload initial intelligence datasets.
          </p>
        </div>

        <button
          type="button"
          className="new-investigation-cancel"
          onClick={onBack}
        >
          <span className="cancel-x">
            ×
          </span>

          Cancel
        </button>

      </header>


      {/* =================================================
          STEPPER
      ================================================= */}

      <section className="investigation-stepper">

        <div className="stepper-line" />

        <div className="investigation-step completed">
          <div className="step-circle">
            ✓
          </div>

          <span>
            01
          </span>

          <strong>
            Details
          </strong>
        </div>

        <div className="investigation-step active">
          <div className="step-circle">
            02
          </div>

          <span>
            02
          </span>

          <strong>
            Upload Data
          </strong>
        </div>

        <div className="investigation-step">
          <div className="step-circle">
            03
          </div>

          <span>
            03
          </span>

          <strong>
            Review
          </strong>
        </div>

        <div className="investigation-step">
          <div className="step-circle">
            04
          </div>

          <span>
            04
          </span>

          <strong>
            Create
          </strong>
        </div>

      </section>


      {/* =================================================
          CASE NAME
      ================================================= */}

      <section className="investigation-name-row">

        <label>
          <span>
            INVESTIGATION NAME
          </span>

          <input
            type="text"
            value={caseName}
            onChange={(event) =>
              setCaseName(
                event.target.value
              )
            }
            placeholder="Enter investigation name"
          />
        </label>

      </section>


      {/* =================================================
          UPLOAD SECTION
      ================================================= */}

      <section className="upload-section">

        <div className="upload-section-heading">
          <h2>
            Upload Intelligence Data
          </h2>

          <p>
            Provide initial datasets to populate
            the investigation matrix. All files
            must be in CSV format.
          </p>
        </div>


        {/* =================================================
            UPLOAD GRID
        ================================================= */}

        <div className="upload-grid">

          {uploadItems.map((item) => {
            const selectedFile =
              files[item.key];

            return (
              <article
                key={item.key}
                className={`intelligence-upload-card ${
                  selectedFile
                    ? 'uploaded'
                    : ''
                }`}
              >

                <div
                  className={`intelligence-upload-icon ${item.accent}`}
                >
                  {selectedFile
                    ? '✓'
                    : item.icon}
                </div>


                <div className="intelligence-upload-content">

                  <div className="intelligence-upload-title">
                    <h3>
                      {item.title}
                    </h3>

                    {selectedFile && (
                      <span className="uploaded-badge">
                        READY
                      </span>
                    )}
                  </div>

                  <p>
                    {item.description}
                  </p>


                  {selectedFile && (
                    <div className="selected-file">

                      <div className="selected-file-icon">
                        ▣
                      </div>

                      <div className="selected-file-info">

                        <strong>
                          {selectedFile.name}
                        </strong>

                        <span>
                          {formatFileSize(
                            selectedFile.size
                          )}
                        </span>

                      </div>

                    </div>
                  )}


                  <div className="upload-actions">

                    <input
                      ref={
                        fileInputs[item.key]
                      }
                      type="file"
                      accept=".csv,text/csv"
                      hidden
                      onChange={(event) =>
                        handleFileChange(
                          item.key,
                          event
                        )
                      }
                    />

                    <button
                      type="button"
                      className="choose-csv-button"
                      onClick={() =>
                        fileInputs[
                          item.key
                        ].current?.click()
                      }
                    >
                      {selectedFile
                        ? 'Change CSV'
                        : 'Choose CSV'}
                    </button>


                    {selectedFile && (
                      <button
                        type="button"
                        className="remove-csv-button"
                        onClick={() =>
                          removeFile(
                            item.key
                          )
                        }
                      >
                        Remove
                      </button>
                    )}

                  </div>

                </div>

              </article>
            );
          })}

        </div>


        {/* =================================================
            UPLOAD STATUS
        ================================================= */}

        <div className="upload-status-row">

          <span>
            {uploadedCount} of 4 datasets uploaded
          </span>

          {uploadedCount === 4 && (
            <strong>
              ✓ All datasets ready
            </strong>
          )}

        </div>

      </section>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {error && (
        <div
          className="investigation-message error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="investigation-message success"
          role="status"
        >
          {success}
        </div>
      )}


      {/* =================================================
          FOOTER ACTIONS
      ================================================= */}

      <footer className="investigation-footer">

        <button
          type="button"
          className="footer-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          type="button"
          className="review-investigation-button"
          onClick={handleReview}
          disabled={
            creating ||
            uploadedCount !== 4
          }
        >
          {creating
            ? 'Creating Investigation...'
            : 'Review Investigation →'}
        </button>

      </footer>

    </main>
  );
}

export default NewInvestigation;