use rand::seq::SliceRandom;
use rand::thread_rng;
use walkdir::WalkDir;

#[tauri::command]
fn get_img_paths(dir: &str) -> Vec<String> {
    let mut image_paths = Vec::new();

    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
    {
        let path = entry.path();
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if matches!(
                ext.to_lowercase().as_str(),
                "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "tiff" | "ico"
            ) {
                if let Some(path_str) = path.to_str() {
                    image_paths.push(path_str.to_string());
                }
            }
        }
    }

    image_paths.shuffle(&mut thread_rng());
    image_paths
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_img_paths])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
