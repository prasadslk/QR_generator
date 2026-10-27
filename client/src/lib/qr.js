import QRCode from "qrcode";

export const ECC_LEVELS = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
];

const FONT_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
const fontOf = (weight, size) => `${weight} ${size}px ${FONT_STACK}`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let measureCtx = null;
function textWidth(font, text) {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

// Shrinks the font until the text fits, then truncates with an ellipsis as a last resort.
function fitText(text, weight, startSize, minSize, maxWidth) {
  let size = Math.round(startSize);
  while (size > minSize && textWidth(fontOf(weight, size), text) > maxWidth) size--;

  const font = fontOf(weight, size);
  if (textWidth(font, text) <= maxWidth) return { text, size };

  // Binary search for the longest prefix that still fits with an ellipsis.
  let lo = 1;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (textWidth(font, `${text.slice(0, mid)}…`) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return { text: `${text.slice(0, lo).trimEnd()}…`, size };
}

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

/**
 * Lays out a QR code plus optional heading / value / "powered by" labels.
 * The same layout feeds both the canvas (PNG, PDF) and SVG output, so every format looks identical.
 * Throws if the text is too long to fit in a QR code.
 */
export function createQR({ text, size, margin, ecc, dark, light, topText = "", showValue = false, watermark = "" }) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: ecc });
  const count = modules.size;
  const cells = count + margin * 2;
  // Whole pixels per module keep the PNG edges sharp; the actual size can differ slightly from the request.
  const scale = Math.max(1, Math.round(size / cells));
  const qrPx = scale * cells;

  const pad = Math.max(6, Math.round(qrPx * 0.03));
  const maxTextWidth = qrPx - pad * 2;

  const heading = topText ? fitText(topText, 700, clamp(qrPx * 0.075, 16, 44), 10, maxTextWidth) : null;
  const headingH = heading ? Math.round(heading.size + pad * 1.5) : 0;

  const value = showValue ? fitText(text.replace(/\s+/g, " "), 500, clamp(qrPx * 0.04, 11, 26), 9, maxTextWidth) : null;
  const valueH = value ? Math.round(value.size + pad * 1.5) : 0;

  const mark = watermark ? fitText(watermark, 500, clamp(qrPx * 0.032, 9, 16), 7, maxTextWidth) : null;
  const markH = mark ? Math.round(mark.size + pad) : 0;

  const width = qrPx;
  const height = headingH + qrPx + valueH + markH;

  const labels = [];
  if (heading) labels.push({ ...heading, weight: 700, opacity: 1, y: headingH / 2 });
  if (value) labels.push({ ...value, weight: 500, opacity: 0.85, y: headingH + qrPx + valueH / 2 });
  if (mark) labels.push({ ...mark, weight: 500, opacity: 0.55, y: headingH + qrPx + valueH + markH / 2 });

  // Horizontal runs of dark modules: [x, y, width]
  const runs = [];
  for (let row = 0; row < count; row++) {
    let col = 0;
    while (col < count) {
      if (!modules.data[row * count + col]) {
        col++;
        continue;
      }
      const start = col;
      while (col < count && modules.data[row * count + col]) col++;
      runs.push([(margin + start) * scale, headingH + (margin + row) * scale, (col - start) * scale]);
    }
  }

  return {
    width,
    height,
    draw(ctx) {
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = dark;
      for (const [x, y, w] of runs) ctx.fillRect(x, y, w, scale);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const label of labels) {
        ctx.globalAlpha = label.opacity;
        ctx.font = fontOf(label.weight, label.size);
        ctx.fillText(label.text, width / 2, label.y);
      }
      ctx.globalAlpha = 1;
    },
    svg() {
      const path = runs.map(([x, y, w]) => `M${x} ${y}h${w}v${scale}h-${w}z`).join("");
      const texts = labels
        .map(
          (l) =>
            `<text x="${width / 2}" y="${l.y}" text-anchor="middle" dominant-baseline="central" ` +
            `font-family='${FONT_STACK.replace(/"/g, "&quot;")}' font-size="${l.size}" font-weight="${l.weight}" ` +
            `fill="${escapeXml(dark)}" fill-opacity="${l.opacity}">${escapeXml(l.text)}</text>`
        )
        .join("");
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
        `<rect width="${width}" height="${height}" fill="${escapeXml(light)}"/>` +
        `<path d="${path}" fill="${escapeXml(dark)}" shape-rendering="crispEdges"/>` +
        `${texts}</svg>`
      );
    },
  };
}

export function drawToCanvas(qr, canvas) {
  canvas.width = qr.width;
  canvas.height = qr.height;
  qr.draw(canvas.getContext("2d"));
  return canvas;
}

function luminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(h.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG-style contrast ratio between the two colours (1 = identical, 21 = black on white)
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
