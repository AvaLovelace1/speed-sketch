import tkinter as tk
import ttkbootstrap as ttk


class App(ttk.Window):
    APP_NAME = 'Drawing Practice Timer'
    THEME = 'darkly'

    def __init__(self):
        super().__init__(title=self.APP_NAME, themename=self.THEME)


if __name__ == '__main__':
    app = App()
    app.mainloop()
