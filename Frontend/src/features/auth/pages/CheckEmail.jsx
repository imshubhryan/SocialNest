import React, { useState } from "react";
import "../style/form.scss";
import { Link, useLocation } from "react-router";
import { Mail, RefreshCw } from "lucide-react";
import Logo from "../../../components/Logo";
import api from "../../../lib/api";

const CheckEmail = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMsg("");
    try {
      await api.post("/api/auth/resend-verification", { email });
      setResendMsg("Verification email resent! Check your inbox.");
    } catch (err) {
      setResendMsg(err?.response?.data?.message || "Failed to resend");
    }
    setResending(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container" style={{ textAlign: "center" }}>
        <div style={{
          width: 70, height: 70, borderRadius: "50%",
          background: "rgba(194,24,91,0.08)", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem"
        }}>
          <Mail size={32} color="#C2185B" />
        </div>

        <h1>Check Your Email</h1>
        <p className="form-subtitle">
          We've sent a verification link to<br />
          <strong style={{ color: "#C2185B" }}>{email || "your email"}</strong>
        </p>

        <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Click the link in the email to verify your account.
          The link expires in 24 hours.
        </p>

        {resendMsg && (
          <div className={resendMsg.includes("resent") ? "form-success" : "form-error"}>
            {resendMsg}
          </div>
        )}

        <button
          className="button primary-button"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={handleResend}
          disabled={resending || !email}
          aria-label="Resend verification email"
        >
          <RefreshCw size={16} style={{ marginRight: 8, display: "inline" }} />
          {resending ? "Resending..." : "Resend Verification Email"}
        </button>

        <p className="form-footer">
          Wrong email?
          <Link to="/register"> Register again</Link>
        </p>

        <p className="form-footer" style={{ marginTop: "0.5rem" }}>
          Already verified?
          <Link to="/login"> Sign In</Link>
        </p>
      </div>
    </main>
  );
};

export default CheckEmail;
