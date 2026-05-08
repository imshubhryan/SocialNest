import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { Grid3x3, Bookmark, Camera } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import ProfileHeader from "../components/ProfileHeader";
import PostGrid from "../components/PostGrid";
import EditProfileModal from "../components/EditProfileModal";
import SettingsModal from "../../settings/components/SettingsModal";
import PostModal from "../../post/components/PostModal";
import StoryViewer from "../../story/components/StoryViewer";
import StoryUploadModal from "../../story/components/StoryUploadModal";
import * as storyApi from "../../story/services/story.api";
import * as userApi from "../services/user.api";
import { getSavedPosts } from "../../post/services/post.api";
import { ProfileSkeleton } from "../../../components/Skeletons";
import EmptyState from "../../../components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import "../style/profile.scss";

const Profile = () => {
  const { username } = useParams();
  const { user: loggedInUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [storyGroups, setStoryGroups] = useState([]);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      const res = await storyApi.getFollowingStories();
      setStoryGroups(res.data || []);
    } catch {
      setStoryGroups([]);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getUserProfile(username);
      setProfile(res.data);
      await fetchStories();
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username, fetchStories]);

  const fetchSavedPosts = async () => {
    try {
      setLoadingSaved(true);
      const res = await getSavedPosts();
      setSavedPosts(res.data || []);
    } catch {
      setSavedPosts([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedPosts();
    }
  }, [activeTab]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await userApi.unfollowUser(profile.username);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          isPending: false,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
      } else {
        const res = await userApi.followUser(profile.username);
        const newStatus = res.data?.status;
        setProfile((prev) => ({
          ...prev,
          isFollowing: newStatus === "accepted",
          isPending: newStatus === "pending",
          followersCount: newStatus === "accepted" ? prev.followersCount + 1 : prev.followersCount,
        }));
      }
    } catch {
      // silently handle
    }
  };

  const handleSaveProfile = async (formData) => {
    const res = await userApi.updateProfile(formData);
    setProfile((prev) => ({ ...prev, ...res.data }));
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="profile-page">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page" style={{ padding: "40px 16px" }}>
        <EmptyState
          icon={Camera}
          title="User Not Found"
          message={`The user profile for @${username} does not exist or has been disabled.`}
        />
      </div>
    );
  }

  const isOwner = loggedInUser?.username === profile.username;

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ paddingBottom: "80px" }}
    >
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        onEditClick={() => setShowEditModal(true)}
        onSettingsClick={() => setShowSettings(true)}
        onFollowToggle={handleFollowToggle}
        hasActiveStory={storyGroups.find(g => g.user.username === profile.username)?.stories?.length > 0}
        onAvatarClick={() => setStoryViewerOpen(true)}
        onAddStoryClick={() => setUploadOpen(true)}
      />

      {/* Tabs */}
      <div className="profile-tabs">
        <div
          className={`tab-item ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
          role="button"
          tabIndex={0}
          aria-label="View posts grid"
        >
          <Grid3x3 size={14} /> Posts
        </div>
        {isOwner && (
          <div
            className={`tab-item ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
            role="button"
            tabIndex={0}
            aria-label="View saved posts"
          >
            <Bookmark size={14} /> Saved
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <PostGrid posts={profile.posts} isOwner={isOwner} onPostClick={setSelectedPost} />
          </motion.div>
        )}
        {activeTab === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {loadingSaved ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <PostGrid posts={savedPosts} isOwner={isOwner} onPostClick={setSelectedPost} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <PostModal 
            post={{ ...selectedPost, user: profile }}
            onClose={() => setSelectedPost(null)}
            onPostUpdated={fetchProfile}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {storyViewerOpen && storyGroups.find(g => g.user.username === profile.username) && (
          <StoryViewer
            storyGroups={storyGroups}
            startIndex={storyGroups.indexOf(storyGroups.find(g => g.user.username === profile.username))}
            onClose={() => setStoryViewerOpen(false)}
            onStoryDeleted={fetchProfile}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadOpen && (
          <StoryUploadModal 
            onClose={() => setUploadOpen(false)} 
            onDone={() => {
              setUploadOpen(false);
              fetchProfile();
            }} 
          />
        )}
      </AnimatePresence>

      {showEditModal && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showSettings && (
        <SettingsModal
          user={profile}
          onClose={() => setShowSettings(false)}
          onProfileUpdate={(data) => setProfile(prev => ({ ...prev, ...data }))}
        />
      )}
    </motion.div>
  );
};

export default Profile;
