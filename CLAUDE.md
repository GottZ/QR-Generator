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
- Bitcoin payments (BIP21)
- SEPA/EPC payments
- Calendar events (iCal/VEVENT)

Live at: https://gottz.de/qr

## File Structure

- `index.html` - Minimal entry point, most UI is JS-generated
- `script.js` - Main application logic with custom dropdown component
- `style.css` - Neumorphic styling with CSS variables, dark/light mode support
- `sw.js` - Service worker (stale-while-revalidate + update notification)
- `manifest.json` - PWA manifest with share_target
- `qrcode.js` - QR code generation library (by Kazuhiko Arase, MIT license)
- `ce.js` - DOM helper function (by GottZ)
- `icons/` - PWA icons (192/512, standard + maskable)

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

// Bitcoin (BIP21)
`bitcoin:${address}?amount=${btc}&label=${name}&message=${msg}`

// SEPA/EPC v002 (12 lines, LF-separated, trailing empty lines trimmed, ECL forced to M)
// Lines 10 (structured ref) and 11 (remittance text) are mutually exclusive
`BCD\n002\n1\nSCT\n${bic}\n${name}\n${iban}\nEUR${amount}\n${purpose}\n${structRef}\n${unstructRef}\n${info}`

// SEPA/EPC v001 (Legacy, same format but version 001, BIC required)
// BezahlCode (Legacy): bank://singlepaymentsepa?name=...&iban=...&bic=...&amount=10,00&reason=...

// Calendar Event (iCal)
`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${YYYYMMDDTHHmmss}\n...END:VEVENT\nEND:VCALENDAR`
```

## URL Parameter API

QR codes can be generated directly via GET parameters — `handleQueryParams()` in `script.js`.

### Flow

`checkSharedData()` checks for `type` param first (parameter API), then falls back to share target handling. Parameter API does NOT clean the URL (stays shareable), share target does.

### Parameters

- **Global**: `type` (required), `size`, `error`, `outline`, `plain` (flag)
- **Per type**: mapped via `fieldMap` object (e.g. `content` → `text-content`, `ssid` → `wifi-ssid`)

### Plain Mode

`?plain` flag adds `body.plain` class → CSS hides everything except QR code (fullscreen, white bg). Title set to "QR".

### Field Mapping Logic

- Regular fields: `field.value = paramValue`
- Checkboxes: `field.checked = paramValue === "true"`
- Custom selects: `field.value = paramValue` (setter handles trigger text + ARIA update)

## Service Worker (sw.js)

### Caching Strategy: Stale-While-Revalidate

The SW serves cached files instantly, then fetches fresh versions from the network in the background. For text assets (HTML, CSS, JS, JSON), it compares response bodies. If content changed, it sends `postMessage({ type: "UPDATE_AVAILABLE" })` to all clients, which triggers an update toast.

### When to update sw.js

- **Content changes to existing files**: NO change to sw.js needed. The stale-while-revalidate strategy detects changes automatically on every page load.
- **New files added to the project**: Add them to the `APP_SHELL` array in sw.js so they get precached for offline use.
- **SW logic changes** (new routes, new handlers): Obviously update sw.js.

### SEPA/EPC Error Correction

The EPC spec mandates error correction level M. The `generate()` function overrides the user's error correction selection for EPC formats (v002/v001): `isEpc ? "M" : errorSelect.value`. BezahlCode uses the user's selected ECL.

### SEPA Format Support

Three formats supported via `sepa-format` dropdown:
- **GiroCode (EPC v002)** — default, BIC optional in EWR, 12-line LF-separated payload, max 331 bytes
- **EPC v001 (Legacy)** — BIC required, otherwise identical to v002
- **BezahlCode (Legacy)** — `bank://singlepaymentsepa?...` URI format, amount uses comma decimal

The `setupSepaForm()` function handles dynamic UI behavior: reference type toggle (structured vs unstructured, mutually exclusive), BIC required/optional label, live byte counter, IBAN format validation, and amount range validation.

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
