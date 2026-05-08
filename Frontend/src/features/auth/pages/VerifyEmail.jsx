import React, { useEffect, useState } from "react";
import "../style/form.scss";
import { useParams, Link, useNavigate } from "react-router";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Logo from "../../../components/Logo";
import api from "../../../lib/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/api/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
        
        // Auto redirect after 1.5 seconds
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification failed");
      }
    };
    if (token) verifyEmail();
  }, [token, navigate]);

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container" style={{ textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <div style={{ margin: "2rem 0" }}>
              <Loader size={48} color="#C2185B" className="spin-icon" />
            </div>
            <h1>Verifying your email...</h1>
            <p className="form-subtitle">Please wait a moment</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "rgba(76,175,80,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}>
              <CheckCircle size={36} color="#4CAF50" />
            </div>
            <h1 style={{ color: "#4CAF50" }}>Email Verified! 🎉</h1>
            <p className="form-subtitle">{message}</p>
            <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "1rem" }}>
              Redirecting to login page...
            </p>
            <Link to="/login" className="button primary-button" style={{
              display: "inline-block", marginTop: "1.5rem", padding: "0.9rem 2rem"
            }}>
              Sign In to Your Account
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "rgba(244,67,54,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}>
              <XCircle size={36} color="#F44336" />
            </div>
            <h1 style={{ color: "#F44336" }}>Verification Failed</h1>
            <p className="form-subtitle">{message}</p>
            <Link to="/register" className="button primary-button" style={{
              display: "inline-block", marginTop: "1.5rem", padding: "0.9rem 2rem"
            }}>
              Register Again
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default VerifyEmail;
