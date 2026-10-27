import { BRAND } from "../config.js";

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <g fill="#fff">
        <path d="M5 5h8v8H5zM7 7v4h4V7z" fillRule="evenodd" />
        <path d="M19 5h8v8h-8zM21 7v4h4V7z" fillRule="evenodd" />
        <path d="M5 19h8v8H5zM7 21v4h4v-4z" fillRule="evenodd" />
        <rect x="19" y="19" width="3" height="3" />
        <rect x="24" y="19" width="3" height="3" />
        <rect x="21.5" y="22.5" width="3" height="3" />
        <rect x="19" y="25" width="3" height="3" />
        <rect x="24" y="25" width="3" height="3" />
      </g>
    </svg>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label={`${BRAND.siteName} home`}>
          <LogoMark />
          <span>
            QR<span className="brand-accent">.ceyMX</span>
          </span>
        </a>
        <a className="btn btn-ghost" href={BRAND.companyUrl} target="_blank" rel="noopener noreferrer">
          Visit ceyMX.com <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
