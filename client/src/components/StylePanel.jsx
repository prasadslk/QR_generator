import { BRAND, LIMITS } from "../config.js";
import { ECC_LEVELS, contrastRatio } from "../lib/qr.js";

function Slider({ id, label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div className="field">
      <div className="field-row">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {value}
          {unit}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Check({ id, checked, onChange, children, hint }) {
  return (
    <div className="check">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>
        {children}
        {hint && <span className="hint">{hint}</span>}
      </label>
    </div>
  );
}

function colorWarning({ dark, light }) {
  if (contrastRatio(dark, light) < 3) return "These colours are too similar — the code may not scan.";
  if (dark.toLowerCase() !== light.toLowerCase() && contrastRatio(dark, "#000000") > contrastRatio(light, "#000000")) {
    return "Light-on-dark codes are not read by every scanner app. Test before printing.";
  }
  return "";
}

export default function StylePanel({ style, onChange, mode }) {
  const warning = colorWarning(style);

  return (
    <section className="card" aria-labelledby="style-title">
      <h2 id="style-title" className="card-title">
        Style
      </h2>

      <div className="grid-2">
        <Slider id="size" label="Size" value={style.size} min={LIMITS.minSize} max={LIMITS.maxSize} step={8} unit=" px" onChange={(v) => onChange("size", v)} />
        <Slider id="margin" label="Quiet zone" value={style.margin} min={0} max={LIMITS.maxMargin} unit=" modules" onChange={(v) => onChange("margin", v)} />
      </div>

      <div className="field">
        <label htmlFor="ecc">Error correction</label>
        <select id="ecc" value={style.ecc} onChange={(e) => onChange("ecc", e.target.value)}>
          {ECC_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <span className="hint">Higher levels survive scuffs and logos but make the code denser.</span>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="dark">Code colour</label>
          <div className="color-input">
            <input id="dark" type="color" value={style.dark} onChange={(e) => onChange("dark", e.target.value)} />
            <code>{style.dark}</code>
          </div>
        </div>
        <div className="field">
          <label htmlFor="light">Background</label>
          <div className="color-input">
            <input id="light" type="color" value={style.light} onChange={(e) => onChange("light", e.target.value)} />
            <code>{style.light}</code>
          </div>
        </div>
      </div>
      {warning && (
        <p className="notice notice-warn" role="status">
          {warning}
        </p>
      )}

      <fieldset className="fieldset">
        <legend>Text</legend>
        <Check id="show-heading" checked={style.showHeading} onChange={(v) => onChange("showHeading", v)}>
          {mode === "bulk" ? "Heading above every code" : "Heading above the code"}
        </Check>
        {style.showHeading && (
          <input
            type="text"
            aria-label="Heading text"
            value={style.heading}
            maxLength={80}
            placeholder="e.g. Scan to visit our website"
            onChange={(e) => onChange("heading", e.target.value)}
          />
        )}
        {mode === "bulk" && style.showHeading && <span className="hint">A heading in the CSV's third column overrides this for that row.</span>}
        <Check id="show-value" checked={style.showValue} onChange={(v) => onChange("showValue", v)}>
          Show the encoded text below the code
        </Check>
      </fieldset>

      <fieldset className="fieldset">
        <legend>Branding</legend>
        <Check
          id="powered-by"
          checked={style.poweredBy}
          onChange={(v) => onChange("poweredBy", v)}
          hint={`Adds "${BRAND.watermark}" in small print. Thanks for keeping it on!`}
        >
          Show “Powered by” credit
        </Check>
      </fieldset>
    </section>
  );
}
