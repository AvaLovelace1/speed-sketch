import time
import tkinter as tk
from collections.abc import Callable

import ttkbootstrap as ttk
from PIL import Image, ImageTk

from app_frame import AppFrame
from button_bar import ButtonBar


class ImageViewer(AppFrame):
    BUTTON_NAMES = ['prev', 'next', 'pause', 'exit']
    BUTTON_TEXTS = ['← PREV', 'NEXT →', 'PAUSE ⏸', 'EXIT Ⓧ']
    BUTTON_STYLES = ['default', 'default', 'warning', 'danger']
    BUTTON_HOTKEYS = ['<Left>', '<Right>', '<space>', '<Escape>']

    def __init__(self, app, timed_session):
        super().__init__(app.window)

        self.app = app
        self.timed_session = timed_session
        self.prev_max_image_size = (0, 0)
        self.image = None

        self.frame = self._create_frame()
        self.info_frame = self._create_info_frame()
        self.image_count_label = self._create_image_count_label()
        self.countdown_label = self._create_countdown_label()
        self.progress_bar = self._create_progress_bar()
        self.image_container = self._create_image_container()
        self.button_bar = self._create_button_bar()

        self._bind_hotkeys()

    @property
    def max_image_size(self) -> tuple[int, int]:
        return self.app.window.winfo_width(), self.app.window.winfo_height() - 150

    @property
    def button_commands(self) -> list[Callable]:
        return [
            self.timed_session.prev_image,
            self.timed_session.next_image,
            self.timed_session.toggle_pause,
            self.app.end_timed_session,
        ]

    def _create_frame(self) -> ttk.Frame:
        frame = ttk.Frame(master=self.wrapper)
        frame.pack(fill='x', expand=True)
        return frame

    def _create_info_frame(self) -> ttk.Frame:
        frame = ttk.Frame(master=self.frame)
        frame.pack(pady=(0, 8))
        return frame

    def _create_image_count_label(self) -> ttk.Label:
        self.image_count_text = tk.StringVar()
        label = ttk.Label(master=self.info_frame, textvariable=self.image_count_text)
        label.pack(side='left', padx=30)
        self.update_image_count_text()
        return label

    def _create_countdown_label(self) -> ttk.Label:
        self.countdown_text = tk.StringVar()
        label = ttk.Label(master=self.info_frame, textvariable=self.countdown_text)
        label.pack(side='right', padx=30)
        self.update_countdown_text()
        return label

    def _create_progress_bar(self) -> ttk.Progressbar:
        bar = ttk.Progressbar(
            master=self.frame,
            length=self.app.VIEWER_PROGRESS_BAR_LENGTH,
            variable=self.timed_session.percentage_time_passed
        )
        bar.pack()
        return bar

    def _create_image_container(self) -> ttk.Label:
        label = ttk.Label(master=self.frame)
        label.pack(pady=15)
        label.bind('<Configure>', self._resize_image_if_needed)
        return label

    def _create_button_bar(self) -> ButtonBar:
        return ButtonBar(
            self.frame,
            self.BUTTON_NAMES,
            self.BUTTON_TEXTS,
            self.BUTTON_STYLES,
            self.button_commands,
            self.app.VIEWER_BUTTON_WIDTH,
            self.app.VIEWER_BUTTON_PADX,
        )

    def set_image(self, new_image: Image) -> None:
        self.image = new_image
        self.image.thumbnail(self.app.screen_size)
        self._update_image_size()

    def _update_image_size(self) -> None:
        assert self.image
        image = self.image.copy()
        image.thumbnail(self.max_image_size)
        image_tk = ImageTk.PhotoImage(image)
        self.image_container.configure(image=image_tk)
        self.image_container.image = image_tk

    def _resize_image_if_needed(self, _=None) -> None:
        if not self.image or self.prev_max_image_size == self.max_image_size:
            return
        self._update_image_size()
        self.prev_max_image_size = self.max_image_size

    def update_image_count_text(self) -> None:
        self.image_count_text.set(f'Images completed ☑ {self.timed_session.images_completed}')

    def update_countdown_text(self) -> None:
        formatted_time_remaining = time.strftime('%M:%S', time.gmtime(self.timed_session.time_remaining))
        self.countdown_text.set(f'Time remaining ⏲ {formatted_time_remaining}')

    def update_state_is_paused(self) -> None:
        self.button_bar.buttons['pause'].configure(text='RESUME ▶', bootstyle='success')

    def update_state_is_resumed(self) -> None:
        self.button_bar.buttons['pause'].configure(text='PAUSE ⏸', bootstyle='warning')

    def _bind_hotkeys(self) -> None:
        for key, cmd in zip(self.BUTTON_HOTKEYS, self.button_commands):
            self.app.window.bind(key, cmd)

    def _unbind_hotkeys(self) -> None:
        for key in self.BUTTON_HOTKEYS:
            self.app.window.unbind(key)

    def destroy(self) -> None:
        self._unbind_hotkeys()
        super().destroy()
