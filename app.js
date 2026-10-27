// Tiny static server for the built client (client/dist).
// All QR generation happens in the browser, so there is no API and no database.
// On a VPS you can also skip this file entirely and let nginx serve client/dist (see README).
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "client", "dist");
const PORT = process.env.PORT || 3000;

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Vite fingerprints everything in /assets, so it can be cached for a year.
app.use("/assets", express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y" }));
app.use(express.static(dist, { maxAge: "1h" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Single-page app fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(dist, "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`QR generator listening on port ${PORT}, serving ${dist}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
