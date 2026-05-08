import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { UserPlus, Check, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

const SuggestedCreators = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get("/api/users/suggestions");
        setCreators(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load suggested creators:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleFollow = async (username, id) => {
    try {
      await api.post(`/api/users/follow/${username}`);
      setFollowedIds((prev) => [...prev, id]);
    } catch (err) {
      console.error("Follow action failed:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#9d9aa6" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
        <span>Finding amazing creators...</span>
      </div>
    );
  }

  if (creators.length === 0) return null;

  return (
    <div style={{
      width: "100%",
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      padding: "24px",
      margin: "24px 0",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "18px"
      }}>
        <Sparkles size={18} style={{ color: "#38bdf8" }} />
        <h4 style={{
          color: "#f3f0f7",
          fontSize: "1rem",
          fontWeight: 800,
          margin: 0,
          letterSpacing: "-0.01em"
        }}>
          Suggested Creators For You
        </h4>
      </div>

      <div style={{
        display: "flex",
        gap: "16px",
        overflowX: "auto",
        paddingBottom: "12px",
        scrollbarWidth: "thin"
      }} className="hide-scrollbar">
        {creators.map((c, idx) => {
          const isFollowed = followedIds.includes(c._id);
          return (
            <motion.div 
              key={c._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -6, scale: 1.02, border: "1px solid rgba(56, 189, 248, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.05 }}
              style={{
                flex: "0 0 160px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "20px 16px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.015)",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                cursor: "pointer"
              }}
              className="creator-card"
            >
              <Link to={`/profile/${c.username}`} style={{ position: "relative", display: "inline-block" }}>
                <img 
                  src={c.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                  alt={c.username}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: c.hasActiveStory 
                      ? "2px solid transparent" 
                      : "2px solid rgba(255, 255, 255, 0.1)",
                    backgroundImage: c.hasActiveStory 
                      ? "linear-gradient(#000, #000), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" 
                      : "none",
                    backgroundOrigin: "border-box",
                    backgroundClip: "content-box, border-box",
                    marginBottom: "12px",
                    padding: c.hasActiveStory ? "2px" : "0"
                  }}
                />
              </Link>

              <Link to={`/profile/${c.username}`} style={{ textDecoration: "none", width: "100%" }}>
                <span style={{
                  color: "#f3f0f7",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%"
                }}>
                  {c.username}
                  {c.isVerified && (
                    <span style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center" }} title="Verified account">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  )}
                </span>
                <span style={{
                  color: "#9d9aa6",
                  fontSize: "0.75rem",
                  display: "block",
                  marginBottom: "14px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%"
                }}>
                  {c.fullName || "@" + c.username}
                </span>
              </Link>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFollow(c.username, c._id)}
                className={`button ${isFollowed ? "secondary-button" : "primary-button"}`}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  border: isFollowed ? "1px solid rgba(255, 255, 255, 0.15)" : "none",
                  background: isFollowed ? "rgba(255, 255, 255, 0.05)" : "#38bdf8",
                  color: isFollowed ? "#f3f0f7" : "#0f0c1b",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {isFollowed ? (
                  <>
                    <Check size={12} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={12} />
                    <span>Follow</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedCreators;
