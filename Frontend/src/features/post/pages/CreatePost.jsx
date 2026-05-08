import React, { useRef, useState } from "react";
import "../style/createpost.scss";
import { usePost } from "../hook/usePost";
import { useNavigate } from "react-router";
import { ImagePlus } from "lucide-react";

const CreatePost = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const postImageinputFieldRef = useRef(null);
  const { handleCreatePost } = usePost();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous preview to prevent memory leak
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = postImageinputFieldRef.current.files[0];
    if (!file) {
      setError("Please select an image");
      return;
    }
    if (caption.length > 2200) {
      setError("Caption must be under 2200 characters");
      return;
    }
    
    setError("");
    setSubmitting(true);
    try {
      // Await upload before navigating — fixes race condition
      await handleCreatePost(file, caption, tags);
      // Cleanup
      if (preview) URL.revokeObjectURL(preview);
      navigate("/");
    } catch (err) {
      setError("Failed to create post. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="create-post-page">
      <div className="create-post-card">
        <h2>Create Post</h2>

        {error && <div className="form-error" style={{ marginBottom: "1rem", color: "#D32F2F", fontSize: "0.85rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div
            className={`image-upload-area ${preview ? 'has-preview' : ''}`}
            onClick={() => postImageinputFieldRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <>
                <ImagePlus size={40} className="upload-icon" />
                <span className="upload-text">Click to upload image</span>
                <span className="upload-hint">JPG, PNG, WEBP up to 5MB</span>
              </>
            )}
          </div>
          <input
            ref={postImageinputFieldRef}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
          />

          <div className="input-group">
            <label htmlFor="caption">Caption</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={2200}
            />
            <span style={{ textAlign: "right", fontSize: "0.7rem", color: "#aaa" }}>
              {caption.length}/2200
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              type="text"
              placeholder="e.g. travel, food, tech (comma separated)"
            />
          </div>

          <button
            className="button primary-button create-post-btn"
            disabled={submitting}
            aria-label="Publish post"
          >
            {submitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreatePost;
