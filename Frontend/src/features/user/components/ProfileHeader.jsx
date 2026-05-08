import React, { useState } from "react";
import { Settings, UserPlus, UserCheck, Clock } from "lucide-react";
import { useLongPress } from "./useLongPress";
import ProfilePhotoPreviewModal from "./ProfilePhotoPreviewModal";
import { AnimatePresence } from "framer-motion";
import "../style/profile.scss";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const ProfileHeader = ({ profile, isOwner, onEditClick, onSettingsClick, onFollowToggle, onAvatarClick, onAddStoryClick, hasActiveStory: explicitHasActiveStory }) => {
  const [showPreview, setShowPreview] = useState(false);

  const {
    username,
    fullName,
    bio,
    profileImage,
    followersCount,
    followingCount,
    postsCount,
    isFollowing,
    isPending,
    hasActiveStory: profileHasActiveStory,
    isVerified,
  } = profile;

  const hasActiveStory = explicitHasActiveStory !== undefined ? explicitHasActiveStory : profileHasActiveStory;

  const handleLongPress = () => {
    setShowPreview(true);
  };

  const handleNormalClick = () => {
    if (hasActiveStory && onAvatarClick) {
      onAvatarClick();
    } else if (isOwner && onAddStoryClick) {
      onAddStoryClick();
    } else {
      setShowPreview(true);
    }
  };

  const avatarLongPressProps = useLongPress(handleLongPress, handleNormalClick);

  return (
    <>
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div 
            className={`avatar-wrapper ${hasActiveStory ? "has-story" : "no-story"}`}
            {...avatarLongPressProps}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label="Profile photo interactions"
          >
            <img src={profileImage || DEFAULT_AVATAR} alt={username || "User profile"} className="profile-large-avatar" loading="lazy" />
          </div>
        </div>

        <div className="profile-info-section">
          <div className="profile-title-row">
            <h2 className="profile-username" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {username}
              {isVerified && (
                <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center" }} title="Verified account">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              )}
            </h2>
            
            <div className="profile-actions">
              {isOwner ? (
                <>
                  <button className="btn-secondary" onClick={onEditClick} aria-label="Edit Profile">Edit Profile</button>
                  <button className="btn-icon" onClick={onSettingsClick} aria-label="Settings"><Settings size={20} /></button>
                </>
              ) : (
                <button 
                  className={`btn-action ${isFollowing ? "following" : "follow"}`}
                  onClick={onFollowToggle}
                  aria-label={isFollowing ? "Unfollow" : isPending ? "Requested" : "Follow"}
                >
                  {isFollowing ? (
                    <><UserCheck size={18} /> Following</>
                  ) : isPending ? (
                    <><Clock size={18} /> Requested</>
                  ) : (
                    <><UserPlus size={18} /> Follow</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="profile-stats-row">
            <div className="stat-item"><strong>{postsCount || 0}</strong> posts</div>
            <div className="stat-item"><strong>{followersCount || 0}</strong> followers</div>
            <div className="stat-item"><strong>{followingCount || 0}</strong> following</div>
          </div>

          <div className="profile-bio-row">
            <div className="full-name">{fullName}</div>
            <div className="bio-text">{bio}</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <ProfilePhotoPreviewModal 
            src={profileImage}
            alt={username}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileHeader;
