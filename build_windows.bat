:: CREATE PYTHON VIRTUALENV
python -m venv .venv  &:: Initialize python virtualenv
CALL .venv\Scripts\activate.bat  &:: Activate virtualenv
pip install -r requirements.txt  &:: Install required packages

:: BUILD APP
rd /s /q build dist
pyinstaller -F --add-data "src/icon.png:." -i "src/icon.png" -w "src/main.py" -n SpeedSketch
copy dist\SpeedSketch.exe bin\SpeedSketch.exe
