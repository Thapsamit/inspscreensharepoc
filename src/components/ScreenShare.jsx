import React, { useEffect, useRef, useState } from "react";
import samplevideo from "./samplewebvideo.webm";
const { ipcRenderer } = window.require("electron");

let animateFrameId = undefined;
const ScreenShare = () => {
  const [currentDisplay, setCurrentDisplay] = useState(null);
  const [dispX, setDispX] = useState(0);
  const [dispY, setDispY] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  console.log("dispX", dispX);
  console.log("dispY", dispY);

  const handleScreenShare = () => {
    const dataToSend = { key: "value" }; // Your data here
    ipcRenderer.send("open-capture-window", dataToSend);
  };

  function renderVideoToCanvas(data, videoRef) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("capteur window bounds", data?.captureWindowBounds);

    function drawFrame() {
      // CanvasRenderingContext2D.drawImage (image, sx, sy, sw, sh, dx, dy, dw, dh)
      // cuts a rectangle (sx,sy,sw,sh) out of the source image and inserts it as (dx,dy,dw,dh) into the destination canvas.

      ctx.drawImage(
        videoRef.current,
        data?.captureWindowBounds?.x,
        data?.captureWindowBounds?.y,
        data?.captureWindowBounds?.width,
        data?.captureWindowBounds?.height,
        0,
        0,
        data?.captureWindowBounds?.width,
        data?.captureWindowBounds?.height
      );
      animateFrameId = window.requestAnimationFrame(drawFrame);
    }

    animateFrameId = window.requestAnimationFrame(drawFrame);
  }

  const handleStream = (stream, data) => {
    try {
      if (videoRef) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        renderVideoToCanvas(data, videoRef);
      }
    } catch (err) {
      console.log("error in displaying stream", err);
    }
  };

  const updatingScreenCapture = (data) => {
    try {
      if (canvasRef.current) {
        console.log("updating canvas...");
        if (animateFrameId) {
          window.cancelAnimationFrame(animateFrameId);
        }
        renderVideoToCanvas(data, videoRef);
      }
    } catch (err) {
      console.log("error in updating screen", err);
    }
  };

  const handleStopShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("handle stop", animateFrameId);

    if (animateFrameId) {
      console.log("clearing animate frame", animateFrameId);
      window.cancelAnimationFrame(animateFrameId);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  useEffect(() => {
    console.log("use effect runs..");
    ipcRenderer.on("update-screen-to-capture", async (event, data) => {
      if (!currentDisplay || data?.display?.id !== currentDisplay.id) {
        console.log("dislay", data?.display);
        setCurrentDisplay(data?.display);
        const { x: x, y: y } = data?.display?.bounds;
        setDispX(x ?? dispX);
        setDispY(y ?? dispY);
        setCanvasWidth(data?.captureWindowBounds?.width);
        setCanvasHeight(data?.captureWindowBounds?.height);
        console.log("data in update screen ", data);
        updatingScreenCapture(data);
      }
    });
    ipcRenderer.on("SET_SCREEN_SHARE", async (event, data) => {
      try {
        console.log("video withd height", data);
        const videoConstraints = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: data?.source?.id,
              maxWidth: data?.display?.bounds?.width,
              maxHeight: data?.display?.bounds?.height,
            },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );
        setCanvasWidth(data?.captureWindowBounds?.width);
        setCanvasHeight(data?.captureWindowBounds?.height);
        handleStream(stream, data);
      } catch (err) {
        console.log("error in screen share", err);
      }
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Screen Share App</h1>
      <button onClick={handleScreenShare}>Click to screen share</button>
      <button onClick={handleStopShare}>Stop screen </button>
      {/* <div style={{ width: "700px", height: "700px" }}> */}
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        muted
        hidden
      ></video>
      {/* </div> */}

      <div>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            background: "red",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        ></canvas>
      </div>
    </div>
  );
};

export default ScreenShare;
