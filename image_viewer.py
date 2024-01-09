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

    def _bind_hotkeys(self) -> None:
        for key, cmd in zip(self.BUTTON_HOTKEYS, self.button_commands):
            self.app.window.bind(key, cmd)

    def _unbind_hotkeys(self) -> None:
        for key in self.BUTTON_HOTKEYS:
            self.app.window.unbind(key)

    def destroy(self) -> None:
        self._unbind_hotkeys()
        super().destroy()
