import { BRAND } from "../config.js";

export const DEFAULT_STYLE = {
  size: 512,
  margin: 2,
  ecc: "M",
  dark: "#000000",
  light: "#ffffff",
  showHeading: false,
  heading: "",
  showValue: false,
  poweredBy: true,
};

/**
 * Combines the shared style settings with one QR value into the options createQR() expects.
 * `rowHeading` (from a CSV row) takes priority over the global heading.
 */
export function toQROptions(style, text, rowHeading = "") {
  const global = style.showHeading ? style.heading : "";
  return {
    text,
    size: style.size,
    margin: style.margin,
    ecc: style.ecc,
    dark: style.dark,
    light: style.light,
    topText: (rowHeading || global).trim(),
    showValue: style.showValue,
    watermark: style.poweredBy ? BRAND.watermark : "",
  };
}
