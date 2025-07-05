use std::path::Path;
use std::time::Duration;
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::AppHandle;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;
use tokio::{task, time};
use walkdir::{DirEntry, WalkDir};

/// Return a list of image file paths from the specified directory.
/// Error if the process takes longer than timeout_duration (specified in seconds).
#[tauri::command]
async fn get_img_files(
    dir: String,
    include_subdirs: bool,
    timeout_duration: u64,
) -> Result<Vec<String>, String> {
    // First check that folder exists and is a directory
    let dir_path = Path::new(&dir);
    match dir_path.try_exists() {
        Ok(true) => {}
        Ok(false) => return Err("DoesNotExist".to_string()),
        Err(_) => return Err("PathError".to_string()),
    }
    if !dir_path.is_dir() {
        return Err("NotADirectory".to_string());
    }

    // Spawn task to call _get_img_files; time out if taking too long
    let result = task::spawn_blocking(move || _get_img_files(&dir, include_subdirs));
    let timeout = Duration::from_secs(timeout_duration);
    match time::timeout(timeout, result).await {
        Ok(Ok(files)) => Ok(files),
        Ok(Err(_)) => Err("TaskJoinError".to_string()),
        Err(_) => Err("TimeoutError".to_string()),
    }
}

fn _get_img_files(dir: &str, include_subdirs: bool) -> Vec<String> {
    let walk_dir = if include_subdirs {
        WalkDir::new(dir)
    } else {
        WalkDir::new(dir).max_depth(1)
    };

    walk_dir
        .into_iter()
        .filter_map(Result::ok)
        .filter(is_img_file)
        .filter_map(|entry| entry.path().to_str().map(String::from))
        .collect()
}

/// Check if the given entry is an image file based on its extension.
fn is_img_file(entry: &DirEntry) -> bool {
    if !entry.file_type().is_file() {
        return false;
    }
    if let Some(ext) = entry.path().extension() {
        matches!(
            ext.to_str().unwrap_or_default().to_lowercase().as_str(),
            "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "tif" | "tiff" | "ico" | "svg"
        )
    } else {
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    #[cfg(desktop)]
    {
        // Enable single instance mode for desktop applications.
        // IMPORTANT: This should be the first plugin added to the builder.
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }
    builder
        .plugin(tauri_plugin_prevent_default::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_keepawake::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_img_files])
        .setup(|app| {
            // Build app menu
            #[cfg(target_os = "macos")]
            {
                let main = SubmenuBuilder::new(app, app.package_info().name.as_str())
                    .about(None)
                    .separator()
                    .hide()
                    .hide_others()
                    .separator()
                    .quit()
                    .build()?;
                let view = SubmenuBuilder::new(app, "View").fullscreen().build()?;
                let window = SubmenuBuilder::new(app, "Window")
                    .minimize()
                    .maximize()
                    .separator()
                    .close_window()
                    .build()?;
                let help = SubmenuBuilder::new(app, "Help")
                    .text("report_issue", "🔗 Report an Issue…")
                    .build()?;
                let menu = MenuBuilder::new(app)
                    .items(&[&main, &view, &window, &help])
                    .build()?;
                app.set_menu(menu)?;
            }

            app.on_menu_event(move |app_handle: &AppHandle, event| {
                if event.id().0.as_str() == "report_issue" {
                    let url = "https://github.com/AvaLovelace1/speed-sketch/issues/new";
                    app_handle
                        .opener()
                        .open_url(url, None::<&str>)
                        .unwrap_or_default()
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
