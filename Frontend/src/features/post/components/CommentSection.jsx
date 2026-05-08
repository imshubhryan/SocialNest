import React, { useState, useEffect } from 'react';
import { Send, Trash2, X } from 'lucide-react';
import * as commentApi from '../services/comment.api';
import { useAuth } from '../../auth/hooks/useAuth';
import "../style/post.scss";

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
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const CommentSection = ({ postId, onClose, onCommentAdded }) => {
  const { user: currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentApi.getPostComments(postId);
      setComments(res.data || []);
    } catch (err) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    if (trimmed.length > 500) {
      setError("Comment must be under 500 characters");
      return;
    }

    try {
      setError('');
      const newComment = await commentApi.addComment(postId, trimmed);
      setComments(prev => [{ ...newComment.data, user: currentUser }, ...prev]);
      setCommentText('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post comment");
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentApi.deleteComment(id);
      setComments(prev => prev.filter(c => c._id !== id));
      if (onCommentAdded) onCommentAdded(-1); // can adjust count if needed
    } catch (err) {
      // silently handle
    }
  };

  return (
    <div className="comment-slide-panel">
      <div className="panel-header">
        <h4>Comments</h4>
        <button className="close-btn" onClick={onClose} aria-label="Close comments"><X size={20} /></button>
      </div>

      <div className="comments-list">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : comments.length === 0 ? (
          <div className="empty-state">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map(c => (
            <div key={c._id} className="comment-item">
              <img src={c.user?.profileImage || DEFAULT_AVATAR} alt={c.user?.username || "user"} className="comment-avatar" loading="lazy" />
              <div className="comment-content">
                <p>
                  <span className="username">{c.user?.username}</span>
                  {c.content}
                </p>
                <span className="time-ago">{timeAgo(c.createdAt)}</span>
              </div>
              {(c.user?._id === currentUser?._id || currentUser?.role === 'admin') && (
                <button className="delete-btn" onClick={() => handleDelete(c._id)} aria-label="Delete comment"><Trash2 size={14} /></button>
              )}
            </div>
          ))
        )}
      </div>

      {error && <div className="form-error" style={{ color: "#D32F2F", fontSize: "0.75rem", padding: "0.5rem 1rem", background: "rgba(211,47,47,0.05)" }}>{error}</div>}

      <form className="comment-input-area" onSubmit={handleSubmit}>
        <img src={currentUser?.profileImage || DEFAULT_AVATAR} alt="You" className="user-avatar" loading="lazy" />
        <input 
          type="text" 
          placeholder="Add a comment..." 
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            if (error) setError('');
          }}
          maxLength={500}
          aria-label="Write a comment"
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button type="submit" disabled={!commentText.trim()} aria-label="Send comment"><Send size={18} /></button>
          <span style={{ fontSize: "0.6rem", color: "#aaa", marginTop: "2px" }}>{commentText.length}/500</span>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
