import ttkbootstrap as ttk
from PIL import Image, ImageTk

from app_frame import AppFrame


class ImageViewer(AppFrame):
    def __init__(self, app):
        super().__init__(app.window)
        self.app = app
        self.image_container = self._create_image_container()
        self.image = None
        self.prev_max_image_size = (0, 0)

    @property
    def max_image_size(self) -> tuple[int, int]:
        return self.app.window.winfo_width(), self.app.window.winfo_height() - 150

    def _create_image_container(self) -> ttk.Label:
        label = ttk.Label(master=self.frame)
        label.pack(pady=15)
        label.bind('<Configure>', self._resize_image_if_needed)
        return label

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
        if self.prev_max_image_size == self.max_image_size:
            return
        self._update_image_size()
        self.prev_max_image_size = self.max_image_size
