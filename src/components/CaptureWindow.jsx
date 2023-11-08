import React, { useEffect, useRef } from "react";
import "./captureWindow.css";
const { ipcRenderer } = window.require("electron");
const CaptureWindow = () => {
  const innerRef = useRef(null);

  useEffect(() => {
    const handleMouseEnter = () => {
      ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
      // console.log(`mouseenter, ignore: true`);
    };

    const handleMouseLeave = () => {
      ipcRenderer.send("set-ignore-mouse-events", false);
      // console.log(`mouseleave, ignore: false`);
    };

    if (innerRef.current) {
      innerRef.current.addEventListener("mouseenter", handleMouseEnter);
      innerRef.current.addEventListener("mouseleave", handleMouseLeave);
    }

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      if (innerRef.current) {
        innerRef.current.removeEventListener("mouseenter", handleMouseEnter);
        innerRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);
  return (
    <div class="border" style={{ WebkitAppRegion: "no-drag" }}>
      <div class="outer" style={{ WebkitAppRegion: "drag" }}>
        <div
          class="inner"
          ref={innerRef}
          style={{ WebkitAppRegion: "no-drag" }}
        ></div>
      </div>
    </div>
  );
};

export default CaptureWindow;
