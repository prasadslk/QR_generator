import { LIMITS } from "../config.js";
import { createQR, drawToCanvas } from "./qr.js";

export const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "pdf", label: "PDF" },
];

const PX_TO_MM = 25.4 / 96;

const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image"))), "image/png")
  );

/** Renders the QR code described by `options` into a Blob of the requested format. */
export async function renderBlob(options, format) {
  const qr = createQR(options);

  if (format === "svg") return new Blob([qr.svg()], { type: "image/svg+xml" });
  if (format === "png") return canvasToBlob(drawToCanvas(qr, document.createElement("canvas")));

  // PDF: page is the QR's size at 96 dpi, but the embedded bitmap is larger so it prints sharp.
  const hiRes = createQR({ ...options, size: Math.max(options.size, LIMITS.pdfMinPixels) });
  const png = drawToCanvas(hiRes, document.createElement("canvas")).toDataURL("image/png");
  const { jsPDF } = await import("jspdf");
  const wMm = qr.width * PX_TO_MM;
  const hMm = wMm * (hiRes.height / hiRes.width);
  const doc = new jsPDF({ unit: "mm", format: [wMm, hMm], orientation: wMm > hMm ? "l" : "p" });
  // "FAST" makes jsPDF deflate the bitmap; the default stores it raw (~5 MB per page).
  doc.addImage(png, "PNG", 0, 0, wMm, hMm, undefined, "FAST");
  return doc.output("blob");
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export async function copyPngToClipboard(options) {
  const blob = await renderBlob(options, "png");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
