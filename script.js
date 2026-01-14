// Custom Select Component with full ARIA support
function createCustomSelect(parent, options, defaultValue, id, labelText) {
  const wrapper = ce("div.custom-select", parent);
  if (id) wrapper.id = id;

  // Generate unique IDs for ARIA references
  const baseId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;

  // Find the preceding label element and give it an ID for aria-labelledby
  const precedingLabel = parent.querySelector("label:last-of-type");
  if (precedingLabel && !precedingLabel.id) {
    precedingLabel.id = labelId;
  }

  const trigger = ce("button.custom-select-trigger", wrapper, {
    type: "button",
    textContent: options.find(o => o.value === defaultValue)?.label || options[0]?.label || ""
  });

  // ARIA attributes for trigger (combobox pattern)
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", listboxId);
  if (precedingLabel) {
    trigger.setAttribute("aria-labelledby", labelId);
  }

  const dropdown = ce("div.custom-select-dropdown", wrapper);
  dropdown.id = listboxId;
  dropdown.setAttribute("role", "listbox");
  if (precedingLabel) {
    dropdown.setAttribute("aria-labelledby", labelId);
  }

  let currentValue = defaultValue || options[0]?.value;
  const changeListeners = [];

  // Helper to update ARIA attributes
  function updateAriaSelected() {
    dropdown.querySelectorAll(".custom-select-option").forEach(o => {
      const isSelected = o.dataset.value === currentValue;
      o.setAttribute("aria-selected", isSelected ? "true" : "false");
      o.classList.toggle("selected", isSelected);
    });
    // Update aria-activedescendant
    const selectedOption = dropdown.querySelector(`[data-value="${currentValue}"]`);
    if (selectedOption) {
      trigger.setAttribute("aria-activedescendant", selectedOption.id);
    }
  }

  options.forEach((opt, index) => {
    const optionId = `${baseId}-option-${index}`;
    const option = ce("div.custom-select-option", dropdown, {
      textContent: opt.label
    });
    option.id = optionId;
    option.dataset.value = opt.value;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", opt.value === currentValue ? "true" : "false");

    if (opt.value === currentValue) {
      option.classList.add("selected");
      trigger.setAttribute("aria-activedescendant", optionId);
    }

    option.addEventListener("click", () => {
      currentValue = opt.value;
      trigger.textContent = opt.label;

      // Update selected state
      updateAriaSelected();

      // Close dropdown
      wrapper.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");

      // Return focus to trigger
      trigger.focus();

      // Fire change event
      changeListeners.forEach(fn => fn());
    });
  });

  // Toggle dropdown
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();

    // Close other dropdowns
    document.querySelectorAll(".custom-select.open").forEach(s => {
      if (s !== wrapper) {
        s.classList.remove("open");
        s.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
      }
    });

    const isOpen = wrapper.classList.toggle("open");
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Keyboard navigation
  trigger.addEventListener("keydown", (e) => {
    const isOpen = wrapper.classList.contains("open");

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = options.findIndex(o => o.value === currentValue);
      let newIndex;

      if (e.key === "ArrowDown") {
        newIndex = Math.min(currentIndex + 1, options.length - 1);
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }

      if (newIndex !== currentIndex) {
        const newOpt = options[newIndex];
        currentValue = newOpt.value;
        trigger.textContent = newOpt.label;

        updateAriaSelected();
        changeListeners.forEach(fn => fn());
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const nowOpen = wrapper.classList.toggle("open");
      trigger.setAttribute("aria-expanded", nowOpen ? "true" : "false");
    } else if (e.key === "Escape") {
      if (isOpen) {
        wrapper.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      if (options.length > 0) {
        currentValue = options[0].value;
        trigger.textContent = options[0].label;
        updateAriaSelected();
        changeListeners.forEach(fn => fn());
      }
    } else if (e.key === "End") {
      e.preventDefault();
      if (options.length > 0) {
        currentValue = options[options.length - 1].value;
        trigger.textContent = options[options.length - 1].label;
        updateAriaSelected();
        changeListeners.forEach(fn => fn());
      }
    }
  });

  return {
    get value() { return currentValue; },
    set value(v) {
      const opt = options.find(o => o.value === v);
      if (opt) {
        currentValue = v;
        trigger.textContent = opt.label;
        updateAriaSelected();
      }
    },
    addEventListener(event, fn) {
      if (event === "change") {
        changeListeners.push(fn);
      }
    },
    element: wrapper,
    trigger: trigger
  };
}

// Close dropdowns when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".custom-select.open").forEach(s => {
    s.classList.remove("open");
    s.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
  });
});

// Build the UI
const container = ce("div.container", document.body);
container.setAttribute("role", "main");
container.setAttribute("aria-label", "QR Code Generator");

// Header
const header = ce("header", container);
ce("h1", header, { textContent: "QR Generator" });
ce("p", header, { textContent: "Generate QR codes instantly" });

// Input Card
const inputCard = ce("div.card", container);
const inputSection = ce("div.input-section", inputCard);

// Type selector
const typeGroup = ce("div.option-group.full-width", inputSection);
ce("label", typeGroup, { textContent: "Type" });
const typeSelect = createCustomSelect(typeGroup, [
  { value: "text", label: "Text / URL" },
  { value: "wifi", label: "WiFi" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "SMS" },
  { value: "vcard", label: "Contact (vCard)" },
  { value: "geo", label: "Location" }
], "text", "type-select");

// Dynamic form container
const formContainer = ce("div.form-container", inputSection);

// Form definitions
const forms = {
  text: [
    { id: "text-content", label: "Content", type: "textarea", placeholder: "Enter text, URL, or any content..." }
  ],
  wifi: [
    { id: "wifi-ssid", label: "Network Name (SSID)", type: "text", placeholder: "MyNetwork" },
    { id: "wifi-password", label: "Password", type: "text", placeholder: "Password (leave empty if open)" },
    { id: "wifi-security", label: "Security", type: "select", options: [
      { value: "WPA", label: "WPA/WPA2" },
      { value: "WEP", label: "WEP" },
      { value: "nopass", label: "None (Open)" }
    ]},
    { id: "wifi-hidden", label: "Hidden Network", type: "checkbox" }
  ],
  email: [
    { id: "email-to", label: "To", type: "text", placeholder: "recipient@example.com" },
    { id: "email-subject", label: "Subject", type: "text", placeholder: "Subject line" },
    { id: "email-body", label: "Body", type: "textarea", placeholder: "Email content..." }
  ],
  phone: [
    { id: "phone-number", label: "Phone Number", type: "tel", placeholder: "+1234567890" }
  ],
  sms: [
    { id: "sms-number", label: "Phone Number", type: "tel", placeholder: "+1234567890" },
    { id: "sms-message", label: "Message", type: "textarea", placeholder: "Your message..." }
  ],
  vcard: [
    { id: "vcard-firstname", label: "First Name", type: "text", placeholder: "John" },
    { id: "vcard-lastname", label: "Last Name", type: "text", placeholder: "Doe" },
    { id: "vcard-phone", label: "Phone", type: "tel", placeholder: "+1234567890" },
    { id: "vcard-email", label: "Email", type: "text", placeholder: "john@example.com" },
    { id: "vcard-org", label: "Organization", type: "text", placeholder: "Company Inc." },
    { id: "vcard-title", label: "Job Title", type: "text", placeholder: "Developer" },
    { id: "vcard-url", label: "Website", type: "text", placeholder: "https://example.com" }
  ],
  geo: [
    { id: "geo-lat", label: "Latitude", type: "text", placeholder: "52.5200" },
    { id: "geo-lon", label: "Longitude", type: "text", placeholder: "13.4050" }
  ]
};

// Store form field references
let formFields = {};

function renderForm(type) {
  formContainer.innerHTML = "";
  formFields = {};

  const fields = forms[type];
  fields.forEach(field => {
    const group = ce("div.form-group", formContainer);

    if (field.type === "checkbox") {
      const checkGroup = ce("div.checkbox-group", group);
      const input = ce("input#" + field.id, checkGroup, { type: "checkbox" });
      ce("label", checkGroup, { textContent: field.label, htmlFor: field.id });
      formFields[field.id] = input;
    } else if (field.type === "select") {
      ce("label", group, { textContent: field.label });
      const select = createCustomSelect(group, field.options, field.options[0]?.value, field.id);
      formFields[field.id] = select;
    } else if (field.type === "textarea") {
      ce("label", group, { textContent: field.label, htmlFor: field.id });
      const textarea = ce("textarea#" + field.id, group, { placeholder: field.placeholder || "", spellcheck: false });
      formFields[field.id] = textarea;
    } else {
      ce("label", group, { textContent: field.label, htmlFor: field.id });
      const input = ce("input#" + field.id, group, { type: field.type, placeholder: field.placeholder || "" });
      formFields[field.id] = input;
    }
  });

  // Add event listeners to all form fields
  Object.values(formFields).forEach(field => {
    if (field.addEventListener) {
      field.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generate, 300);
      });
      field.addEventListener("change", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generate, 300);
      });
    }
    if (field.tagName) {
      field.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault();
          generate();
        }
      });
    }
  });

  // Focus first field
  const firstField = Object.values(formFields)[0];
  if (firstField?.focus) firstField.focus();
}

function getQRData() {
  const type = typeSelect.value;

  switch (type) {
    case "text":
      return formFields["text-content"]?.value?.trim() || "";

    case "wifi": {
      const ssid = formFields["wifi-ssid"]?.value?.trim() || "";
      const password = formFields["wifi-password"]?.value || "";
      const security = formFields["wifi-security"]?.value || "WPA";
      const hidden = formFields["wifi-hidden"]?.checked ? "true" : "false";
      if (!ssid) return "";
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
    }

    case "email": {
      const to = formFields["email-to"]?.value?.trim() || "";
      const subject = formFields["email-subject"]?.value?.trim() || "";
      const body = formFields["email-body"]?.value?.trim() || "";
      if (!to) return "";
      let mailto = `mailto:${encodeURIComponent(to)}`;
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) mailto += "?" + params.join("&");
      return mailto;
    }

    case "phone": {
      const number = formFields["phone-number"]?.value?.trim() || "";
      if (!number) return "";
      return `tel:${number}`;
    }

    case "sms": {
      const number = formFields["sms-number"]?.value?.trim() || "";
      const message = formFields["sms-message"]?.value?.trim() || "";
      if (!number) return "";
      let sms = `sms:${number}`;
      if (message) sms += `?body=${encodeURIComponent(message)}`;
      return sms;
    }

    case "vcard": {
      const firstName = formFields["vcard-firstname"]?.value?.trim() || "";
      const lastName = formFields["vcard-lastname"]?.value?.trim() || "";
      const phone = formFields["vcard-phone"]?.value?.trim() || "";
      const email = formFields["vcard-email"]?.value?.trim() || "";
      const org = formFields["vcard-org"]?.value?.trim() || "";
      const title = formFields["vcard-title"]?.value?.trim() || "";
      const url = formFields["vcard-url"]?.value?.trim() || "";

      if (!firstName && !lastName) return "";

      let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
      vcard += `N:${lastName};${firstName};;;\n`;
      vcard += `FN:${firstName} ${lastName}\n`;
      if (phone) vcard += `TEL:${phone}\n`;
      if (email) vcard += `EMAIL:${email}\n`;
      if (org) vcard += `ORG:${org}\n`;
      if (title) vcard += `TITLE:${title}\n`;
      if (url) vcard += `URL:${url}\n`;
      vcard += "END:VCARD";
      return vcard;
    }

    case "geo": {
      const lat = formFields["geo-lat"]?.value?.trim() || "";
      const lon = formFields["geo-lon"]?.value?.trim() || "";
      if (!lat || !lon) return "";
      return `geo:${lat},${lon}`;
    }

    default:
      return "";
  }
}

// Options
const options = ce("div.options", inputSection);

const sizeGroup = ce("div.option-group", options);
ce("label", sizeGroup, { textContent: "Size" });
const sizeSelect = createCustomSelect(sizeGroup, [
  { value: "1", label: "Pixel-perfect" },
  { value: "4", label: "Small" },
  { value: "8", label: "Medium" },
  { value: "12", label: "Large" },
  { value: "16", label: "Extra Large" }
], "8", "size-select");

const errorGroup = ce("div.option-group", options);
ce("label", errorGroup, { textContent: "Error Correction" });
const errorSelect = createCustomSelect(errorGroup, [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" }
], "L", "error-select");

const outlineGroup = ce("div.option-group", options);
ce("label", outlineGroup, { textContent: "Outline" });
const outlineSelect = createCustomSelect(outlineGroup, [
  { value: "0", label: "None" },
  { value: "1", label: "1 unit" },
  { value: "2", label: "2 units" },
  { value: "4", label: "4 units" }
], "1", "outline-select");

// Output Card
const outputCard = ce("div.card", container);
outputCard.setAttribute("aria-label", "QR Code Output");
const outputSection = ce("div.output-section", outputCard);

const qrContainer = ce("div.qr-container", outputSection);
qrContainer.setAttribute("role", "img");
qrContainer.setAttribute("aria-label", "QR code preview area");

// Status element for screen reader announcements
const statusAnnouncer = ce("div", outputSection, { className: "sr-only" });
statusAnnouncer.setAttribute("role", "status");
statusAnnouncer.setAttribute("aria-live", "polite");
statusAnnouncer.setAttribute("aria-atomic", "true");

const placeholder = ce("div.qr-placeholder", qrContainer, { textContent: "Your QR code will appear here" });
placeholder.setAttribute("aria-hidden", "true");
const img = ce("img", qrContainer, { alt: "Generated QR Code", style: { display: "none" } });

const actions = ce("div.actions", outputSection);
actions.setAttribute("role", "group");
actions.setAttribute("aria-label", "QR code actions");
const generateBtn = ce("button.btn-primary", actions, { textContent: "Generate" });
const downloadBtn = ce("button.btn-secondary", actions, { textContent: "Download", disabled: true });
downloadBtn.setAttribute("aria-describedby", "download-hint");

ce("div.keyboard-hint", outputSection, { innerHTML: "Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate" });

// Footer
const footer = ce("footer", container);
footer.innerHTML = 'Made by <a href="https://contact.gottz.de" target="_blank">GottZ</a>';

// QR Generation Logic
qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

let lastGenerated = null;
let debounceTimer;

function generate() {
  const text = getQRData();
  const type = typeSelect.value;

  if (!text) {
    img.style.display = "none";
    placeholder.textContent = "Your QR code will appear here";
    placeholder.style.display = "block";
    downloadBtn.disabled = true;
    lastGenerated = null;
    qrContainer.setAttribute("aria-label", "QR code preview area - empty");
    return;
  }

  try {
    const size = parseInt(sizeSelect.value, 10);
    const errorLevel = errorSelect.value;
    const outline = parseInt(outlineSelect.value, 10);

    const qr = qrcode(0, errorLevel);
    qr.addData(text);
    qr.make();

    // margin parameter is in pixels, so multiply by cell size
    const dataUrl = qr.createDataURL(size, outline * size);
    img.src = dataUrl;
    img.style.display = "block";
    placeholder.style.display = "none";
    downloadBtn.disabled = false;

    // Generate descriptive alt text based on QR type
    const typeLabels = {
      text: "text content",
      wifi: "WiFi network credentials",
      email: "email link",
      phone: "phone number",
      sms: "SMS message",
      vcard: "contact card",
      geo: "geographic location"
    };
    const altText = `Generated QR code containing ${typeLabels[type] || "data"}`;
    img.alt = altText;
    qrContainer.setAttribute("aria-label", altText);

    // Announce to screen readers
    statusAnnouncer.textContent = `QR code generated successfully for ${typeLabels[type] || "your content"}`;

    lastGenerated = { dataUrl, text };
  } catch (e) {
    placeholder.textContent = "Content too long for QR code";
    placeholder.style.display = "block";
    img.style.display = "none";
    downloadBtn.disabled = true;
    lastGenerated = null;
    qrContainer.setAttribute("aria-label", "QR code preview area - error");
    statusAnnouncer.textContent = "Error: Content is too long for QR code";
  }
}

function download() {
  if (!lastGenerated) return;

  const link = document.createElement("a");
  link.download = "qrcode.png";
  link.href = lastGenerated.dataUrl;
  link.click();
}

// Event Listeners
generateBtn.addEventListener("click", generate);
downloadBtn.addEventListener("click", download);

typeSelect.addEventListener("change", () => {
  renderForm(typeSelect.value);
  generate();
});

sizeSelect.addEventListener("change", generate);
errorSelect.addEventListener("change", generate);
outlineSelect.addEventListener("change", generate);

// Initialize
renderForm("text");
