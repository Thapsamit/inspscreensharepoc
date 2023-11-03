import React from "react";
import "./captureWindow.css";
const CaptureWindow = () => {
  return (
    <div class="border" style={{ WebkitAppRegion: "no-drag" }}>
      <div class="outer" style={{ WebkitAppRegion: "drag" }}>
        <div class="inner" style={{ WebkitAppRegion: "no-drag" }}></div>
      </div>
    </div>
  );
};

export default CaptureWindow;
