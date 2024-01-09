import os
import tkinter as tk
import tkinter.filedialog

import ttkbootstrap as ttk

from main_menu import MainMenu


class App:
    APP_NAME = 'Drawing Practice Timer'
    VERSION_INFO = 'v1.0 • Ava Pun, 2024'
    THEME = 'darkly'

    MENU_HEADING_FONT = (None, 32)
    MENU_BUTTON_WIDTH = 23

    def __init__(self):
        self.window = self._create_window()
        self.main_menu = MainMenu(self)

    def _create_window(self) -> ttk.Window:
        window = ttk.Window(title=self.APP_NAME, themename=self.THEME)
        window.grid_rowconfigure(0, weight=1)
        window.grid_columnconfigure(0, weight=1)
        return window

    def run(self):
        self.window.mainloop()

    def ask_for_folder(self) -> None:
        folder_path = tk.filedialog.askdirectory()
        self._set_folder(folder_path)

    def _set_folder(self, folder_path: str) -> None:
        if not folder_path:
            return
        self.image_folder = folder_path
        self.image_filepaths = self._load_image_filepaths()

    def _load_image_filepaths(self) -> list[str]:
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        with os.scandir(self.image_folder) as entries:
            filepaths = [entry.path for entry in entries
                         if entry.is_file() and any(entry.name.lower().endswith(ext) for ext in image_extensions)]
            return filepaths
