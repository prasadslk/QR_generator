# QR Code Generator

A free, fast QR code generator by [ceyMX](https://www.ceymx.com). Live at **https://qr.ceymx.com**.

- Custom colours, size, quiet zone and error-correction level
- Optional heading above the code and the encoded text below it
- Download as **PNG, SVG or PDF**, or copy the image to the clipboard
- **Bulk mode:** upload a CSV (up to 100 rows) and get a ZIP of QR codes
- Light and dark themes, responsive down to phone width
- **Private by design:** everything is generated in the browser. No uploads, no database, no tracking.

## How it works

The app is a static React (Vite) site. QR codes are rendered in the browser with the [`qrcode`](https://github.com/soldair/node-qrcode) library; the same layout code produces the canvas (PNG/PDF) and the SVG output, so every format looks identical. PDF and ZIP support ([`jspdf`](https://github.com/parallax/jsPDF), [`jszip`](https://stuk.github.io/jszip/)) are loaded only when needed.

`app.js` is an optional ~30-line Express server that serves the built site. You can also serve `client/dist` straight from nginx.

```
app.js              optional static server for client/dist
client/
  index.html        SEO tags, structured data
  public/           favicon, robots.txt, sitemap.xml
  src/
    config.js       brand name, URLs, "Powered by" text, limits
    lib/qr.js       QR layout + canvas/SVG rendering
    lib/export.js   PNG / SVG / PDF blobs, downloads
    lib/bulk.js     ZIP builder
    lib/csv.js      CSV parser (quotes, BOM, ; or , delimiters)
    components/     Header, panels, preview, FAQ, company call-to-action
    styles.css      all styling (CSS variables, dark mode)
```

## Develop

```bash
npm run install-all   # root + client dependencies
npm run dev           # Vite dev server on http://localhost:5173
npm run lint
```

## Bulk CSV format

```csv
text,filename,heading
https://www.ceymx.com,ceymx_website,Visit our website
"Hello, World",hello,Greeting
```

Column 1 is the QR content (required); column 2 is the file name and column 3 a heading printed above that code (both optional). A header row, UTF-8 BOM and `;`/tab delimiters are handled automatically.

## Deploy on a VPS

Build once, then serve the static files:

```bash
npm run install-all
npm run build         # creates client/dist
```

**Option A: nginx only (recommended).** No Node process to keep alive.

```nginx
server {
    server_name qr.ceymx.com;
    root /var/www/qr-app/client/dist;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
    location / { try_files $uri /index.html; }
}
```

Then add HTTPS with `sudo certbot --nginx -d qr.ceymx.com`.

**Option B: Node.** Run `PORT=3000 node app.js` under systemd or pm2 and reverse-proxy to it.

To roll out an update: `git pull && npm run build`. With option A nothing needs restarting.

## Customising the branding

Edit [`client/src/config.js`](client/src/config.js) for the company name, URLs, contact link, services chips and the "Powered by" watermark text. Page title, description and structured data live in [`client/index.html`](client/index.html).

## License

MIT
