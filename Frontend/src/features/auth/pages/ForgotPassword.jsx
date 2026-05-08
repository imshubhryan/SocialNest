import React, { useState } from "react";
import "../style/form.scss";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { forgotPassword } from "../services/auth.api";
import Logo from "../../../components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setStatus("success");
      setMessage(res.message || "Password reset link sent! Please check your email.");
    } catch (err) {
      setStatus("error");
      const errMsg = err?.response?.data?.message || err?.message || "Failed to send reset link.";
      setMessage(errMsg);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container" style={{ textAlign: "center" }}>
        
        {status === "success" ? (
          <div>
             <CheckCircle size={48} color="#4CAF50" style={{ margin: "0 auto 1rem" }} />
             <h1>Email Sent!</h1>
             <p className="form-subtitle">{message}</p>
             <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "1rem" }}>
               Didn't receive the email? Check your spam folder.
             </p>
             <Link to="/login" className="button primary-button" style={{ display: "inline-block", marginTop: "2rem", padding: "0.8rem 2rem" }}>
               Return to Log In
             </Link>
          </div>
        ) : (
          <>
            <h1>Forgot Password?</h1>
            <p className="form-subtitle" style={{ marginBottom: "2rem" }}>
              No worries! Enter your registered email address and we'll send you a link to reset your password.
            </p>

            {status === "error" && (
              <div className="form-error" style={{ border: "2px solid #D32F2F", padding: "12px", background: "#FFF0F0", color: "#D32F2F", borderRadius: "10px", marginBottom: "1rem", fontWeight: "bold" }}>
                <AlertCircle size={16} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <div className="input-group">
                <label>Email Address</label>
                <div className={`input-wrapper ${status === "error" ? "has-error" : ""}`}>
                  <Mail size={16} className="input-icon" />
                  <input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                    type="email"
                    placeholder="e.g. you@example.com"
                    required
                  />
                </div>
              </div>

              <button 
                className="button primary-button form-submit-btn" 
                disabled={status === "loading"}
                style={{ marginTop: "1.5rem" }}
              >
                {status === "loading" ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", color: "#888", fontSize: "0.9rem", textDecoration: "none", fontWeight: "bold" }}>
              <ArrowLeft size={16} /> Back to Log In
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;
