import React, { useState, useRef } from "react";
import "../style/form.scss";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Camera, User, Sparkles, ArrowRight } from "lucide-react";
import Logo from "../../../components/Logo";
import api from "../../../lib/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, handleGetMe } = useAuth();
  const [bio, setBio] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("bio", bio);
      // Upload actual file if selected (not blob URL)
      const selectedFile = fileRef.current?.files?.[0];
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }
      await api.post("/api/auth/onboarding", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Cleanup object URL to prevent memory leak
      if (preview) URL.revokeObjectURL(preview);
      await handleGetMe();
      navigate("/");
    } catch (err) {
      // silently handle — user can retry
    }
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await api.post("/api/auth/onboarding", { bio: "" });
      await handleGetMe();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="form-container">
        {/* Progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem"
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: step >= 1 ? "#C2185B" : "#ddd"
          }} />
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: step >= 2 ? "#C2185B" : "#ddd"
          }} />
        </div>

        {step === 1 && (
          <>
            <h1>Set Your Profile Photo</h1>
            <p className="form-subtitle">
              Let others recognize you! Upload a photo or skip for now.
            </p>

            <div
              onClick={() => fileRef.current.click()}
              style={{
                width: 140, height: 140, borderRadius: "50%",
                margin: "1.5rem auto", cursor: "pointer", position: "relative",
                overflow: "hidden", border: "3px dashed rgba(194,24,91,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: preview ? "none" : "rgba(194,24,91,0.03)",
                transition: "all 0.2s"
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{
                  width: "100%", height: "100%", objectFit: "cover"
                }} />
              ) : (
                <div style={{ textAlign: "center", color: "#C2185B" }}>
                  <Camera size={32} />
                  <p style={{ fontSize: "0.75rem", marginTop: 4 }}>Tap to upload</p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              hidden
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                className="button secondary-button"
                style={{ flex: 1 }}
                onClick={() => setStep(2)}
              >
                Skip
              </button>
              <button
                className="button primary-button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={() => setStep(2)}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Tell us about yourself</h1>
            <p className="form-subtitle">
              Write a short bio so people know who you are.
            </p>

            <div style={{ margin: "1.5rem 0" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem"
              }}>
                <img
                  src={preview || user?.profileImage || "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp"}
                  alt="avatar"
                  style={{
                    width: 50, height: 50, borderRadius: "50%",
                    objectFit: "cover", border: "2px solid rgba(194,24,91,0.2)"
                  }}
                />
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    {user?.username || "Your username"}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#888" }}>Setting up your profile</p>
                </div>
              </div>

              <div className="input-group">
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Photography enthusiast 📸 | Travel lover ✈️ | Coffee addict ☕"
                  maxLength={150}
                  style={{
                    border: "none", outline: "none",
                    background: "#F5E6E0", padding: "0.85rem 1rem",
                    borderRadius: "14px", fontSize: "0.9rem",
                    fontFamily: "'Inter', sans-serif",
                    color: "#2D2D2D", resize: "none", minHeight: "80px",
                    width: "100%", boxSizing: "border-box"
                  }}
                />
                <p style={{ textAlign: "right", fontSize: "0.75rem", color: "#aaa" }}>
                  {bio.length}/150
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="button ghost-button"
                style={{ flex: 1 }}
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </button>
              <button
                className="button primary-button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={handleComplete}
                disabled={loading}
              >
                <Sparkles size={16} />
                {loading ? "Setting up..." : "Complete Setup"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Onboarding;
