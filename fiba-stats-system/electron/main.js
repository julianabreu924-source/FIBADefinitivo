const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { startPythonBackend, stopPythonBackend } = require('./src/pythonProcess');
const { createMainWindow } = require('./src/windows');

let mainWindow = null;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

app.whenReady().then(async () => {
    // Start Python backend before creating the window
    await startPythonBackend();

    mainWindow = createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    stopPythonBackend();
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    stopPythonBackend();
});

// Open external links in browser
ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
});

// Handle printing
ipcMain.on('print', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.webContents.print({
        silent: false,
        printBackground: true,
        deviceName: ''
    });
});
