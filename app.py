import ttkbootstrap as ttk

from main_menu import MainMenu


class App:
    APP_NAME = 'Drawing Practice Timer'
    VERSION_INFO = 'v1.0 • Ava Pun, 2024'
    THEME = 'darkly'

    def __init__(self):
        self.window = ttk.Window(title=self.APP_NAME, themename=self.THEME)
        self.main_menu = MainMenu(self)

    def run(self):
        self.window.mainloop()
