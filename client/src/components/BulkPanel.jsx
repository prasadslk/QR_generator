import { useState } from "react";
import { LIMITS } from "../config.js";
import { SAMPLE_CSV, parseBulkCsv } from "../lib/csv.js";
import { FORMATS, downloadBlob } from "../lib/export.js";
import { buildZip } from "../lib/bulk.js";

const PREVIEW_ROWS = 5;

export default function BulkPanel({ rows, onRowsChange, makeOptions }) {
  const [fileName, setFileName] = useState("");
  const [truncated, setTruncated] = useState(0);
  const [format, setFormat] = useState("png");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState(null);

  const clear = () => {
    onRowsChange([]);
    setFileName("");
    setTruncated(0);
    setError("");
    setResult(null);
    setProgress({ done: 0, total: 0 });
  };

  const loadFile = async (file) => {
    if (!file) return;
    clear();
    if (file.size > LIMITS.maxCsvBytes) {
      setError("That file is larger than 1 MB. Please split it into smaller CSV files.");
      return;
    }
    try {
      const { items, truncated: extra } = parseBulkCsv(await file.text());
      if (items.length === 0) {
        setError("No rows found. The first column of each line should contain the text or URL for a QR code.");
        return;
      }
      setFileName(file.name);
      setTruncated(extra);
      onRowsChange(items);
    } catch {
      setError("Could not read that file.");
    }
  };

  const downloadSample = () => downloadBlob(new Blob([SAMPLE_CSV], { type: "text/csv" }), "sample-qr-codes.csv");

  const generate = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    setProgress({ done: 0, total: rows.length });
    try {
      const { blob, count, failed } = await buildZip(rows, (item) => makeOptions(item.text, item.topText), format, setProgress);
      downloadBlob(blob, `qr-codes-${new Date().toISOString().slice(0, 10)}.zip`);
      setResult({ count, failed });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <section className="card" aria-labelledby="bulk-title">
      <h2 id="bulk-title" className="card-title">
        Bulk CSV
      </h2>

      <label
        className={`dropzone${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          loadFile(e.dataTransfer.files[0]);
        }}
      >
        <input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => { loadFile(e.target.files[0]); e.target.value = ""; }} />
        <span className="dropzone-icon" aria-hidden="true">⇪</span>
        <strong>{fileName || "Choose a CSV file or drop it here"}</strong>
        <span className="hint">Up to {LIMITS.maxBulkRows} rows · max 1 MB</span>
      </label>

      <p className="hint">
        Columns: <code>text</code>, <code>filename</code> (optional), <code>heading</code> (optional).{" "}
        <button type="button" className="link" onClick={downloadSample}>
          Download a sample CSV
        </button>
      </p>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="table-head">
            <strong>{rows.length} codes ready</strong>
            <button type="button" className="link" onClick={clear}>
              Clear
            </button>
          </div>
          {truncated > 0 && (
            <p className="notice notice-warn">
              Only the first {LIMITS.maxBulkRows} rows are used. {truncated} extra {truncated === 1 ? "row was" : "rows were"} ignored.
            </p>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Text</th>
                  <th>File name</th>
                  <th>Heading</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, PREVIEW_ROWS).map((r, i) => (
                  <tr key={i}>
                    <td title={r.text}>{r.text}</td>
                    <td>{r.filename}</td>
                    <td>{r.topText || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > PREVIEW_ROWS && <p className="hint">…and {rows.length - PREVIEW_ROWS} more</p>}

          <div className="field">
            <span className="label" id="bulk-format-label">File format inside the ZIP</span>
            <div className="segmented" role="radiogroup" aria-labelledby="bulk-format-label">
              {FORMATS.map((f) => (
                <button key={f.value} type="button" role="radio" aria-checked={format === f.value} className={format === f.value ? "is-active" : ""} onClick={() => setFormat(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={generate}>
            {busy ? `Generating… ${percent}%` : `Generate ${rows.length} QR codes (.zip)`}
          </button>

          {(busy || result) && (
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result ? 100 : percent}>
              <div className="progress-bar" style={{ width: `${result ? 100 : percent}%` }} />
            </div>
          )}
        </>
      )}

      {result && (
        <div className="status" role="status" aria-live="polite">
          <p className="notice notice-ok">
            Done — {result.count} {result.count === 1 ? "code" : "codes"} saved to your ZIP.
          </p>
          {result.failed.length > 0 && (
            <p className="notice notice-warn">
              {result.failed.length} {result.failed.length === 1 ? "row was" : "rows were"} skipped (text too long):{" "}
              {result.failed.map((f) => `#${f.row}`).join(", ")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
