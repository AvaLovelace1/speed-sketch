import os
import tkinter as tk
import tkinter.filedialog

import ttkbootstrap as ttk

from app_frame import AppFrame
from radio_selector import RadioSelector


def _basename(filepath: str) -> str:
    return os.path.basename(os.path.normpath(filepath))


class MainMenu(AppFrame):
    def __init__(self, app):
        super().__init__(app.window)
        self.app = app
        self.frame = self._create_frame()
        self.label_frame = self._create_label_frame()
        self.heading_label = self._create_heading_label()
        self.folder_select_button = self._create_folder_select_button()
        self.folder_label = self._create_folder_label()
        self.time_selector = self._create_time_selector()
        self.go_button = self._create_go_button()

    def _create_frame(self) -> ttk.Frame:
        frame = ttk.Frame(master=self.wrapper)
        frame.grid(row=0, column=0)
        return frame

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
            command=self._ask_for_folder,
        )
        button.pack(pady=(0, 7))
        return button

    def _create_folder_label(self) -> ttk.Label:
        self.folder_label_text = tk.StringVar()
        self.folder_label_text.set('Folder: None selected')
        label = ttk.Label(master=self.label_frame, textvariable=self.folder_label_text)
        label.pack(pady=(0, 15))
        return label

    def _create_time_selector(self) -> RadioSelector:
        return RadioSelector(
            self.label_frame,
            self.app.MENU_TIME_OPTION_TEXTS,
            self.app.MENU_TIME_OPTIONS,
            self.app.image_show_time,
        )

    def _create_go_button(self) -> ttk.Button:
        button = ttk.Button(
            master=self.label_frame,
            text='GO! ▶',
            width=self.app.MENU_BUTTON_WIDTH,
            state='disabled',
            bootstyle='success',
            command=self.app.start_timed_session,
        )
        button.pack(pady=(12, 7))
        return button

    def _ask_for_folder(self) -> None:
        folder_path = tk.filedialog.askdirectory()
        if not folder_path:
            return
        self.app.set_folder(folder_path)
        self._update_folder_label()
        self._update_go_button()

    def _update_folder_label(self) -> None:
        self.folder_label_text.set(f'Folder: {_basename(self.app.image_folder)} '
                                   f'({self.app.n_images} images found)')

    def _update_go_button(self) -> None:
        if self.app.can_start_timed_session():
            self.go_button.configure(state='enabled')
        else:
            self.go_button.configure(state='disabled')
