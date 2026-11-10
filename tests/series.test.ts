import { test } from "node:test";
import assert from "node:assert/strict";
import { icl, iclEn, ipc, ipcEn, ultimaUVA, ultimoICL, ultimoIPC, uva, uvaEn } from "../lib/data";

test("series: valores verificados de ICL, UVA e IPC", () => {
  assert.equal(iclEn("2023-12-01"), 6.69);
  assert.equal(uvaEn("2026-11-09"), 2185.48);
  assert.equal(ipcEn("2026-09"), 12514.1508);
  assert.equal(iclEn("1999-01-01"), null);
  assert.equal(uvaEn("1999-01-01"), null);
  assert.equal(ipcEn("1999-01"), null);
});

test("series: advertencia si ICL/UVA/IPC están atrasados", () => {
  const hoy = new Date();
  const dias = (iso: string) => Math.floor((hoy.getTime() - new Date(`${iso}T00:00:00`).getTime()) / 86_400_000);

  const atrasoIcl = dias(ultimoICL().fecha);
  const atrasoUva = dias(ultimaUVA().fecha);
  if (atrasoIcl > 10) console.warn(`ICL atrasado ${atrasoIcl} días (último ${ultimoICL().fecha}). Corré npm run data:series.`);
  if (atrasoUva > 10) console.warn(`UVA atrasada ${atrasoUva} días (última ${ultimaUVA().fecha}). Corré npm run data:series.`);

  const prox = ipc.proximaPublicacion;
  if (prox?.fecha && prox.periodo) {
    const yaPaso = hoy >= new Date(`${prox.fecha}T${prox.hora || "16:00"}:00-03:00`);
    if (yaPaso && ultimoIPC().periodo < prox.periodo) {
      console.warn(`IPC: ya pasó la publicación de ${prox.periodo} (${prox.fecha}) y el último cargado es ${ultimoIPC().periodo}. Corré npm run data:series.`);
    }
  }

  // el test no falla por atraso; solo valida que las series existan
  assert.ok(icl.serie.length > 0);
  assert.ok(uva.serie.length > 0);
  assert.ok(ipc.serie.length > 0);
});
