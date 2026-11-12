// Prueba end-to-end: levanta el sitio compilado y verifica las calculadoras publicadas + hubs + enlaces.
// Uso: npm run build && npm run test:e2e   (BASE_URL=http://... para probar otro servidor)
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const PORT = 3100;
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
let server;
if (!process.env.BASE_URL) {
  console.log(`e2e: levantando next start en :${PORT}`);
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: process.env.E2E_LOG ? "inherit" : "ignore", detached: true });
  let up = false;
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE); up = true; break; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  if (!up) {
    console.error("e2e: no pudo levantarse el servidor");
    if (server) process.kill(-server.pid, "SIGTERM");
    process.exit(1);
  }
}

const num = (s) => Number(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || Number(String(s).replace(/[^\d,]/g, "").replace(",", "."));
const cerca = (a, b, tol = 1) => Math.abs(a - b) <= tol;

async function fill(page, sel, valor) {
  const el = page.locator(sel).first();
  await el.waitFor({ state: "visible", timeout: 5000 });
  const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  if (tag === "select") {
    await el.selectOption(valor);
    return;
  }
  const type = await el.getAttribute("type");
  if (type === "date") {
    await el.fill(valor);
    return;
  }
  await el.fill("");
  await el.type(valor, { delay: 5 });
}

async function clickRadio(page, name, value) {
  await page.locator(`input[type="radio"][name="${name}"][value="${value}"]`).click();
}

/** Casos: primer test de cada prompt (montos en es-AR / pesos0 redondeado donde aplica). */
const casos = [
  // Originales
  { url: "/laboral/sueldo-neto/", fills: [["#bruto", "2000000"]], espera: (t) => cerca(num(t), 1_660_000) },
  { url: "/laboral/aguinaldo/", fills: [["#rem", "2000000"]], espera: (t) => cerca(num(t), 830_000) },
  { url: "/laboral/indemnizacion/", fills: [["#rem", "2000000"]], espera: (t) => num(t) > 10_000_000 },
  { url: "/impuestos/ganancias/", fills: [["#bruto", "4000000"]], espera: (t) => cerca(num(t), 792_864.71, 0.02) },
  {
    url: "/impuestos/retencion-ganancias/",
    fills: [["#bruto", "4000000"]],
    espera: (t) => cerca(num(t), 475_271.67, 0.02),
  },
  { url: "/impuestos/monotributo/", fills: [["#fact", "20000000"]], espera: (t) => cerca(num(t), 66_020.12, 0.02) },
  { url: "/impuestos/iva/", fills: [["#monto", "10000"]], espera: (t) => cerca(num(t), 12_100) },
  { url: "/impuestos/autonomos/", fills: [], espera: (t) => cerca(num(t), 156_541.75, 0.02) },
  // Tanda 2
  { url: "/finanzas/actualizacion-alquiler/", fills: [["#alq", "200000"], ["#fi", "2023-12-01"], ["#fa", "2024-12-01"]], espera: (t) => cerca(num(t), 617_339) },
  { url: "/finanzas/cuotas-o-contado/", fills: [["#contado", "1080000"], ["#n", "6"], ["#cuota", "200000"], ["#tasa", "1,9"]], espera: (t) => cerca(num(t), 1_080_000) },
  { url: "/finanzas/dolar-tarjeta/", fills: [["#usd", "100"], ["#cot", "1571,84"]], espera: (t) => cerca(num(t), 204_339) },
  { url: "/finanzas/plazo-fijo/", fills: [["#cap", "1000000"], ["#tna", "21,18"], ["#dias", "30"]], espera: (t) => cerca(num(t), 1_017_408) },
  { url: "/finanzas/inflacion/", fills: [["#monto", "100000"], ["#origen", "2020-01"], ["#destino", "2026-09"]], espera: (t) => cerca(num(t), 4_317_757) },
  { url: "/finanzas/rendimiento-billeteras/", fills: [["#saldo", "1000000"], ["#tna", "20"]], espera: (t) => cerca(num(t), 1_016_570) },
  { url: "/finanzas/prestamos/", fills: [["#cap", "1000000"], ["#tna", "60"], ["#n", "12"]], espera: (t) => cerca(num(t), 123_325) },
  { url: "/hogar/combustible/", fills: [["#km", "700"], ["#cons", "8"], ["#precio", "1500"]], espera: (t) => cerca(num(t), 84_000) },
  { url: "/laboral/vacaciones/", fills: [["#ing", "2019-06-01"], ["#anio", "2026"], ["#sue", "1500000"]], espera: (t) => /21\s*d[ií]as/i.test(t) },
  { url: "/laboral/horas-extras/", fills: [["#sue", "1500000"], ["#hm", "200"], ["#h50", "10"], ["#h100", "4"]], espera: (t) => cerca(num(t), 172_500) },
  { url: "/laboral/liquidacion-final/", fills: [["#ingreso", "2022-03-01"], ["#egreso", "2026-11-15"], ["#rem", "1500000"]], espera: (t) => cerca(num(t), 2_046_637) },
  {
    url: "/laboral/costo-laboral/",
    before: async (page) => { await clickRadio(page, "tipo", "B"); },
    fills: [["#bruto", "1500000"], ["#per", "2026-11"]],
    espera: (t) => cerca(num(t), 1_859_164),
  },
  {
    url: "/laboral/casas-particulares/",
    fills: [],
    espera: (t) => cerca(num(t), 556_664.00, 0.02),
  },
  {
    url: "/laboral/asignaciones-familiares/",
    fills: [["#igf", "1000000"], ["#hijos", "1"]],
    espera: (t) => cerca(num(t), 79_816, 0.02),
  },
  {
    url: "/finanzas/costo-alquilar/",
    fills: [["#alquiler", "800000"], ["#jur", "cordoba"]],
    espera: (t) => cerca(num(t), 2_400_000),
  },
];

const hubs = ["/finanzas/", "/hogar/"];

/** Hrefs del catálogo = todas las calculadoras publicadas (lib/content.ts). */
const hrefsCatalogo = [
  "/laboral/sueldo-neto/", "/laboral/aguinaldo/", "/laboral/indemnizacion/",
  "/laboral/liquidacion-final/", "/laboral/costo-laboral/", "/laboral/casas-particulares/", "/laboral/asignaciones-familiares/", "/laboral/vacaciones/", "/laboral/horas-extras/",
  "/impuestos/ganancias/", "/impuestos/retencion-ganancias/", "/impuestos/monotributo/", "/impuestos/iva/", "/impuestos/autonomos/",
  "/finanzas/actualizacion-alquiler/", "/finanzas/costo-alquilar/", "/finanzas/cuotas-o-contado/", "/finanzas/dolar-tarjeta/",
  "/finanzas/plazo-fijo/", "/finanzas/inflacion/", "/finanzas/rendimiento-billeteras/", "/finanzas/prestamos/",
  "/hogar/combustible/",
];

console.log("e2e: lanzando Chromium");
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
let fallas = 0;
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15_000);

  // Home v3 (prompt 31)
  await page.goto(BASE + "/", { waitUntil: "load" });
  try {
    const h1 = ((await page.locator("h1").first().textContent()) ?? "").trim();
    assert.equal(h1, "Calculadoras online para tus cuentas de todos los días.");
    const bajada = ((await page.locator(".hero .bajada").textContent()) ?? "").trim();
    assert.equal(bajada, "Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.");
    assert.equal(await page.locator('form[role="search"]').getAttribute("action"), "/buscar/");
    const lista = await page.$$eval(".catalogo a.tarjeta", (as) => as.map((a) => a.getAttribute("href")));
    assert.deepEqual([...lista].sort(), [...hrefsCatalogo].sort());
    const hubsHome = await page.$$eval(".catalogo .categoria h2 a", (as) => as.map((a) => a.getAttribute("href")));
    for (const h of hubsHome) assert.ok(["/laboral/", "/impuestos/", "/finanzas/", "/hogar/"].includes(h), `hub inesperado ${h}`);
    assert.equal(hubsHome.length, 4);
    const body = (await page.locator("body").innerText()) ?? "";
    assert.equal(/Hacé la cuenta|Más usadas|Por tema|Tanda 2|\bNueva\b|Valores vigentes|sitio independiente|no pertenece al Estado/i.test(body), false);
    assert.equal(await page.locator(".valores, .ranking").count(), 0);
    const ld = await page.$$eval('script[type="application/ld+json"]', (ss) => ss.map((s) => s.textContent ?? ""));
    assert.ok(ld.some((t) => t.includes('"WebSite"') && t.includes("SearchAction")));
    assert.ok(ld.some((t) => t.includes('"Organization"')));
    const nav = await page.$$eval("header .nav a", (as) => as.map((a) => a.textContent?.trim()));
    assert.equal(nav.length, 5);
    assert.equal(nav.at(-1), "Noticias");
    assert.equal(await page.locator('header .nav a[href="/noticias/"]').count(), 1);
    assert.equal(await page.locator('footer a[href="/noticias/"]').count(), 1);
    const bloque = await page.locator(".bloque-noticias").count();
    if (bloque > 0) {
      assert.equal(await page.locator('.bloque-noticias a[href="/noticias/"]').count(), 1);
    }
    console.log(`ok  / → home v3 (${lista.length} tarjetas, nav ${nav.join(", ")})`);
  } catch (e) {
    fallas++;
    console.error(`MAL home: ${e.message}`);
  }

  for (const hub of hubs) {
    const res = await page.goto(BASE + hub, { waitUntil: "load" });
    try {
      assert.equal(res?.status(), 200, `${hub} status ${res?.status()}`);
      console.log(`ok  ${hub} → 200`);
    } catch (e) { fallas++; console.error(`MAL ${e.message}`); }
  }

  // Noticias QA: portada, borradores 404, publicadas en sitemap
  try {
    const resN = await page.goto(BASE + "/noticias/", { waitUntil: "load" });
    assert.equal(resN?.status(), 200, `/noticias/ status ${resN?.status()}`);
    const h1n = ((await page.locator("h1").first().textContent()) ?? "").trim();
    assert.equal(h1n, "Noticias");
    assert.equal(await page.locator('header .nav a[href="/noticias/"][aria-current="page"]').count(), 1);
    assert.equal(await page.locator('footer a[href="/noticias/"]').count(), 1);
    assert.equal(await page.locator("html").getAttribute("lang"), "es-AR");
    // Slug inexistente: debe 404 (cubre el caso que antes usaba un borrador real en content/)
    const missing = await page.request.get(BASE + "/noticias/nota-que-no-existe-qa/");
    assert.equal(missing.status(), 404, `nota inexistente → ${missing.status()}`);
    const sm = await (await page.request.get(BASE + "/sitemap.xml")).text();
    assert.ok(sm.includes("https://www.calculalo.com.ar/noticias/"), "sitemap sin /noticias/");
    assert.equal(sm.includes("/noticias/nota-que-no-existe-qa"), false);
    assert.ok(sm.includes("/laboral/sueldo-neto/"), "sitemap sin calculadoras");
    assert.ok(sm.includes("/impuestos/iva/"), "sitemap sin IVA");
    console.log("ok  /noticias/ → H1, slug inexistente 404, sitemap con /noticias/ e IVA");
  } catch (e) {
    fallas++;
    console.error(`MAL noticias: ${e.message}`);
  }

  // Enlaces internos de home y hubs
  const seeds = ["/", "/laboral/", "/impuestos/", "/finanzas/", "/hogar/"];
  const seen = new Set();
  const broken = [];
  for (const seed of seeds) {
    await page.goto(BASE + seed, { waitUntil: "load" });
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")).filter(Boolean));
    for (const href of hrefs) {
      if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/#") || href.includes("mailto:")) continue;
      const path = href.split("#")[0].split("?")[0];
      if (!path || seen.has(path)) continue;
      seen.add(path);
      const r = await page.request.get(BASE + path);
      if (r.status() >= 400) broken.push(`${path} → ${r.status()} (desde ${seed})`);
    }
  }
  if (broken.length) {
    fallas++;
    console.error(`MAL enlaces rotos:\n${broken.join("\n")}`);
  } else {
    console.log(`ok  enlaces internos (${seen.size} rutas)`);
  }

  for (const c of casos) {
    await page.goto(BASE + c.url, { waitUntil: "load" });
    if (c.before) await c.before(page);
    for (const [sel, valor] of c.fills ?? []) await fill(page, sel, valor);
    await page.waitForTimeout(250);
    const t = (await page.getByTestId("resultado").textContent()) ?? "";
    try {
      assert.ok(c.espera(t), `${c.url}: resultado inesperado "${t}"`);
      console.log(`ok  ${c.url} → ${t}`);
    } catch (e) {
      fallas++;
      console.error(`MAL ${e.message}`);
    }
  }
  console.log(`e2e: ${casos.length} calculadoras + hubs`);
} finally {
  await browser.close();
  if (server) {
    try { process.kill(-server.pid, "SIGTERM"); } catch { /* ya cerrado */ }
  }
}
process.exit(fallas ? 1 : 0);
