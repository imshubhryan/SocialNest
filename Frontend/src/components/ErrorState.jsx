import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({ message = "Something went wrong. Please check your connection.", onRetry }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "32px 16px", color: "#f72585", width: "100%", maxWidth: "400px",
    margin: "0 auto", background: "rgba(247, 37, 133, 0.03)", borderRadius: "18px",
    border: "1px solid rgba(247, 37, 133, 0.12)"
  }}>
    <AlertCircle size={32} style={{ marginBottom: "12px" }} />
    <p style={{ fontSize: "0.9rem", color: "#9d9aa6", marginBottom: "16px", lineHeight: 1.4 }}>{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          display: "flex", alignItems: "center", gap: "8px", background: "rgba(142, 45, 226, 0.1)",
          color: "#8e2de2", border: "1px solid rgba(142, 45, 226, 0.2)", borderRadius: "8px",
          padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(142, 45, 226, 0.18)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(142, 45, 226, 0.1)"; }}
      >
        <RefreshCw size={14} /> Retry
      </button>
    )}
  </div>
);

export default ErrorState;
