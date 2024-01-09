import ttkbootstrap as ttk


class AppFrame:
    def __init__(self, master):
        self.wrapper = self._create_wrapper(master)

    def _create_wrapper(self, master) -> ttk.Frame:
        frame = ttk.Frame(master=master)
        frame.grid(row=0, column=0, sticky='nsew')
        frame.grid_rowconfigure(0, weight=1)
        frame.grid_columnconfigure(0, weight=1)
        return frame

    def show(self) -> None:
        self.wrapper.tkraise()

    def destroy(self) -> None:
        self.wrapper.destroy()
