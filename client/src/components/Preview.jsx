import { useEffect, useMemo, useRef, useState } from "react";
import { createQR, drawToCanvas } from "../lib/qr.js";
import { FORMATS, copyPngToClipboard, downloadBlob, renderBlob } from "../lib/export.js";

function friendlyError(error) {
  return /too big/i.test(error.message)
    ? "That is too much text for one QR code. Shorten it or lower the error-correction level."
    : `Could not create the QR code: ${error.message}`;
}

/**
 * Live preview. In "single" mode it also hosts the download buttons;
 * in "bulk" mode it previews the first CSV row.
 */
export default function Preview({ options, mode, caption }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const { qr, error } = useMemo(() => {
    if (!options) return {};
    try {
      return { qr: createQR(options) };
    } catch (e) {
      return { error: friendlyError(e) };
    }
  }, [options]);

  useEffect(() => {
    if (qr && canvasRef.current) drawToCanvas(qr, canvasRef.current);
  }, [qr]);

  const download = async (format) => {
    setBusy(true);
    setStatus("");
    try {
      downloadBlob(await renderBlob(options, format), `qrcode.${format}`);
    } catch (e) {
      setStatus(`Download failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await copyPngToClipboard(options);
      setStatus("Copied to clipboard");
    } catch {
      setStatus("Your browser blocked copying. Use Download instead.");
    }
  };

  return (
    <section className="card preview-card" aria-labelledby="preview-title">
      <h2 id="preview-title" className="card-title">
        Preview
      </h2>

      <div className="preview-stage">
        {qr ? (
          <canvas ref={canvasRef} className="preview-canvas" role="img" aria-label="QR code preview" />
        ) : (
          <div className="preview-empty">
            <span aria-hidden="true">▦</span>
            <p>{error || (mode === "bulk" ? "Upload a CSV to preview the first code." : "Type something to see your QR code.")}</p>
          </div>
        )}
        {qr && error && <p className="notice notice-warn">{error}</p>}
      </div>

      {qr && (
        <p className="preview-meta">
          {qr.width} × {qr.height} px{caption ? ` · ${caption}` : ""}
        </p>
      )}

      {mode === "single" && (
        <div className="actions">
          <div className="download-row">
            {FORMATS.map((f, i) => (
              <button key={f.value} type="button" className={`btn ${i === 0 ? "btn-primary" : "btn-secondary"}`} disabled={!qr || busy} onClick={() => download(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-block" disabled={!qr || busy} onClick={copy}>
            Copy image
          </button>
          <p className="status" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      )}
    </section>
  );
}
