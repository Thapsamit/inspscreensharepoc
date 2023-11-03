const { app, BrowserWindow, ipcMain } = require("electron");

// allows ipc with react index.j and main.js of electron app
require("@electron/remote/main").initialize();

let captureWindow;
let mainWindow;

const initCapRect = {
  x: app.commandLine.hasSwitch("cx")
    ? parseInt(app.commandLine.getSwitchValue("cx"))
    : null,
  y: app.commandLine.hasSwitch("cy")
    ? parseInt(app.commandLine.getSwitchValue("cy"))
    : null,
  width: app.commandLine.hasSwitch("cw")
    ? parseInt(app.commandLine.getSwitchValue("cw"))
    : 500,
  height: app.commandLine.hasSwitch("ch")
    ? parseInt(app.commandLine.getSwitchValue("ch"))
    : 500,
};

function createCaptureWindow() {
  captureWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    width: initCapRect.width,
    height: initCapRect.height,
    transparent: true, // fancyzones only resizes non-transparent windows
    frame: false,
  });

  require("@electron/remote/main").enable(captureWindow.webContents);
  captureWindow.loadURL("http://localhost:3000/capture-window");
}
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
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
  mainWindow.setContentProtection(true);
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
