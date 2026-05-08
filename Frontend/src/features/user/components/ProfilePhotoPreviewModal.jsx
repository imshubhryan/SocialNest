import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const ProfilePhotoPreviewModal = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div 
      className="profile-preview-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="profile-preview-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src || DEFAULT_AVATAR} alt={alt || "Enlarged profile avatar"} className="enlarged-avatar-img" />
        <span className="hold-tip">Tap outside to dismiss</span>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePhotoPreviewModal;
