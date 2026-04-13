import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const Login = () => {
  const [invigilatorId, setInvigilatorId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!invigilatorId || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/login', {
        invigilatorId,
        password,
      });

      if (response.data.success) {
        navigate('/dashboard', { 
          state: { 
            invigilatorId: response.data.invigilatorId,
            roomId: response.data.assignedRoom.id,
            roomName: response.data.assignedRoom.name
          } 
        });
      } else {
        setErrorMessage('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="diagonal-header">
        <h1>Examify - A Smart Surveillance</h1>
      </div>
      
      <div className="content-container">
        <div className="card">
          <h2>Invigilator Login Panel</h2>
          {errorMessage && <div className="message error-message">{errorMessage}</div>}
          
          <form onSubmit={handleLogin} className="form">
            <div className="input-group">
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input
                  id="invigilatorId"
                  type="text"
                  placeholder="Invigilator ID"
                  value={invigilatorId}
                  onChange={(e) => setInvigilatorId(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="action-link">
              <a onClick={() => navigate('/forgot-password')}>Forgot Password?</a>
            </div>
            
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;