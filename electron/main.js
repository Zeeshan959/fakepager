import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Select the correct icon format based on the OS
  // Windows prefers .ico, Mac/Linux prefer .png
  const isWin = process.platform === 'win32';
  const iconName = isWin ? 'pagerlo.ico' : 'icon.png';
  const iconPath = path.join(__dirname, '../public', iconName);

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Pagerlo',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // Set the window icon
    icon: iconPath
  });

  // Check if we are in development mode
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // In development, load from the Vite dev server
    win.loadURL('http://localhost:5173');
  } else {
    // In production, load the built html file
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  // Open external links (starting with http/https) in the system's default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Remove default menu for a cleaner "App-like" feel
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});