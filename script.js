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
  { value: "geo", label: "Location" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "sepa", label: "SEPA Payment" },
  { value: "event", label: "Calendar Event" }
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
  ],
  bitcoin: [
    { id: "btc-address", label: "Address", type: "text", placeholder: "bc1q..." },
    { id: "btc-amount", label: "Amount (BTC)", type: "text", placeholder: "0.001 (optional)" },
    { id: "btc-label", label: "Label", type: "text", placeholder: "Recipient name (optional)" },
    { id: "btc-message", label: "Message", type: "text", placeholder: "Payment description (optional)" }
  ],
  sepa: [
    { id: "sepa-name", label: "Recipient", type: "text", placeholder: "Max Mustermann" },
    { id: "sepa-iban", label: "IBAN", type: "text", placeholder: "DE89 3704 0044 0532 0130 00" },
    { id: "sepa-amount", label: "Amount (EUR)", type: "text", placeholder: "10.00 (optional)" },
    { id: "sepa-bic", label: "BIC", type: "text", placeholder: "COBADEFFXXX (optional)" },
    { id: "sepa-reference", label: "Reference", type: "text", placeholder: "Invoice 2024-001 (optional)" }
  ],
  event: [
    { id: "event-title", label: "Title", type: "text", placeholder: "Team Meeting" },
    { id: "event-start", label: "Start", type: "datetime-local" },
    { id: "event-end", label: "End", type: "datetime-local" },
    { id: "event-location", label: "Location", type: "text", placeholder: "Conference Room (optional)" },
    { id: "event-description", label: "Description", type: "textarea", placeholder: "Event details (optional)" }
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

    case "bitcoin": {
      const address = formFields["btc-address"]?.value?.trim() || "";
      if (!address) return "";
      let uri = `bitcoin:${address}`;
      const params = [];
      const amount = formFields["btc-amount"]?.value?.trim();
      const label = formFields["btc-label"]?.value?.trim();
      const message = formFields["btc-message"]?.value?.trim();
      if (amount) params.push(`amount=${amount}`);
      if (label) params.push(`label=${encodeURIComponent(label)}`);
      if (message) params.push(`message=${encodeURIComponent(message)}`);
      if (params.length) uri += "?" + params.join("&");
      return uri;
    }

    case "sepa": {
      const name = formFields["sepa-name"]?.value?.trim() || "";
      const iban = formFields["sepa-iban"]?.value?.trim().replace(/\s/g, "") || "";
      if (!name || !iban) return "";
      const bic = formFields["sepa-bic"]?.value?.trim() || "";
      const amount = formFields["sepa-amount"]?.value?.trim();
      const reference = formFields["sepa-reference"]?.value?.trim() || "";
      return [
        "BCD", "002", "1", "SCT",
        bic, name, iban,
        amount ? `EUR${amount}` : "",
        "", "", reference, ""
      ].join("\n");
    }

    case "event": {
      const title = formFields["event-title"]?.value?.trim() || "";
      const start = formFields["event-start"]?.value || "";
      if (!title || !start) return "";
      const end = formFields["event-end"]?.value || "";
      const location = formFields["event-location"]?.value?.trim() || "";
      const description = formFields["event-description"]?.value?.trim() || "";
      const fmtDate = (d) => d.replace(/[-:]/g, "") + "00";
      let vcal = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT";
      vcal += `\nSUMMARY:${title}`;
      vcal += `\nDTSTART:${fmtDate(start)}`;
      if (end) vcal += `\nDTEND:${fmtDate(end)}`;
      if (location) vcal += `\nLOCATION:${location}`;
      if (description) vcal += `\nDESCRIPTION:${description}`;
      vcal += "\nEND:VEVENT\nEND:VCALENDAR";
      return vcal;
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
footer.innerHTML = 'Made by <a href="https://contact.gottz.de" target="_blank">GottZ</a> · <a href="https://github.com/GottZ/QR-Generator" target="_blank">GitHub</a>';

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
    const errorLevel = type === "sepa" ? "M" : errorSelect.value;
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
      geo: "geographic location",
      bitcoin: "Bitcoin payment address",
      sepa: "SEPA payment",
      event: "calendar event"
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

// Share target handling
async function checkSharedData() {
  const params = new URLSearchParams(window.location.search);

  // Check for POST share data (via service worker)
  if (params.get("shared") === "1") {
    try {
      const res = await fetch("/qr/get-shared-data");
      const data = await res.json();
      if (data) {
        handleSharedContent(data);
      }
    } catch (e) {
      // ignore
    }
    history.replaceState(null, "", window.location.pathname);
    return;
  }

  // Check for GET share params
  const title = params.get("title");
  const text = params.get("text");
  const url = params.get("url");
  if (title || text || url) {
    handleSharedContent({ title: title || "", text: text || "", url: url || "" });
    history.replaceState(null, "", window.location.pathname);
  }
}

function handleSharedContent(data) {
  // Determine primary content - prefer file content, then url, then text, then title
  let content = data.fileContent || data.url || data.text || data.title || "";

  // If we have both url and text, combine them
  if (data.url && data.text && !data.fileContent) {
    content = data.text.includes(data.url) ? data.text : data.text + "\n" + data.url;
  }

  if (!content) return;

  // Auto-detect type based on content
  if (data.fileType === "text/vcard" || data.fileType === "text/x-vcard" ||
      (data.fileName && data.fileName.endsWith(".vcf")) ||
      content.startsWith("BEGIN:VCARD")) {
    handleSharedVCard(content);
  } else if (content.startsWith("WIFI:")) {
    handleSharedWifi(content);
  } else if (content.startsWith("tel:")) {
    typeSelect.value = "phone";
    renderForm("phone");
    if (formFields["phone-number"]) formFields["phone-number"].value = content.slice(4);
    generate();
  } else if (content.startsWith("mailto:")) {
    handleSharedEmail(content);
  } else if (content.startsWith("sms:")) {
    handleSharedSms(content);
  } else if (content.startsWith("geo:")) {
    handleSharedGeo(content);
  } else if (content.startsWith("bitcoin:")) {
    handleSharedBitcoin(content);
  } else if (content.startsWith("BCD\n")) {
    handleSharedSepa(content);
  } else if (content.startsWith("BEGIN:VCALENDAR") || content.startsWith("BEGIN:VEVENT")) {
    handleSharedEvent(content);
  } else {
    typeSelect.value = "text";
    renderForm("text");
    if (formFields["text-content"]) formFields["text-content"].value = content;
    generate();
  }
}

function handleSharedVCard(content) {
  typeSelect.value = "vcard";
  renderForm("vcard");

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    const val = rest.join(":");
    const baseKey = key.split(";")[0].toUpperCase();

    if (baseKey === "FN") {
      const parts = val.trim().split(/\s+/);
      if (formFields["vcard-firstname"]) formFields["vcard-firstname"].value = parts[0] || "";
      if (formFields["vcard-lastname"]) formFields["vcard-lastname"].value = parts.slice(1).join(" ");
    } else if (baseKey === "N") {
      const parts = val.split(";");
      if (formFields["vcard-lastname"]) formFields["vcard-lastname"].value = parts[0] || "";
      if (formFields["vcard-firstname"]) formFields["vcard-firstname"].value = parts[1] || "";
    } else if (baseKey === "TEL") {
      if (formFields["vcard-phone"]) formFields["vcard-phone"].value = val;
    } else if (baseKey === "EMAIL") {
      if (formFields["vcard-email"]) formFields["vcard-email"].value = val;
    } else if (baseKey === "ORG") {
      if (formFields["vcard-org"]) formFields["vcard-org"].value = val;
    } else if (baseKey === "TITLE") {
      if (formFields["vcard-title"]) formFields["vcard-title"].value = val;
    } else if (baseKey === "URL") {
      if (formFields["vcard-url"]) formFields["vcard-url"].value = val;
    }
  }
  generate();
}

function handleSharedWifi(content) {
  typeSelect.value = "wifi";
  renderForm("wifi");

  const match = content.match(/WIFI:(?:.*?T:(.*?);)?(?:.*?S:(.*?);)?(?:.*?P:(.*?);)?(?:.*?H:(.*?);)?/);
  if (match) {
    if (formFields["wifi-security"] && match[1]) formFields["wifi-security"].value = match[1];
    if (formFields["wifi-ssid"] && match[2]) formFields["wifi-ssid"].value = match[2];
    if (formFields["wifi-password"] && match[3]) formFields["wifi-password"].value = match[3];
    if (formFields["wifi-hidden"] && match[4]) formFields["wifi-hidden"].checked = match[4] === "true";
  }
  generate();
}

function handleSharedEmail(content) {
  typeSelect.value = "email";
  renderForm("email");

  const url = new URL(content);
  if (formFields["email-to"]) formFields["email-to"].value = decodeURIComponent(url.pathname);
  if (formFields["email-subject"]) formFields["email-subject"].value = url.searchParams.get("subject") || "";
  if (formFields["email-body"]) formFields["email-body"].value = url.searchParams.get("body") || "";
  generate();
}

function handleSharedSms(content) {
  typeSelect.value = "sms";
  renderForm("sms");

  const [numberPart, ...rest] = content.slice(4).split("?");
  if (formFields["sms-number"]) formFields["sms-number"].value = numberPart;
  const params = new URLSearchParams(rest.join("?"));
  if (formFields["sms-message"]) formFields["sms-message"].value = params.get("body") || "";
  generate();
}

function handleSharedGeo(content) {
  typeSelect.value = "geo";
  renderForm("geo");

  const coords = content.slice(4).split(",");
  if (formFields["geo-lat"] && coords[0]) formFields["geo-lat"].value = coords[0];
  if (formFields["geo-lon"] && coords[1]) formFields["geo-lon"].value = coords[1];
  generate();
}

function handleSharedBitcoin(content) {
  typeSelect.value = "bitcoin";
  renderForm("bitcoin");
  const match = content.match(/^bitcoin:([^?]+)(?:\?(.*))?$/i);
  if (match) {
    if (formFields["btc-address"]) formFields["btc-address"].value = match[1];
    if (match[2]) {
      const params = new URLSearchParams(match[2]);
      if (formFields["btc-amount"]) formFields["btc-amount"].value = params.get("amount") || "";
      if (formFields["btc-label"]) formFields["btc-label"].value = params.get("label") || "";
      if (formFields["btc-message"]) formFields["btc-message"].value = params.get("message") || "";
    }
  }
  generate();
}

function handleSharedSepa(content) {
  typeSelect.value = "sepa";
  renderForm("sepa");
  const lines = content.split("\n");
  if (formFields["sepa-name"] && lines[5]) formFields["sepa-name"].value = lines[5];
  if (formFields["sepa-iban"] && lines[6]) formFields["sepa-iban"].value = lines[6];
  if (formFields["sepa-bic"] && lines[4]) formFields["sepa-bic"].value = lines[4];
  if (formFields["sepa-amount"] && lines[7]) formFields["sepa-amount"].value = lines[7].replace(/^EUR/i, "");
  if (formFields["sepa-reference"] && lines[10]) formFields["sepa-reference"].value = lines[10];
  generate();
}

function handleSharedEvent(content) {
  typeSelect.value = "event";
  renderForm("event");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    const val = rest.join(":");
    const baseKey = key.split(";")[0].toUpperCase();
    if (baseKey === "SUMMARY") {
      if (formFields["event-title"]) formFields["event-title"].value = val;
    } else if (baseKey === "DTSTART") {
      if (formFields["event-start"]) formFields["event-start"].value = iCalToLocal(val);
    } else if (baseKey === "DTEND") {
      if (formFields["event-end"]) formFields["event-end"].value = iCalToLocal(val);
    } else if (baseKey === "LOCATION") {
      if (formFields["event-location"]) formFields["event-location"].value = val;
    } else if (baseKey === "DESCRIPTION") {
      if (formFields["event-description"]) formFields["event-description"].value = val;
    }
  }
  generate();
}

function iCalToLocal(ical) {
  const s = ical.replace("Z", "");
  if (s.length < 13) return "";
  return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T${s.slice(9,11)}:${s.slice(11,13)}`;
}

// Initialize
renderForm("text");
checkSharedData();
