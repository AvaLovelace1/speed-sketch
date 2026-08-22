use std::path::Path;
use std::time::Duration;
use tauri::Manager;
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tokio::{task, time};
use walkdir::{DirEntry, WalkDir};

/// Return a list of image file paths from the specified directory.
/// Error if the process takes longer than timeout_duration (specified in seconds).
#[tauri::command]
async fn get_img_files<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    dir: String,
    include_subdirs: bool,
    timeout_duration: u64,
) -> Result<Vec<String>, String> {
    // First check that folder exists and is a directory
    let dir_path = Path::new(&dir);
    match dir_path.try_exists() {
        Ok(true) => {}
        Ok(false) => {
            log::warn!("Reference folder does not exist: {dir}");
            return Err("DoesNotExist".to_string());
        }
        Err(e) => {
            log::error!("Cannot access reference folder {dir}: {e}");
            return Err("PathError".to_string());
        }
    }
    if !dir_path.is_dir() {
        log::warn!("Reference path is not a folder: {dir}");
        return Err("NotADirectory".to_string());
    }

    // Grant the asset protocol read access to this folder, so its files can be displayed
    let allowed_dir = dir_path
        .canonicalize()
        .unwrap_or_else(|_| dir_path.to_path_buf());
    if let Err(e) = app
        .asset_protocol_scope()
        .allow_directory(&allowed_dir, include_subdirs)
    {
        log::error!("Failed to grant access to folder {dir}: {e}");
        return Err("PathError".to_string());
    }

    // Spawn task to call _get_img_files; time out if taking too long
    let scan_dir = dir.clone();
    let result = task::spawn_blocking(move || _get_img_files(&scan_dir, include_subdirs));
    let timeout = Duration::from_secs(timeout_duration);
    match time::timeout(timeout, result).await {
        Ok(Ok(files)) => Ok(files),
        Ok(Err(e)) => {
            log::error!("Failed to scan reference folder {dir}: {e}");
            Err("TaskJoinError".to_string())
        }
        Err(_) => {
            log::error!("Scanning reference folder {dir} timed out after {timeout_duration}s");
            Err("TimeoutError".to_string())
        }
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

/// Check if the given extension corresponds to a supported media file (image or video).
fn is_media_extension(ext: &str) -> bool {
    matches!(
        ext.to_lowercase().as_str(),
        // Images
        "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "tif" | "tiff" | "ico" | "svg"
        // Videos
        | "mp4" | "webm" | "mov" | "mkv" | "avi" | "m4v" | "ogv"
    )
}

/// Check if the given entry is a supported media file based on its extension.
fn is_img_file(entry: &DirEntry) -> bool {
    if !entry.file_type().is_file() {
        return false;
    }
    entry
        .path()
        .extension()
        .and_then(|e| e.to_str())
        .map(is_media_extension)
        .unwrap_or(false)
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
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .max_file_size(5_000_000)
                .build(),
        )
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
                let menu = MenuBuilder::new(app)
                    .items(&[&main, &view, &window])
                    .build()?;
                app.set_menu(menu)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use tauri::test::{mock_builder, mock_context, noop_assets};

    /// Create a temp folder containing a single image, plus the app to test against.
    fn setup(name: &str) -> (tauri::App<tauri::test::MockRuntime>, PathBuf, PathBuf) {
        let app = mock_builder()
            .build(mock_context(noop_assets()))
            .expect("failed to build mock app");
        let dir = std::env::temp_dir().join(name);
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).expect("failed to create temp dir");
        let img = dir.join("a.jpg");
        std::fs::write(&img, b"not-a-real-jpg").expect("failed to write temp image");
        (app, dir, img)
    }

    /// Create a nested subfolder holding one image, and return its path.
    fn add_subfolder_img(dir: &Path) -> PathBuf {
        let sub = dir.join("nested");
        std::fs::create_dir_all(&sub).expect("failed to create nested dir");
        let sub_img = sub.join("b.jpg");
        std::fs::write(&sub_img, b"not-a-real-jpg").expect("failed to write nested image");
        sub_img
    }

    #[test]
    fn get_img_files_grants_asset_protocol_access_to_scanned_folder() {
        let (app, dir, img) = setup("speedsketch-scope-allowed");
        assert!(
            !app.asset_protocol_scope().is_allowed(&img),
            "image should not be readable before the folder is scanned"
        );

        let files = tauri::async_runtime::block_on(get_img_files(
            app.handle().clone(),
            dir.to_string_lossy().to_string(),
            true,
            60,
        ))
        .expect("get_img_files failed");

        assert_eq!(files.len(), 1, "expected the one image in the folder");
        assert!(
            app.asset_protocol_scope().is_allowed(&img),
            "image in a scanned folder should be readable via the asset protocol"
        );
    }
    #[test]
    fn get_img_files_grants_subfolder_access_when_subdirs_included() {
        let (app, dir, _img) = setup("speedsketch-scope-subdirs-on");
        let sub_img = add_subfolder_img(&dir);

        tauri::async_runtime::block_on(get_img_files(
            app.handle().clone(),
            dir.to_string_lossy().to_string(),
            true,
            60,
        ))
        .expect("get_img_files failed");

        assert!(
            app.asset_protocol_scope().is_allowed(&sub_img),
            "subfolder images should be readable when subfolders are included"
        );
    }

    #[test]
    fn get_img_files_withholds_subfolder_access_when_subdirs_excluded() {
        let (app, dir, _img) = setup("speedsketch-scope-subdirs-off");
        let sub_img = add_subfolder_img(&dir);

        tauri::async_runtime::block_on(get_img_files(
            app.handle().clone(),
            dir.to_string_lossy().to_string(),
            false,
            60,
        ))
        .expect("get_img_files failed");

        assert!(
            !app.asset_protocol_scope().is_allowed(&sub_img),
            "subfolder images should stay out of scope when subfolders are excluded"
        );
    }
}
