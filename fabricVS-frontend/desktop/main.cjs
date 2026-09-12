const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('node:child_process')
const path = require('node:path')

let backendProcess

function backendPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'fabric-vision-backend.exe')
    : path.join(app.getAppPath(), '..', 'fabricVS-desktop', 'backend-dist', 'fabric-vision-backend.exe')
}

function startBackend() {
  backendProcess = spawn(backendPath(), [], {
    windowsHide: true,
    env: {
      ...process.env,
      FABRIC_VISION_DATA_DIR: path.join(app.getPath('userData'), 'data'),
    },
    stdio: 'ignore',
  })

  backendProcess.on('error', (error) => {
    dialog.showErrorBox('Không thể khởi động Fabric Vision', error.message)
  })
}

async function waitForBackend(attempt = 0) {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/health')
    if (response.ok) return
  } catch {
    // The backend normally needs a short time to initialize SQLite and OpenCV.
  }
  if (attempt >= 40) throw new Error('Backend did not start within 20 seconds.')
  await new Promise((resolve) => setTimeout(resolve, 500))
  return waitForBackend(attempt + 1)
}

async function createWindow() {
  startBackend()
  try {
    await waitForBackend()
  } catch (error) {
    dialog.showErrorBox('Không thể khởi động Fabric Vision', error.message)
    app.quit()
    return
  }

  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#1c2227',
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  })
  await window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
app.on('before-quit', () => backendProcess?.kill())
