import React from "react";

const { ipcRenderer } = window.require("electron");

ipcRenderer.on("update-renderer", (event, ...args) => {
  console.log("Data recieved inmain");
});
const ScreenShare = () => {
  const handleScreenShare = () => {
    const dataToSend = { key: "value" }; // Your data here
    ipcRenderer.send("open-capture-window", dataToSend);
  };
  return (
    <div>
      <h1>Screen Share App</h1>
      <button onClick={handleScreenShare}>Click to screen share</button>
    </div>
  );
};

export default ScreenShare;
