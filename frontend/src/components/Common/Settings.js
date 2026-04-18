import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

function Settings() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        setAccount(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load account settings');
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, []);

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-panel">
          <h2>Settings</h2>
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-page">
        <div className="settings-panel">
          <h2>Settings</h2>
          <p className="form-error">{error}</p>
        </div>
      </div>
    );
  }

  const user = account?.user;
  const merchant = account?.merchant;
  const maskedApiKey = merchant?.apiKey ? `********${merchant.apiKey.slice(-4)}` : 'N/A';

  return (
    <div className="settings-page">
      <div className="settings-panel">
        <h2>Settings</h2>
        <p className="settings-subtitle">Account details synced from the current database schema.</p>

        <section className="settings-section">
          <h3>Account Information</h3>
          <div className="settings-grid">
            <div>
              <span className="settings-label">Username</span>
              <p>{user?.username || 'N/A'}</p>
            </div>
            <div>
              <span className="settings-label">Email</span>
              <p>{user?.email || 'N/A'}</p>
            </div>
            <div>
              <span className="settings-label">Role</span>
              <p>{user?.role || 'N/A'}</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>Security</h3>
          <div className="settings-grid">
            <div>
              <span className="settings-label">2FA Setup</span>
              <p>{user?.twoFactorEnabled ? 'Enabled' : 'Not configured (placeholder)'}</p>
            </div>
          </div>
        </section>

        {user?.role === 'merchant' && (
          <section className="settings-section">
            <h3>Merchant Information</h3>
            {merchant ? (
              <div className="settings-grid">
                <div>
                  <span className="settings-label">Name</span>
                  <p>{merchant.name}</p>
                </div>
                <div>
                  <span className="settings-label">Merchant ID</span>
                  <p>{merchant._id}</p>
                </div>
                <div>
                  <span className="settings-label">API Key</span>
                  <div className="sensitive-value-row">
                    <p>{showApiKey ? merchant.apiKey : maskedApiKey}</p>
                    <button
                      type="button"
                      className="toggle-sensitive-btn"
                      onClick={() => setShowApiKey((prev) => !prev)}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="settings-label">Webhook URL</span>
                  <p>{merchant.webhookUrl || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p>No merchant profile is linked to this account yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Settings;