#!/bin/zsh

# CREATE PYTHON VIRTUALENV
python3 -m venv .venv  # Initialize python virtualenv
source .venv/bin/activate  # Activate virtualenv
pip install -r requirements.txt  # Install required packages

# BUILD APP (UNIVERSAL)
rm -rf build dist
pyinstaller -F --add-data "src/icon.png:." -i "src/icon.png" -w "src/main.py" -n SpeedSketch --target-arch universal2
zip -r "bin/SpeedSketch (Mac OS - Universal).zip" "dist/SpeedSketch.app"

# BUILD APP (APPLE SILICON)
rm -rf build dist
pyinstaller -F --add-data "src/icon.png:." -i "src/icon.png" -w "src/main.py" -n SpeedSketch --target-arch arm64
zip -r "bin/SpeedSketch (Mac OS - Apple Silicon).zip" "dist/SpeedSketch.app"
