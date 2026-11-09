import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularSueldoNeto } from "../lib/calc/sueldoNeto";
import { calcularAguinaldo } from "../lib/calc/aguinaldo";
import { calcularIndemnizacion } from "../lib/calc/indemnizacion";
import { calcularGanancias } from "../lib/calc/ganancias";
import { calcularMonotributo } from "../lib/calc/monotributo";
import { pAguinaldo, pGanancias, pIndem, pMono, pSueldo } from "../lib/params";

const cerca = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);

test("sueldo neto: con y sin tope ANSES", () => {
  cerca(calcularSueldoNeto({ bruto: 1_500_000, noRemunerativo: 0, cuotaSindical: 0 }, pSueldo).neto, 1_245_000);
  const r = calcularSueldoNeto({ bruto: 6_000_000, noRemunerativo: 0, cuotaSindical: 0 }, pSueldo);
  cerca(r.neto, 5_173_513.49);
  assert.equal(r.superaTope, true);
});

test("aguinaldo: completo y proporcional con días reales (184)", () => {
  const c = calcularAguinaldo({ anio: 2026, semestre: 2, mejorRemuneracion: 1_500_000 }, pAguinaldo);
  cerca(c.bruto, 750_000);
  cerca(c.neto, 622_500);
  const p = calcularAguinaldo({ anio: 2026, semestre: 2, mejorRemuneracion: 1_500_000, ingreso: "2026-10-03" }, pAguinaldo);
  assert.equal(p.diasTrabajados, 90);
  assert.equal(p.diasSemestre, 184);
  cerca(p.bruto, 366_847.83);
});

test("indemnización: 4 años y 5 meses computa 5 sueldos y 1 mes de preaviso", () => {
  const r = calcularIndemnizacion({ ingreso: "2022-01-15", egreso: "2026-06-30", mejorRemuneracion: 1_500_000, superoPrueba: true, huboPreaviso: false, topeConvenio: 0, vacacionesGozadas: 0 }, pIndem)!;
  assert.equal(r.aniosComputados, 5);
  cerca(r.antiguedad, 7_500_000);
  cerca(r.preaviso, 1_500_000);
  cerca(r.integracion, 0);
});

test("indemnización: tope de convenio con piso del 67%", () => {
  const r = calcularIndemnizacion({ ingreso: "2020-01-01", egreso: "2026-01-31", mejorRemuneracion: 3_000_000, superoPrueba: true, huboPreaviso: true, topeConvenio: 1_000_000, vacacionesGozadas: 0 }, pIndem)!;
  cerca(r.base, 2_010_000);
});

test("indemnización: en período de prueba no hay preaviso ni antigüedad", () => {
  const r = calcularIndemnizacion({ ingreso: "2026-09-01", egreso: "2026-10-15", mejorRemuneracion: 1_000_000, superoPrueba: false, huboPreaviso: false, topeConvenio: 0, vacacionesGozadas: 0 }, pIndem)!;
  assert.equal(r.preaviso, 0);
  assert.equal(r.antiguedad, 0);
});

test("ganancias: liquidación anual, bruto 4.000.000 × 13", () => {
  const r = calcularGanancias({ brutoMensual: 4_000_000, incluirSac: true, conyuge: false, hijos: 0, alquilerMensual: 0, alquilerReli: false, otrasDeducciones: 0 }, pGanancias);
  cerca(r.impuesto, 792_864.71);
});

test("monotributo: servicios por $20M es categoría C", () => {
  const base = { actividad: "servicios" as const, superficieM2: 0, energiaKw: 0, alquileresAnuales: 0, precioUnitarioMax: 0, aportaPorOtroLado: false };
  const r = calcularMonotributo({ ...base, facturacionAnual: 20_000_000 }, pMono);
  assert.equal(r.excluido, false);
  if (!r.excluido) { assert.equal(r.categoria.categoria, "C"); cerca(r.cuota, 66_020.12); }
  const d = calcularMonotributo({ ...base, facturacionAnual: 20_000_000, aportaPorOtroLado: true }, pMono);
  if (!d.excluido) cerca(d.cuota, 18_246.86);
  assert.equal(calcularMonotributo({ ...base, facturacionAnual: 200_000_000 }, pMono).excluido, true);
});
