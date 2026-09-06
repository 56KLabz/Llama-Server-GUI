# Contributing to Llama Server GUI

Thank you for your interest in contributing to **Llama Server GUI**! 

Whether you're reporting a bug, adding new `llama.cpp` flags, improving hardware detection, or designing new themes, we welcome and appreciate your contributions.

---

## 🧭 Code of Conduct & Ground Rules

1. **Keep it Fast & Lean**:
   - Our core principle is **speed to the metal**. Avoid introducing heavy middleware, unnecessary runtimes, or unoptimized polling loops that degrade token throughput ($t/s$).
2. **Respect the License**:
   - All contributions will be licensed under the [Apache 2.0 License](LICENSE).
3. **Be Constructive & Respectful**:
   - Treat everyone with respect and empathy. Focus feedback on the code and architecture.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **Windows 10/11**: (Currently the primary target platform for `llama-server.exe` hardware orchestration)

### 2. Getting the Code
```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Llama-Server-GUI.git
cd Llama-Server-GUI

# Install dependencies
npm install

# Start Vite + Electron in development mode (with hot reloading)
npm run dev
```

### 3. Testing Production Builds
Before submitting a pull request, always verify that TypeScript compiles and the production bundle builds cleanly:
```bash
# Typecheck & build frontend
npm run build

# Verify electron-builder packaging (optional, tests installer generation)
npm run dist
```

---

## 🌿 Contribution Workflow

We follow standard GitHub Flow:

1. **Branching**:
   - Create a topic branch from `main`:
     ```bash
     git checkout -b feature/your-feature-name
     # or
     git checkout -b fix/your-bug-fix
     ```

2. **Commit Guidelines**:
   - We prefer conventional commit messages:
     - `feat: add ROCm / AMD GPU telemetry support`
     - `fix: resolve VRAM overflow calculation on multi-GPU systems`
     - `docs: update keyboard shortcuts in README`
     - `style: refine Dracula theme contrast in terminal`

3. **Submitting a Pull Request (PR)**:
   - Push your branch to your fork:
     ```bash
     git push origin feature/your-feature-name
     ```
   - Open a Pull Request against the `main` branch of `56KLabz/Llama-Server-GUI`.
   - Provide a clear summary of what you changed, why, and screenshots if you modified UI components.

---

## 💡 Areas Where We Love Contributions

- **Hardware Support**: Improving GPU and VRAM detection for AMD (ROCm), Intel Arc (oneAPI), and multi-GPU tensor-split rigs.
- **`llama.cpp` Feature Sync**: Adding newly merged `llama-server` flags and samplers as the upstream repository evolves.
- **Theme Contributions**: Submitting community-favorite color schemes in `src/data/themes.ts`.
- **Cross-Platform**: Exploratory work toward Linux / macOS support while keeping the Windows experience rock-solid.

---

<p align="center">
  <b>Brought to you with ❤️ by <a href="https://56klabz.io">56kLabz</a></b>
</p>
