mod commands;

use commands::{
    extract_help, get_system_info, is_running, scan_assets, start_process, stop_process,
    ServerProcessState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ServerProcessState::new())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_assets,
            start_process,
            stop_process,
            is_running,
            extract_help,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
