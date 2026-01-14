# QR Code Generator

A modern, privacy-focused QR code generator with a neumorphic design. Runs entirely in your browser - no server-side processing, no data collection.

**Live Demo:** [gottz.de/qr](https://gottz.de/qr)

![Dark Mode](https://img.shields.io/badge/dark%20mode-supported-blue)
![Light Mode](https://img.shields.io/badge/light%20mode-supported-yellow)
![Accessible](https://img.shields.io/badge/accessibility-WCAG%202.1-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

![QR Generator - Dark and Light Mode](screenshot.png)

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
├── screenshot.png  # Dark/light mode preview
├── LICENSE         # MIT license
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

### Application

**QR Generator** by Jan-Stefan Janetzky (GottZ)

- Website: [gottz.de](https://gottz.de)
- Contact: [contact.gottz.de](https://contact.gottz.de)
- License: MIT

### Built with Claude Code

This redesign was created with the help of [Claude Code](https://claude.ai/claude-code), Anthropic's AI-powered coding assistant. Claude Code helped:

- **Unify the design language** - Applying the established neumorphic/skeuomorphic aesthetic from other GottZ projects consistently across all UI components
- **Implement accessibility** - Adding comprehensive ARIA support, keyboard navigation, screen reader announcements, and reduced-motion preferences
- **Build custom components** - Creating a fully-styled custom dropdown to replace native selects that couldn't be styled to match the design system
- **Boost productivity** - Transforming a basic proof-of-concept into a polished, production-ready application through rapid iteration and refinement

The collaboration demonstrates how AI assistants can help developers maintain design consistency across projects while ensuring best practices for accessibility and user experience.

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

## License

MIT License - Copyright (c) 2026 Jan-Stefan Janetzky (GottZ)

See [LICENSE](LICENSE) for full details.

Individual library licenses:
- `qrcode.js` - MIT License, Copyright (c) 2009 Kazuhiko Arase
- `ce.js` - MIT License, Copyright (c) Jan-Stefan Janetzky (GottZ)
