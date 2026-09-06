const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('llamaAPI', {
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  extractHelp: (binaryPath) => ipcRenderer.invoke('llama:extractHelp', binaryPath),
  scanAssets: (customDirs) => ipcRenderer.invoke('llama:scanAssets', customDirs),
  startProcess: (params) => ipcRenderer.invoke('llama:start', params),
  stopProcess: () => ipcRenderer.invoke('llama:stop'),
  isRunning: () => ipcRenderer.invoke('llama:isRunning'),
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
  onLog: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('llama:log', handler);
    return () => ipcRenderer.removeListener('llama:log', handler);
  },
  onStatus: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('llama:status', handler);
    return () => ipcRenderer.removeListener('llama:status', handler);
  }
});
