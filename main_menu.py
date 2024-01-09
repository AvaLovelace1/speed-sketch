import ttkbootstrap as ttk

from app_frame import AppFrame


class MainMenu(AppFrame):
    def __init__(self, app):
        super().__init__(app.window)
        self.app = app
        self.label_frame = self._create_label_frame()
        self.heading_label = self._create_heading_label()
        self.folder_select_button = self._create_folder_select_button()

    def _create_label_frame(self) -> ttk.LabelFrame:
        label_frame = ttk.LabelFrame(master=self.frame, text=self.app.VERSION_INFO)
        label_frame.grid(row=0, column=0, ipadx=25, ipady=12)
        label_frame.grid_rowconfigure(0, weight=1)
        label_frame.grid_columnconfigure(0, weight=1)
        return label_frame

    def _create_heading_label(self) -> ttk.Label:
        label = ttk.Label(master=self.label_frame, text=self.app.APP_NAME, font=self.app.MENU_HEADING_FONT)
        label.pack(pady=(18, 7))
        sep = ttk.Separator(master=self.label_frame, orient='horizontal')
        sep.pack(pady=(0, 24))
        return label

    def _create_folder_select_button(self) -> ttk.Button:
        button = ttk.Button(
            master=self.label_frame,
            text='SELECT IMAGE FOLDER',
            width=self.app.MENU_BUTTON_WIDTH,
            command=self.app.ask_for_folder
        )
        button.pack()
        return button
