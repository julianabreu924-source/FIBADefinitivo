const { BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const DEV_SERVER_URL = 'http://localhost:5173';

/**
 * Creates and returns the main application window.
 */
function createMainWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
        titleBarStyle: 'default',
        title: 'FIBA Stats System',
        show: false, // show only after content loads to avoid white flash
        backgroundColor: '#0a0a0a',
    });

    // Show window gracefully
    win.once('ready-to-show', () => {
        win.show();
    });

    if (isDev) {
        // In development: load Vite dev server
        win.loadURL(DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        // In production (AppImage): frontend is bundled in resources/frontend/dist/
        const indexPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
        win.loadFile(indexPath);
    }

    return win;
}

module.exports = { createMainWindow };
