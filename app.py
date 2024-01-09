import os
import tkinter as tk

import ttkbootstrap as ttk

from main_menu import MainMenu


class App:
    APP_NAME = 'Drawing Practice Timer'
    VERSION_INFO = 'v1.0 • Ava Pun, 2024'
    THEME = 'darkly'

    MENU_HEADING_FONT = (None, 32)
    MENU_BUTTON_WIDTH = 23
    MENU_TIME_OPTION_TEXTS = ['30s', '45s', '1m', '2m', '5m', '10m']
    MENU_TIME_OPTIONS = [30, 45, 60, 120, 300, 600]

    def __init__(self):
        self.window = self._create_window()
        self.image_show_time = tk.IntVar()
        self.main_menu = MainMenu(self)
        self.image_folder = ''
        self.image_filepaths = []

    @property
    def n_images(self) -> int:
        return len(self.image_filepaths)

    def _create_window(self) -> ttk.Window:
        window = ttk.Window(title=self.APP_NAME, themename=self.THEME)
        window.grid_rowconfigure(0, weight=1)
        window.grid_columnconfigure(0, weight=1)
        return window

    def run(self):
        self.window.mainloop()

    def set_folder(self, folder_path: str) -> None:
        assert os.path.isdir(folder_path)
        self.image_folder = folder_path
        self.image_filepaths = self._load_image_filepaths()

    def _load_image_filepaths(self) -> list[str]:
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        with os.scandir(self.image_folder) as entries:
            filepaths = [entry.path for entry in entries
                         if entry.is_file() and any(entry.name.lower().endswith(ext) for ext in image_extensions)]
            return filepaths

    def can_start_timed_session(self) -> bool:
        return self.image_folder and self.n_images > 0

    def _start_timed_session(self, _=None) -> None:
        if not self.can_start_timed_session():
            return
