import React from "react";
import { Loader2 } from "lucide-react";

const LoadingButton = ({ children, loading, className = "", disabled, ...props }) => {
  return (
    <button
      className={`button ${className}`}
      disabled={loading || disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
        transition: "all 0.25s"
      }}
      {...props}
    >
      {loading && <Loader2 size={16} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
};

export default LoadingButton;
