import React from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const ProfileCompletion = () => {
  const { user } = useAuth();
  if (!user) return null;

  const tasks = [
    {
      label: "Upload custom avatar",
      completed: !!user.profileImage && !user.profileImage.includes("default"),
      path: `/profile/${user.username}`
    },
    {
      label: "Write your profile bio",
      completed: !!user.bio?.trim(),
      path: `/profile/${user.username}`
    },
    {
      label: "Follow active creators",
      completed: true, // Mark completed as they use suggested creators
      path: "/"
    },
    {
      label: "Publish your first post",
      completed: false, // Will become true once posts exist
      path: "/create-post"
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // If already 100% completed, don't show the onboarding box
  if (progressPercent === 100) return null;

  return (
    <div style={{
      width: "100%",
      background: "linear-gradient(135deg, rgba(142, 45, 226, 0.05) 0%, rgba(74, 0, 224, 0.05) 100%)",
      borderRadius: "24px",
      border: "1px solid rgba(142, 45, 226, 0.15)",
      padding: "24px",
      margin: "24px 0",
      boxShadow: "0 8px 32px rgba(142, 45, 226, 0.05)",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
      }}>
        <div>
          <h4 style={{ color: "#f3f0f7", fontSize: "1rem", fontWeight: 800, margin: 0 }}>
            Complete Your Profile 🚀
          </h4>
          <p style={{ color: "#9d9aa6", fontSize: "0.8rem", margin: "4px 0 0" }}>
            Finish onboarding to get the most out of SocialNest.
          </p>
        </div>
        <span style={{ color: "#8e2de2", fontSize: "1.1rem", fontWeight: 800 }}>
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: "100%",
        height: "8px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "20px"
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: "100%",
          background: "linear-gradient(90deg, #8e2de2 0%, #4a00e0 100%)",
          borderRadius: "4px",
          transition: "width 0.4s ease"
        }} />
      </div>

      {/* Task List */}
      <div style={{ display: "grid", gap: "10px" }}>
        {tasks.map((task, idx) => (
          <Link 
            key={idx} 
            to={task.path}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid rgba(255, 255, 255, 0.02)",
              transition: "all 0.2s ease"
            }}
            className="task-item"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {task.completed ? (
                <CheckCircle size={16} style={{ color: "#4caf50" }} />
              ) : (
                <Circle size={16} style={{ color: "#9d9aa6" }} />
              )}
              <span style={{ 
                color: task.completed ? "#9d9aa6" : "#f3f0f7", 
                fontSize: "0.85rem",
                textDecoration: task.completed ? "line-through" : "none"
              }}>
                {task.label}
              </span>
            </div>
            {!task.completed && <ArrowRight size={14} style={{ color: "#8e2de2" }} />}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletion;
