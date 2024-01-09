import ttkbootstrap as ttk

from app_frame import AppFrame


class MainMenu(AppFrame):
    TITLE_FONT = (None, 32)
    BUTTON_WIDTH = 23

    def __init__(self, app):
        super().__init__(app.window)
        self.app = app
        self.label_frame = self._create_label_frame()

    def _create_label_frame(self) -> ttk.LabelFrame:
        label_frame = ttk.LabelFrame(master=self.frame, text=self.app.VERSION_INFO)
        label_frame.grid(row=0, column=0, ipadx=25, ipady=12)
        label_frame.grid_rowconfigure(0, weight=1)
        label_frame.grid_columnconfigure(0, weight=1)
        return label_frame
