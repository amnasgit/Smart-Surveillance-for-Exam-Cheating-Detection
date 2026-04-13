import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/GlobalStyles.css";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [strengthLabel, setStrengthLabel] = useState("Too weak");
  const [focusedField, setFocusedField] = useState("");
  const [passwordHints, setPasswordHints] = useState([]);
  
  // Get email from navigation state
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);
  
  // Calculate password strength and generate hints
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      setStrengthLabel("Too weak");
      setPasswordHints([]);
      return;
    }
    
    let strength = 0;
    const missingRequirements = [];
    
    // Length check
    if (newPassword.length >= 8) {
      strength += 1;
    } else {
      missingRequirements.push("Add more characters (minimum 8)");
    }
    
    // Uppercase check
    if (/[A-Z]/.test(newPassword)) {
      strength += 1;
    } else {
      missingRequirements.push("Add an uppercase letter (A-Z)");
    }
    
    // Lowercase + number check
    if (/[a-z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      strength += 1;
    } else if (!(/[a-z]/.test(newPassword))) {
      missingRequirements.push("Add a lowercase letter (a-z)");
    } else {
      missingRequirements.push("Add a number (0-9)");
    }
    
    // Special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      strength += 1;
    } else {
      missingRequirements.push("Add a special character (!@#$...)");
    }
    
    setPasswordStrength(strength);
    
    // Set label based on strength
    const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
    setStrengthLabel(labels[strength]);
    
    // Show at most 2 hints
    setPasswordHints(missingRequirements.slice(0, 2));
    
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setMessage("Please enter the reset code.");
      setIsError(true);
      return;
    }
    
    if (passwordStrength < 3) {
      setMessage("Please create a stronger password.");
      setIsError(true);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post("http://localhost:5000/reset-password", {
        username: email,
        otp,
        newPassword
      });

      if (response.data.success) {
        setMessage("Password updated successfully!");
        setIsError(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setMessage(response.data.message || "Failed to reset password");
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get color for strength indicator
  const getStrengthColor = () => {
    const colors = ["#ff4d4d", "#ffa64d", "#ffff4d", "#4dff4d", "#4d4dff"];
    return colors[passwordStrength];
  };
  
  // Calculate filled segments for strength meter
  const getFilledSegments = () => {
    return Array(5).fill(0).map((_, index) => index < passwordStrength);
  };

  return (
    <div className="page-container">
      <div className="diagonal-header">
        <h1>Examify - A Smart Surveillance</h1>
      </div>
      
      <div className="content-container">
        <div className="card reset-password-card">
          <h2>Reset Your Password</h2>
          
          {email && (
            <p className="email-info">
              We've sent a code to <strong>{email}</strong>
            </p>
          )}
          
          {message && (
            <div className={`message ${isError ? "error-message" : "success-message"}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <div className="input-field">
                <i className="fas fa-key"></i>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter reset code"
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  required
                />
              </div>
              
              {/* Password strength meter */}
              {newPassword && (
                <div className="strength-meter-container">
                  <div className="strength-meter">
                    {getFilledSegments().map((filled, i) => (
                      <div 
                        key={i} 
                        className={`strength-segment ${filled ? 'filled' : ''}`}
                        style={filled ? { backgroundColor: getStrengthColor() } : {}}
                      />
                    ))}
                  </div>
                  <div className="strength-label" style={{ color: getStrengthColor() }}>
                    {strengthLabel}
                  </div>
                </div>
              )}
              
              {/* Dynamic hints */}
              {focusedField === "password" && passwordHints.length > 0 && (
                <div className="password-hints">
                  <div className="hint-title">
                    <i className="fas fa-lightbulb"></i> Tips to strengthen:
                  </div>
                  {passwordHints.map((hint, i) => (
                    <div className="hint" key={i}>• {hint}</div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="input-group">
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="password-mismatch">
                  <i className="fas fa-exclamation-circle"></i> Passwords do not match
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="primary-button"
              disabled={isLoading || passwordStrength < 3}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;