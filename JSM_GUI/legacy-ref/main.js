const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const dgram = require('dgram');

let mainWindow;
let jsmProcess = null;
let touchpadWin = null;
const TELEMETRY_PORT = 8974;
let telemetrySocket = null;
let lastTelemetryPacket = null;

function startTelemetryListener() {
  if (telemetrySocket) {
    return;
  }

  telemetrySocket = dgram.createSocket('udp4');
  telemetrySocket.on('error', err => {
    console.warn('[telemetry] socket error', err);
  });

  telemetrySocket.on('message', msg => {
    try {
      lastTelemetryPacket = JSON.parse(msg.toString('utf8'));
    } catch (err) {
      console.warn('[telemetry] malformed payload', err);
      return;
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('telemetry-sample', lastTelemetryPacket);
    }
  });

  telemetrySocket.bind(TELEMETRY_PORT, '127.0.0.1', () => {
    console.log(`[telemetry] listening on udp://127.0.0.1:${TELEMETRY_PORT}`);
  });
}

function stopTelemetryListener() {
  if (telemetrySocket) {
    telemetrySocket.close();
    telemetrySocket = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    if (lastTelemetryPacket) {
      mainWindow.webContents.send('telemetry-sample', lastTelemetryPacket);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  startTelemetryListener();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  stopTelemetryListener();
});

ipcMain.handle('save-startup', (event, text) => {
  const filePath = path.join(__dirname, 'OnStartUp.txt');
  return fs.promises.writeFile(filePath, text, 'utf8');
});

ipcMain.handle('load-startup', async () => {
  const filePath = path.join(__dirname, 'OnStartUp.txt');
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (err) {
    return '';
  }
});

ipcMain.handle('launch-jsm', (event, delay = 3000) => {
  if (jsmProcess) return Promise.resolve();
  const exePath = path.join(__dirname, 'JoyShockMapper.exe');
  const outLog = fs.openSync(path.join(__dirname, 'jsm_out.log'), 'a');
  const errLog = fs.openSync(path.join(__dirname, 'jsm_err.log'), 'a');

  jsmProcess = spawn(exePath, {
    cwd: __dirname,
    stdio: ['ignore', outLog, errLog],
    windowsHide: true
  });

  jsmProcess.on('exit', () => {
    jsmProcess = null;
  });

  if (mainWindow) {
    mainWindow.minimize();
    setTimeout(() => {
      mainWindow.restore();
      mainWindow.focus();
    }, delay);
  }

  return Promise.resolve();
});

ipcMain.handle('terminate-jsm', () => {
  if (!jsmProcess) return Promise.resolve();

  return new Promise(resolve => {
    jsmProcess.once('exit', () => {
      jsmProcess = null;
      if (mainWindow) {
        mainWindow.minimize();
        setTimeout(() => {
          mainWindow.restore();
          mainWindow.focus();
        }, 3000);
      }
      resolve();
    });
    jsmProcess.kill();
  });
});

ipcMain.handle('open-keymap-ui', () => {
  const keymapWin = new BrowserWindow({
    width: 1100,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  keymapWin.loadFile('keymap-ui.html');
});

ipcMain.handle('open-touchpad-ui', () => {
  if (touchpadWin && !touchpadWin.isDestroyed()) {
    touchpadWin.focus();
    return;
  }

  touchpadWin = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  touchpadWin.loadFile('touch.html');
  touchpadWin.on('closed', () => {
    touchpadWin = null;
  });
});

ipcMain.handle('load-touch-file', async () => {
  const filePath = path.join(__dirname, 'touch.txt');
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (err) {
    return '';
  }
});

ipcMain.handle('save-touch-file', async (event, content) => {
  const filePath = path.join(__dirname, 'touch.txt');
  try {
    await fs.promises.writeFile(filePath, content, 'utf8');
    return true;
  } catch (err) {
    return false;
  }
});

ipcMain.handle('load-keymap', async (event, fileName) => {
  const filePath = path.join(__dirname, fileName);
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (err) {
    return '';
  }
});

ipcMain.handle('save-keymap', async (event, { fileName, content }) => {
  const filePath = path.join(__dirname, fileName);
  try {
    await fs.promises.writeFile(filePath, content, 'utf8');
    return true;
  } catch (err) {
    return false;
  }
});

ipcMain.handle('minimize-temporarily', () => {
  if (mainWindow) {
    mainWindow.minimize();
    setTimeout(() => {
      mainWindow.restore();
      mainWindow.focus();
    }, 2500);
  }
});
