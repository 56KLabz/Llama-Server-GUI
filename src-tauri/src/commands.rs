use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use sysinfo::System;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredBinary {
    pub name: String,
    pub path: String,
    pub r#type: String,
    #[serde(rename = "fromPath", skip_serializing_if = "Option::is_none")]
    pub from_path: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredModel {
    pub name: String,
    pub path: String,
    #[serde(rename = "sizeGB")]
    pub size_gb: f64,
    pub folder: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredAssets {
    pub binaries: Vec<DiscoveredBinary>,
    pub models: Vec<DiscoveredModel>,
    pub projectors: Vec<DiscoveredModel>,
    pub loras: Vec<DiscoveredModel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    #[serde(rename = "vramGB")]
    pub vram_gb: Option<f64>,
    #[serde(rename = "usedVramGB")]
    pub used_vram_gb: Option<f64>,
    #[serde(rename = "freeVramGB")]
    pub free_vram_gb: Option<f64>,
    #[serde(rename = "gpuUtilPercent")]
    pub gpu_util_percent: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    #[serde(rename = "totalMemGB")]
    pub total_mem_gb: f64,
    #[serde(rename = "freeMemGB")]
    pub free_mem_gb: f64,
    #[serde(rename = "usedMemGB")]
    pub used_mem_gb: f64,
    #[serde(rename = "cpuModel")]
    pub cpu_model: String,
    #[serde(rename = "cpuCores")]
    pub cpu_cores: usize,
    pub gpus: Vec<GpuInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartParams {
    #[serde(rename = "binaryPath")]
    pub binary_path: String,
    pub args: Vec<String>,
    pub cwd: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartResult {
    pub success: bool,
    pub pid: Option<u32>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StopResult {
    pub success: bool,
    pub error: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogPayload {
    pub r#type: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusPayload {
    pub state: String,
    #[serde(rename = "exitCode", skip_serializing_if = "Option::is_none")]
    pub exit_code: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

pub struct ServerProcessState {
    pub child: Mutex<Option<Child>>,
    pub is_running: Arc<AtomicBool>,
}

impl ServerProcessState {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }
}

// -------------------------------------------------------------
// Command: Scan Assets
// -------------------------------------------------------------
#[tauri::command]
pub async fn scan_assets(custom_search_dirs: Vec<String>) -> Result<DiscoveredAssets, String> {
    let mut search_dirs: HashSet<PathBuf> = HashSet::new();

    for d in custom_search_dirs {
        search_dirs.insert(PathBuf::from(d));
    }

    if let Some(home) = dirs_home() {
        search_dirs.insert(home.join("Downloads"));
        search_dirs.insert(home.join("Documents"));
        search_dirs.insert(home.join("Projects"));
        search_dirs.insert(home.join("Models"));
        search_dirs.insert(home.join(".cache").join("lm-studio").join("models"));
        search_dirs.insert(home.join(".ollama").join("models"));
        search_dirs.insert(home.join(".cache").join("huggingface").join("hub"));
        search_dirs.insert(home.join(".local").join("bin"));
        search_dirs.insert(home.join("llama.cpp"));
        search_dirs.insert(home.join("llama.cpp").join("build").join("bin"));
        search_dirs.insert(home.join("llamacpp"));
        search_dirs.insert(home.join("models"));

        #[cfg(target_os = "windows")]
        {
            search_dirs.insert(home.join("AppData").join("Local").join("Microsoft").join("WinGet").join("Packages"));
        }
    }

    #[cfg(target_os = "windows")]
    {
        search_dirs.insert(PathBuf::from("C:\\llamacpp"));
        search_dirs.insert(PathBuf::from("C:\\llamacpp\\build\\bin"));
        search_dirs.insert(PathBuf::from("C:\\llama"));
        search_dirs.insert(PathBuf::from("C:\\llama.cpp"));
        search_dirs.insert(PathBuf::from("D:\\llamacpp"));
        search_dirs.insert(PathBuf::from("D:\\llama"));
        search_dirs.insert(PathBuf::from("D:\\models"));
        search_dirs.insert(PathBuf::from("E:\\models"));
        search_dirs.insert(PathBuf::from("C:\\ai\\models"));
        search_dirs.insert(PathBuf::from("C:\\ProgramData\\chocolatey\\bin"));
    }

    #[cfg(not(target_os = "windows"))]
    {
        search_dirs.insert(PathBuf::from("/usr/local/bin"));
        search_dirs.insert(PathBuf::from("/usr/bin"));
        search_dirs.insert(PathBuf::from("/opt/llamacpp"));
    }

    if let Ok(cwd) = std::env::current_dir() {
        search_dirs.insert(cwd);
    }

    let mut binaries: Vec<DiscoveredBinary> = Vec::new();
    let mut models: Vec<DiscoveredModel> = Vec::new();
    let mut projectors: Vec<DiscoveredModel> = Vec::new();
    let mut loras: Vec<DiscoveredModel> = Vec::new();

    // Check system PATH
    if let Ok(path_var) = std::env::var("PATH") {
        let separator = if cfg!(windows) { ';' } else { ':' };
        for p in path_var.split(separator) {
            let path = Path::new(p);
            if path.exists() && path.is_dir() {
                let check_files = [
                    "llama-server.exe",
                    "llama-cli.exe",
                    "llama-bench.exe",
                    "llama-server",
                    "llama-cli",
                ];
                for file_name in &check_files {
                    let full = path.join(file_name);
                    if full.is_file() {
                        let lower = file_name.to_lowercase();
                        binaries.push(DiscoveredBinary {
                            name: file_name.to_string(),
                            path: full.to_string_lossy().to_string(),
                            r#type: if lower.contains("server") { "server".into() } else { "cli".into() },
                            from_path: Some(true),
                        });
                    }
                }
            }
        }
    }

    // Scan directories up to depth 4
    for dir in search_dirs {
        if !dir.exists() || !dir.is_dir() {
            continue;
        }

        for entry in WalkDir::new(&dir)
            .max_depth(4)
            .into_iter()
            .filter_entry(|e| {
                let name = e.file_name().to_string_lossy();
                !name.starts_with('.') && name != "node_modules" && name != "$Recycle.Bin"
            })
            .filter_map(|e| e.ok())
        {
            if !entry.file_type().is_file() {
                continue;
            }

            let file_name = entry.file_name().to_string_lossy();
            let lower_name = file_name.to_lowercase();

            let is_binary = lower_name == "llama-server.exe"
                || lower_name == "llama-cli.exe"
                || lower_name == "llama-bench.exe"
                || lower_name == "llama.exe"
                || (!cfg!(windows) && (lower_name == "llama-server" || lower_name == "llama-cli"));

            if is_binary {
                binaries.push(DiscoveredBinary {
                    name: file_name.to_string(),
                    path: entry.path().to_string_lossy().to_string(),
                    r#type: if lower_name.contains("server") { "server".into() } else { "cli".into() },
                    from_path: None,
                });
            }

            if lower_name.ends_with(".gguf") {
                let size_gb = entry.metadata().map(|m| {
                    (m.len() as f64 / (1024.0 * 1024.0 * 1024.0) * 100.0).round() / 100.0
                }).unwrap_or(0.0);

                let folder = entry.path().parent()
                    .map(|p| p.to_string_lossy().to_string())
                    .unwrap_or_default();

                let item = DiscoveredModel {
                    name: file_name.to_string(),
                    path: entry.path().to_string_lossy().to_string(),
                    size_gb,
                    folder,
                };

                let is_projector = lower_name.contains("mmproj") || lower_name.contains("clip") || lower_name.contains("projector");
                let is_lora = lower_name.contains("lora") || lower_name.contains("adapter");

                if is_projector {
                    projectors.push(item);
                } else if is_lora {
                    loras.push(item);
                } else {
                    models.push(item);
                }
            }
        }
    }

    // Deduplicate binaries by path
    let mut unique_binaries: Vec<DiscoveredBinary> = Vec::new();
    let mut seen_bin_paths: HashSet<String> = HashSet::new();
    for b in binaries {
        if seen_bin_paths.insert(b.path.clone()) {
            unique_binaries.push(b);
        }
    }

    // Prioritize CUDA / llamacpp paths
    unique_binaries.sort_by(|a, b| {
        let a_lower = a.path.to_lowercase();
        let b_lower = b.path.to_lowercase();
        let a_score = if a_lower.contains("llamacpp") || a_lower.contains("cuda") { 2 } else if a_lower.contains("llama") { 1 } else { 0 };
        let b_score = if b_lower.contains("llamacpp") || b_lower.contains("cuda") { 2 } else if b_lower.contains("llama") { 1 } else { 0 };
        b_score.cmp(&a_score)
    });

    let mut unique_models: Vec<DiscoveredModel> = Vec::new();
    let mut seen_model_paths: HashSet<String> = HashSet::new();
    for m in models {
        if seen_model_paths.insert(m.path.clone()) {
            unique_models.push(m);
        }
    }

    let mut unique_projectors: Vec<DiscoveredModel> = Vec::new();
    let mut seen_proj_paths: HashSet<String> = HashSet::new();
    for p in projectors {
        if seen_proj_paths.insert(p.path.clone()) {
            unique_projectors.push(p);
        }
    }

    let mut unique_loras: Vec<DiscoveredModel> = Vec::new();
    let mut seen_lora_paths: HashSet<String> = HashSet::new();
    for l in loras {
        if seen_lora_paths.insert(l.path.clone()) {
            unique_loras.push(l);
        }
    }

    Ok(DiscoveredAssets {
        binaries: unique_binaries,
        models: unique_models,
        projectors: unique_projectors,
        loras: unique_loras,
    })
}

// -------------------------------------------------------------
// Command: Start Process
// -------------------------------------------------------------
#[tauri::command]
pub async fn start_process(
    app: AppHandle,
    state: State<'_, ServerProcessState>,
    params: StartParams,
) -> Result<StartResult, String> {
    let mut child_lock = state.child.lock().await;
    if child_lock.is_some() {
        return Ok(StartResult {
            success: false,
            pid: None,
            error: Some("A process is already running. Stop it first.".into()),
        });
    }

    let working_dir = match &params.cwd {
        Some(d) => PathBuf::from(d),
        None => Path::new(&params.binary_path)
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| PathBuf::from(".")),
    };

    let mut cmd = Command::new(&params.binary_path);
    cmd.args(&params.args)
        .current_dir(working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    {
        cmd.creation_flags(0x08000000);
    }

    match cmd.spawn() {
        Ok(mut child) => {
            let pid = child.id();
            state.is_running.store(true, Ordering::SeqCst);

            let stdout = child.stdout.take();
            let stderr = child.stderr.take();

            let app_clone1 = app.clone();
            if let Some(out) = stdout {
                tokio::spawn(async move {
                    let mut reader = BufReader::new(out).lines();
                    while let Ok(Some(line)) = reader.next_line().await {
                        let _ = app_clone1.emit("llama:log", LogPayload {
                            r#type: "stdout".into(),
                            text: format!("{}\n", line),
                        });
                    }
                });
            }

            let app_clone2 = app.clone();
            if let Some(err) = stderr {
                tokio::spawn(async move {
                    let mut reader = BufReader::new(err).lines();
                    while let Ok(Some(line)) = reader.next_line().await {
                        let _ = app_clone2.emit("llama:log", LogPayload {
                            r#type: "stderr".into(),
                            text: format!("{}\n", line),
                        });
                    }
                });
            }

            *child_lock = Some(child);

            Ok(StartResult {
                success: true,
                pid,
                error: None,
            })
        }
        Err(e) => Ok(StartResult {
            success: false,
            pid: None,
            error: Some(e.to_string()),
        }),
    }
}

// -------------------------------------------------------------
// Command: Stop Process
// -------------------------------------------------------------
#[tauri::command]
pub async fn stop_process(
    app: AppHandle,
    state: State<'_, ServerProcessState>,
) -> Result<StopResult, String> {
    let mut child_lock = state.child.lock().await;

    if let Some(child) = child_lock.take() {
        let pid = child.id();

        #[cfg(target_os = "windows")]
        {
            if let Some(p) = pid {
                let _ = std::process::Command::new("taskkill")
                    .args(["/pid", &p.to_string(), "/T", "/F"])
                    .output();
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            let _ = child.kill().await;
        }

        state.is_running.store(false, Ordering::SeqCst);
        let _ = app.emit("llama:status", StatusPayload {
            state: "stopped".into(),
            exit_code: Some(0),
            error: None,
        });

        Ok(StopResult {
            success: true,
            error: None,
            message: Some("Process terminated".into()),
        })
    } else {
        Ok(StopResult {
            success: true,
            error: None,
            message: Some("No process was running".into()),
        })
    }
}

// -------------------------------------------------------------
// Command: Is Running
// -------------------------------------------------------------
#[tauri::command]
pub async fn is_running(state: State<'_, ServerProcessState>) -> Result<bool, String> {
    Ok(state.is_running.load(Ordering::SeqCst))
}

// -------------------------------------------------------------
// Command: Extract Help
// -------------------------------------------------------------
#[tauri::command]
pub async fn extract_help(binary_path: String) -> Result<serde_json::Value, String> {
    if binary_path.trim().is_empty() {
        return Ok(serde_json::json!({
            "success": false,
            "error": "No binary path provided"
        }));
    }

    let mut cmd = std::process::Command::new(&binary_path);
    cmd.arg("--help");

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    match cmd.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            let combined = format!("{}{}", stdout, stderr);
            if !combined.trim().is_empty() {
                Ok(serde_json::json!({
                    "success": true,
                    "output": combined
                }))
            } else {
                Ok(serde_json::json!({
                    "success": false,
                    "error": "Empty output returned from --help"
                }))
            }
        }
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}

// -------------------------------------------------------------
// Command: System Info & Live Hardware Telemetry
// -------------------------------------------------------------
#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_bytes = sys.total_memory();
    let free_bytes = sys.free_memory();
    let used_bytes = sys.used_memory();

    let total_mem_gb = ((total_bytes as f64 / (1024.0 * 1024.0 * 1024.0)) * 10.0).round() / 10.0;
    let free_mem_gb = ((free_bytes as f64 / (1024.0 * 1024.0 * 1024.0)) * 10.0).round() / 10.0;
    let used_mem_gb = ((used_bytes as f64 / (1024.0 * 1024.0 * 1024.0)) * 10.0).round() / 10.0;

    let cpus = sys.cpus();
    let cpu_cores = cpus.len();
    let cpu_model = if !cpus.is_empty() {
        cpus[0].brand().trim().to_string()
    } else {
        "Unknown CPU".to_string()
    };

    let mut gpus: Vec<GpuInfo> = Vec::new();

    // Query nvidia-smi for live VRAM and utilization
    let mut n_cmd = std::process::Command::new("nvidia-smi");
    n_cmd.args([
        "--query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu",
        "--format=csv,noheader,nounits",
    ]);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        n_cmd.creation_flags(0x08000000);
    }

    if let Ok(output) = n_cmd.output() {
        if output.status.success() {
            let out_str = String::from_utf8_lossy(&output.stdout);
            for line in out_str.lines() {
                let parts: Vec<&str> = line.split(',').map(|s| s.trim()).collect();
                if parts.len() >= 2 {
                    let name = parts[0].to_string();
                    let total_mb: f64 = parts[1].parse().unwrap_or(0.0);
                    let used_mb: Option<f64> = parts.get(2).and_then(|s| s.parse().ok());
                    let free_mb: Option<f64> = parts.get(3).and_then(|s| s.parse().ok());
                    let util: Option<u32> = parts.get(4).and_then(|s| s.parse().ok());

                    gpus.push(GpuInfo {
                        name,
                        vram_gb: if total_mb > 0.0 { Some(((total_mb / 1024.0) * 10.0).round() / 10.0) } else { None },
                        used_vram_gb: used_mb.map(|m| ((m / 1024.0) * 10.0).round() / 10.0),
                        free_vram_gb: free_mb.map(|m| ((m / 1024.0) * 10.0).round() / 10.0),
                        gpu_util_percent: util,
                    });
                }
            }
        }
    }

    // Windows fallback for DirectX / WMI if no NVIDIA card
    #[cfg(target_os = "windows")]
    if gpus.is_empty() {
        use std::os::windows::process::CommandExt;
        let mut w_cmd = std::process::Command::new("powershell");
        w_cmd.args([
            "-NoProfile",
            "-Command",
            "Get-CimInstance Win32_VideoController | Select-Object -Property Name, AdapterRAM | ConvertTo-Json",
        ]);
        w_cmd.creation_flags(0x08000000);

        if let Ok(w_out) = w_cmd.output() {
            if let Ok(val) = serde_json::from_slice::<serde_json::Value>(&w_out.stdout) {
                let list = if val.is_array() {
                    val.as_array().unwrap().clone()
                } else {
                    vec![val]
                };

                for item in list {
                    if let Some(name) = item.get("Name").and_then(|n| n.as_str()) {
                        let lower = name.to_lowercase();
                        if !lower.contains("remote") && !lower.contains("virtual") {
                            let bytes = item.get("AdapterRAM").and_then(|b| b.as_f64());
                            let vram_gb = bytes.map(|b| ((b / (1024.0 * 1024.0 * 1024.0)) * 10.0).round() / 10.0);
                            gpus.push(GpuInfo {
                                name: name.to_string(),
                                vram_gb,
                                used_vram_gb: None,
                                free_vram_gb: None,
                                gpu_util_percent: None,
                            });
                        }
                    }
                }
            }
        }
    }

    Ok(SystemInfo {
        total_mem_gb,
        free_mem_gb,
        used_mem_gb,
        cpu_model,
        cpu_cores,
    gpus,
    })
}

// -------------------------------------------------------------
// Helper: Home Directory
// -------------------------------------------------------------
fn dirs_home() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        std::env::var("USERPROFILE").ok().map(PathBuf::from)
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("HOME").ok().map(PathBuf::from)
    }
}
