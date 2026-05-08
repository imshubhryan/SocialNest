import React, { useState } from "react";
import { X, User, Shield, Bell, Lock, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import * as settingsApi from "../services/settings.api";
import * as userApi from "../../user/services/user.api";
import "../style/settings.scss";

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "data", label: "Data & Activity", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

const SettingsModal = ({ user: profileData, onClose, onProfileUpdate }) => {
  const { handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Account state
  const [accountForm, setAccountForm] = useState({
    fullName: profileData?.fullName || "",
    username: profileData?.username || "",
    bio: profileData?.bio || "",
  });
  const [accountLoading, setAccountLoading] = useState(false);

  // Security state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Privacy state
  const [isPrivate, setIsPrivate] = useState(profileData?.isPrivate || false);

  // Delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    likes: true, comments: true, follows: true, messages: true
  });

  // Data state
  const [dataTab, setDataTab] = useState("saved"); // "saved" or "liked"
  const [activityData, setActivityData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchActivityData = async (type) => {
    setDataLoading(true);
    try {
      const res = type === "saved" ? await settingsApi.getSavedPosts() : await settingsApi.getLikedPosts();
      setActivityData(res.data || []);
    } catch (err) {
      flash("Failed to fetch data", "error");
    } finally {
      setDataLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "data") {
      fetchActivityData(dataTab);
    }
  }, [activeTab, dataTab]);

  const flash = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // ─── ACCOUNT ──────────────────────
  const handleAccountSave = async () => {
    setAccountLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", accountForm.fullName);
      formData.append("username", accountForm.username);
      formData.append("bio", accountForm.bio);
      formData.append("isPrivate", isPrivate);
      const res = await userApi.updateProfile(formData);
      onProfileUpdate?.(res.data);
      flash("Profile updated!");
    } catch (err) {
      flash(err?.response?.data?.message || "Update failed", "error");
    } finally {
      setAccountLoading(false);
    }
  };

  // ─── SECURITY ─────────────────────
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNew) {
      return flash("Passwords do not match", "error");
    }
    setPwdLoading(true);
    try {
      await settingsApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNew: "" });
      flash("Password changed!");
    } catch (err) {
      flash(err?.response?.data?.message || "Failed", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  // ─── DELETE ───────────────────────
  const handleDeleteAccount = async () => {
    try {
      await settingsApi.deleteAccount(deletePassword);
      window.location.href = "/login";
    } catch (err) {
      flash(err?.response?.data?.message || "Delete failed", "error");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {message.text && (
          <div className={`settings-flash ${message.type}`}>{message.text}</div>
        )}

        <div className="settings-body">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""} ${tab.id === "danger" ? "danger" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
            <div className="sidebar-divider" />
            <button className="tab-btn logout-btn" onClick={handleLogout}>
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>

          {/* Content */}
          <div className="settings-content">
            {/* ACCOUNT */}
            {activeTab === "account" && (
              <div className="settings-section">
                <h4>Account Settings</h4>
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={accountForm.fullName} onChange={e => setAccountForm(p => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input value={accountForm.username} onChange={e => setAccountForm(p => ({ ...p, username: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea value={accountForm.bio} onChange={e => setAccountForm(p => ({ ...p, bio: e.target.value }))} maxLength={250} rows={3} />
                  <span className="char-count">{accountForm.bio.length}/250</span>
                </div>
                <button className="btn-save" onClick={handleAccountSave} disabled={accountLoading}>
                  {accountLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <div className="settings-section">
                <h4>Change Password</h4>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmNew} onChange={e => setPasswordForm(p => ({ ...p, confirmNew: e.target.value }))} />
                </div>
                <button className="btn-save" onClick={handlePasswordChange} disabled={pwdLoading}>
                  {pwdLoading ? "Changing..." : "Change Password"}
                </button>

                <div className="section-divider" />
                <h4>Sessions</h4>
                <p className="section-desc">Force logout from all other devices.</p>
                <button className="btn-secondary" onClick={handleLogout}>Logout All Devices</button>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="settings-section">
                <h4>Notification Preferences</h4>
                {Object.entries(notifPrefs).map(([key, val]) => (
                  <div key={key} className="toggle-row">
                    <span className="toggle-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <label className="switch">
                      <input type="checkbox" checked={val} onChange={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <div className="settings-section">
                <h4>Privacy Settings</h4>
                <div className="toggle-row">
                  <div>
                    <span className="toggle-label">Private Account</span>
                    <p className="section-desc">Only approved followers can see your posts.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            )}
            {/* DATA & ACTIVITY */}
            {activeTab === "data" && (
              <div className="settings-section data-section">
                <h4>Data & Activity</h4>
                <div className="data-tabs">
                  <button className={`data-tab-btn ${dataTab === "saved" ? "active" : ""}`} onClick={() => setDataTab("saved")}>Saved</button>
                  <button className={`data-tab-btn ${dataTab === "liked" ? "active" : ""}`} onClick={() => setDataTab("liked")}>Liked</button>
                </div>

                <div className="activity-grid">
                  {dataLoading ? (
                    <div className="data-loader">Loading...</div>
                  ) : activityData.length === 0 ? (
                    <p className="no-data">No {dataTab} posts yet.</p>
                  ) : (
                    activityData.map(post => (
                      <div key={post._id} className="data-item">
                        <img src={post.imgUrl} alt="" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* DANGER ZONE */}
            {activeTab === "danger" && (
              <div className="settings-section danger-zone">
                <h4>⚠️ Danger Zone</h4>
                <p className="section-desc">These actions are permanent and cannot be undone.</p>

                {!showDeleteConfirm ? (
                  <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={16} /> Delete My Account
                  </button>
                ) : (
                  <div className="delete-confirm">
                    <p className="delete-warning">Enter your password to confirm account deletion:</p>
                    <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your password" />
                    <div className="delete-actions">
                      <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                      <button className="btn-danger" onClick={handleDeleteAccount}>Permanently Delete</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
