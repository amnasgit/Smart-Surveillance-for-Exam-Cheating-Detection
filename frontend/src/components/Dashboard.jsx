import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { invigilatorId, roomId, roomName } = location.state || {};

  useEffect(() => {
    if (!invigilatorId || !roomId) {
      navigate('/login');
    }
  }, [invigilatorId, roomId, navigate]);

  const [alerts, setAlerts] = useState([
    { id: 1, message: 'Suspicious movement detected - Seat A4', time: '2 mins ago' }
  ]);

  const handleLogout = () => {
    navigate('/login');
  };

  if (!invigilatorId || !roomId) {
    return null;
  }

  return (
    <div className="dashboard full-page">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <span className="camera-icon">📹</span>
            <h1>Examify - Smart Surveillance</h1>
          </div>
          
          <nav className="nav-menu">
            <a href="/dashboard" className="nav-link">Live Feed</a>
            <div className="notification-wrapper">
              <a href="#" className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/alert-page', { state: { invigilatorId, roomId, roomName } });
                }}
              >
                <span className="bell-icon">🔔</span>
                <span className="notification-badge">{alerts.length}</span>
              </a>
            </div>
            <div className="invigilator-info">
              <span className="user-icon">👤</span>
              <span>ID: {invigilatorId}</span>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <div className="left-section">
          <div className="camera-card">
            <div className="camera-header">
              <div className="camera-info">
                <h2>{roomName || 'Exam Room'}</h2>
                <p>Live Webcam Feed</p>
              </div>
              <span className="live-badge">REC</span>
            </div>

            <div className="main-video-container">
              <img 
                className="video-player"
                src="http://localhost:5001/video_feed" 
                alt="Webcam Feed"
              />
            </div>
          </div>

          <div className="alerts-card">
            <div className="alerts-header">
              <h3>Recent Alerts</h3>
              <span className="alert-badge">{alerts.length} New</span>
            </div>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <p className="alert-message">{alert.message}</p>
                    <p className="alert-time">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="camera-selection-card">
            <h3>Camera Views</h3>
            <p>Live webcam feed is active</p>
            <div className="main-video-container">
              <img 
                className="video-player"
                src="http://localhost:5001/video_feed" 
                alt="Webcam Feed"
              />
            </div>
            <br></br>
            <p>Live webcam feed is active</p>
            <div className="main-video-container">
              <img 
                className="video-player"
                src="http://localhost:5001/video_feed" 
                alt="Webcam Feed"
              />
            </div>
            <br></br>
            <p>Live webcam feed is active</p>
            <div className="main-video-container">
              <img 
                className="video-player"
                src="http://localhost:5001/video_feed" 
                alt="Webcam Feed"
              />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;