from app import App


def test_app():
    app = App()
    app.window.update()
    assert app.window.title() == app.APP_NAME
    assert app.main_menu.label_frame.cget('text') == app.VERSION_INFO
