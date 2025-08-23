<a href="https://avalovelace1.github.io/speed-sketch/"><img src="icon-no-shadow.png" alt="Logo" width="80" height="80"></a>

# SpeedSketch: Gesture Drawing App

[![Browser][Browser]][Webapp]
[![Windows][Windows]](#desktop-app)
[![macOS][macOS]](#desktop-app)
[![Linux][Linux]](#desktop-app)

**SpeedSketch** is a free app for creating timed drawing sessions using photo references on your own
device. It displays all images in a given collection one by one, each for a specified amount of time.
Perfect for gesture studies, figure drawing practice, and the like!

_Available as a [web app][Webapp] and a [desktop app](#desktop-app) for **Windows**, **macOS**, and **Linux**._

## Features

### Create your own drawing session

- **Personal photo references:** Choose any folder on your device to use as a photo reference source.
- **Custom session schedule:** Choose a fixed display time in **Endless Mode**, or create your own schedule in **Class Mode**.
- **Randomize image order:** Choose whether to display images alphabetically or in a random order.

### Image Viewing

- **Zoom/pan:** Scroll to zoom in and out, and click & drag to pan around the image.
- **Flip horizontally or vertically:** Flip the image for more variety.
- **Customizable image filters:** Use the **Greyscale**, **High Contrast**, and **Blur** filters to focus on shape
  and form.
- **Pin window to top** _(desktop version only)_: Keep the app window on top of other windows for easy reference while
  drawing.
- **Show image folder** _(desktop version only)_: Reveal the image in your system’s file navigator.
- **Light & dark themes**

## Usage

### Web app

[Use SpeedSketch directly in your browser with no installation.][Webapp]

### Desktop app

Build the desktop app on your computer by following the instructions in [Build from source](#build-from-source). Pre-built binaries are currently not available.

### Build from source

SpeedSketch is built using [SvelteKit](https://svelte.dev/docs/kit/introduction) and [Tauri](https://tauri.app). Follow these steps to build from source:

1. Clone this repository with `git clone https://github.com/AvaLovelace1/speed-sketch.git && cd speed-sketch`.
2. Install all [Tauri prerequisites](https://tauri.app/start/prerequisites/), including **System Dependencies**,
   **Rust**, and **Node.js**. (There is no need to **Configure for Mobile Targets**.)
3. Install all dependencies (including Tauri) with `npm install`.
4. Build the web app with `npm run build`, or the desktop app with `npm run tauri:build`.

## Acknowledgements

- Thanks to [Svelte](https://svelte.dev), [Tauri](https://tauri.app),
  [Tailwind CSS](https://tailwindcss.com), [DaisyUI](https://daisyui.com), and [Bits UI](https://bits-ui.com) for the
  amazing open-source technologies that made this app possible.
- Thanks to [Lucide](https://lucide.dev) for the icons, [Mixkit](https://mixkit.co) for the sound effects, and
  [Nord](https://www.nordtheme.com) for the colour scheme.
- Thanks to [Andrew Sindt](https://www.pexels.com/@andrew-sindt-2650965/), [Hong Son](https://www.pexels.com/@hson/),
  [Sasha Kim](https://www.pexels.com/@sasha-kim/), and [JookpubStock](https://jookpubstock.com) for the
  reference images used in examples and testing.
- SpeedSketch was inspired by the wonderful
  [GestureDrawing!](https://cubebrush.co/advanches/products/d9q6yq/gesturedrawing?q=gesturedrawing)
  and [Quickposes](https://quickposes.com/en/desktop-app).

<!-- Links -->

[Webapp]: https://avalovelace1.github.io/speed-sketch/
[Browser]: https://img.shields.io/badge/Web%20Browser-4285F4?logo=GoogleChrome&logoColor=white&style=for-the-badge
[Windows]: https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white&style=for-the-badge
[macOS]: https://img.shields.io/badge/mac-000000?logo=apple&logoColor=F0F0F0&style=for-the-badge
[Linux]: https://img.shields.io/badge/Linux-FCC624?logo=linux&logoColor=black&style=for-the-badge
