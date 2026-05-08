import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Bookmark, Share2, Send, Trash2, X } from "lucide-react";
import { usePost } from "../hook/usePost";
import { useAuth } from "../../auth/hooks/useAuth";
import * as commentApi from "../services/comment.api";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const timeAgo = (date) => {
  if (!date) return "1m ago";
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const PostModal = ({ post: initialPost, onClose, onPostUpdated }) => {
  const { user: currentUser } = useAuth();
  const { handleLike, handleSave } = usePost();
  
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (post?._id) {
      fetchComments();
    }
    // Body scroll lock
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [post?._id]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await commentApi.getPostComments(post._id);
      setComments(res.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDoubleTap = async () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 1000);

    if (!post.isLiked) {
      await handleLike(post._id);
      setPost(prev => ({
        ...prev,
        isLiked: true,
        likesCount: (prev.likesCount || 0) + 1
      }));
      if (onPostUpdated) onPostUpdated();
    }
  };

  const handleLikeToggle = async () => {
    await handleLike(post._id);
    setPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? Math.max(0, (prev.likesCount || 1) - 1) : (prev.likesCount || 0) + 1
    }));
    if (onPostUpdated) onPostUpdated();
  };

  const handleSaveToggle = async () => {
    await handleSave(post._id);
    setPost(prev => ({ ...prev, isSaved: !prev.isSaved }));
    if (onPostUpdated) onPostUpdated();
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    try {
      const res = await commentApi.addComment(post._id, text);
      setComments(prev => [...prev, { ...res.data, user: currentUser }]);
      setCommentText("");
      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      if (onPostUpdated) onPostUpdated();
      
      // Scroll to bottom
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      // ignore
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      setPost(prev => ({ ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) }));
      if (onPostUpdated) onPostUpdated();
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <motion.div 
      className="post-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="post-modal-close-global" onClick={onClose} aria-label="Close modal">
        <X size={28} />
      </button>

      {copyStatus && (
        <div className="share-toast">Link copied to clipboard!</div>
      )}

      <motion.div 
        className="post-modal-container"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Side */}
        <div className="post-modal-media" onDoubleClick={handleDoubleTap}>
          <img src={post.imgUrl} alt={post.caption} className="main-media-img" loading="lazy" />
          
          <AnimatePresence>
            {showHeartBurst && (
              <motion.div 
                className="heart-burst-container"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4 }}
              >
                <Heart size={80} fill="#f72585" stroke="#f72585" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Side */}
        <div className="post-modal-content">
          {/* Header */}
          <div className="content-header">
            <div className="user-profile">
              <img src={post.user?.profileImage || DEFAULT_AVATAR} alt={post.user?.username} className="user-avatar" />
              <div className="user-info">
                <span className="username">{post.user?.username}</span>
                <span className="location">SocialNest Premium</span>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="content-comments">
            {/* Caption (First Comment style) */}
            <div className="caption-comment">
              <img src={post.user?.profileImage || DEFAULT_AVATAR} alt={post.user?.username} className="comment-avatar" />
              <div className="comment-body">
                <p>
                  <span className="username">{post.user?.username}</span>
                  {post.caption}
                </p>
                <span className="timestamp">{timeAgo(post.createdAt)}</span>
              </div>
            </div>

            <hr className="divider" />

            {/* User Comments */}
            {loadingComments ? (
              <div className="comments-loading">
                <div className="spinner"></div>
                <span>Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="empty-comments">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <img src={comment.user?.profileImage || DEFAULT_AVATAR} alt={comment.user?.username} className="comment-avatar" />
                  <div className="comment-body">
                    <p>
                      <span className="username">{comment.user?.username}</span>
                      {comment.content}
                    </p>
                    <div className="comment-meta">
                      <span className="timestamp">{timeAgo(comment.createdAt)}</span>
                      {(comment.user?._id === currentUser?._id || currentUser?.role === "admin") && (
                        <button className="btn-comment-delete" onClick={() => handleCommentDelete(comment._id)} aria-label="Delete comment">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Action Bar */}
          <div className="content-actions">
            <div className="action-buttons">
              <div className="left-actions">
                <button className={`action-btn ${post.isLiked ? "liked" : ""}`} onClick={handleLikeToggle}>
                  <Heart size={24} fill={post.isLiked ? "#f72585" : "none"} />
                </button>
                <button className="action-btn" onClick={() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" })}>
                  <MessageCircle size={24} />
                </button>
                <button className="action-btn" onClick={handleShare}>
                  <Share2 size={24} />
                </button>
              </div>
              <button className={`action-btn ${post.isSaved ? "saved" : ""}`} onClick={handleSaveToggle}>
                <Bookmark size={24} fill={post.isSaved ? "#8e2de2" : "none"} />
              </button>
            </div>
            
            <div className="post-stats">
              <span className="likes-count">{post.likesCount || 0} likes</span>
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Comment Form */}
          <form className="content-form" onSubmit={handleCommentSubmit}>
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={200}
            />
            <button type="submit" disabled={!commentText.trim()} className="btn-submit">
              Post
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostModal;
