import { useEffect, useState } from 'react';
import './Settings.css';

function Settings({
  user,
  theme,
  onThemeChange,
  onBack,
  onLogout,
}) {
  const [activeTab, setActiveTab] =
    useState('profile');

  const [profile, setProfile] = useState({
    name:
      user?.name ||
      'Investigator',
    codename:
      user?.codename ||
      user?.id ||
      'OPR-7742',
    role:
      user?.role ||
      'Senior Analyst',
    email:
      user?.email ||
      'investigator@casefusion.int',
  });

  const [notifications, setNotifications] =
    useState({
      criticalAlerts:
        localStorage.getItem(
          'casefusion_critical_alerts'
        ) !== 'false',

      caseActivity:
        localStorage.getItem(
          'casefusion_case_activity'
        ) !== 'false',
    });

  const [security, setSecurity] =
    useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

  const [saveMessage, setSaveMessage] =
    useState('');

  const [securityMessage, setSecurityMessage] =
    useState('');

  /* =====================================================
     LOAD SAVED PROFILE
     ===================================================== */

  useEffect(() => {
    const savedProfile =
      localStorage.getItem(
        'casefusion_profile'
      );

    if (savedProfile) {
      try {
        const parsed =
          JSON.parse(savedProfile);

        if (
          parsed &&
          typeof parsed === 'object'
        ) {
          setProfile((current) => ({
            ...current,
            ...parsed,
          }));
        }
      } catch (error) {
        console.error(
          'Invalid saved profile:',
          error
        );
      }
    }
  }, []);

  /* =====================================================
     PROFILE INPUT
     ===================================================== */

  function handleProfileChange(
    field,
    value
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaveMessage('');
  }

  /* =====================================================
     SAVE PROFILE
     ===================================================== */

  function handleSaveProfile(event) {
    event.preventDefault();

    localStorage.setItem(
      'casefusion_profile',
      JSON.stringify(profile)
    );

    /*
     * Keep the existing logged-in user
     * while updating visible profile values.
     */

    const storedUser =
      localStorage.getItem(
        'casefusion_user'
      );

    if (storedUser) {
      try {
        const parsed =
          JSON.parse(storedUser);

        localStorage.setItem(
          'casefusion_user',
          JSON.stringify({
            ...parsed,
            name: profile.name,
            role: profile.role,
            email: profile.email,
            codename: profile.codename,
          })
        );
      } catch (error) {
        console.error(
          'Could not update saved user:',
          error
        );
      }
    }

    const sessionUser =
      sessionStorage.getItem(
        'casefusion_user'
      );

    if (sessionUser) {
      try {
        const parsed =
          JSON.parse(sessionUser);

        sessionStorage.setItem(
          'casefusion_user',
          JSON.stringify({
            ...parsed,
            name: profile.name,
            role: profile.role,
            email: profile.email,
            codename: profile.codename,
          })
        );
      } catch (error) {
        console.error(
          'Could not update session user:',
          error
        );
      }
    }

    setSaveMessage(
      'Changes saved successfully.'
    );

    setTimeout(() => {
      setSaveMessage('');
    }, 2500);
  }

  /* =====================================================
     NOTIFICATION TOGGLE
     ===================================================== */

  function toggleNotification(
    type
  ) {
    setNotifications((current) => {
      const updated = {
        ...current,
        [type]: !current[type],
      };

      localStorage.setItem(
        'casefusion_critical_alerts',
        String(
          updated.criticalAlerts
        )
      );

      localStorage.setItem(
        'casefusion_case_activity',
        String(
          updated.caseActivity
        )
      );

      return updated;
    });
  }

  /* =====================================================
     THEME
     ===================================================== */

  function handleThemeChange(
    selectedTheme
  ) {
    if (onThemeChange) {
      onThemeChange(
        selectedTheme
      );
    }
  }

  /* =====================================================
     SECURITY
     ===================================================== */

  function handleSecurityChange(
    field,
    value
  ) {
    setSecurity((current) => ({
      ...current,
      [field]: value,
    }));

    setSecurityMessage('');
  }

  function handleSecuritySubmit(
    event
  ) {
    event.preventDefault();

    if (
      !security.currentPassword ||
      !security.newPassword ||
      !security.confirmPassword
    ) {
      setSecurityMessage(
        'Please fill all password fields.'
      );

      return;
    }

    if (
      security.newPassword !==
      security.confirmPassword
    ) {
      setSecurityMessage(
        'New passwords do not match.'
      );

      return;
    }

    if (
      security.newPassword.length <
      6
    ) {
      setSecurityMessage(
        'New password must contain at least 6 characters.'
      );

      return;
    }

    setSecurityMessage(
      'Password updated successfully.'
    );

    setSecurity({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }

  /* =====================================================
     RENDER TAB
     ===================================================== */

  function renderProfile() {
    return (
      <>
        <section className="settings-card">

          <div className="settings-card-header">
            <div>
              <h2>
                Investigator Profile
              </h2>

              <p>
                Manage your operational
                identity and contact details.
              </p>
            </div>
          </div>

          <div className="settings-divider" />

          <form
            className="profile-form"
            onSubmit={
              handleSaveProfile
            }
          >

            <div className="profile-photo-section">

              <div className="profile-photo">
                {profile.name
                  ?.charAt(0)
                  .toUpperCase() || 'I'}
              </div>

              <button
                type="button"
                className="change-photo-button"
                onClick={() => {
                  alert(
                    'Photo upload can be connected here.'
                  );
                }}
              >
                Change Photo
              </button>

            </div>

            <div className="profile-fields">

              <div className="settings-form-row">

                <div className="settings-field">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={
                      profile.name
                    }
                    onChange={(event) =>
                      handleProfileChange(
                        'name',
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Codename / ID
                  </label>

                  <input
                    type="text"
                    value={
                      profile.codename
                    }
                    onChange={(event) =>
                      handleProfileChange(
                        'codename',
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="settings-field">

                <label>
                  Operational Role
                </label>

                <select
                  value={
                    profile.role
                  }
                  onChange={(event) =>
                    handleProfileChange(
                      'role',
                      event.target.value
                    )
                  }
                >
                  <option>
                    Senior Analyst
                  </option>

                  <option>
                    Intelligence Analyst
                  </option>

                  <option>
                    Lead Investigator
                  </option>

                  <option>
                    Investigation Officer
                  </option>

                  <option>
                    Administrator
                  </option>
                </select>

              </div>

              <div className="settings-field">

                <label>
                  Secure Email
                </label>

                <input
                  type="email"
                  value={
                    profile.email
                  }
                  onChange={(event) =>
                    handleProfileChange(
                      'email',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="settings-form-actions">

                {saveMessage && (
                  <span className="save-message">
                    {saveMessage}
                  </span>
                )}

                <button
                  type="submit"
                  className="primary-settings-button"
                >
                  Save Changes
                </button>

              </div>

            </div>

          </form>

        </section>


        <section className="settings-card">

          <div className="settings-card-header">

            <div>

              <h2>
                Alert Preferences
              </h2>

              <p>
                Configure automated signals
                for case updates and system
                events.
              </p>

            </div>

          </div>

          <div className="settings-divider" />

          <div className="settings-preference">

            <div>
              <strong>
                Critical Alerts
              </strong>

              <span>
                Immediate notifications for
                high-priority case updates
                and breaches.
              </span>
            </div>

            <button
              type="button"
              className={`
                settings-switch
                ${
                  notifications.criticalAlerts
                    ? 'settings-switch-on-red'
                    : ''
                }
              `}
              onClick={() =>
                toggleNotification(
                  'criticalAlerts'
                )
              }
              aria-label="Toggle critical alerts"
            >
              <span />
            </button>

          </div>


          <div className="settings-preference">

            <div>
              <strong>
                Case Activity Summary
              </strong>

              <span>
                Daily digest of modifications
                to your assigned investigations.
              </span>
            </div>

            <button
              type="button"
              className={`
                settings-switch
                ${
                  notifications.caseActivity
                    ? 'settings-switch-on-purple'
                    : ''
                }
              `}
              onClick={() =>
                toggleNotification(
                  'caseActivity'
                )
              }
              aria-label="Toggle case activity summary"
            >
              <span />
            </button>

          </div>

        </section>
      </>
    );
  }


  function renderNotifications() {
    return (
      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>
              Notification Settings
            </h2>

            <p>
              Choose which investigation
              events should notify you.
            </p>
          </div>

        </div>

        <div className="settings-divider" />

        <div className="notification-list">

          <div className="notification-item">

            <div>
              <strong>
                Critical Alerts
              </strong>

              <span>
                Receive immediate alerts
                for critical investigation
                events.
              </span>
            </div>

            <button
              type="button"
              className={`
                settings-switch
                ${
                  notifications.criticalAlerts
                    ? 'settings-switch-on-red'
                    : ''
                }
              `}
              onClick={() =>
                toggleNotification(
                  'criticalAlerts'
                )
              }
            >
              <span />
            </button>

          </div>


          <div className="notification-item">

            <div>
              <strong>
                Case Activity Summary
              </strong>

              <span>
                Receive a summary of recent
                case activity.
              </span>
            </div>

            <button
              type="button"
              className={`
                settings-switch
                ${
                  notifications.caseActivity
                    ? 'settings-switch-on-purple'
                    : ''
                }
              `}
              onClick={() =>
                toggleNotification(
                  'caseActivity'
                )
              }
            >
              <span />
            </button>

          </div>

        </div>

      </section>
    );
  }


  function renderAppearance() {
    return (
      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>
              Appearance
            </h2>

            <p>
              Customize how CASE-FUSION
              looks on your screen.
            </p>
          </div>

        </div>

        <div className="settings-divider" />


        <div className="appearance-options">

          <button
            type="button"
            className={`
              theme-option
              ${
                theme === 'dark'
                  ? 'theme-option-active'
                  : ''
              }
            `}
            onClick={() =>
              handleThemeChange(
                'dark'
              )
            }
          >

            <div className="theme-preview theme-preview-dark">

              <div className="preview-top" />

              <div className="preview-content">

                <span />
                <span />
                <span />

              </div>

            </div>

            <div className="theme-option-info">

              <strong>
                Dark
              </strong>

              <span>
                Recommended for
                investigation work.
              </span>

            </div>

            <span className="theme-radio">
              {theme === 'dark'
                ? '●'
                : '○'}
            </span>

          </button>


          <button
            type="button"
            className={`
              theme-option
              ${
                theme === 'light'
                  ? 'theme-option-active'
                  : ''
              }
            `}
            onClick={() =>
              handleThemeChange(
                'light'
              )
            }
          >

            <div className="theme-preview theme-preview-light">

              <div className="preview-top" />

              <div className="preview-content">

                <span />
                <span />
                <span />

              </div>

            </div>

            <div className="theme-option-info">

              <strong>
                Light
              </strong>

              <span>
                Clean and bright
                interface.
              </span>

            </div>

            <span className="theme-radio">
              {theme === 'light'
                ? '●'
                : '○'}
            </span>

          </button>

        </div>

      </section>
    );
  }


  function renderSecurity() {
    return (
      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>
              Security
            </h2>

            <p>
              Manage your account security
              and password.
            </p>
          </div>

        </div>

        <div className="settings-divider" />

        <form
          className="security-form"
          onSubmit={
            handleSecuritySubmit
          }
        >

          <div className="settings-field">

            <label>
              Current Password
            </label>

            <input
              type="password"
              value={
                security.currentPassword
              }
              onChange={(event) =>
                handleSecurityChange(
                  'currentPassword',
                  event.target.value
                )
              }
            />

          </div>


          <div className="settings-field">

            <label>
              New Password
            </label>

            <input
              type="password"
              value={
                security.newPassword
              }
              onChange={(event) =>
                handleSecurityChange(
                  'newPassword',
                  event.target.value
                )
              }
            />

          </div>


          <div className="settings-field">

            <label>
              Confirm New Password
            </label>

            <input
              type="password"
              value={
                security.confirmPassword
              }
              onChange={(event) =>
                handleSecurityChange(
                  'confirmPassword',
                  event.target.value
                )
              }
            />

          </div>


          <div className="security-actions">

            {securityMessage && (
              <span
                className={
                  securityMessage.includes(
                    'successfully'
                  )
                    ? 'save-message'
                    : 'error-message'
                }
              >
                {securityMessage}
              </span>
            )}

            <button
              type="submit"
              className="primary-settings-button"
            >
              Update Password
            </button>

          </div>

        </form>

      </section>
    );
  }


  /* =====================================================
     MAIN
     ===================================================== */

  return (
    <div className="settings-page">

      <aside className="settings-sidebar">

        <div className="settings-sidebar-title">
          Settings
        </div>


        <button
          type="button"
          className={`
            settings-sidebar-item
            ${
              activeTab === 'profile'
                ? 'settings-sidebar-active'
                : ''
            }
          `}
          onClick={() =>
            setActiveTab(
              'profile'
            )
          }
        >
          Profile
        </button>


        <button
          type="button"
          className={`
            settings-sidebar-item
            ${
              activeTab ===
              'notifications'
                ? 'settings-sidebar-active'
                : ''
            }
          `}
          onClick={() =>
            setActiveTab(
              'notifications'
            )
          }
        >
          Notifications
        </button>


        <button
          type="button"
          className={`
            settings-sidebar-item
            ${
              activeTab ===
              'appearance'
                ? 'settings-sidebar-active'
                : ''
            }
          `}
          onClick={() =>
            setActiveTab(
              'appearance'
            )
          }
        >
          Appearance
        </button>


        <button
          type="button"
          className={`
            settings-sidebar-item
            ${
              activeTab === 'security'
                ? 'settings-sidebar-active'
                : ''
            }
          `}
          onClick={() =>
            setActiveTab(
              'security'
            )
          }
        >
          Security
        </button>


        <div className="settings-sidebar-bottom">

          <button
            type="button"
            className="settings-back-button"
            onClick={
              onBack
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </aside>


      <main className="settings-main">

        <div className="settings-heading">

          <div>

            <div className="settings-breadcrumb">
              CASE-FUSION / SETTINGS
            </div>

            <h1>
              System Settings
            </h1>

            <p>
              Manage your investigator
              profile and system preferences.
            </p>

          </div>

        </div>


        <div className="settings-content">

          {activeTab ===
            'profile' &&
            renderProfile()}

          {activeTab ===
            'notifications' &&
            renderNotifications()}

          {activeTab ===
            'appearance' &&
            renderAppearance()}

          {activeTab ===
            'security' &&
            renderSecurity()}

        </div>

      </main>

    </div>
  );
}

export default Settings;