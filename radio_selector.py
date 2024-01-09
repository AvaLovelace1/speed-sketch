import tkinter as tk

import ttkbootstrap as ttk


class RadioSelector:
    def __init__(self, master, texts: list[str], values: list[int], variable: tk.IntVar):
        assert len(texts) > 0 and len(texts) == len(values)
        self.master = master
        self.texts = texts
        self.values = values
        self.variable = variable
        self.frame = self._create_frame()
        self.buttons = self._create_buttons()

    def _create_frame(self) -> ttk.Frame:
        frame = ttk.Frame(master=self.master)
        frame.pack()
        return frame

    def _create_buttons(self) -> list[ttk.Radiobutton]:
        buttons = [self._create_radio_button(i, txt, val) for i, (txt, val) in enumerate(zip(self.texts, self.values))]
        self.variable.set(self.values[0])
        return buttons

    def _create_radio_button(self, idx: int, txt: str, val: int) -> ttk.Radiobutton:
        button = ttk.Radiobutton(self.frame, text=txt, value=val, variable=self.variable, bootstyle="toolbutton")
        padx = (0, 0) if idx == 0 else (1, 0)
        button.pack(side='left', padx=padx)
        return button
