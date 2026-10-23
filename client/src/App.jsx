import { useState, useEffect } from 'react';

function App() {
  const [backendHealth, setBackendHealth] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setBackendHealth((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setBackendHealth({
        loading: false,
        data,
        error: null,
      });
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setBackendHealth({
        loading: false,
        data: null,
        error: err.message,
      });
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <span className="badge-tag">STEP 2: PROJECT FOUNDATION</span>
        <h1 className="title">Thaniyam Treats</h1>
        <p className="subtitle">
          Traditional Food E-Commerce MVP • Architecture & Health Verification
        </p>
      </header>

      <main>
        <div className="status-grid">
          {/* Frontend Status Card */}
          <div className="status-card">
            <div className="card-title">
              <span>Frontend (Client)</span>
              <span className="pill pill-success">Running</span>
            </div>
            <div className="card-detail">
              <p><strong>Stack:</strong> React + Vite</p>
              <p><strong>URL:</strong> http://localhost:5173</p>
              <p><strong>Proxy:</strong> /api &rarr; http://localhost:5000</p>
            </div>
          </div>

          {/* Backend Status Card */}
          <div className="status-card">
            <div className="card-title">
              <span>Backend (API Server)</span>
              {backendHealth.loading ? (
                <span className="pill pill-warning">Checking...</span>
              ) : backendHealth.error ? (
                <span className="pill pill-danger">Offline</span>
              ) : (
                <span className="pill pill-success">Online</span>
              )}
            </div>
            <div className="card-detail">
              <p><strong>Stack:</strong> Node.js + Express</p>
              <p><strong>Health Route:</strong> /api/health</p>
              <p>
                <strong>Database:</strong>{' '}
                {backendHealth.data?.database?.status === 'connected' ? (
                  <span className="pill pill-success" style={{ padding: '2px 6px' }}>Connected</span>
                ) : (
                  <span className="pill pill-warning" style={{ padding: '2px 6px' }}>
                    {backendHealth.data?.database?.status || 'Disconnected'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Live API Health Payload */}
        <div className="info-box">
          <p style={{ marginBottom: 6 }}>
            <strong>Backend Response from <code>/api/health</code>:</strong>
          </p>
          {backendHealth.loading ? (
            <p>Connecting to backend API...</p>
          ) : backendHealth.error ? (
            <p style={{ color: '#b91c1c' }}>⚠️ Could not reach backend: {backendHealth.error}</p>
          ) : (
            <div>
              <p>• Status: <code>{backendHealth.data?.status}</code> ({backendHealth.data?.project})</p>
              <p>• Database Status: <code>{backendHealth.data?.database?.status}</code></p>
              <p>• Note: {backendHealth.data?.database?.message}</p>
            </div>
          )}
        </div>

        <div className="action-bar">
          <button className="btn-refresh" onClick={checkHealth}>
            Re-check Health
          </button>
          {lastChecked && (
            <span className="timestamp">Last verified: {lastChecked}</span>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
