import { useCallback, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import SinglePanel from "./components/SinglePanel.jsx";
import BulkPanel from "./components/BulkPanel.jsx";
import StylePanel from "./components/StylePanel.jsx";
import Preview from "./components/Preview.jsx";
import Footer, { CompanyCta, Faq } from "./components/Footer.jsx";
import { BRAND } from "./config.js";
import { DEFAULT_STYLE, toQROptions } from "./lib/options.js";

const TABS = [
  { id: "single", label: "Single QR code" },
  { id: "bulk", label: "Bulk (CSV)" },
];

export default function App() {
  const [tab, setTab] = useState("single");
  const [text, setText] = useState(BRAND.siteUrl);
  const [rows, setRows] = useState([]);
  const [style, setStyle] = useState(DEFAULT_STYLE);

  const updateStyle = useCallback((key, value) => setStyle((s) => ({ ...s, [key]: value })), []);

  // One style panel drives both tabs; bulk previews its first row.
  const first = rows[0];
  const previewOptions = useMemo(() => {
    if (tab === "single") return text.trim() ? toQROptions(style, text) : null;
    return first ? toQROptions(style, first.text, first.topText) : null;
  }, [tab, text, first, style]);

  return (
    <>
      <Header />

      <main>
        <section className="container hero">
          <h1>Free QR code generator</h1>
          <p>
            Create custom QR codes in seconds — pick your colours, add a heading, download as PNG, SVG or PDF, or make up to 100 at once from a CSV.
            Everything runs in your browser: nothing is uploaded.
          </p>
        </section>

        <div className="container">
          <div className="tabs" role="tablist" aria-label="Generator mode">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="workspace" className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="workspace" id="workspace" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            <div className="area-content">
              {tab === "single" ? (
                <SinglePanel text={text} onChange={setText} />
              ) : (
                <BulkPanel rows={rows} onRowsChange={setRows} makeOptions={(value, rowHeading) => toQROptions(style, value, rowHeading)} />
              )}
            </div>
            <div className="area-preview">
              <Preview options={previewOptions} mode={tab} caption={tab === "bulk" && first ? `first of ${rows.length}` : ""} />
            </div>
            <div className="area-style">
              <StylePanel style={style} onChange={updateStyle} mode={tab} />
            </div>
          </div>
        </div>

        <Faq />
        <CompanyCta />
      </main>

      <Footer />
    </>
  );
}
