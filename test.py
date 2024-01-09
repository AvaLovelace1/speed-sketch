from app import App


def test_app():
    app = App()
    app.window.update()
    assert app.window.title() == app.APP_NAME

    # Test main menu
    assert app.main_menu.label_frame.cget('text') == app.VERSION_INFO
    assert app.main_menu.heading_label.cget('text') == app.APP_NAME
