import React, { useState } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import "../style/profile.scss";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user.username || "",
    fullName: user.fullName || "",
    bio: user.bio || "",
    isPrivate: user.isPrivate || false,
  });
  const [imagePreview, setImagePreview] = useState(user.profileImage || DEFAULT_AVATAR);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile image must be under 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }
    if (formData.bio.length > 150) {
      setError("Bio must be under 150 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    const data = new FormData();
    data.append("username", formData.username.trim());
    data.append("fullName", formData.fullName.trim());
    data.append("bio", formData.bio.trim());
    data.append("isPrivate", formData.isPrivate);
    if (selectedFile) data.append("profileImage", selectedFile);

    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="edit-profile-title">Edit Profile</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close edit profile"><X size={20} /></button>
        </div>

        {error && <div className="form-error" style={{ padding: "0.5rem 1rem", color: "#D32F2F", fontSize: "0.85rem", background: "rgba(211,47,47,0.05)" }}>{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="image-edit-section">
            <div className="avatar-preview-wrapper" onClick={() => document.getElementById('profile-upload').click()} style={{ cursor: "pointer" }}>
              <img src={imagePreview} alt="Profile photo preview" />
              <div className="camera-overlay"><Camera size={24} color="white" /></div>
            </div>
            <input id="profile-upload" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleImageChange} />
            <button type="button" className="text-btn" onClick={() => document.getElementById('profile-upload').click()} aria-label="Change profile photo">
              Change Profile Photo
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Name</label>
            <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" maxLength={150} rows={3} />
            <span className="char-count">{formData.bio.length}/150</span>
          </div>

          <div className="form-group checkbox-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label className="switch" style={{ position: "relative", display: "inline-block", width: "40px", height: "20px" }}>
              <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={handleChange} aria-label="Private account" />
              <span className="slider round"></span>
            </label>
            <span>Private Account</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
