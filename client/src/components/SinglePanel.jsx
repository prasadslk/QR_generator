export default function SinglePanel({ text, onChange }) {
  return (
    <section className="card" aria-labelledby="content-title">
      <h2 id="content-title" className="card-title">
        Content
      </h2>
      <div className="field">
        <label htmlFor="qr-text">Text or URL</label>
        <textarea
          id="qr-text"
          rows={4}
          value={text}
          placeholder="https://example.com"
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
        <span className="hint">
          Tip: include the full link, starting with <code>https://</code>. {text.length.toLocaleString()} characters.
        </span>
      </div>
    </section>
  );
}
