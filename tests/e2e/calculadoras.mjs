// Prueba end-to-end: levanta el sitio compilado y verifica que las 5 calculadoras calculan.
// Uso: npm run build && npm run test:e2e   (BASE_URL=http://... para probar otro servidor)
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const PORT = 3100;
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
let server;
if (!process.env.BASE_URL) {
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: process.env.E2E_LOG ? "inherit" : "ignore", detached: true });
  for (let i = 0; i < 60; i++) { try { await fetch(BASE); break; } catch { await new Promise((r) => setTimeout(r, 500)); } }
}

const num = (s) => Number(s.replace(/[^\d,]/g, "").replace(",", "."));
const casos = [
  { url: "/laboral/sueldo-neto/", campo: "#bruto", valor: "2000000", espera: (t) => num(t) === 1660000 },
  { url: "/laboral/aguinaldo/", campo: "#rem", valor: "2000000", espera: (t) => num(t) === 830000 },
  { url: "/laboral/indemnizacion/", campo: "#rem", valor: "2000000", espera: (t) => num(t) > 10000000 },
  { url: "/impuestos/ganancias/", campo: "#bruto", valor: "4000000", espera: (t) => num(t) === 792864.71 },
  { url: "/impuestos/monotributo/", campo: "#fact", valor: "20000000", espera: (t) => num(t) === 66020.12 },
];

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
let fallas = 0;
try {
  const page = await browser.newPage();
  for (const c of casos) {
    await page.goto(BASE + c.url, { waitUntil: "networkidle" });
    const out = page.getByTestId("resultado");
    const antes = await out.textContent();
    // Reintenta por si la página todavía no terminó de hidratar
    for (let i = 0; i < 10; i++) {
      await page.fill(c.campo, "");
      await page.type(c.campo, c.valor);
      const cambio = await page.waitForFunction((a) => document.querySelector('[data-testid="resultado"]')?.textContent !== a, antes, { timeout: 1000 }).then(() => true, () => false);
      if (cambio) break;
    }
    const t = await out.textContent();
    try { assert.ok(c.espera(t), `${c.url}: resultado inesperado "${t}"`); console.log(`ok  ${c.url} → ${t}`); }
    catch (e) { fallas++; console.error(`MAL ${e.message}`); }
  }
} finally {
  await browser.close();
  if (server) process.kill(-server.pid, "SIGTERM");
}
process.exit(fallas ? 1 : 0);
