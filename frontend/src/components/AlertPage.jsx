import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/AlertPage.css';

const AlertPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { invigilatorId, roomId, roomName } = location.state || {};

  const [alerts, setAlerts] = useState([]); // Ensure it's always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Fetch alerts from MongoDB
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('/api/alerts', {
          params: { roomId }
        });

        console.log("Fetched alerts:", response.data); // Debugging response

        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setAlerts(response.data);
        } else {
          console.error("API did not return an array:", response.data);
          setAlerts([]); // Set empty array if unexpected response
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts. Please try again later.');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [roomId]);

  // Ensure alerts is an array before filtering
  const filteredAlerts = Array.isArray(alerts)
    ? alerts.filter(alert => {
        const matchesStatus = statusFilter === 'All' || alert.status === statusFilter;
        const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
        return matchesStatus && matchesSeverity;
      })
    : [];

  const handleBack = () => {
    navigate('/dashboard', { state: { invigilatorId, roomId, roomName } });
  };

  const handleStatusChange = async (caseNo, newStatus) => {
    try {
      await axios.patch(`/api/alerts/${caseNo}`, { status: newStatus });

      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.caseNo === caseNo ? { ...alert, status: newStatus } : alert
        )
      );
    } catch (err) {
      console.error('Error updating alert status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={handleBack} className="back-button">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="alert-page">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <span className="camera-icon">📹</span>
            <h1>Examify - Smart Surveillance</h1>
          </div>
          <button className="back-button" onClick={handleBack}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="alert-container">
        <div className="alert-header">
          <h2>All Alerts {roomName ? `- ${roomName}` : ''}</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Severity:</label>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <p>No alerts match your current filters.</p>
          </div>
        ) : (
          <div className="alert-table-container">
            <table className="alert-table">
              <thead>
                <tr>
                  <th>Case No.</th>
                  <th>Student ID</th>
                  <th>Alert Type</th>
                  <th>Severity</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.caseNo} className={`severity-${alert.severity.toLowerCase()}`}>
                    <td>{alert.caseNo}</td>
                    <td>{alert.caseId}</td>
                    <td>{alert.alertType}</td>
                    <td>
                      <span className={`severity-badge ${alert.severity.toLowerCase()}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td>{new Date(alert.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${alert.status.toLowerCase()}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={alert.status}
                        onChange={(e) => handleStatusChange(alert.caseNo, e.target.value)}
                        className="status-dropdown"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPage;
