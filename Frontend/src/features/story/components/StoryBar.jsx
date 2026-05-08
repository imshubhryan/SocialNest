import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import * as storyApi from "../services/story.api";
import StoryViewer from "./StoryViewer";
import StoryUploadModal from "./StoryUploadModal";
import { StorySkeleton } from "../../../components/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import "../style/story.scss";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const StoryBar = () => {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await storyApi.getFollowingStories();
      setStoryGroups(res.data || []);
    } catch {
      setStoryGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (idx) => {
    setCurrentGroupIdx(idx);
    setViewerOpen(true);
  };

  const handleUploadDone = () => {
    setUploadOpen(false);
    fetchStories();
  };

  // Check if current user has stories
  const myGroup = storyGroups.find(g => g.user._id === user?._id || g.user.username === user?.username);

  return (
    <>
      <div className="story-bar">
        <div className="story-bar-scroll">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <motion.div
                  key={`story-skeleton-${n}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <StorySkeleton />
                </motion.div>
              ))
            ) : (
              <>
                {/* Your Story */}
                <motion.div
                  key="your-story"
                  className="story-item your-story"
                  onClick={() => myGroup ? openViewer(storyGroups.indexOf(myGroup)) : setUploadOpen(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Your story"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`story-ring ${myGroup ? "has-story" : "no-story"}`}>
                    <img src={user?.profileImage || DEFAULT_AVATAR} alt="You" className="story-avatar" loading="lazy" />
                    {!myGroup && (
                      <div className="add-story-badge"><Plus size={14} /></div>
                    )}
                  </div>
                  <span className="story-username">Your story</span>
                </motion.div>

                {/* Other Users' Stories */}
                {storyGroups.map((group, idx) => {
                  if (group.user.username === user?.username) return null;
                  return (
                    <motion.div
                      key={group.user._id}
                      className="story-item"
                      onClick={() => openViewer(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View story of ${group.user.username}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.2) }}
                    >
                      <div className={`story-ring ${group.hasUnviewed ? "unseen" : "seen"}`}>
                        <img src={group.user.profileImage || DEFAULT_AVATAR} alt={group.user.username} className="story-avatar" loading="lazy" />
                      </div>
                      <span className="story-username">{group.user.username}</span>
                    </motion.div>
                  );
                })}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {viewerOpen && storyGroups.length > 0 && (
        <StoryViewer
          storyGroups={storyGroups}
          startIndex={currentGroupIdx}
          onClose={() => setViewerOpen(false)}
          onStoryDeleted={fetchStories}
        />
      )}

      {uploadOpen && (
        <StoryUploadModal onClose={() => setUploadOpen(false)} onDone={handleUploadDone} />
      )}
    </>
  );
};

export default StoryBar;
