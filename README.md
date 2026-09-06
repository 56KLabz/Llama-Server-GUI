# 🦙 Llama Server GUI

> **The native, high-performance desktop control deck and flag configurator for `llama-server` and `llama.cpp`.**

[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows)](https://github.com/56KLabz/Llama-Server-GUI)
[![Engine: llama.cpp](https://img.shields.io/badge/Engine-llama.cpp%20%2F%20llama--server-amber)](https://github.com/ggml-org/llama.cpp)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-emerald)](LICENSE)
[![Brought to you by 56kLabz](https://img.shields.io/badge/56kLabz-56klabz.io-amber?logo=terminal)](https://56klabz.io)

**Llama Server GUI** is an all-in-one desktop cockpit designed to eliminate the command-line headaches of running `llama.cpp` and `llama-server`. It automatically detects your hardware, tunes your GPU layers, discovers your `.gguf` model files, and gives you a visual dashboard to configure, launch, and monitor local LLM inference at full unthrottled hardware speed.

---

## ⚡ 60-Second Quickstart (Beginner Friendly)

You don't need to know command-line flags, CUDA syntax, or batching equations to get started.

### Step 1: Install `llama.cpp` (If you don't already have it)
If you already have `llama-server.exe` (in `C:\llamacpp` or anywhere else), skip this step!

If you are starting fresh on Windows, open PowerShell and run:
```powershell
winget install ggml.llamacpp
```
*(Or grab the latest pre-compiled CUDA release zip from the [official llama.cpp releases](https://github.com/ggml-org/llama.cpp/releases)).*

---

### Step 2: Download & Install Llama Server GUI
Download the installer from the [Releases](https://github.com/56KLabz/Llama-Server-GUI/releases) page:
* **`Llama Server GUI Setup 1.0.0.exe`** — Standard Windows installer with desktop shortcut.
* **`Llama Server GUI 1.0.0.exe`** — Standalone portable executable (no install required, run from USB or any folder).

---

### Step 3: Launch & Start Chatting
1. **Launch the App**: The GUI automatically scans your `Downloads`, `Documents`, and system paths for your `llama-server.exe` binary and any `.gguf` models you've downloaded.
2. **Auto Hardware Detection**: If you have an NVIDIA GPU, it automatically configures all layers (`-ngl 99`) and Flash Attention (`-fa on`) to give you maximum tokens/sec out of the box.
3. **Click `START SERVER`**: Your local OpenAI-compatible API is now live!
4. **Chat**: Click the **API Playground** tab (`F3`) at the top to chat with your model immediately.

---

## 🔌 Connecting to Other Apps (OpenAI Compatible)

When your server is running, **Llama Server GUI** hosts a local OpenAI-compatible endpoint at:
```text
http://127.0.0.1:8080/v1
```

You can plug this URL directly into your favorite AI tools:
* **OpenWebUI / LibreChat**: Set Base URL to `http://127.0.0.1:8080/v1` (API Key: anything).
* **VS Code (Continue / Roo Code / Cline)**: Select "OpenAI Compatible" provider and point to port `8080`.
* **Obsidian (Smart Connections / BMO Chat)**: Use local base URL `http://127.0.0.1:8080/v1`.
* **SillyTavern**: Select Chat Completion $\rightarrow$ OpenAI $\rightarrow$ `http://127.0.0.1:8080/v1`.
* **Python / LangChain / AutoGen**:
  ```python
  from openai import OpenAI
  client = OpenAI(base_url="http://127.0.0.1:8080/v1", api_key="not-needed")
  response = client.chat.completions.create(
      model="default",
      messages=[{"role": "user", "content": "Hello!"}]
  )
  print(response.choices[0].message.content)
  ```

---

## ✨ Features Breakdown

- ⚙️ **100+ Configurable Flags**: Full visual control matrix covering GPU layer offloading, Flash Attention, KV Cache Quantization (`q8_0`, `q4_0`), samplers (temp, top-k, min-p, mirostat), context sizes, and multi-model router mode (`--models-dir`).
- ⚡ **Live Real-Time Hardware Telemetry**: Continuously polls and displays your exact GPU name, active VRAM utilization (`used / total GB`), GPU compute %, and system RAM in real time.
- 🔍 **Strict GGUF Asset Vault**: Automatically indexes all `.gguf` weights across your drives while strictly ignoring game binaries and unrelated `.bin` files.
- 🖥️ **Live Command String Builder**: Watch the exact `llama-server.exe <args>` string construct live in a read-only terminal box at the bottom of the screen. Includes one-click copy and export to Windows `.bat`, PowerShell `.ps1`, and JSON config profiles.
- 💬 **Integrated Chat Playground**: Test your prompt generation and model responses with streaming tokens directly in the app.
- 🎨 **7 Terminal Themes**: Switch instantly between **Noir Obsidian (Default)**, **Tokyo Night**, **Catppuccin Mocha**, **Dracula Dark**, **Gruvbox Retro**, **Nordic Frost**, and **Cyberpunk Neon** (`Ctrl+T`).
- 🚀 **Silent Launch Mode**: Native windowless launch via `Launch_GUI.vbs`—zero lingering black CMD console windows.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| `F1` | Switch to **Options Matrix** |
| `F2` | Switch to **Console Stream & Logs** |
| `F3` | Switch to **API Chat Playground** |
| `Ctrl + O` | Browse & Open GGUF Model File |
| `Ctrl + B` | Select Llama Executable Binary |
| `Ctrl + T` | Open Color Themes Palette |
| `Ctrl + \`` | Toggle Live Command Preview Bar |
| `Ctrl + Shift + S` | Open Local Models Vault Scanner |
| `Ctrl + H` | Ingest Flags Dynamically from `--help` |

---

## 🛠️ Building from Source (Developers)

If you'd like to build or modify Llama Server GUI locally:

```bash
# 1. Clone repository
git clone https://github.com/56KLabz/Llama-Server-GUI.git
cd Llama-Server-GUI

# 2. Install dependencies
npm install

# 3. Launch live hot-reloading dev environment
npm run dev

# 4. Compile production Windows NSIS installer & portable .exe
npm run dist
```
The compiled installer will be in the `dist-installer/` directory.

---

## 🤝 Contributing
Contributions are what make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please review our [Contributing Guidelines](CONTRIBUTING.md) for branch workflows, development setup, and code standards.

---

## 🛡️ License
Distributed under the Apache 2.0 License. See [LICENSE](LICENSE) for more information.

---

<p align="center">
  <b>Brought to you by <a href="https://56klabz.io">56kLabz</a></b><br>
  <i>"Speed, Control, and Pure Silicon."</i>
</p>
