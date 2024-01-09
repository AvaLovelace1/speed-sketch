import os
import random
import tkinter as tk

import ttkbootstrap as ttk
from PIL import Image

from image_viewer import ImageViewer
from main_menu import MainMenu


class App:
    APP_NAME = 'Drawing Practice Timer'
    VERSION_INFO = 'v1.0 • Ava Pun, 2024'
    THEME = 'darkly'

    WINDOW_DEFAULT_SIZE = (800, 600)
    WINDOW_MINSIZE = (600, 350)

    BUTTON_FONT = (None, 18)

    MENU_HEADING_FONT = (None, 32)
    MENU_BUTTON_WIDTH = 23
    MENU_TIME_OPTION_TEXTS = ['30s', '45s', '1m', '2m', '5m', '10m']
    MENU_TIME_OPTIONS = [30, 45, 60, 120, 300, 600]

    VIEWER_PROGRESS_BAR_LENGTH = 500
    VIEWER_BUTTON_WIDTH = 10
    VIEWER_BUTTON_PADX = 7

    def __init__(self):
        self.window = self._create_window()
        self.image_show_time = tk.IntVar()
        self.main_menu = MainMenu(self)
        self.image_folder = ''
        self.image_filepaths = []
        self.timed_session = None

        self._customize_styles()
        self._bind_hotkeys()

    @property
    def n_images(self) -> int:
        return len(self.image_filepaths)

    @property
    def screen_size(self) -> tuple[int, int]:
        return self.window.winfo_screenwidth(), self.window.winfo_screenheight()

    def _create_window(self) -> ttk.Window:
        window = ttk.Window(
            title=self.APP_NAME,
            themename=self.THEME,
            size=self.WINDOW_DEFAULT_SIZE,
            minsize=self.WINDOW_MINSIZE
        )
        window.grid_rowconfigure(0, weight=1)
        window.grid_columnconfigure(0, weight=1)
        return window

    def _customize_styles(self) -> None:
        self.window.style.configure('TButton', font=self.BUTTON_FONT)

    def _bind_hotkeys(self) -> None:
        self.window.bind('<Return>', self.start_timed_session)

    def run(self):
        self._tick()
        self.main_menu.show()
        self.window.mainloop()

    def _tick(self):
        if self.timed_session:
            self.timed_session.tick()
        self.window.after(1000, self._tick)

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
        return self.image_folder and self.n_images > 0 and self.timed_session is None

    def start_timed_session(self, _=None) -> None:
        if not self.can_start_timed_session():
            return
        self.timed_session = TimedSession(self, self.image_filepaths, self.image_show_time.get())

    def end_timed_session(self, _=None):
        self.timed_session.destroy()
        self.timed_session = None


class TimedSession:
    def __init__(self, app, image_filepaths: list[str], image_show_time: int):
        self.app = app
        self.image_filepaths = image_filepaths.copy()
        random.shuffle(self.image_filepaths)
        self.image_show_time = image_show_time

        self._images_completed = 0
        self._time_passed = 0
        self.is_paused = False
        self._percentage_time_passed = tk.DoubleVar()
        self.image_viewer = ImageViewer(app, self)

        self._set_image(0)
        self._reset_timer()

    @property
    def n_images(self) -> int:
        return len(self.image_filepaths)

    @property
    def images_completed(self) -> int:
        return self._images_completed

    @images_completed.setter
    def images_completed(self, value):
        self._images_completed = value
        self.image_viewer.update_image_count_text()

    @property
    def time_passed(self) -> int:
        return self._time_passed

    @time_passed.setter
    def time_passed(self, value) -> None:
        self._time_passed = value
        self._percentage_time_passed.set(value / self.image_show_time * 100)
        self.image_viewer.update_countdown_text()

    @property
    def percentage_time_passed(self) -> tk.DoubleVar:
        return self._percentage_time_passed

    @property
    def time_remaining(self) -> int:
        return self.image_show_time - self.time_passed

    def tick(self) -> None:
        if self.is_paused:
            return
        self.time_passed += 1
        if self.time_remaining <= 0:
            self._finish_image()

    def _finish_image(self) -> None:
        self.images_completed += 1
        self.next_image()

    def _reset_timer(self) -> None:
        self.time_passed = 0

    def _set_image(self, idx: int) -> None:
        self.image_viewer.set_image(Image.open(self.image_filepaths[idx]))
        self.image_idx = idx

    def prev_image(self, _=None) -> None:
        self._set_image((self.image_idx - 1 + self.n_images) % self.n_images)
        self._reset_timer()

    def next_image(self, _=None) -> None:
        self._set_image((self.image_idx + 1) % self.n_images)
        self._reset_timer()

    def toggle_pause(self, _=None) -> None:
        if self.is_paused:
            self._resume()
        else:
            self._pause()

    def _pause(self) -> None:
        self.is_paused = True
        self.image_viewer.update_state_is_paused()

    def _resume(self) -> None:
        self.is_paused = False
        self.image_viewer.update_state_is_resumed()

    def destroy(self) -> None:
        self.image_viewer.destroy()
