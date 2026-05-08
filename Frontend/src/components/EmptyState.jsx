import React from "react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router";

const EmptyState = ({ 
  icon: Icon = Sparkles, 
  title = "Nothing here yet", 
  message = "Share your story or explore posts from friends!",
  actionLabel,
  actionPath,
  actionOnClick
}) => {
  return (
    <div className="empty-state-card" style={{
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      textAlign: "center", 
      padding: "40px 24px", 
      margin: "24px auto",
      width: "100%",
      maxWidth: "500px",
      borderRadius: "24px",
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Animated Glow */}
      <div style={{
        position: "absolute",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(142, 45, 226, 0.15) 0%, rgba(0,0,0,0) 70%)",
        top: "-50px",
        left: "-50px",
        pointerEvents: "none"
      }} />

      <div style={{
        width: "72px", 
        height: "72px", 
        borderRadius: "22px",
        background: "linear-gradient(135deg, rgba(142, 45, 226, 0.1) 0%, rgba(74, 0, 224, 0.1) 100%)", 
        display: "flex",
        alignItems: "center", 
        justifyContent: "center", 
        marginBottom: "20px",
        color: "#8e2de2", 
        border: "1px solid rgba(142, 45, 226, 0.2)",
        boxShadow: "0 4px 12px rgba(142, 45, 226, 0.1)"
      }}>
        <Icon size={32} />
      </div>

      <h3 style={{ 
        color: "#f3f0f7", 
        fontSize: "1.35rem", 
        fontWeight: 800, 
        marginBottom: "10px",
        letterSpacing: "-0.02em"
      }}>
        {title}
      </h3>
      
      <p style={{ 
        fontSize: "0.95rem", 
        color: "#9d9aa6", 
        lineHeight: 1.6,
        maxWidth: "360px",
        marginBottom: (actionLabel || actionPath) ? "24px" : "0"
      }}>
        {message}
      </p>

      {actionPath && (
        <Link 
          to={actionPath} 
          className="button primary-button"
          style={{
            padding: "10px 24px",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: 700,
            textDecoration: "none"
          }}
        >
          {actionLabel}
        </Link>
      )}

      {actionOnClick && (
        <button 
          onClick={actionOnClick}
          className="button primary-button"
          style={{
            padding: "10px 24px",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: 700
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
