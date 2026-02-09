const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * File Operations
   */
  getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  openFile: (options) =>
    ipcRenderer.invoke('dialog:open-file', options),
  writeFile: (filepath, data) =>
    ipcRenderer.invoke('file:write', filepath, data),
  readFile: (filepath) =>
    ipcRenderer.invoke('file:read', filepath),

  /**
   * Platform Detection
   */
  platform: process.platform,
  arch: process.arch,

  /**
   * App Version
   */
  appVersion: process.versions.electron,

  /**
   * IPC for custom events
   */
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  off: (channel, func) => {
    ipcRenderer.off(channel, func);
  },
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  },
  invoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  },
});
