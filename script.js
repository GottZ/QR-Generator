const input = ce("textarea", document.body, { type: "text", placeholder: "Type something..." });
ce("br", document.body);
const generateButton = ce("button", document.body, { textContent: "Generate" });
ce("br", document.body);
const img = ce("img", document.body);

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

const generate = function() {
  const text = input.value;
  const qr = qrcode(0, "L");
  qr.addData(text);
  qr.make();
  img.src = qr.createDataURL(8, 8);
};

generateButton.addEventListener("click", generate);
input.addEventListener("blur", generate);
input.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    generate();
  }
});
