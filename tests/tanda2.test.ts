import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularAlquiler } from "../lib/calc/alquiler";
import { calcularCuotas } from "../lib/calc/cuotas";
import { calcularDolar } from "../lib/calc/dolar";
import { calcularPlazoFijo, calcularPlazoFijoUVA } from "../lib/calc/plazoFijo";
import { calcularInflacion } from "../lib/calc/inflacion";
import { calcularBilletera } from "../lib/calc/billetera";
import { calcularPrestamoPersonal, calcularPrestamoUVA } from "../lib/calc/prestamo";
import { compararGNC, costoViaje, kmPorLitroDesdeL100, litrosPor100DesdeKmL } from "../lib/calc/combustible";
import { calcularVacaciones, diasPorAntiguedad } from "../lib/calc/vacaciones";
import { calcularHorasExtras } from "../lib/calc/horasExtras";
import { calcularLiquidacionFinal } from "../lib/calc/liquidacionFinal";
import { calcularIndemnizacion } from "../lib/calc/indemnizacion";
import { calcularCostoLaboral } from "../lib/calc/costoLaboral";
import { pAlquiler, pCosto, pDolar, pHorasExtras, pIndem, pInflacion, pLiquidacion, pPlazoFijo, pPrestamo, pVacaciones } from "../lib/params";
import { categoriasConContenido } from "../lib/content";

const cerca = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);

test("alquiler ICL: 200.000 desde 2023-12-01", () => {
  const a = calcularAlquiler({ modo: "icl", alquilerInicial: 200_000, fechaInicio: "2023-12-01", fechaAjuste: "2024-12-01" }, pAlquiler);
  assert.equal(a.ok, true);
  if (a.ok) cerca(a.nuevo, 617_339.31);
  const b = calcularAlquiler({ modo: "icl", alquilerInicial: 200_000, fechaInicio: "2023-12-01", fechaAjuste: "2025-12-01" }, pAlquiler);
  assert.equal(b.ok, true);
  if (b.ok) cerca(b.nuevo, 860_089.69);
});

test("alquiler IPC: 600.000 de 2025-12 a 2026-03", () => {
  const r = calcularAlquiler({ modo: "ipc", alquilerActual: 600_000, mesBase: "2025-12", mesFinal: "2026-03" }, pAlquiler);
  assert.equal(r.ok, true);
  if (r.ok) cerca(r.nuevo, 656_653.74);
});

test("alquiler acuerdo: 5% × 2 períodos", () => {
  const r = calcularAlquiler({ modo: "acuerdo", alquilerActual: 600_000, porcentaje: 0.05, periodos: 2 }, pAlquiler);
  assert.equal(r.ok, true);
  if (r.ok) cerca(r.nuevo, 661_500);
});

test("alquiler ICL antes del inicio de la serie → error", () => {
  const r = calcularAlquiler({ modo: "icl", alquilerInicial: 200_000, fechaInicio: "2020-06-15", fechaAjuste: "2024-12-01" }, pAlquiler);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /no hay dato/i);
});

test("con actualizacion-alquiler, finanzas aparece en el nav", () => {
  assert.ok(categoriasConContenido().some((c) => c.slug === "finanzas"));
  assert.ok(categoriasConContenido().some((c) => c.slug === "hogar"));
});

test("cuotas vs contado: 6 × 200.000 vs 1.080.000 a 1,9%", () => {
  const base = { precioContado: 1_080_000, cantidadCuotas: 6, valorCuota: 200_000, tasaMensual: 0.019 };
  const a = calcularCuotas({ ...base, primeraCuotaHoy: false });
  assert.equal(a.ok, true);
  if (a.ok) {
    cerca(a.vp, 1_124_076.70);
    assert.equal(a.conviene, "contado");
    cerca(a.diferencia, 44_076.70);
    assert.ok(Math.abs(a.tasaEquilibrio - 0.03096) < 0.00001, `eq ${a.tasaEquilibrio}`);
  }
  const b = calcularCuotas({ ...base, primeraCuotaHoy: true });
  assert.equal(b.ok, true);
  if (b.ok) cerca(b.vp, 1_145_434.16);
  const cero = calcularCuotas({ ...base, tasaMensual: 0, primeraCuotaHoy: false });
  assert.equal(cero.ok, true);
  if (cero.ok) cerca(cero.vp, 1_200_000);
});

test("dólar tarjeta / digital / oficial / MEP", () => {
  const cot = 1_571.84;
  const p = { percepcionAlicuota: pDolar.percepcion.alicuota, ivaAlicuota: pDolar.ivaServiciosDigitales.alicuota };
  const t = calcularDolar({ montoUSD: 100, modo: "tarjeta", cotizacion: cot }, p);
  assert.equal(t.ok, true);
  if (t.ok) { cerca(t.pesos, 157_184); cerca(t.percepcion, 47_155.20); cerca(t.total, 204_339.20); }
  const d = calcularDolar({ montoUSD: 10, modo: "digital", cotizacion: cot }, p);
  assert.equal(d.ok, true);
  if (d.ok) { cerca(d.pesos, 15_718.40); cerca(d.iva, 3_300.86); cerca(d.percepcion, 4_715.52); cerca(d.total, 23_734.78); }
  const propios = calcularDolar({ montoUSD: 100, modo: "dolaresPropios", cotizacion: cot }, p);
  assert.equal(propios.ok, true);
  if (propios.ok) assert.equal(propios.percepcion, 0);
  const oficial = calcularDolar({ montoUSD: 100, modo: "compraOficial", cotizacion: cot }, p);
  assert.equal(oficial.ok, true);
  if (oficial.ok) assert.equal(oficial.percepcion, 0);
  const mepVacio = calcularDolar({ montoUSD: 100, modo: "mep", cotizacion: cot }, p);
  assert.equal(mepVacio.ok, false);
  const mep = calcularDolar({ montoUSD: 100, modo: "mep", cotizacion: cot, cotizacionMEP: 1_600 }, p);
  assert.equal(mep.ok, true);
  if (mep.ok) cerca(mep.total, 160_000);
});

test("plazo fijo tradicional: 1.000.000 a 21,18% 30 días", () => {
  const r = calcularPlazoFijo({ capital: 1_000_000, tna: 0.2118, dias: 30 }, pPlazoFijo);
  assert.equal(r.ok, true);
  if (r.ok) {
    cerca(r.interes, 17_408.22);
    cerca(r.total, 1_017_408.22);
    assert.ok(Math.abs(r.tea - 0.2337) < 0.0001, `tea ${r.tea}`);
  }
  const corto = calcularPlazoFijo({ capital: 1_000_000, tna: 0.2118, dias: 20 }, pPlazoFijo);
  assert.equal(corto.ok, false);
});

test("plazo fijo UVA: 1.000.000 desde 2026-08-04 por 90 días", () => {
  const r = calcularPlazoFijoUVA({
    capital: 1_000_000, fechaConstitucion: "2026-08-04", dias: 90, tnaAdicional: 0.01, inflacionMensualEsperada: 0.01657,
  }, pPlazoFijo);
  assert.equal(r.ok, true);
  if (r.ok) {
    cerca(r.uvaInicial, 2059.24);
    assert.ok(Math.abs(r.cantidadUVA - 485.6161) < 0.0001, `uva ${r.cantidadUVA}`);
    assert.equal(r.vencimiento, "2026-11-02");
    cerca(r.uvaFinal, 2177.53);
    cerca(r.capitalAjustado, 1_057_443.52);
    cerca(r.interes, 2_607.39);
    cerca(r.total, 1_060_050.92);
    assert.equal(r.esEstimacion, false);
  }
  const corto = calcularPlazoFijoUVA({
    capital: 1_000_000, fechaConstitucion: "2026-08-04", dias: 60, tnaAdicional: 0.01, inflacionMensualEsperada: 0.01657,
  }, pPlazoFijo);
  assert.equal(corto.ok, false);
  const est = calcularPlazoFijoUVA({
    capital: 1_000_000, fechaConstitucion: "2026-11-01", dias: 90, tnaAdicional: 0.01, inflacionMensualEsperada: 0.01657,
  }, pPlazoFijo);
  assert.equal(est.ok, true);
  if (est.ok) assert.equal(est.esEstimacion, true);
});

test("inflación: 100.000 de 2020-01 a 2026-09", () => {
  const r = calcularInflacion({ monto: 100_000, mesOrigen: "2020-01", mesDestino: "2026-09" }, pInflacion);
  assert.equal(r.ok, true);
  if (r.ok) {
    cerca(r.montoActualizado, 4_317_757.00);
    cerca(r.inflacionAcumulada, 42.1776);
  }
  const corto = calcularInflacion({ monto: 100_000, mesOrigen: "2025-09", mesDestino: "2026-09" }, pInflacion);
  assert.equal(corto.ok, true);
  if (corto.ok) {
    cerca(corto.montoActualizado, 133_354.94);
    cerca(corto.inflacionAcumulada, 0.3335);
  }
  assert.equal(calcularInflacion({ monto: 100_000, mesOrigen: "2016-11", mesDestino: "2026-09" }, pInflacion).ok, false);
  assert.equal(calcularInflacion({ monto: 100_000, mesOrigen: "2020-01", mesDestino: "2099-01" }, pInflacion).ok, false);
});

test("billetera: capitalización diaria y tope remunerado", () => {
  const r = calcularBilletera({ saldo: 1_000_000, tna: 0.2, dias: 30 });
  assert.equal(r.ok, true);
  if (r.ok) {
    cerca(r.final, 1_016_569.63);
    cerca(r.interes, 16_569.63);
    assert.ok(Math.abs(r.tea - 0.2213) < 0.0001, `tea ${r.tea}`);
    assert.ok(r.interes > 16_438.36, "debe capitalizar diario, no interés simple");
  }
  const t = calcularBilletera({ saldo: 1_000_000, tna: 0.2, dias: 30, topeRemunerado: 500_000 });
  assert.equal(t.ok, true);
  if (t.ok) cerca(t.final, 1_008_284.82);
});

test("préstamo personal: 1.000.000 TNA 60% 12 cuotas", () => {
  const r = calcularPrestamoPersonal({ capital: 1_000_000, tna: 0.6, cuotas: 12, sumarIVA: true }, pPrestamo);
  assert.equal(r.ok, true);
  if (r.ok) {
    cerca(r.cuotaPura, 112_825.41);
    cerca(r.filas[0]!.interes, 50_000);
    cerca(r.filas[0]!.iva!, 10_500);
    cerca(r.filas[0]!.cuotaConIva!, 123_325.41);
    cerca(r.intereses, 353_904.92);
    cerca(r.ivaTotal, 74_320.03);
    cerca(r.filas[r.filas.length - 1]!.saldo, 0);
    cerca(r.filas.reduce((s, f) => s + f.amortizacion, 0), 1_000_000);
  }
});

test("préstamo UVA: 50.000.000 el 2026-11-09", () => {
  const r = calcularPrestamoUVA({
    capital: 50_000_000, fechaDesembolso: "2026-11-09", tna: 0.045, cuotas: 240,
    inflacionMensualEsperada: 0.01657,
  }, pPrestamo);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.ok(Math.abs(r.capitalUVA - 22_878.2693) < 0.0001, `cap ${r.capitalUVA}`);
    assert.ok(Math.abs(r.cuotaUVA - 144.7392) < 0.0001, `cuotaU ${r.cuotaUVA}`);
    cerca(r.cuotaPesosHoy, 317_478.26);
    cerca(r.cuotaUVA * 2196.12, 317_864.71);
    cerca(r.filas.reduce((s, f) => s + f.amortizacion, 0), r.capitalUVA);
  }
});

test("combustible: viaje, GNC y conversión", () => {
  const v = costoViaje({ km: 700, consumoL100km: 8, precioLitro: 1500 });
  assert.equal(v.ok, true);
  if (v.ok) {
    cerca(v.litros, 56);
    cerca(v.costo, 84_000);
  }
  const g = compararGNC({
    km: 700, consumoNafta: 8, precioNafta: 1500, consumoGNCm3100km: 7, precioM3: 800, costoEquipo: 1_500_000,
  });
  assert.equal(g.ok, true);
  if (g.ok) {
    cerca(g.m3Gnc, 49);
    cerca(g.costoGnc, 39_200);
    cerca(g.ahorro, 44_800);
    cerca(g.kmRecupero!, 23_437.5);
  }
  cerca(litrosPor100DesdeKmL(12.5)!, 8);
  cerca(kmPorLitroDesdeL100(8)!, 12.5);
});

test("vacaciones: escala, proporcional y plus", () => {
  const r = calcularVacaciones({ fechaIngreso: "2019-06-01", anio: 2026, sueldoMensual: 1_500_000 }, pVacaciones);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.dias, 21);
    cerca(r.valorDia, 60_000);
    cerca(r.totalBruto, 1_260_000);
    cerca(r.plus, 210_000);
  }
  const prop = calcularVacaciones({
    fechaIngreso: "2026-08-01", anio: 2026, sueldoMensual: 1_500_000, diasTrabajadosEnElAnio: 100,
  }, pVacaciones);
  assert.equal(prop.ok, true);
  if (prop.ok) {
    assert.equal(prop.dias, 5);
    assert.equal(prop.proporcional, true);
  }
  assert.equal(diasPorAntiguedad("2021-12-31", 2026, pVacaciones.diasArt150), 14);
  assert.equal(diasPorAntiguedad("2021-12-30", 2026, pVacaciones.diasArt150), 21);
  assert.equal(diasPorAntiguedad("2006-12-31", 2026, pVacaciones.diasArt150), 28);
  assert.equal(diasPorAntiguedad("2005-06-01", 2026, pVacaciones.diasArt150), 35);
});

test("horas extras: 50%, 100% y límites", () => {
  const r = calcularHorasExtras({ sueldoMensual: 1_500_000, horasMensualesNormales: 200, horas50: 10, horas100: 4 }, pHorasExtras);
  assert.equal(r.ok, true);
  if (r.ok) {
    cerca(r.valorHora, 7_500);
    cerca(r.extra50, 112_500);
    cerca(r.extra100, 60_000);
    cerca(r.total, 172_500);
    assert.equal(r.alertaMensual, false);
  }
  const lim = calcularHorasExtras({ sueldoMensual: 1_500_000, horas50: 25, horas100: 10 }, pHorasExtras);
  assert.equal(lim.ok, true);
  if (lim.ok) assert.equal(lim.alertaMensual, true);
  const h180 = calcularHorasExtras({ sueldoMensual: 1_500_000, horasMensualesNormales: 180, horas50: 0, horas100: 0 }, pHorasExtras);
  assert.equal(h180.ok, true);
  if (h180.ok) cerca(h180.valorHora, 8_333.33);
});

test("liquidación final: renuncia, despido y mutuo acuerdo", () => {
  const base = {
    ingreso: "2022-03-01", egreso: "2026-11-15", mejorRemuneracion: 1_500_000,
    vacacionesGozadas: 0, topeConvenio: 0, huboPreaviso: false,
  };
  const ren = calcularLiquidacionFinal({ ...base, motivo: "renuncia" }, pLiquidacion);
  assert.equal(ren.ok, true);
  if (ren.ok) {
    cerca(ren.indem.diasMes, 750_000);
    cerca(ren.indem.vacaciones, 734_136.99);
    cerca(ren.indem.sacProporcional, 562_500);
    cerca(ren.total, 2_046_636.99);
  }
  const sin = calcularLiquidacionFinal({ ...base, motivo: "despidoSinCausa" }, pLiquidacion);
  const ind = calcularIndemnizacion({ ...base, superoPrueba: true }, pIndem)!;
  assert.equal(sin.ok, true);
  if (sin.ok) {
    cerca(sin.total, 11_984_136.99);
    cerca(sin.total, ind.total);
    cerca(sin.indem.antiguedad, 7_500_000);
    cerca(sin.indem.preaviso, 1_500_000);
    cerca(sin.indem.integracion, 750_000);
    cerca(sin.indem.sacPreaviso, 187_500);
  }
  const con = calcularLiquidacionFinal({ ...base, motivo: "despidoConCausa" }, pLiquidacion);
  assert.equal(con.ok, true);
  if (con.ok) cerca(con.total, 2_046_636.99);
  const mut = calcularLiquidacionFinal({ ...base, motivo: "mutuoAcuerdo", gratificacion: 3_000_000 }, pLiquidacion);
  assert.equal(mut.ok, true);
  if (mut.ok) cerca(mut.total, 5_046_636.99);
});

test("costo laboral: tipo B, A, RIFL y FAL", () => {
  const base = { bruto: 1_500_000, mipyme: true, rifl: false, detraccion: "general" as const, empleadosNomina: 1, periodo: "2026-11" };
  const b = calcularCostoLaboral({ ...base, tipoEmpleador: "B" }, pCosto);
  assert.equal(b.ok, true);
  if (b.ok) {
    cerca(b.ssBruta, 268_739.34);
    cerca(b.obraSocial, 90_000);
    cerca(b.scvo, 424.62);
    cerca(b.costoMensual, 1_859_163.96);
    assert.ok(Math.abs(b.pctSobreBruto - 0.2394) < 0.0001, `pct ${b.pctSobreBruto}`);
    cerca(b.costoAnual, 24_169_967.49);
  }
  const a = calcularCostoLaboral({ ...base, tipoEmpleador: "A" }, pCosto);
  assert.equal(a.ok, true);
  if (a.ok) {
    cerca(a.ssBruta, 304_571.25);
    cerca(a.costoMensual, 1_894_995.87);
  }
  const rifl = calcularCostoLaboral({ ...base, tipoEmpleador: "B", rifl: true }, pCosto);
  assert.equal(rifl.ok, true);
  if (rifl.ok) {
    cerca(rifl.ssBruta, 75_000);
    cerca(rifl.costoMensual, 1_665_424.62);
  }
  const fal = calcularCostoLaboral({ ...base, tipoEmpleador: "B", mipyme: true, periodo: "2026-12" }, pCosto);
  assert.equal(fal.ok, true);
  if (fal.ok) {
    cerca(fal.fal!, 37_500);
    cerca(fal.ss, 231_239.34);
    cerca(fal.costoMensual, 1_859_163.96);
  }
});
