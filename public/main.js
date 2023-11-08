const {
  app,
  ipcMain,
  screen,
  BrowserWindow,
  desktopCapturer,
} = require("electron");

// allows ipc with react index.j and main.js of electron app
require("@electron/remote/main").initialize();

let captureWindow;
let mainWindow;

const initCapRect = {
  x: app.commandLine.hasSwitch("cx")
    ? parseInt(app.commandLine.getSwitchValue("cx"))
    : 0,
  y: app.commandLine.hasSwitch("cy")
    ? parseInt(app.commandLine.getSwitchValue("cy"))
    : 0,
  width: app.commandLine.hasSwitch("cw")
    ? parseInt(app.commandLine.getSwitchValue("cw"))
    : 500,
  height: app.commandLine.hasSwitch("ch")
    ? parseInt(app.commandLine.getSwitchValue("ch"))
    : 500,
};

function checkWindowBounds(win) {
  // function to calculate screen width height, x, y z position from screen
  const rect = win.getBounds();
  const dbounds = screen.getDisplayMatching(rect).bounds;
  console.log("rect capture window", rect);
  console.log("dbounds capture window", dbounds);
  console.log("primary display", screen.getPrimaryDisplay());
  rect.x = Math.max(rect.x, dbounds.x);
  rect.y = Math.max(rect.y, dbounds.y);
  rect.x = Math.min(rect.x, dbounds.x + 1920 - rect.width);
  rect.y = Math.min(rect.y, dbounds.y + 1080 - rect.height);
  win.setBounds(rect);
  const captureWindowBounds = win.getBounds();
  console.log("capture window final bound", captureWindowBounds);
  return captureWindowBounds;
}

function determineScreenToCapture(captureWindowBounds) {
  // this determine the screen that we need to capture from captureWindow.getBounds()
  const rect = captureWindow.getBounds();
  const display = screen.getDisplayMatching(rect);
  console.log("display", display);

  return display;
}

function updateScreenCapture(display, captureWindowBounds) {
  mainWindow.send("update-screen-to-capture", {
    display: display,
    captureWindowBounds: captureWindowBounds,
  });
}

async function determineDesktopCapture(display, captureWindowBounds) {
  const inputSources = await desktopCapturer.getSources({
    types: ["screen"],
  });

  inputSources.map((is) =>
    mainWindow.send("SET_SCREEN_SHARE", {
      source: is,
      display: display,
      captureWindowBounds: captureWindowBounds,
    })
  );
}
function createCaptureWindow() {
  captureWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    width: initCapRect.width,
    height: initCapRect.height,
    x: initCapRect.x,
    y: initCapRect.y,
    transparent: true, // fancyzones only resizes non-transparent windows
    frame: false,
    titleBarStyle: "hidden",
  });
  captureWindow.setContentProtection(true);

  require("@electron/remote/main").enable(captureWindow.webContents);

  captureWindow.on("resized", (event) => {
    const captureWindowBounds = checkWindowBounds(captureWindow);
    const display = determineScreenToCapture(captureWindowBounds);
    updateScreenCapture(display, captureWindowBounds);
  });
  captureWindow.on("moved", (event) => {
    console.log("capture window moved...");
    const captureWindowBounds = checkWindowBounds(captureWindow);
    const display = determineScreenToCapture(captureWindowBounds);
    updateScreenCapture(display, captureWindowBounds);
  });
  captureWindow.on("move", (event) => {
    console.log("capture window moving...");
    console.log("Capture window position", captureWindow.getPosition());
  });
  captureWindow.webContents.on("dom-ready", () => {
    console.log("Dom ready of capture window");
    const captureWindowBounds = checkWindowBounds(captureWindow);
    const display = determineScreenToCapture(captureWindowBounds);
    determineDesktopCapture(display, captureWindowBounds);
  });
  captureWindow.on("resize", (event) => {
    console.log("capture window ressizing...");
    console.log("capture window size", captureWindow.getSize());
  });
  captureWindow.on("close", () => {
    // Set captureWindow to null
    captureWindow = null;
  });

  captureWindow.loadURL("http://localhost:3000/capture-window");
}
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  require("@electron/remote/main").enable(mainWindow.webContents);

  ipcMain.on("open-capture-window", (event, ...args) => {
    createCaptureWindow();
  });

  ipcMain.on("set-ignore-mouse-events", (event, ...args) => {
    console.log("mouse entering");
    BrowserWindow.fromWebContents(event.sender).setIgnoreMouseEvents(...args);
  });

  // mainWindow.setContentProtection(true);
  mainWindow.on("closed", () => {
    if (captureWindow) {
      captureWindow.close();
    }
    app.quit();
  });

  mainWindow.loadURL("http://localhost:3000");
}

app.on("ready", createMainWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
