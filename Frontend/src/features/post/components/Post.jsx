import React, { useState } from 'react'
import { usePost } from '../hook/usePost'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react'
import CommentSection from './CommentSection'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router'
import "../style/post.scss";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const Post = ({ user, post }) => {
  const { handleLike, handleSave, deletePost } = usePost()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [showComments, setShowComments] = useState(false)
  const [copyStatus, setCopyStatus] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const timeAgo = (date) => {
    if (!date) return '1m ago'
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${Math.max(1, mins)}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`
    navigator.clipboard.writeText(url)
    setCopyStatus(true)
    setTimeout(() => setCopyStatus(false), 2000)
  }

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post._id);
      setShowMenu(false);
    }
  }

  const navigateToProfile = () => {
    if (user?.username) {
      navigate(`/profile/${user.username}`);
    }
  }

  return (
    <div className="post">
      {/* Toast Notification for Copy */}
      {copyStatus && (
        <div className="share-toast">Link copied to clipboard!</div>
      )}

      <div className="post-header">
        <div className="user">
          <div className={`img-wrapper ${user?.hasActiveStory ? "has-story" : ""} ${user?.storyViewed ? "viewed" : ""}`} onClick={navigateToProfile} style={{ cursor: "pointer" }}>
            <img src={user?.profileImage || DEFAULT_AVATAR} alt={user?.username || "user"} loading="lazy" />
          </div>
          <div className="user-info">
            <span className="username" onClick={navigateToProfile} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              {user?.username}
              {user?.isVerified && (
                <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center" }} title="Verified account">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              )}
            </span>
            <span className="timestamp">{timeAgo(post?.createdAt)}</span>
          </div>
        </div>
        {(currentUser?._id === user?._id || currentUser?.role === 'admin') && (
          <div style={{ position: "relative" }}>
            <button className="post-menu" onClick={() => setShowMenu(!showMenu)} aria-label="Post options">
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="post-dropdown-menu" style={{
                position: "absolute", right: 0, top: "100%", background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px",
                padding: "4px", zIndex: 10, minWidth: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <button 
                  onClick={handleDeletePost} 
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px",
                    background: "none", border: "none", color: "#D32F2F", cursor: "pointer", fontSize: "0.85rem",
                    textAlign: "left", borderRadius: "6px"
                  }}
                  className="delete-post-option"
                >
                  <Trash2 size={14} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <img 
        className="post-image" 
        src={post?.imgUrl} 
        alt="post content" 
        onDoubleClick={() => handleLike(post._id)} 
        loading="lazy"
      />

      <div className="post-actions">
        <div className="left">
          <button
            className={`action-btn ${post?.isLiked ? 'liked' : ''}`}
            onClick={() => handleLike(post?._id)}
            aria-label={post?.isLiked ? "Unlike post" : "Like post"}
          >
            <Heart size={22} fill={post?.isLiked ? '#ed4956' : 'none'} color={post?.isLiked ? '#ed4956' : 'currentColor'} />
          </button>
          <button className="action-btn" onClick={() => setShowComments(true)} aria-label="View comments">
            <MessageCircle size={22} />
          </button>
          <button className="action-btn" onClick={handleShare} aria-label="Share post">
            <Share2 size={22} />
          </button>
        </div>
        <div className="right">
          <button 
            className={`action-btn ${post?.isSaved ? 'saved' : ''}`}
            onClick={() => handleSave(post?._id)}
            aria-label={post?.isSaved ? "Unsave post" : "Save post"}
          >
            <Bookmark size={22} fill={post?.isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="post-body">
        {post?.likesCount > 0 && (
          <div className="post-stats">
            {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
          </div>
        )}
        
        {post?.caption && (
          <p className="caption">
            <span className="caption-user" onClick={navigateToProfile} style={{ cursor: "pointer" }}>{user?.username}</span>
            {post.caption}
          </p>
        )}

        {post?.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map((tag, i) => (
              <span key={i} className="tag" onClick={() => navigate(`/search?query=${tag}`)} style={{ cursor: "pointer" }}>#{tag}</span>
            ))}
          </div>
        )}

        <button className="view-comments-btn" onClick={() => setShowComments(true)}>
          {post?.commentsCount > 0 ? `View all ${post.commentsCount} comments` : 'Add a comment'}
        </button>
      </div>

      {showComments && (
        <CommentSection 
          postId={post._id} 
          onClose={() => setShowComments(false)} 
        />
      )}
    </div>
  )
}

export default Post