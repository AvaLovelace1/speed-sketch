import ttkbootstrap as ttk

from app_frame import AppFrame


class ImageViewer(AppFrame):
    def __init__(self, app):
        super().__init__(app.window)
        self.app = app
        self.image = self._create_image()

    def _create_image(self) -> ttk.Label:
        label = ttk.Label(master=self.frame)
        label.pack(expand=True, pady=15)
        return label
