```bash
python3 -m venv .venv  # Initialize python virtualenv
source .venv/bin/activate  # Activate virtualenv
pip install -r requirements.txt  # Install required packages
```

```bash
rm -rf build dist  # Remove old build files if necessary
python setup.py py2app  # Run py2app
```

> [!WARNING]
> Issues may arise if PyInstaller is installed at the same time as py2app.
> If this is the case, try uninstalling PyInstaller.

