import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/GlobalStyles.css";
import "../styles/ForgotPassword.css"

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !username.includes("@")) {
      setMessage("Please provide a valid email address.");
      setIsError(true);
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post("http://localhost:5000/forgot-password", {
        username,
      });

      if (response.data.success) {
        setMessage("Reset code sent successfully");
        setIsError(false);
        
        // Navigate to reset password page with email in state
        navigate("/reset-password", { state: { email: username } });
      } else {
        setMessage(response.data.message || "Failed to send reset code");
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
        "Failed to process your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="diagonal-header">
        <h1>Examify - A Smart Surveillance</h1>
      </div>
      
      <div className="content-container">
        <div className="card">
          <h2>Reset Your Password</h2>
          <p className="info-text">
            Enter the email address associated with your account and we'll send you
            a code to reset your password.
          </p>
          
          {message && (
            <div className={`message ${isError ? "error-message" : "success-message"}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
            
            <div className="action-link" style={{ textAlign: 'center', marginTop: '16px' }}>
              <a onClick={() => navigate("/")} className="login-link">
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;