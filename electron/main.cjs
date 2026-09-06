const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');

// Set dedicated app name and isolated user data directory
app.setName('LlamaServerGUI');
try {
  const customUserData = path.join(app.getPath('appData'), 'LlamaServerGUI');
  if (!fs.existsSync(customUserData)) {
    fs.mkdirSync(customUserData, { recursive: true });
  }
  app.setPath('userData', customUserData);
} catch (e) {}

// Prevent multiple instances fighting over disk cache
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Suppress GPU disk cache lock collisions on Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow = null;
let runningProcess = null;

function killRunningProcess() {
  if (runningProcess) {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${runningProcess.pid} /T /F`);
      } else {
        runningProcess.kill('SIGTERM');
      }
    } catch (e) {}
    runningProcess = null;
  }
}

function checkDevServer(url) {
  return new Promise((resolve) => {
    try {
      const req = http.get(url, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(400, () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

async function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.ico');

  mainWindow = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    title: "Llama Server GUI",
    backgroundColor: "#050608",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  const devUrl = 'http://localhost:5173';
  
  if (process.env.NODE_ENV === 'development') {
    const isDevUp = await checkDevServer(devUrl);
    if (isDevUp) {
      mainWindow.loadURL(devUrl);
    } else if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      mainWindow.loadURL(devUrl);
    }
  } else {
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      const isDevUp = await checkDevServer(devUrl);
      if (isDevUp) {
        mainWindow.loadURL(devUrl);
      } else {
        mainWindow.loadFile(distPath);
      }
    }
  }

  mainWindow.on('closed', () => {
    killRunningProcess();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  killRunningProcess();
});

app.on('window-all-closed', () => {
  killRunningProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('dialog:openFile', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [{ name: 'All Files', extensions: ['*'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('dialog:saveFile', async (event, options = {}) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || 'run_llama.bat',
    filters: options.filters || [{ name: 'Batch Script', extensions: ['bat'] }, { name: 'PowerShell Script', extensions: ['ps1'] }, { name: 'JSON Profile', extensions: ['json'] }]
  });
  if (!result.canceled && result.filePath) {
    if (options.content) {
      fs.writeFileSync(result.filePath, options.content, 'utf8');
    }
    return result.filePath;
  }
  return null;
});

ipcMain.handle('shell:openExternal', async (event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://'))) {
    shell.openExternal(url);
    return true;
  }
  return false;
});

// Run --help and capture raw text
ipcMain.handle('llama:extractHelp', async (event, binaryPath) => {
  return new Promise((resolve) => {
    if (!binaryPath) {
      return resolve({ success: false, error: 'No binary path provided' });
    }
    exec(`"${binaryPath}" --help`, { maxBuffer: 1024 * 1024 * 10, windowsHide: true }, (error, stdout, stderr) => {
      const output = (stdout || '') + (stderr || '');
      if (output.trim().length > 0) {
        resolve({ success: true, output });
      } else if (error) {
        resolve({ success: false, error: error.message, output });
      } else {
        resolve({ success: false, error: 'Empty output returned from --help' });
      }
    });
  });
});

// AUTO-DISCOVERY SCANNER: Scans common paths for llama binaries and .gguf models
ipcMain.handle('llama:scanAssets', async (event, customSearchDirs = []) => {
  const userHome = os.homedir();
  const searchDirs = new Set([
    ...customSearchDirs,
    'C:\\llamacpp',
    'C:\\llamacpp\\build\\bin',
    'C:\\llama',
    'C:\\llama.cpp',
    'D:\\llamacpp',
    'D:\\llama',
    'D:\\models',
    'E:\\models',
    'C:\\ai\\models',
    path.join(userHome, 'Downloads'),
    path.join(userHome, 'Documents'),
    path.join(userHome, 'Projects'),
    path.join(userHome, 'Models'),
    path.join(userHome, '.cache', 'lm-studio', 'models'),
    path.join(userHome, '.ollama', 'models'),
    path.join(userHome, '.cache', 'huggingface', 'hub'),
    path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages'),
    'C:\\ProgramData\\chocolatey\\bin',
    process.cwd()
  ]);

  const binaries = [];
  const models = [];
  const projectors = [];
  const loras = [];

  function scanFolder(dirPath, depth = 0) {
    if (depth > 4 || !fs.existsSync(dirPath)) return;
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '$Recycle.Bin') {
            scanFolder(fullPath, depth + 1);
          }
        } else if (entry.isFile()) {
          const lowerName = entry.name.toLowerCase();
          
          if (lowerName === 'llama-server.exe' || lowerName === 'llama-cli.exe' || lowerName === 'llama-bench.exe' || lowerName === 'llama.exe' || (process.platform !== 'win32' && (lowerName === 'llama-server' || lowerName === 'llama-cli'))) {
            binaries.push({
              name: entry.name,
              path: fullPath,
              type: lowerName.includes('server') ? 'server' : 'cli'
            });
          }

          // Strict .gguf filtering only (prevents indexing .bin game files like DayZ)
          if (lowerName.endsWith('.gguf')) {
            let sizeGB = 0;
            try {
              const stat = fs.statSync(fullPath);
              sizeGB = Number((stat.size / (1024 * 1024 * 1024)).toFixed(2));
            } catch (e) {}

            const isProjector = lowerName.includes('mmproj') || lowerName.includes('clip') || lowerName.includes('projector');
            const isLora = lowerName.includes('lora') || lowerName.includes('adapter');

            const item = {
              name: entry.name,
              path: fullPath,
              sizeGB,
              folder: path.dirname(fullPath)
            };

            if (isProjector) {
              projectors.push(item);
            } else if (isLora) {
              loras.push(item);
            } else {
              models.push(item);
            }
          }
        }
      }
    } catch (err) {}
  }

  const pathEnv = process.env.PATH || '';
  const pathDirs = pathEnv.split(path.delimiter);
  for (const p of pathDirs) {
    if (fs.existsSync(p)) {
      try {
        const files = ['llama-server.exe', 'llama-cli.exe', 'llama-bench.exe', 'llama-server', 'llama-cli'];
        for (const f of files) {
          const fp = path.join(p, f);
          if (fs.existsSync(fp)) {
            binaries.push({
              name: f,
              path: fp,
              type: f.includes('server') ? 'server' : 'cli',
              fromPath: true
            });
          }
        }
      } catch (e) {}
    }
  }

  for (const dir of searchDirs) {
    scanFolder(dir, 0);
  }

  let uniqueBinaries = Array.from(new Map(binaries.map(b => [b.path, b])).values());
  
  // Prioritize dedicated GPU/CUDA builds (e.g. C:\llamacpp, C:\llama.cpp, cuda) ahead of WinGet or CPU
  uniqueBinaries.sort((a, b) => {
    const aLower = a.path.toLowerCase();
    const bLower = b.path.toLowerCase();
    const aScore = (aLower.includes('llamacpp') || aLower.includes('cuda')) ? 2 : (aLower.includes('llama') ? 1 : 0);
    const bScore = (bLower.includes('llamacpp') || bLower.includes('cuda')) ? 2 : (bLower.includes('llama') ? 1 : 0);
    return bScore - aScore;
  });

  const uniqueModels = Array.from(new Map(models.map(m => [m.path, m])).values());
  const uniqueProjectors = Array.from(new Map(projectors.map(p => [p.path, p])).values());
  const uniqueLoras = Array.from(new Map(loras.map(l => [l.path, l])).values());

  return {
    binaries: uniqueBinaries,
    models: uniqueModels,
    projectors: uniqueProjectors,
    loras: uniqueLoras
  };
});

// Launch server / CLI process
ipcMain.handle('llama:start', async (event, { binaryPath, args, cwd }) => {
  if (runningProcess) {
    return { success: false, error: 'A process is already running. Stop it first.' };
  }

  if (!binaryPath) {
    return { success: false, error: 'Please specify the binary executable path' };
  }

  try {
    const workingDir = cwd || path.dirname(binaryPath);
    runningProcess = spawn(binaryPath, args, {
      cwd: workingDir,
      windowsHide: false,
      shell: false
    });

    const pid = runningProcess.pid;

    runningProcess.stdout.on('data', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('llama:log', { type: 'stdout', text: data.toString() });
      }
    });

    runningProcess.stderr.on('data', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('llama:log', { type: 'stderr', text: data.toString() });
      }
    });

    runningProcess.on('error', (err) => {
      if (mainWindow) {
        mainWindow.webContents.send('llama:status', { state: 'error', error: err.message });
      }
      runningProcess = null;
    });

    runningProcess.on('close', (code) => {
      if (mainWindow) {
        mainWindow.webContents.send('llama:status', { state: 'stopped', exitCode: code });
      }
      runningProcess = null;
    });

    return { success: true, pid };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Stop server / CLI process
ipcMain.handle('llama:stop', async () => {
  if (!runningProcess) {
    return { success: true, message: 'No process was running' };
  }
  try {
    killRunningProcess();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('llama:isRunning', async () => {
  return runningProcess !== null;
});

// Accurate System info query with live memory & GPU stats
ipcMain.handle('system:getInfo', async () => {
  return new Promise((resolve) => {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const totalMemGB = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(1));
    const freeMemGB = Number((freeBytes / (1024 * 1024 * 1024)).toFixed(1));
    const usedMemGB = Number(((totalBytes - freeBytes) / (1024 * 1024 * 1024)).toFixed(1));
    const cpus = os.cpus();
    let cpuModel = cpus.length > 0 ? cpus[0].model.replace(/\s+/g, ' ').trim() : 'Unknown';
    const cpuCores = cpus.length;

    // Check for NVIDIA GPU first with nvidia-smi with live memory metrics
    exec('nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu --format=csv,noheader,nounits', (nErr, nStdout) => {
      let gpus = [];

      if (!nErr && nStdout && nStdout.trim()) {
        const lines = nStdout.trim().split(/\r?\n/);
        for (const line of lines) {
          const parts = line.split(',').map(s => s.trim());
          if (parts.length >= 2) {
            const name = parts[0];
            const totalMb = parseFloat(parts[1]);
            const usedMb = parts.length > 2 ? parseFloat(parts[2]) : NaN;
            const freeMb = parts.length > 3 ? parseFloat(parts[3]) : NaN;
            const util = parts.length > 4 ? parseFloat(parts[4]) : NaN;

            const vramGB = !isNaN(totalMb) ? Number((totalMb / 1024).toFixed(1)) : null;
            const usedVramGB = !isNaN(usedMb) ? Number((usedMb / 1024).toFixed(1)) : null;
            const freeVramGB = !isNaN(freeMb) ? Number((freeMb / 1024).toFixed(1)) : null;
            const gpuUtilPercent = !isNaN(util) ? Math.round(util) : null;

            gpus.push({ name, vramGB, usedVramGB, freeVramGB, gpuUtilPercent });
          } else if (parts.length === 1 && parts[0]) {
            gpus.push({ name: parts[0], vramGB: null });
          }
        }
      }

      // If no NVIDIA GPU found via nvidia-smi, check Windows WMI / DirectX
      if (gpus.length === 0) {
        exec('powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | Select-Object -Property Name, AdapterRAM | ConvertTo-Json"', (wErr, wStdout) => {
          try {
            if (wStdout) {
              const parsed = JSON.parse(wStdout);
              const list = Array.isArray(parsed) ? parsed : [parsed];
              for (const g of list) {
                if (g && g.Name && !g.Name.toLowerCase().includes('remote') && !g.Name.toLowerCase().includes('virtual')) {
                  const bytes = typeof g.AdapterRAM === 'number' ? g.AdapterRAM : parseInt(g.AdapterRAM);
                  const vramGB = bytes && bytes > 0 ? Number((bytes / (1024 * 1024 * 1024)).toFixed(1)) : null;
                  gpus.push({ name: g.Name, vramGB });
                }
              }
            }
          } catch (e) {}

          resolve({
            totalMemGB,
            freeMemGB,
            usedMemGB,
            cpuModel,
            cpuCores,
            gpus
          });
        });
      } else {
        resolve({
          totalMemGB,
          freeMemGB,
          usedMemGB,
          cpuModel,
          cpuCores,
          gpus
        });
      }
    });
  });
});
