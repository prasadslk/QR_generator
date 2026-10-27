// Everything brand-specific lives here so the app can be re-skinned in one place.
export const BRAND = {
  name: "ceyMX",
  siteName: "QR.ceyMX",
  siteUrl: "https://qr.ceymx.com",
  companyUrl: "https://www.ceymx.com",
  contactUrl: "https://www.ceymx.com/contact.php",
  email: "info@ceymx.com",
  // Printed under the QR code when "Powered by" is enabled
  watermark: "Powered by qr.ceyMX.com",
  tagline: "Empowering Business Through Innovation",
  services: ["HR & Payroll", "ERP", "Custom software", "Web development"],
};

export const LIMITS = {
  minSize: 128,
  maxSize: 2000,
  maxMargin: 8,
  maxBulkRows: 100,
  maxCsvBytes: 1024 * 1024,
  // PDFs embed a larger bitmap so they stay sharp when printed
  pdfMinPixels: 1200,
};
