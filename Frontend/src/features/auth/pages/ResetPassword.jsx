import React, { useState } from "react";
import "../style/form.scss";
import { useParams, useNavigate, Link } from "react-router";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { resetPassword } from "../services/auth.api";
import Logo from "../../../components/Logo";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await resetPassword(token, password, confirmPassword);
      setStatus("success");
      setMessage(res.message || "Password updated successfully!");
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setStatus("error");
      const errMsg = err?.response?.data?.message || err?.message || "Failed to reset password. The link might be expired.";
      setMessage(errMsg);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container">
        
        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
             <CheckCircle size={48} color="#4CAF50" style={{ margin: "0 auto 1rem" }} />
             <h1 style={{ color: "#4CAF50" }}>Password Reset! 🎉</h1>
             <p className="form-subtitle">{message}</p>
             <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "1rem" }}>
               Redirecting to login page...
             </p>
             <Link to="/login" className="button primary-button" style={{ display: "inline-block", marginTop: "1.5rem", padding: "0.9rem 2rem" }}>
               Go to Log In
             </Link>
          </div>
        ) : (
          <>
            <h1 style={{ textAlign: "center" }}>Create New Password</h1>
            <p className="form-subtitle" style={{ textAlign: "center", marginBottom: "2rem" }}>
              Your new password must be different from previous used passwords and at least 8 characters long.
            </p>

            {status === "error" && (
              <div className="form-error" style={{ border: "2px solid #D32F2F", padding: "12px", background: "#FFF0F0", color: "#D32F2F", borderRadius: "10px", marginBottom: "1rem", fontWeight: "bold" }}>
                <AlertCircle size={16} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>New Password</label>
                <div className={`input-wrapper ${status === "error" && message.includes('at least 8') ? "has-error" : ""}`}>
                  <Lock size={16} className="input-icon" />
                  <input
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setStatus("idle"); }}
                    type="password"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Confirm New Password</label>
                <div className={`input-wrapper ${status === "error" && message.includes('match') ? "has-error" : ""}`}>
                  <Lock size={16} className="input-icon" />
                  <input
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setStatus("idle"); }}
                    type="password"
                    placeholder="Repeat your new password"
                    required
                  />
                </div>
              </div>

              <button 
                className="button primary-button form-submit-btn" 
                disabled={status === "loading"}
                style={{ marginTop: "1.5rem" }}
              >
                {status === "loading" ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
