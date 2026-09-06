# 🦙 Llama Server GUI

> **The native, high-performance desktop control deck and flag configurator for `llama-server` and `llama.cpp`.**

[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows)](https://github.com/56KLabz/Llama-Server-GUI)
[![Engine: llama.cpp](https://img.shields.io/badge/Engine-llama.cpp%20%2F%20llama--server-amber)](https://github.com/ggml-org/llama.cpp)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald)](LICENSE)
[![Brought to you by 56kLabz](https://img.shields.io/badge/56kLabz-56klabz.io-amber?logo=terminal)](https://56klabz.io)

**Llama Server GUI** transforms complex command-line flags into an intuitive, high-octane desktop interface. Launch, monitor, and tune local GGUF models on your GPU with zero syntax headaches.

---

## ✨ Features

- ⚙️ **100+ Configurable Flags**: Full visual matrix covering GPU layers, Flash Attention, KV quantization (`q8_0`, `q4_0`), samplers, batch sizes, and multi-model router mode.
- ⚡ **Live Hardware Telemetry & Auto-Tuning**: Real-time NVIDIA GPU, VRAM, and RAM detection with automatic layer offloading (`-ngl 99`) and continuous VRAM polling.
- 🔍 **GGUF Asset Vault**: Automatically scans common directories and custom drives for `llama-server`, `llama-cli`, and `.gguf` weights while filtering out unrelated `.bin` files.
- 🖥️ **Live Command Preview**: Real-time reactive CLI command string builder with syntax highlighting, one-click copy, and script export (`.bat`, `.ps1`, `.json`).
- 💬 **Built-in API Playground**: Test chat completions directly against your running local server without needing third-party clients.
- 🎨 **7 Terminal Color Themes**: Switch instantly between **Noir Obsidian**, **Tokyo Night**, **Catppuccin Mocha**, **Dracula Dark**, **Gruvbox Retro**, **Nordic Frost**, and **Cyberpunk Neon** (`Ctrl+T`).
- 🚀 **Silent Launcher**: Windowless launch mode with zero persistent CMD console windows.

---

## 🛠️ Quick Start

### 1. Requirements
- Windows 10/11 (64-bit)
- NVIDIA GPU with CUDA drivers (or CPU fallback)
- [`llama.cpp`](https://github.com/ggml-org/llama.cpp/releases) binaries (`llama-server.exe` / `llama-cli.exe`)

### 2. Download Prebuilt Binaries
Download the latest Windows installer or portable `.exe` from the [Releases](https://github.com/56KLabz/Llama-Server-GUI/releases) page:
- `Llama Server GUI Setup 1.0.0.exe` (NSIS Desktop Installer)
- `Llama Server GUI 1.0.0.exe` (Single-file Portable)

### 3. Build from Source
```bash
# Clone the repository
git clone https://github.com/56KLabz/Llama-Server-GUI.git
cd Llama-Server-GUI

# Install dependencies
npm install

# Start in development mode
npm run dev

# Package production installer & portable exe
npm run dist
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `F1` | Options Matrix Tab |
| `F2` | Console Logs Tab |
| `F3` | API Chat Playground Tab |
| `Ctrl + O` | Browse & Open GGUF Model |
| `Ctrl + B` | Select Llama Binary |
| `Ctrl + T` | Open Color Themes Palette |
| `Ctrl + \`` | Toggle Live Command Box |
| `Ctrl + Shift + S` | Open Local Models Vault Scanner |
| `Ctrl + H` | Ingest Flags from `--help` |

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <b>Brought to you by <a href="https://56klabz.io">56kLabz</a></b><br>
  <i>"Speed, Control, and Pure Silicon."</i>
</p>
