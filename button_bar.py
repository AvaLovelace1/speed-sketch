import ttkbootstrap as ttk


class ButtonBar:
    def __init__(self, master, names: list[str], texts: list[str], bootstyles: list[str],
                 button_width: int, button_padx: int):
        assert len(names) > 0 and len(names) == len(texts) == len(bootstyles)
        self.master = master
        self.names = names
        self.texts = texts
        self.bootstyles = bootstyles
        self.button_width = button_width
        self.button_padx = button_padx
        self.frame = self._create_frame()
        self.buttons = self._create_buttons()

    def _create_frame(self) -> ttk.Frame:
        frame = ttk.Frame(master=self.master)
        frame.pack()
        return frame

    def _create_buttons(self) -> dict[str, ttk.Button]:
        buttons = {name: self._create_button(txt, style)
                   for name, txt, style in zip(self.names, self.texts, self.bootstyles)}
        return buttons

    def _create_button(self, text: str, bootstyle: str = 'default') -> ttk.Button:
        button = ttk.Button(master=self.frame, text=text, width=self.button_width, bootstyle=bootstyle)
        button.pack(side='left', padx=self.button_padx)
        return button
