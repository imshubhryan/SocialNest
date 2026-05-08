import React from "react";

const Logo = ({ size = "default" }) => {
  const imgSize = size === "large" ? 200 : size === "small" ? 80 : 150;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img
        src="/logo.png"
        alt="SocialNest"
        style={{
          width: imgSize,
          height: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export default Logo;
