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
