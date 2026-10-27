import { LIMITS } from "../config.js";

const HEADER_NAMES = new Set(["text", "url", "value", "content", "data", "qr", "qr value", "qr_value", "qrvalue"]);

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length - 1]);
  const best = counts.sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ",";
}

// Minimal RFC 4180 parser: quoted fields, escaped quotes (""), commas and newlines inside quotes.
export function parseCsv(text, delimiter = detectDelimiter(text)) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Turns CSV text into bulk items: column 1 = QR value, column 2 = filename (optional), column 3 = heading (optional).
 * A header row is skipped automatically.
 */
export function parseBulkCsv(rawText) {
  const text = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText; // strip Excel BOM
  let rows = parseCsv(text).filter((r) => r.some((cell) => cell.trim() !== ""));

  if (rows.length > 0 && HEADER_NAMES.has(rows[0][0].trim().toLowerCase())) rows = rows.slice(1);

  const all = rows
    .map((r, i) => ({
      text: (r[0] ?? "").trim(),
      filename: (r[1] ?? "").trim() || `qr_${i + 1}`,
      topText: (r[2] ?? "").trim(),
    }))
    .filter((item) => item.text);

  return {
    items: all.slice(0, LIMITS.maxBulkRows),
    truncated: Math.max(0, all.length - LIMITS.maxBulkRows),
  };
}

export const SAMPLE_CSV = [
  "text,filename,heading",
  "https://www.ceymx.com,ceymx_website,Visit our website",
  "https://example.com/menu,restaurant_menu,Scan for the menu",
  '"Hello, World",hello,Greeting',
  "tel:+94717774772,call_us,Call us",
].join("\n");
