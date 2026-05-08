import React, { useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { User, Lock, Mail, AlertCircle } from "lucide-react";
import Logo from "../../../components/Logo";

const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister, authError } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = "Username is required";
    } else if (username.length < 3 || username.length > 20) {
      errs.username = "Username must be 3–20 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errs.username = "Only letters, numbers, and underscores are allowed";
    }

    if (!email.trim()) {
      errs.email = "Please enter your email";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errs.email = "Enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errs.password = "Password must include at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      console.log("Attempting registration for:", username);
      const res = await handleRegister(username, email, password, confirmPassword);
      console.log("Registration API Response:", res);
      navigate("/check-email", { state: { email } });
    } catch (err) {
      console.log("Registration failed handle by global state");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container">
        <h1>Join the Nest</h1>
        <p className="form-subtitle">
          Create your account and start connecting with your community.
        </p>

        {authError && (
          <div className="form-error" style={{ border: "2px solid #D32F2F", padding: "12px", background: "#FFF0F0", color: "#D32F2F", borderRadius: "10px", marginBottom: "1rem", fontWeight: "bold" }}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="input-group">
            <label>Username</label>
            <div className={`input-wrapper ${errors.username ? "has-error" : ""}`}>
              <User size={16} className="input-icon" />
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors(p => ({ ...p, username: "" })); }}
                type="text"
                placeholder="Pick a unique username"
              />
            </div>
            {errors.username && <span className="field-error"><AlertCircle size={12} /> {errors.username}</span>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <div className={`input-wrapper ${errors.email ? "has-error" : ""}`}>
              <Mail size={16} className="input-icon" />
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                type="text"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <span className="field-error"><AlertCircle size={12} /> {errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className={`input-wrapper ${errors.password ? "has-error" : ""}`}>
              <Lock size={16} className="input-icon" />
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                type="password"
                placeholder="Minimum 8 characters"
              />
            </div>
            {errors.password && <span className="field-error"><AlertCircle size={12} /> {errors.password}</span>}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className={`input-wrapper ${errors.confirmPassword ? "has-error" : ""}`}>
              <Lock size={16} className="input-icon" />
              <input
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })); }}
                type="password"
                placeholder="Repeat your password"
              />
            </div>
            {errors.confirmPassword && <span className="field-error"><AlertCircle size={12} /> {errors.confirmPassword}</span>}
          </div>

          <button 
            className="button primary-button form-submit-btn" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="form-footer">
          Already have an account?
          <Link to="/login"> Sign In</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
