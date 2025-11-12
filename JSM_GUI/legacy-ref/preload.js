const { contextBridge, ipcRenderer } = require('electron');

const api = {
  launchJSM: (delay = 3000) => ipcRenderer.invoke('launch-jsm', delay),
  terminateJSM: () => ipcRenderer.invoke('terminate-jsm'),
  saveStartupFile: (text) => ipcRenderer.invoke('save-startup', text),
  loadStartupFile: () => ipcRenderer.invoke('load-startup'),
  openKeymapUI: () => ipcRenderer.invoke('open-keymap-ui'),
  openTouchpadUI: () => ipcRenderer.invoke('open-touchpad-ui'),
  loadKeymapFile: (fileName) => ipcRenderer.invoke('load-keymap', fileName),
  saveKeymapFileToName: (fileName, content) => ipcRenderer.invoke('save-keymap', { fileName, content }),
  minimizeTemporarily: () => ipcRenderer.invoke('minimize-temporarily'),
  loadTouchFile: () => ipcRenderer.invoke('load-touch-file'),
  saveTouchFile: (content) => ipcRenderer.invoke('save-touch-file', content),
};

const telemetryListeners = new Set();
ipcRenderer.on('telemetry-sample', (_event, payload) => {
  telemetryListeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (err) {
      console.error('[telemetry] renderer callback failed', err);
    }
  });
});

contextBridge.exposeInMainWorld('electronAPI', api);
contextBridge.exposeInMainWorld('telemetry', {
  onSample: (callback) => {
    if (typeof callback !== 'function') return () => {};
    telemetryListeners.add(callback);
    return () => telemetryListeners.delete(callback);
  },
});
