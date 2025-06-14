use rand::thread_rng;
use rand::seq::SliceRandom;
use walkdir::{DirEntry, WalkDir};

/// Return a shuffled list of image file paths from the specified directory.
/// Error if the directory does not exist or is not accessible.
#[tauri::command]
fn get_img_files(dir: &str) -> Result<Vec<String>, String> {
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
    Ok(result)
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
