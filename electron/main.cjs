const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3002;
const SERVER_URL = 'http://localhost:' + SERVER_PORT;

// Previne multiplas instancias do CineRapha rodando simultaneamente
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

function startBackendServer() {
  const serverScript = path.join(__dirname, '../server/index.js');
  
  // Inicia o servidor Node.js silenciosamente em segundo plano
  serverProcess = fork(serverScript, [], {
    cwd: path.join(__dirname, '..'),
    env: Object.assign({}, process.env, { PORT: String(SERVER_PORT), NODE_ENV: 'production' }),
    silent: true // sem janela de terminal aberta
  });

  serverProcess.on('error', (err) => {
    console.error('[CineRapha Native] Erro no servidor de fundo:', err);
  });
}

function waitForServer(callback, maxAttempts = 50) {
  let attempts = 0;
  const check = () => {
    attempts++;
    const req = http.get(SERVER_URL + '/api/movies', (res) => {
      if (res.statusCode === 200) {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 200);
      } else {
        callback();
      }
    });

    req.on('error', () => {
      if (attempts < maxAttempts) {
        setTimeout(check, 200);
      } else {
        callback();
      }
    });

    req.end();
  };

  check();
}

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icons/icon-512x512.png');

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    title: 'CineRapha',
    icon: iconPath,
    backgroundColor: '#141414',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.loadURL(SERVER_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();
  waitForServer(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
  }
});
