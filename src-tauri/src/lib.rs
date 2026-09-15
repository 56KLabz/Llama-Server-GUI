mod commands;

use commands::{
    extract_help, get_system_info, is_running, scan_assets, start_process, stop_process,
    ServerProcessState,
};
use tauri::Manager;

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

            // Setup System Tray
            use tauri::menu::{Menu, MenuItem};
            use tauri::tray::TrayIconBuilder;

            let show_i = MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide to Tray", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit Llama Server GUI", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Llama Server GUI")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

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
