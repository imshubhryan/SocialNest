import React, { useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { User, Lock, AlertCircle } from "lucide-react";
import Logo from "../../../components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { loading, handleLogin, authError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(username, password);
      navigate("/");
    } catch (err) {
      console.log("Login failed handle by global state");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container">
        <h1>Welcome Back</h1>
        <p className="form-subtitle">
          Enter your credentials to access your dashboard.
        </p>

        {authError && (
          <div className="form-error" style={{ border: "2px solid #D32F2F", padding: "12px", background: "#FFF0F0", color: "#D32F2F", borderRadius: "10px", marginBottom: "1rem", fontWeight: "bold" }}>
             ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username or Email</label>
            <div className={`input-wrapper ${authError ? "has-error" : ""}`}>
              <User size={16} className="input-icon" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                name="username"
                placeholder="e.g. curator_studio or you@email.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className={`input-wrapper ${authError ? "has-error" : ""}`}>
              <Lock size={16} className="input-icon" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.5rem" }}>
            <Link to="/forgot-password" style={{ color: "#C2185B", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600" }}>
              Forgot Password?
            </Link>
          </div>

          <button 
            className="button primary-button form-submit-btn" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="form-footer">
          New to the nest?
          <Link to="/register">Register Now</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
