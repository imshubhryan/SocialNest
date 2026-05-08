import React from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { usePost } from "../../post/hook/usePost";
import "../style/profile.scss";

const PostGrid = ({ posts, isOwner, onPostClick }) => {
  const { deletePost } = usePost();
  
  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="empty-posts">
        <div className="empty-icon">📸</div>
        <h3>No Posts Yet</h3>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <div key={post._id} className="grid-item" onClick={() => onPostClick && onPostClick(post)} style={{ cursor: "pointer" }}>
          <img src={post.imgUrl} alt={post.caption} className="grid-image" loading="lazy" />
          <div className="grid-overlay">
            <div className="overlay-stats">
              <span className="stat"><Heart size={18} fill="white" /> {post.likesCount || 0}</span>
              <span className="stat"><MessageCircle size={18} fill="white" /> {post.commentsCount || 0}</span>
            </div>
            {isOwner && (
              <button className="grid-delete-btn" onClick={(e) => handleDelete(e, post._id)}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
