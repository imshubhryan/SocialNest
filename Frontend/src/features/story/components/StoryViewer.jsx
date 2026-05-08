import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import * as storyApi from "../services/story.api";
import { motion, AnimatePresence } from "framer-motion";
import "../style/story.scss";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const StoryViewer = ({ storyGroups, startIndex, onClose, onStoryDeleted }) => {
  const { user: currentUser } = useAuth();
  const [groupIdx, setGroupIdx] = useState(startIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentGroup = storyGroups[groupIdx];
  const currentStory = currentGroup?.stories?.[storyIdx];

  // Mark as viewed
  useEffect(() => {
    if (currentStory?._id) {
      storyApi.viewStory(currentStory._id).catch(() => {});
    }
    setProgress(0);
  }, [currentStory?._id]);

  const goNext = useCallback(() => {
    if (showConfirmDelete) return; // Pause during confirm
    if (storyIdx < currentGroup.stories.length - 1) {
      setStoryIdx(prev => prev + 1);
    } else if (groupIdx < storyGroups.length - 1) {
      setGroupIdx(prev => prev + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [storyIdx, groupIdx, currentGroup, storyGroups, onClose, showConfirmDelete]);

  // Auto-advance timer (5 seconds per story)
  useEffect(() => {
    if (showConfirmDelete || deleting) return; // Pause timers
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [groupIdx, storyIdx, goNext, showConfirmDelete, deleting]);

  const goPrev = () => {
    if (storyIdx > 0) {
      setStoryIdx(prev => prev - 1);
    } else if (groupIdx > 0) {
      setGroupIdx(prev => prev - 1);
      setStoryIdx(0);
    }
  };

  if (!currentStory) return null;

  const isOwner = currentGroup.user?._id === currentUser?._id || currentGroup.user?.username === currentUser?.username;

  const handleDeleteStory = async () => {
    try {
      setDeleting(true);
      await storyApi.deleteStory(currentStory._id);
      setShowConfirmDelete(false);
      setDeleting(false);
      
      if (onStoryDeleted) {
        onStoryDeleted();
      }
      onClose();
    } catch {
      alert("Failed to delete story");
      setDeleting(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 60) return `${Math.max(1, diff)}m`;
    return `${Math.floor(diff / 60)}h`;
  };

  return (
    <div className="story-viewer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Viewing ${currentGroup.user.username}'s story`}>
      <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
        {/* Progress Bars */}
        <div className="story-progress-bar">
          {currentGroup.stories.map((_, i) => (
            <div key={i} className="progress-segment">
              <div
                className="progress-fill"
                style={{
                  width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%"
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-user-info">
            <img src={currentGroup.user.profileImage || DEFAULT_AVATAR} alt={currentGroup.user.username} className="story-user-avatar" loading="lazy" />
            <span className="story-user-name">{currentGroup.user.username}</span>
            <span className="story-time">{timeAgo(currentStory.createdAt)}</span>
          </div>
          <div className="header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {isOwner && (
              <button 
                className="story-delete-btn" 
                onClick={() => setShowConfirmDelete(true)} 
                aria-label="Delete story"
                style={{ background: "none", border: "none", color: "#f72585", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Trash2 size={20} />
              </button>
            )}
            <button className="story-close" onClick={onClose} aria-label="Close story"><X size={24} /></button>
          </div>
        </div>

        {/* Media */}
        <div className="story-media">
          {currentStory.mediaType === "video" ? (
            <video src={currentStory.media} autoPlay muted playsInline aria-label="Story video" />
          ) : (
            <img src={currentStory.media} alt="Story content" />
          )}
        </div>

        {/* Navigation Zones */}
        <div className="story-nav-left" onClick={goPrev} role="button" aria-label="Previous story">
          {(storyIdx > 0 || groupIdx > 0) && <ChevronLeft size={28} />}
        </div>
        <div className="story-nav-right" onClick={goNext} role="button" aria-label="Next story">
          <ChevronRight size={28} />
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div 
              className="confirm-delete-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="confirm-delete-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3>Delete story?</h3>
                <p>Are you sure you want to delete this story? This action cannot be undone.</p>
                <div className="action-buttons">
                  <button className="btn-cancel" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                  <button className="btn-delete" onClick={handleDeleteStory} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryViewer;
