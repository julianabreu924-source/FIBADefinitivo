const { app } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

let pythonProcess = null;
const BACKEND_PORT = 8000;
const MAX_RETRIES = 30;    // 30 × 500ms = 15 seconds max wait
const RETRY_INTERVAL = 500; // ms between retries

/**
 * Check if the backend is already running on the given port.
 */
function isPortOpen(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(300);
        socket.once('connect', () => { socket.destroy(); resolve(true); });
        socket.once('error', () => { socket.destroy(); resolve(false); });
        socket.once('timeout', () => { socket.destroy(); resolve(false); });
        socket.connect(port, '127.0.0.1');
    });
}

/**
 * Wait until the backend is accepting connections (or timeout).
 */
async function waitForBackend(retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        const open = await isPortOpen(BACKEND_PORT);
        if (open) return true;
        await new Promise(r => setTimeout(r, RETRY_INTERVAL));
    }
    return false;
}

/**
 * Start the Python FastAPI backend.
 * In development: the backend is expected to be running already.
 * In production: we spawn the bundled Python executable.
 */
async function startPythonBackend() {
    const isDev = process.env.NODE_ENV === 'development';

    // If already running (e.g. dev server started manually), just wait for it
    const alreadyRunning = await isPortOpen(BACKEND_PORT);
    if (alreadyRunning) {
        console.log('[Electron] Backend already running on port', BACKEND_PORT);
        return;
    }

    if (isDev) {
        // In development, the developer should start the backend manually.
        // We just wait a bit for it to come up.
        console.log('[Electron] DEV mode: waiting for backend...');
        const ready = await waitForBackend();
        if (!ready) {
            console.warn('[Electron] Backend did not start in time. App will try to connect anyway.');
        }
        return;
    }

    // PRODUCTION: spawn the bundled backend
    // With --onedir, the executable is at backend/backend (file)
    const exeName = process.platform === 'win32' ? 'backend.exe' : 'backend';
    const backendExe = path.join(process.resourcesPath, 'backend', exeName);
    const backendDir = path.dirname(backendExe);

    // FIX permissions on Linux/macOS
    if (process.platform !== 'win32') {
        try {
            fs.chmodSync(backendExe, '755');
            console.log('[Electron] Set executable permissions for:', backendExe);
        } catch (err) {
            console.error('[Electron] Failed to set permissions:', err);
        }
    }

    // Ensure DB is writable by copying it to the User Data folder if it doesn't exist
    const userDataPath = app.getPath('userData');
    const destDbPath = path.join(userDataPath, 'fiba_stats.db');
    // Source DB should be in the same dir as the backend usually
    const sourceDbPath = path.join(backendDir, 'fiba_stats.db');

    if (!fs.existsSync(destDbPath) && fs.existsSync(sourceDbPath)) {
        console.log('[Electron] Copying initial database to:', destDbPath);
        fs.copyFileSync(sourceDbPath, destDbPath);
    }

    console.log('[Electron] Starting backend at:', backendExe);

    pythonProcess = spawn(backendExe, [], {
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            PYTHONUNBUFFERED: '1',
            DATABASE_URL: `sqlite:///${destDbPath}`,
            DEBUG: '0' // Force debug off in production
        },
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log('[Backend]', data.toString().trim());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('[Backend ERR]', data.toString().trim());
    });

    pythonProcess.on('exit', (code) => {
        console.log('[Electron] Backend exited with code', code);
        pythonProcess = null;
    });

    // Wait for the backend to be ready
    const ready = await waitForBackend();
    if (ready) {
        console.log('[Electron] Backend is ready!');
    } else {
        console.warn('[Electron] Backend did not respond in time.');
    }
}

/**
 * Gracefully stop the Python backend process if we spawned it.
 */
function stopPythonBackend() {
    if (pythonProcess) {
        console.log('[Electron] Stopping backend...');
        pythonProcess.kill('SIGTERM');
        pythonProcess = null;
    }
}

module.exports = { startPythonBackend, stopPythonBackend };
