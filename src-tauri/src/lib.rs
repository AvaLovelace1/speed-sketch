use rand::seq::SliceRandom;
use rand::thread_rng;
use std::time::Duration;
use tokio::{task, time};
use walkdir::{DirEntry, WalkDir};

/// Return a shuffled list of image file paths from the specified directory.
/// Error if the process takes longer than timeout_duration (specified in seconds).
#[tauri::command]
async fn get_img_files(dir: String, timeout_duration: u64) -> Result<Vec<String>, String> {
    // Spawn task to call _get_img_files; time out if taking too long
    let result = task::spawn_blocking(move || _get_img_files(&dir));
    let timeout = Duration::from_secs(timeout_duration);
    match time::timeout(timeout, result).await {
        Ok(Ok(files)) => Ok(files),
        Ok(Err(_)) => Err("TaskJoinError".to_string()),
        Err(_) => Err("TimeoutError".to_string()),
    }
}

fn _get_img_files(dir: &str) -> Vec<String> {
    let mut result = Vec::new();
    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(Result::ok)
        .filter(is_img_file)
    {
        if let Some(path_str) = entry.path().to_str() {
            result.push(path_str.to_string());
        }
    }
    result.shuffle(&mut thread_rng());
    result
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
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_img_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
