# 🎨 Pixel Icon Editor for SSD1306 OLED Displays

A simple web-based pixel art editor designed to create custom monochrome icons for OLED displays like the SSD1306. Draw your icons and export them as C++ PROGMEM arrays ready to use with Arduino and Adafruit libraries.

![Pixel Icon Editor](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Pixel-perfect drawing** - Draw on a customizable grid (8×8 to 64×64 pixels)
- **Multiple tools** - Pencil, eraser, and fill bucket
- **Adjustable brush size** - Draw with 1-5 pixel brush width
- **Black & White colors** - Perfect for monochrome displays
- **Smart grid guides** - Highlighted center and quarter lines for symmetric drawing
- **Grid toggle** - Show/hide grid lines for easier drawing
- **Undo support** - Revert your last 50 actions
- **PROGMEM export** - Generate Arduino-compatible byte arrays
- **Bit inversion** - Toggle bit order if your display shows inverted images
- **Copy to clipboard** - One-click copy of generated code
- **Collapsible info panel** - Built-in documentation and usage examples

## 🚀 Quick Start

### Local Development
1. Clone or download this repository
2. Open `public/index.html` in your web browser
3. Draw your icon using the pencil tool
4. Click **"Generate C++ Array"**
5. Copy the output and paste it into your Arduino project

### Live Demo
Visit the hosted version: [https://pixel2bitarray.web.app](https://pixel2bitarray.web.app)

## 🖥️ Usage

### Drawing Your Icon

1. **Select a color** - Choose between white (filled) or black (empty) pixels
2. **Choose a tool**:
   - **Pencil** - Draw pixels
   - **Eraser** - Remove pixels
   - **Fill** - Flood fill an area
3. **Adjust brush size** - Use the slider to change brush width (1-5 pixels)
4. **Draw on the canvas** - Click and drag to create your icon

### Exporting to Arduino

After drawing your icon, click **"Generate C++ Array"** to get code like this:

```cpp
static const unsigned char PROGMEM icon_thermometer_30[] = {
  0b00000111, 0b11000000, 0b00000000, 0b00000000,
  0b00001100, 0b01100000, 0b00000000, 0b00000000,
  // ... more rows
};
```

### Using in Your Arduino Project

```cpp
#include <Adafruit_SSD1306.h>
#include "icons.h"

Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  
  // Draw your custom icon at position (x, y)
  display.drawBitmap(10, 10, icon_thermometer_30, 30, 30, WHITE);
  
  display.display();
}
```

## 🔧 Technical Details

### Output Format

- **Format**: PROGMEM byte arrays
- **Bit depth**: 1 bit per pixel (monochrome)
- **Bit order**: MSB first (most significant bit = leftmost pixel)
- **Storage**: Flash memory (saves RAM on Arduino)

### Grid Sizes

- Minimum: 8×8 pixels
- Maximum: 64×64 pixels
- Default: 30×30 pixels

### Browser Compatibility

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## 📁 Project Structure

```
pixelToByteArray/
├── public/                    # Deployment directory (Firebase hosting)
│   ├── index.html            # Main HTML structure
│   ├── styles.css            # All styling
│   └── app.js                # Drawing logic and export functionality
├── .github/                   # GitHub workflows and configuration
├── firebase.json              # Firebase hosting configuration
├── .firebaserc               # Firebase project settings
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🛠️ Development & Deployment

### Local Development
Simply open `public/index.html` in any modern web browser. No build process or server required.

### Firebase Deployment
This project is configured for Firebase Hosting:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

The `public/` directory contains all deployable files and is configured in `firebase.json`.

## 💡 Tips

- **Smart grid guides**: The canvas shows highlighted lines at the center (blue) and quarters (white) to help create symmetric icons
- **Invert bits option**: If your icon appears reversed on the display, check the "Invert bits" option before generating
- **Grid size**: Make sure your grid size matches the width/height parameters in `drawBitmap()`
- **Save your work**: Copy the generated array to an `icons.h` file in your Arduino project
- **Test on hardware**: OLED displays may render differently than the preview
- **Brush size**: Use larger brush sizes for faster filling of large areas

## 🎯 Use Cases

Perfect for creating:
- Weather icons (sun, cloud, rain, etc.)
- Status indicators (battery, WiFi, Bluetooth)
- UI elements (arrows, buttons, symbols)
- Custom logos and branding
- Game sprites for OLED displays

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - Feel free to use this tool in your projects!

## 🔗 Resources

- [Adafruit SSD1306 Library](https://github.com/adafruit/Adafruit_SSD1306)
- [Arduino Documentation](https://www.arduino.cc/reference/en/)
- [SSD1306 Datasheet](https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf)

---

Made with ❤️ for the Arduino and maker community
