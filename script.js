// Build the UI
const container = ce("div.container", document.body);

// Header
const header = ce("header", container);
ce("h1", header, { textContent: "QR Generator" });
ce("p", header, { textContent: "Generate QR codes instantly" });

// Input Card
const inputCard = ce("div.card", container);
const inputSection = ce("div.input-section", inputCard);

// Type selector
const typeGroup = ce("div.option-group.full-width", inputSection);
ce("label", typeGroup, { textContent: "Type", htmlFor: "type-select" });
const typeSelect = ce("select#type-select", typeGroup);
[
  { value: "text", label: "Text / URL" },
  { value: "wifi", label: "WiFi" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "SMS" },
  { value: "vcard", label: "Contact (vCard)" },
  { value: "geo", label: "Location" }
].forEach(opt => {
  ce("option", typeSelect, { value: opt.value, textContent: opt.label });
});

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
      ce("label", group, { textContent: field.label, htmlFor: field.id });
      const select = ce("select#" + field.id, group);
      field.options.forEach(opt => {
        ce("option", select, { value: opt.value, textContent: opt.label });
      });
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
    field.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(generate, 300);
    });
    field.addEventListener("change", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(generate, 300);
    });
    field.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    });
  });

  // Focus first field
  const firstField = Object.values(formFields)[0];
  if (firstField) firstField.focus();
}

function getQRData() {
  const type = typeSelect.value;

  switch (type) {
    case "text":
      return formFields["text-content"]?.value.trim() || "";

    case "wifi": {
      const ssid = formFields["wifi-ssid"]?.value.trim() || "";
      const password = formFields["wifi-password"]?.value || "";
      const security = formFields["wifi-security"]?.value || "WPA";
      const hidden = formFields["wifi-hidden"]?.checked ? "true" : "false";
      if (!ssid) return "";
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
    }

    case "email": {
      const to = formFields["email-to"]?.value.trim() || "";
      const subject = formFields["email-subject"]?.value.trim() || "";
      const body = formFields["email-body"]?.value.trim() || "";
      if (!to) return "";
      let mailto = `mailto:${encodeURIComponent(to)}`;
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) mailto += "?" + params.join("&");
      return mailto;
    }

    case "phone": {
      const number = formFields["phone-number"]?.value.trim() || "";
      if (!number) return "";
      return `tel:${number}`;
    }

    case "sms": {
      const number = formFields["sms-number"]?.value.trim() || "";
      const message = formFields["sms-message"]?.value.trim() || "";
      if (!number) return "";
      let sms = `sms:${number}`;
      if (message) sms += `?body=${encodeURIComponent(message)}`;
      return sms;
    }

    case "vcard": {
      const firstName = formFields["vcard-firstname"]?.value.trim() || "";
      const lastName = formFields["vcard-lastname"]?.value.trim() || "";
      const phone = formFields["vcard-phone"]?.value.trim() || "";
      const email = formFields["vcard-email"]?.value.trim() || "";
      const org = formFields["vcard-org"]?.value.trim() || "";
      const title = formFields["vcard-title"]?.value.trim() || "";
      const url = formFields["vcard-url"]?.value.trim() || "";

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
      const lat = formFields["geo-lat"]?.value.trim() || "";
      const lon = formFields["geo-lon"]?.value.trim() || "";
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
ce("label", sizeGroup, { textContent: "Size", htmlFor: "size-select" });
const sizeSelect = ce("select#size-select", sizeGroup);
[
  { value: "1", label: "Pixel-perfect" },
  { value: "4", label: "Small" },
  { value: "8", label: "Medium" },
  { value: "12", label: "Large" },
  { value: "16", label: "Extra Large" }
].forEach(opt => {
  const option = ce("option", sizeSelect, { value: opt.value, textContent: opt.label });
  if (opt.value === "8") option.selected = true;
});

const errorGroup = ce("div.option-group", options);
ce("label", errorGroup, { textContent: "Error Correction", htmlFor: "error-select" });
const errorSelect = ce("select#error-select", errorGroup);
[
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" }
].forEach(opt => {
  ce("option", errorSelect, { value: opt.value, textContent: opt.label });
});

const outlineGroup = ce("div.option-group", options);
ce("label", outlineGroup, { textContent: "Outline", htmlFor: "outline-select" });
const outlineSelect = ce("select#outline-select", outlineGroup);
[
  { value: "0", label: "None" },
  { value: "1", label: "1 unit" },
  { value: "2", label: "2 units" },
  { value: "4", label: "4 units" }
].forEach(opt => {
  const option = ce("option", outlineSelect, { value: opt.value, textContent: opt.label });
  if (opt.value === "1") option.selected = true;
});

// Output Card
const outputCard = ce("div.card", container);
const outputSection = ce("div.output-section", outputCard);

const qrContainer = ce("div.qr-container", outputSection);
const placeholder = ce("div.qr-placeholder", qrContainer, { textContent: "Your QR code will appear here" });
const img = ce("img", qrContainer, { alt: "QR Code", style: { display: "none" } });

const actions = ce("div.actions", outputSection);
const generateBtn = ce("button.btn-primary", actions, { textContent: "Generate" });
const downloadBtn = ce("button.btn-secondary", actions, { textContent: "Download", disabled: true });

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

  if (!text) {
    img.style.display = "none";
    placeholder.textContent = "Your QR code will appear here";
    placeholder.style.display = "block";
    downloadBtn.disabled = true;
    lastGenerated = null;
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

    lastGenerated = { dataUrl, text };
  } catch (e) {
    placeholder.textContent = "Content too long for QR code";
    placeholder.style.display = "block";
    img.style.display = "none";
    downloadBtn.disabled = true;
    lastGenerated = null;
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
