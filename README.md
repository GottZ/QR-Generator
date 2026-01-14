# QR Code Generator

A modern, privacy-focused QR code generator with a neumorphic design. Runs entirely in your browser - no server-side processing, no data collection.

**Live Demo:** [gottz.de/qr](https://gottz.de/qr)

![Dark Mode](https://img.shields.io/badge/dark%20mode-supported-blue)
![Light Mode](https://img.shields.io/badge/light%20mode-supported-yellow)
![Accessible](https://img.shields.io/badge/accessibility-WCAG%202.1-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## Features

### QR Code Types

| Type | Description | Example Output |
|------|-------------|----------------|
| **Text / URL** | Plain text or web links | `https://example.com` |
| **WiFi** | Network credentials for easy connection | `WIFI:T:WPA;S:MyNetwork;P:password;;` |
| **Email** | Pre-filled email composition | `mailto:user@example.com?subject=Hello` |
| **Phone** | Dial a phone number | `tel:+1234567890` |
| **SMS** | Pre-filled text message | `sms:+1234567890?body=Hello` |
| **vCard** | Contact card with name, phone, email, etc. | Full vCard 3.0 format |
| **Location** | Geographic coordinates | `geo:52.5200,13.4050` |

### Customization Options

- **Size**: Pixel-perfect (1x) to Extra Large (16x)
- **Error Correction**: Low (7%), Medium (15%), Quartile (25%), High (30%)
- **Outline**: 0-4 cell units of white margin

### Design

- Neumorphic/skeuomorphic UI with subtle shadows and depth
- Automatic dark/light mode based on system preference
- Fully responsive layout
- Smooth animations with reduced-motion support

### Accessibility

- Full keyboard navigation
- Screen reader support with ARIA labels
- Live announcements for QR generation status
- Clear focus indicators
- WCAG 2.1 compliant

## Usage

Simply open the page and:

1. Select the QR code type from the dropdown
2. Fill in the required fields
3. QR code generates automatically as you type
4. Click **Download** to save as PNG

**Keyboard shortcut:** Press `Ctrl + Enter` to generate immediately.

## Privacy

This application runs **100% client-side**. Your data never leaves your browser:

- No server requests for QR generation
- No analytics or tracking
- No cookies (except browser preferences)
- Works offline once loaded

## Technical Details

### Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

### Dependencies

All dependencies are bundled locally:

- `ce.js` - DOM creation helper library
- `qrcode.js` - QR code generation library

## Development

### File Structure

```
qr/
├── index.html      # Entry point
├── script.js       # Application logic & custom components
├── style.css       # Neumorphic styling & theming
├── ce.js           # DOM helper library
├── qrcode.js       # QR generation library
├── CLAUDE.md       # Technical documentation for AI assistants
└── README.md       # This file
```

### Local Development

No build process required. Simply serve the files with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## Credits

### QR Code Library

**qrcode.js** by Kazuhiko Arase

- Website: [d-project.com](http://www.d-project.com/)
- License: MIT
- Copyright (c) 2009 Kazuhiko Arase

> "QR Code" is a registered trademark of DENSO WAVE INCORPORATED

### DOM Helper Library

**ce.js** by Jan-Stefan Janetzky (GottZ)

- Website: [gottz.de](https://gottz.de)
- License: MIT

### Application

**QR Generator** by Jan-Stefan Janetzky (GottZ)

- Website: [gottz.de](https://gottz.de)
- Contact: [contact.gottz.de](https://contact.gottz.de)
- License: MIT

## License

MIT License - see individual library files for their respective licenses.

```
Copyright (c) 2024 Jan-Stefan Janetzky

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
