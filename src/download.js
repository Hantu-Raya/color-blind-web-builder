export function downloadBytes(filename, bytes, mimeType = "application/octet-stream") {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(filename, text, mimeType = "text/plain;charset=utf-8") {
  downloadBytes(filename, new TextEncoder().encode(String(text ?? "")), mimeType);
}
