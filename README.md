# SpeedSketch: Timed Drawing App

**[Download (Mac + Windows)](https://github.com/AvaLovelace1/speed-sketch/releases/latest)**

>[!NOTE]
> Your antivirus software may prevent the app from opening for the first time, as it is from an unidentified developer. To bypass this problem:
> - On Mac, right-click the app, select "Open," and click "Open" on the dialog that pops up.
> - On Windows, click "More Info" and then "Run Anyway."
> 
> Alternatively, you can build the app yourself using the provided build script.

**SpeedSketch** is a free app that allows you to create timed drawing sessions using photo references on your own
computer—perfect for gesture studies, figure drawing practice, and the like.
It was inspired by [GestureDrawing!](https://cubebrush.co/advanches/products/d9q6yq/gesturedrawing?q=gesturedrawing)
and [Quickposes](https://quickposes.com/en/desktop-app).

Given an input folder, SpeedSketch scans the folder for images. It then displays them one by one in a
random order, each for a specified amount of time.

<img src="screenshot-1.png" width="500" alt="Screenshot: Main Menu"/>
<img src="screenshot-2.png" width="500" alt="Screenshot: Image Viewer"/> 

## Installation

### Pre-built binaries: Mac (Apple Silicon) + Windows

You can find pre-built Mac (Apple Silicon) and Windows applications
**[here](https://github.com/AvaLovelace1/speed-sketch/releases/latest)**.

### Building from source: Mac (Apple Silicon) + Mac (Universal) + Windows)

To build from source, you must have [Python](https://www.python.org/downloads/) installed.

First clone this repository:

```bash
git clone https://github.com/AvaLovelace1/speed-sketch.git
cd speed-sketch
```

Then, run the provided build script:

```bash
./build_mac.zsh  # On Mac
# OR
build_windows.cmd  # On Windows
```

The app will be saved to the folder `bin`.
