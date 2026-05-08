import React from "react";
import "../styles/_variables.scss";
import "../styles/_animations.scss";

export const Shimmer = () => (
  <div style={{
    width: "100%", height: "100%",
    background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite linear",
    borderRadius: "inherit"
  }} />
);

export const PostSkeleton = () => (
  <div style={{
    background: "rgba(20, 18, 30, 0.45)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "18px",
    padding: "16px", marginBottom: "20px", width: "100%"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <Shimmer />
      </div>
      <div style={{ display: "flex", flexDirection: "col", gap: "6px", flex: 1 }}>
        <div style={{ width: "120px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
        <div style={{ width: "60px", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginTop: "4px" }}><Shimmer /></div>
      </div>
    </div>
    <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: "12px", background: "rgba(255,255,255,0.03)", marginBottom: "16px" }}>
      <Shimmer />
    </div>
    <div style={{ width: "80%", height: "12px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "8px" }}><Shimmer /></div>
    <div style={{ width: "50%", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
  </div>
);

export const ProfileSkeleton = () => (
  <div style={{ width: "100%", padding: "24px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "32px" }}>
      <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}>
        <Shimmer />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ width: "150px", height: "24px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "12px" }}><Shimmer /></div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ width: "60px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
          <div style={{ width: "60px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
          <div style={{ width: "60px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
        </div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ width: "100%", aspectRatio: "1/1", borderRadius: "12px", background: "rgba(255,255,255,0.03)" }}>
          <Shimmer />
        </div>
      ))}
    </div>
  </div>
);

export const StorySkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "70px" }}>
    <div style={{ width: "62px", height: "62px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}>
      <Shimmer />
    </div>
    <div style={{ width: "45px", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
  </div>
);

export const NotificationSkeleton = () => (
  <div style={{
    display: "flex", alignItems: "center", gap: "12px", padding: "16px",
    background: "rgba(20, 18, 30, 0.2)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  }}>
    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}>
      <Shimmer />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ width: "180px", height: "12px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "6px" }}><Shimmer /></div>
      <div style={{ width: "80px", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
    </div>
    <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "rgba(255,255,255,0.03)" }}>
      <Shimmer />
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div style={{ display: "flex", gap: "12px", padding: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}>
      <Shimmer />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ width: "100px", height: "12px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "6px" }}><Shimmer /></div>
      <div style={{ width: "220px", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}><Shimmer /></div>
    </div>
  </div>
);
