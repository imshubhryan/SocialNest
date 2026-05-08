import React, { useState, useRef } from "react";
import { X, Image, Upload, Loader2 } from "lucide-react";
import * as storyApi from "../services/story.api";
import "../style/story.scss";

const StoryUploadModal = ({ onClose, onDone }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await storyApi.uploadStory(file);
      onDone();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="story-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add to Story</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="upload-body">
          {!preview ? (
            <div className="upload-dropzone" onClick={() => fileRef.current.click()}>
              <Image size={48} className="dropzone-icon" />
              <p>Click to select photo or video</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="preview-container">
              {file?.type?.startsWith("video") ? (
                <video src={preview} controls className="media-preview" />
              ) : (
                <img src={preview} alt="Preview" className="media-preview" />
              )}
              <div className="preview-actions">
                <button className="btn-cancel" onClick={() => { setFile(null); setPreview(null); }}>
                  Change
                </button>
                <button className="btn-save" onClick={handleUpload} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Upload size={16} /> Share Story</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryUploadModal;
