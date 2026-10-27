import { renderBlob, sanitizeFilename } from "./export.js";

const nextFrame = () => new Promise((resolve) => setTimeout(resolve));

function uniqueName(base, used) {
  let name = base;
  for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base}_${n}`;
  used.add(name.toLowerCase());
  return name;
}

/**
 * Renders every item and packs them into a ZIP. Rows that cannot be encoded (e.g. text too long)
 * are skipped and reported in `failed` instead of aborting the whole batch.
 */
export async function buildZip(items, makeOptions, format, onProgress) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const used = new Set();
  const failed = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const blob = await renderBlob(makeOptions(item), format);
      const name = uniqueName(sanitizeFilename(item.filename) || `qr_${i + 1}`, used);
      zip.file(`${name}.${format}`, blob);
    } catch (error) {
      failed.push({ row: i + 1, filename: item.filename, reason: error.message });
    }
    onProgress({ done: i + 1, total: items.length });
    if (i % 3 === 2) await nextFrame(); // let the progress bar repaint
  }

  const count = items.length - failed.length;
  if (count === 0) throw new Error("None of the rows could be turned into a QR code.");

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, count, failed };
}
