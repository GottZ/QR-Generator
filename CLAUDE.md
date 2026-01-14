# QR Code Generator

A modern, accessible QR code generator with a neumorphic/skeuomorphic design aesthetic.

## Project Overview

This project wraps the `qrcode.js` library into a user-friendly interface supporting multiple QR code types:
- Text / URL
- WiFi credentials
- Email (mailto:)
- Phone numbers (tel:)
- SMS messages
- Contact cards (vCard)
- Geographic locations (geo:)

Live at: https://gottz.de/qr

## File Structure

- `index.html` - Minimal entry point, most UI is JS-generated
- `script.js` - Main application logic with custom dropdown component
- `style.css` - Neumorphic styling with CSS variables, dark/light mode support
- `qrcode.js` - QR code generation library (by Kazuhiko Arase, MIT license)
- `ce.js` - DOM helper function (by GottZ)

## The ce() Helper Function

A custom DOM creation utility using CSS selector syntax, created by GottZ.

### Usage Patterns

```javascript
// Classes use dot notation in the tag selector
ce("div.card", parent);
ce("div.container.full-width", parent);

// IDs use hash notation
ce("textarea#my-input", parent);
ce("button#submit-btn.btn-primary", parent);

// Properties passed as third argument object
ce("input#email", parent, {
  type: "email",
  placeholder: "Enter email...",
  disabled: true
});

// IMPORTANT: style must be an object, NOT a string
ce("img", parent, { style: { display: "none" } });  // Correct
ce("img", parent, { style: "display: none;" });     // WRONG - will error
```

### Common Mistakes to Avoid

1. **Classes**: Use `ce("div.card", parent)` NOT `ce("div", parent, { className: "card" })`
2. **IDs**: Use `ce("input#name", parent)` NOT `ce("input", parent, { id: "name" })`
3. **Style**: Must be object `{ style: { prop: value } }` NOT string

## QR Code Library (qrcode.js)

### Basic Usage

```javascript
qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

const qr = qrcode(0, errorLevel);  // 0 = auto-detect version
qr.addData(text);
qr.make();

// createDataURL(cellSize, marginInPixels)
const dataUrl = qr.createDataURL(8, 8);
```

### Important: Margin is in Pixels

The `createDataURL` margin parameter is in **pixels**, not QR cell units. To add a margin of N cells:

```javascript
const cellSize = 8;
const marginCells = 2;
const dataUrl = qr.createDataURL(cellSize, marginCells * cellSize);
```

### Error Correction Levels

- `L` - Low (7% recovery)
- `M` - Medium (15% recovery)
- `Q` - Quartile (25% recovery)
- `H` - High (30% recovery)

## Custom Dropdown Component

Native `<select>` elements have limited styling, so this project uses a custom dropdown with full ARIA support.

### Creating a Dropdown

```javascript
const select = createCustomSelect(
  parentElement,           // Container element
  [                        // Options array
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" }
  ],
  "opt1",                  // Default value
  "my-select"              // ID (optional)
);

// Usage
select.value;              // Get current value
select.value = "opt2";     // Set value
select.addEventListener("change", () => { /* handler */ });
```

### ARIA Attributes (Automatic)

The component automatically handles:
- `role="combobox"` with `aria-haspopup="listbox"`
- `aria-expanded` state management
- `aria-controls` and `aria-activedescendant`
- `aria-labelledby` (links to preceding label)
- `role="listbox"` and `role="option"` with `aria-selected`

### Keyboard Navigation

- Arrow Up/Down: Navigate options
- Enter/Space: Toggle dropdown
- Escape: Close dropdown
- Home/End: Jump to first/last option

## CSS Architecture

### Design System

The project uses a neumorphic/skeuomorphic design matching https://login.home.gottz.de

### CSS Variables

```css
:root {
  /* Colors */
  --bg, --bg-gradient          /* Page background */
  --surface, --surface-solid   /* Card/input backgrounds */
  --text, --text-muted         /* Typography */
  --border                     /* Subtle borders */
  --primary, --primary-hover, --primary-glow  /* Accent (green hue 126.453) */

  /* Shadows (neumorphic) */
  --card-shadow                /* Raised cards with inset highlights */
  --input-shadow               /* Inset inputs */
  --button-shadow, --button-shadow-hover, --button-shadow-active

  /* Spacing */
  --radius: 16px               /* Large radius */
  --radius-sm: 10px            /* Small radius */
}
```

### Dark/Light Mode

Automatic via `@media (prefers-color-scheme: light)` - all colors adapt through CSS variables.

### Accessibility CSS

```css
/* Screen reader only content */
.sr-only { /* visually hidden but accessible */ }

/* Keyboard focus indicator */
:focus-visible { outline: 2px solid var(--primary); }

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) { /* disable animations */ }
```

### Custom Scrollbar

Styled for webkit (Chrome/Safari/Edge) and Firefox to match the theme.

## Accessibility Features

- **ARIA Combobox Pattern**: Full screen reader support for custom dropdowns
- **Live Region**: Status announcements for QR generation (`role="status"`, `aria-live="polite"`)
- **Descriptive Alt Text**: Dynamic alt text based on QR content type
- **Keyboard Navigation**: Full keyboard support throughout
- **Focus Management**: Clear focus indicators, proper focus return
- **Landmarks**: `role="main"` with proper labeling
- **Reduced Motion**: Respects `prefers-reduced-motion`

## QR Data Formats

```javascript
// WiFi
`WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`

// Email
`mailto:${email}?subject=${subject}&body=${body}`

// Phone
`tel:${number}`

// SMS
`sms:${number}?body=${message}`

// vCard
`BEGIN:VCARD\nVERSION:3.0\nN:${last};${first};;;\nFN:${first} ${last}\n...END:VCARD`

// Location
`geo:${latitude},${longitude}`
```

## Testing with Playwright

```javascript
// Navigate to the page
await page.goto('https://gottz.de/qr');

// Test dark mode
await page.emulateMedia({ colorScheme: 'dark' });

// Click dropdown (uses ARIA role)
await page.getByRole('combobox', { name: 'Type' }).click();

// Select option
await page.getByRole('option', { name: 'WiFi' }).click();
```

## Author

Made by [GottZ](https://contact.gottz.de)
