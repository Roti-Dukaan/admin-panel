const THERMAL_PRINT_STYLES = `
@page {
  size: 100mm 150mm;
  margin: 0;
}

* {
  box-sizing: border-box;
}

html, body {
  width: 100mm;
  height: 150mm;
  margin: 0;
  padding: 0;
  background: #fff;
}

.thermal-label-paper {
  width: 100mm;
  height: 150mm;
  max-width: 100mm;
  max-height: 150mm;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  padding: 5mm 5mm 4mm;
}

.thermal-brand-header {
  text-align: center;
  margin-bottom: 4px;
}

.thermal-brand-logo {
  display: block;
  width: 36px;
  height: 36px;
  margin: 0 auto 4px;
  object-fit: cover;
  border-radius: 4px;
}

.thermal-label-paper h1 {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin: 0;
}

.thermal-brand-tagline {
  font-size: 6.5px;
  color: #444;
  margin: 2px 0 0;
}

.thermal-label-paper h2 {
  font-size: 10px;
  font-weight: 700;
  margin: 4px 0 0;
}

.thermal-divider {
  border-top: 1.5px solid #000;
  margin: 4px 0;
}

.thermal-section-title {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.thermal-row {
  font-size: 8.5px;
  line-height: 1.3;
  margin-bottom: 2px;
  word-break: break-word;
}

.thermal-row-compact {
  font-size: 7.5px;
  line-height: 1.25;
  margin-bottom: 1px;
}

.thermal-qty {
  font-size: 9px;
  font-weight: 800;
}

.thermal-badge {
  display: block;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  border: 1.5px solid #000;
  padding: 4px 3px;
  margin-top: 4px;
}

.thermal-badge-cod {
  font-size: 9px;
}

.thermal-footer {
  font-size: 6.5px;
  text-align: center;
  margin-top: 4px;
  color: #333;
}

.thermal-signature {
  font-size: 7.5px;
  margin-top: 3px;
}

.thermal-items-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.thermal-items-list li {
  margin-bottom: 3px;
}
`;

export function printThermalLabel(elementId: string): void {
  const el = document.getElementById(elementId);
  if (!el) return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><title>Print</title><style>${THERMAL_PRINT_STYLES}</style></head><body>${el.outerHTML}</body></html>`,
  );
  doc.close();

  const cleanup = () => {
    if (iframe.parentNode) document.body.removeChild(iframe);
  };

  win.onafterprint = cleanup;
  win.focus();
  win.print();
  window.setTimeout(cleanup, 2000);
}
