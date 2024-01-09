import pytest

from app import App


@pytest.fixture(scope='module')
def app():
    return App()


def test_app_window_title(app):
    assert app.window.title() == app.APP_NAME


def test_main_menu_gui(app):
    assert app.main_menu.label_frame.cget('text') == app.VERSION_INFO
    assert app.main_menu.heading_label.cget('text') == app.APP_NAME


def test_folder_select(app):
    folder_path = '.'
    app._set_folder(folder_path)
    assert app.image_folder == folder_path
    assert app.image_filepaths == []
