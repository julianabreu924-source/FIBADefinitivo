const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a safe, sandboxed API to the renderer process.
 * Never expose ipcRenderer directly - only expose specific methods.
 */
contextBridge.exposeInMainWorld('electronAPI', {
    // Open an external URL in the system browser
    openExternal: (url) => ipcRenderer.send('open-external', url),

    // Expose environment info
    platform: process.platform,
    isElectron: true,

    // Trigger printing
    print: () => ipcRenderer.send('print'),
});
