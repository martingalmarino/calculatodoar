#!/usr/bin/env node
// Actualiza data/icl.json, data/uva.json y data/ipc.json desde BCRA e INDEC.
// Correr a mano antes de un deploy: npm run data:series  (NO en el build de Vercel).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hoy = new Date().toISOString().slice(0, 10);
const TOL = 0.01;

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;

async function bcraSerie(idVariable, desde, decimales) {
  const limit = 3000;
  let offset = 0;
  const puntos = [];
  for (;;) {
    const url = `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/${idVariable}?desde=${desde}&hasta=${hoy}&limit=${limit}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`BCRA ${idVariable}: HTTP ${res.status}`);
    const json = await res.json();
    const detalle = json.results?.[0]?.detalle ?? [];
    if (!detalle.length && offset === 0) throw new Error(`BCRA ${idVariable}: respuesta vacía`);
    for (const d of detalle) puntos.push([d.fecha.slice(0, 10), round(Number(d.valor), decimales)]);
    const total = json.metadata?.resultset?.count ?? puntos.length;
    offset += limit;
    if (offset >= total || !detalle.length) break;
  }
  puntos.sort((a, b) => a[0].localeCompare(b[0]));
  // dedupe por fecha (queda el último)
  const map = new Map(puntos);
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function parseNumAR(s) {
  if (s == null || s === "" || s === "NA") return null;
  return Number(String(s).replace(/\./g, "").replace(",", "."));
}

async function ipcNacional() {
  const res = await fetch("https://www.indec.gob.ar/ftp/cuadros/economia/serie_ipc_divisiones.csv");
  if (!res.ok) throw new Error(`INDEC IPC: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = new TextDecoder("latin1").decode(buf);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(";");
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const out = [];
  for (const line of lines.slice(1)) {
    const c = line.split(";");
    if (c[idx.Codigo] !== "0" || c[idx.Region] !== "Nacional") continue;
    const p = c[idx.Periodo]; // YYYYMM
    const periodo = `${p.slice(0, 4)}-${p.slice(4, 6)}`;
    const indice = parseNumAR(c[idx.Indice_IPC]);
    if (indice == null) continue;
    out.push([periodo, indice, parseNumAR(c[idx.v_m_IPC]), parseNumAR(c[idx.v_i_a_IPC])]);
  }
  if (!out.length) throw new Error("INDEC IPC: sin filas Nacional / Codigo 0");
  out.sort((a, b) => a[0].localeCompare(b[0]));
  return out;
}

function assertHistorico(nombre, vieja, nueva, keyIdx = 0, valIdx = 1) {
  const mapN = new Map(nueva.map((r) => [r[keyIdx], r]));
  for (const row of vieja) {
    const n = mapN.get(row[keyIdx]);
    if (!n) continue; // ok si el organismo dejó de publicar un día puntual
    if (Math.abs(Number(n[valIdx]) - Number(row[valIdx])) > TOL) {
      throw new Error(`${nombre}: el valor de ${row[keyIdx]} cambió de ${row[valIdx]} a ${n[valIdx]} (> ${TOL}). Revisá antes de sobrescribir.`);
    }
  }
}

function writeSerie(path, patch) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  Object.assign(data, patch);
  writeFileSync(path, `${JSON.stringify(data)}\n`);
}

async function main() {
  const iclPath = join(root, "data/icl.json");
  const uvaPath = join(root, "data/uva.json");
  const ipcPath = join(root, "data/ipc.json");
  const iclOld = JSON.parse(readFileSync(iclPath, "utf8"));
  const uvaOld = JSON.parse(readFileSync(uvaPath, "utf8"));
  const ipcOld = JSON.parse(readFileSync(ipcPath, "utf8"));

  console.log("Bajando ICL (BCRA 40)…");
  const iclSerie = await bcraSerie(40, iclOld.primerFecha, iclOld.decimales ?? 2);
  console.log("Bajando UVA (BCRA 31)…");
  const uvaSerie = await bcraSerie(31, uvaOld.primerFecha, uvaOld.decimales ?? 2);
  console.log("Bajando IPC (INDEC)…");
  const ipcSerie = await ipcNacional();

  assertHistorico("ICL", iclOld.serie, iclSerie);
  assertHistorico("UVA", uvaOld.serie, uvaSerie);
  assertHistorico("IPC", ipcOld.serie, ipcSerie);

  writeSerie(iclPath, {
    fechaConsulta: hoy,
    primerFecha: iclSerie[0][0],
    ultimaFecha: iclSerie.at(-1)[0],
    serie: iclSerie,
  });
  writeSerie(uvaPath, {
    fechaConsulta: hoy,
    primerFecha: uvaSerie[0][0],
    ultimaFecha: uvaSerie.at(-1)[0],
    serie: uvaSerie,
  });
  writeSerie(ipcPath, {
    fechaConsulta: hoy,
    primerPeriodo: ipcSerie[0][0],
    ultimoPeriodo: ipcSerie.at(-1)[0],
    serie: ipcSerie,
  });

  console.log(`OK ICL ${iclSerie[0][0]} → ${iclSerie.at(-1)[0]} (${iclSerie.length})`);
  console.log(`OK UVA ${uvaSerie[0][0]} → ${uvaSerie.at(-1)[0]} (${uvaSerie.length})`);
  console.log(`OK IPC ${ipcSerie[0][0]} → ${ipcSerie.at(-1)[0]} (${ipcSerie.length})`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
