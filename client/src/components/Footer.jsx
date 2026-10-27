import { BRAND } from "../config.js";

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. Create as many QR codes as you like, in PNG, SVG or PDF, with no sign-up and no limits on scans.",
  },
  {
    q: "Do you store my links or data?",
    a: "No. Your QR codes are generated inside your browser — your text, URLs and CSV files are never uploaded to our server.",
  },
  {
    q: "Will my QR code ever expire?",
    a: "No. These are static QR codes: the information is stored in the pattern itself, so they keep working forever and don't depend on our service. The trade-off is that you can't change the destination after printing.",
  },
  {
    q: "Which format should I use for printing?",
    a: "Use SVG or PDF for print — they stay sharp at any size. Keep strong contrast (dark code on a light background), leave the quiet zone around the code, and always test-scan a printed proof.",
  },
  {
    q: "Can I remove the “Powered by” credit?",
    a: "Yes, untick it in the Style panel. We'd appreciate it if you leave it on, as it helps other people find the tool.",
  },
];

export function Faq() {
  return (
    <section className="container faq" aria-labelledby="faq-title">
      <h2 id="faq-title">Frequently asked questions</h2>
      <div className="faq-list">
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function CompanyCta() {
  return (
    <section className="container" aria-labelledby="cta-title">
      <div className="cta">
        <div>
          <p className="eyebrow">A free tool from ceyMX</p>
          <h2 id="cta-title">Running a business? Let's make the rest of it easier too.</h2>
          <p>
            ceyMX is a Sri Lankan software company building HR &amp; payroll, ERP and custom business software that helps teams spend less time on
            paperwork.
          </p>
          <ul className="chips" aria-label="ceyMX services">
            {BRAND.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="cta-actions">
          <a className="btn btn-primary" href={BRAND.contactUrl} target="_blank" rel="noopener noreferrer">
            Talk to ceyMX
          </a>
          <a className="btn btn-secondary" href={BRAND.companyUrl} target="_blank" rel="noopener noreferrer">
            See our products
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()}{" "}
          <a href={BRAND.companyUrl} target="_blank" rel="noopener noreferrer">
            ceyMX
          </a>{" "}
          · {BRAND.tagline}
        </p>
        <p>
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        </p>
      </div>
    </footer>
  );
}
