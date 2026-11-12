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

test("autonomos: importes de la tabla ARCA octubre 2026", async () => {
  const { calcularAutonomos } = await import("../lib/calc/autonomos");
  const { pAutonomos } = await import("../lib/params");
  const { autonomos } = await import("../lib/data");
  assert.equal(autonomos.verificadoEnPdf, true);

  const casos: [string, number][] = [
    ["minima-I", 78_271.56],
    ["minima-III", 156_541.75],
    ["penosa-V", 376_676.94],
    ["jubilado-I", 66_041.63],
    ["ama-I", 26_905.85],
    ["revista-A", 61_049.52],
  ];
  for (const [id, importe] of casos) {
    const r = calcularAutonomos({ categoria: id }, pAutonomos);
    assert.equal(r.ok, true, id);
    if (r.ok) cerca(r.aporte, importe);
  }
});

test("iva: sumar y quitar con alícuotas de la ley", async () => {
  const { calcularIva } = await import("../lib/calc/iva");
  const { pIva } = await import("../lib/params");
  const a = (v: number) => pIva.alicuotas.find((x) => x.valor === v)!.valor;

  const s21 = calcularIva({ monto: 10_000, modo: "sumar", alicuota: a(0.21) });
  assert.equal(s21.ok, true);
  if (s21.ok) { cerca(s21.iva, 2_100); cerca(s21.total, 12_100); }

  const q21 = calcularIva({ monto: 12_100, modo: "quitar", alicuota: a(0.21) });
  assert.equal(q21.ok, true);
  if (q21.ok) { cerca(q21.neto, 10_000); cerca(q21.iva, 2_100); }

  const s105 = calcularIva({ monto: 10_000, modo: "sumar", alicuota: a(0.105) });
  if (s105.ok) { cerca(s105.iva, 1_050); cerca(s105.total, 11_050); }
  const q105 = calcularIva({ monto: 11_050, modo: "quitar", alicuota: a(0.105) });
  if (q105.ok) cerca(q105.neto, 10_000);

  const s27 = calcularIva({ monto: 10_000, modo: "sumar", alicuota: a(0.27) });
  if (s27.ok) { cerca(s27.iva, 2_700); cerca(s27.total, 12_700); }
  const s5 = calcularIva({ monto: 10_000, modo: "sumar", alicuota: a(0.05) });
  if (s5.ok) { cerca(s5.iva, 500); cerca(s5.total, 10_500); }
  const s25 = calcularIva({ monto: 10_000, modo: "sumar", alicuota: a(0.025) });
  if (s25.ok) { cerca(s25.iva, 250); cerca(s25.total, 10_250); }
});

test("casas particulares: escalas, aportes, zona, antigüedad y SAC", async () => {
  const { calcularCasasParticulares, diasVacacionesArt29 } = await import("../lib/calc/casasParticulares");
  const { pCasas } = await import("../lib/params");
  const { casasParticulares } = await import("../lib/data");

  assert.equal(casasParticulares.escalas["2026-10"].verificadoEnPdf, true);
  assert.equal(casasParticulares.escalas["2026-11"].verificadoEnPdf, true);
  assert.equal(casasParticulares.escalas["2026-12"].verificadoEnPdf, true);
  assert.equal(casasParticulares.aportes["2026-10"].verificadoEnPdf, true);
  assert.equal(casasParticulares.aportes["2026-11"].verificadoEnPdf, true);
  assert.equal(casasParticulares.aportes["2026-12"].verificadoEnPdf, false);

  const base = {
    categoria: "tareas-generales" as const,
    modalidad: "con-retiro" as const,
    formaPago: "mensual" as const,
    horasSemanales: 48,
    aniosAntiguedad: 0,
    zonaDesfavorable: false,
    situacion: "activo18" as const,
    semestreSac: 2 as const,
  };

  const novAportes = calcularCasasParticulares({ ...base, periodo: "2026-11" }, pCasas);
  assert.equal(novAportes.ok, true);
  if (novAportes.ok && novAportes.aportes) {
    cerca(novAportes.aportes.importeAPagar, 45_024.63);
    cerca(novAportes.aportes.aportesSalud, 25_694.55);
    cerca(novAportes.aportes.contribucionesSipa, 2_128.79);
    cerca(novAportes.aportes.cuotaArt, 17_201.29);
    cerca(novAportes.remuneracion, 511_639.37);
    cerca(novAportes.medioSac, 255_819.69);
    cerca(novAportes.costoMensualEmpleador, 556_664.00);
  }

  const novMenos12 = calcularCasasParticulares({ ...base, periodo: "2026-11", horasSemanales: 10 }, pCasas);
  if (novMenos12.ok && novMenos12.aportes) cerca(novMenos12.aportes.importeAPagar, 10_953.66);

  const novJoven = calcularCasasParticulares({ ...base, periodo: "2026-11", situacion: "joven16a17" }, pCasas);
  if (novJoven.ok && novJoven.aportes) {
    cerca(novJoven.aportes.importeAPagar, 42_895.84);
    cerca(novJoven.aportes.contribucionesSipa, 0);
  }

  const oct = calcularCasasParticulares({ ...base, periodo: "2026-10" }, pCasas);
  assert.equal(oct.ok, true);
  if (oct.ok && oct.aportes) {
    cerca(oct.remuneracion, 498_582.06);
    cerca(oct.medioSac, 249_291.03);
    cerca(oct.aportes.importeAPagar, 44_784.77);
    cerca(oct.aportes.cuotaArt, 16_961.43);
    cerca(oct.costoMensualEmpleador, 543_366.83);
  }

  const oct16h = calcularCasasParticulares({ ...base, periodo: "2026-10", horasSemanales: 16, formaPago: "hora" }, pCasas);
  if (oct16h.ok) {
    cerca(oct16h.minimoEscala, 65_025.28);
    assert.equal(oct16h.tramo, "de16mas");
  }

  const octZona = calcularCasasParticulares({ ...base, periodo: "2026-10", zonaDesfavorable: true }, pCasas);
  if (octZona.ok) cerca(octZona.minimoAjustado, 653_142.50);

  const octAnt = calcularCasasParticulares({ ...base, periodo: "2026-10", aniosAntiguedad: 3 }, pCasas);
  if (octAnt.ok) cerca(octAnt.minimoAjustado, 513_539.52);

  const octSacProp = calcularCasasParticulares({ ...base, periodo: "2026-10", diasTrabajadosSac: 90 }, pCasas);
  if (octSacProp.ok) {
    assert.equal(octSacProp.diasSemestreSac, 184);
    // 498582,06 × ½ × 90/184 = 121935,83 (el prompt 45 tipó 121968,26)
    cerca(octSacProp.medioSac, 121_935.83);
  }

  const nov16h = calcularCasasParticulares({ ...base, periodo: "2026-11", horasSemanales: 16, formaPago: "hora" }, pCasas);
  if (nov16h.ok) cerca(nov16h.minimoEscala, 66_728.32);

  const novZona = calcularCasasParticulares({ ...base, periodo: "2026-11", zonaDesfavorable: true }, pCasas);
  if (novZona.ok) cerca(novZona.minimoAjustado, 670_247.57);

  const novAnt = calcularCasasParticulares({ ...base, periodo: "2026-11", aniosAntiguedad: 3 }, pCasas);
  if (novAnt.ok) cerca(novAnt.minimoAjustado, 526_988.55);

  const novZonaAnt = calcularCasasParticulares({
    ...base, periodo: "2026-11", zonaDesfavorable: true, aniosAntiguedad: 3,
  }, pCasas);
  if (novZonaAnt.ok) cerca(novZonaAnt.minimoAjustado, 690_355.00);

  const dic = calcularCasasParticulares({ ...base, periodo: "2026-12" }, pCasas);
  assert.equal(dic.ok, true);
  if (dic.ok) {
    cerca(dic.remuneracion, 519_825.60);
    cerca(dic.medioSac, 259_912.80);
    assert.equal(dic.aportesDisponibles, false);
    assert.equal(dic.aportes, null);
    cerca(dic.costoMensualEmpleador, 519_825.60);
  }

  assert.equal(diasVacacionesArt29(3, pCasas.vacaciones.tramos), 14);
  assert.equal(diasVacacionesArt29(6, pCasas.vacaciones.tramos), 21);
  assert.equal(diasVacacionesArt29(12, pCasas.vacaciones.tramos), 28);
  assert.equal(diasVacacionesArt29(21, pCasas.vacaciones.tramos), 35);
});

test("asignaciones familiares: AAFF, AUH y monotributo (Res. 303/2026)", async () => {
  const { calcularAsignaciones } = await import("../lib/calc/asignaciones");
  const { pAsignaciones } = await import("../lib/params");
  const { asignacionesFamiliares } = await import("../lib/data");
  assert.equal(asignacionesFamiliares.verificadoEnNorma, true);

  const base = {
    regimen: "aaff" as const,
    zona: "general" as const,
    hijosDiscapacidad: 0,
    prenatal: false,
    ayudaEscolar: false,
    nacimiento: false,
    matrimonio: false,
    adopcion: false,
    integranteSuperaTope: false,
  };

  const r1 = calcularAsignaciones({ ...base, igf: 1_000_000, hijos: 1 }, pAsignaciones);
  assert.equal(r1.ok, true);
  if (r1.ok) cerca(r1.totalMensual, 79_816);

  const r2 = calcularAsignaciones({ ...base, igf: 1_500_000, hijos: 1 }, pAsignaciones);
  if (r2.ok) cerca(r2.totalMensual, 53_841);

  const r3 = calcularAsignaciones({ ...base, igf: 7_000_000, hijos: 1 }, pAsignaciones);
  if (r3.ok) {
    cerca(r3.totalMensual, 0);
    assert.ok(r3.mensajes.some((m) => /supera el tope/i.test(m)));
  }

  const r4 = calcularAsignaciones({ ...base, igf: 1_000_000, hijos: 2 }, pAsignaciones);
  if (r4.ok) cerca(r4.totalMensual, 159_632);

  const r5 = calcularAsignaciones({ ...base, zona: "zona2", igf: 1_000_000, hijos: 1 }, pAsignaciones);
  if (r5.ok) cerca(r5.totalMensual, 172_096);

  const r6 = calcularAsignaciones({ ...base, igf: 2_500_000, hijos: 0, hijosDiscapacidad: 1 }, pAsignaciones);
  if (r6.ok) cerca(r6.totalMensual, 116_026);

  const r7 = calcularAsignaciones({ ...base, igf: 2_000_000, hijos: 1, ayudaEscolar: true }, pAsignaciones);
  if (r7.ok) {
    cerca(r7.totalMensual, 32_566);
    cerca(r7.lineasAnuales[0]!.monto, 55_672);
  }

  const r8 = calcularAsignaciones({ ...base, igf: 5_000_000, hijos: 0, nacimiento: true }, pAsignaciones);
  if (r8.ok) cerca(r8.lineasUnicas[0]!.monto, 93_035);

  const auh = calcularAsignaciones({
    ...base, regimen: "auh", igf: 0, hijos: 1,
  }, pAsignaciones);
  if (auh.ok && auh.auh) {
    cerca(auh.totalMensual, 159_611);
    cerca(auh.auh.cobroMensual, 127_688.80);
    cerca(auh.auh.retenido, 31_922.20);
  }

  const auhD = calcularAsignaciones({
    ...base, regimen: "auh", igf: 0, hijos: 0, hijosDiscapacidad: 1,
  }, pAsignaciones);
  if (auhD.ok && auhD.auh) {
    cerca(auhD.totalMensual, 519_704);
    cerca(auhD.auh.cobroMensual, 415_763.20);
  }

  const auhZ1 = calcularAsignaciones({
    ...base, regimen: "auh", zona: "zona1", igf: 0, hijos: 1,
  }, pAsignaciones);
  if (auhZ1.ok && auhZ1.auh) cerca(auhZ1.auh.cobroMensual, 165_996);

  const monoA = calcularAsignaciones({
    ...base, regimen: "monotributo", igf: 0, hijos: 1, categoriaMono: "A",
  }, pAsignaciones);
  if (monoA.ok) cerca(monoA.totalMensual, 79_816);

  const monoH = calcularAsignaciones({
    ...base, regimen: "monotributo", igf: 0, hijos: 1, categoriaMono: "H-K",
  }, pAsignaciones);
  if (monoH.ok) cerca(monoH.totalMensual, 0);

  const monoHD = calcularAsignaciones({
    ...base, regimen: "monotributo", igf: 0, hijos: 0, hijosDiscapacidad: 1, categoriaMono: "H-K",
  }, pAsignaciones);
  if (monoHD.ok) cerca(monoHD.totalMensual, 116_026);

  const topeInt = calcularAsignaciones({
    ...base, igf: 1_000_000, hijos: 1, integranteSuperaTope: true,
  }, pAsignaciones);
  if (topeInt.ok) cerca(topeInt.totalMensual, 0);

  const topeIntDisc = calcularAsignaciones({
    ...base, igf: 1_000_000, hijos: 0, hijosDiscapacidad: 1, integranteSuperaTope: true,
  }, pAsignaciones);
  if (topeIntDisc.ok) cerca(topeIntDisc.totalMensual, 259_864);
});

test("costo alquilar: sellos CABA/PBA/Córdoba y totales de entrada", async () => {
  const { calcularCostoAlquilar } = await import("../lib/calc/costoAlquilar");
  const { pCostoAlquilar } = await import("../lib/params");
  assert.equal(pCostoAlquilar.cabaViviendaVerificada, true);
  assert.equal(pCostoAlquilar.cabaComercialVerificada, false);

  const base = {
    plazoMeses: 24,
    mesesDeposito: 1,
    mesAdelantado: true,
    modoComision: "meses" as const,
    mesesComision: 1,
    porcentajeComision: 0,
    expensas: 0,
  };

  const cba1 = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "cordoba", destino: "vivienda",
  }, pCostoAlquilar);
  if (cba1.ok) { cerca(cba1.sellos, 0); cerca(cba1.total, 2_400_000); }

  const cba2 = calcularCostoAlquilar({
    ...base, alquilerMensual: 2_000_000, jurisdiccion: "cordoba", destino: "vivienda",
  }, pCostoAlquilar);
  if (cba2.ok) { cerca(cba2.sellos, 240_000); cerca(cba2.total, 6_240_000); }

  const cbaRural = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "cordoba", destino: "rural",
  }, pCostoAlquilar);
  if (cbaRural.ok) { cerca(cbaRural.sellos, 144_000); cerca(cbaRural.total, 2_544_000); }

  const pba1 = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "pba", destino: "vivienda",
    viviendaUnicaPba: true, valuacionFiscal: 1_000_000,
  }, pCostoAlquilar);
  if (pba1.ok) { cerca(pba1.sellos, 0); cerca(pba1.total, 2_400_000); }

  const pba2 = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "pba", destino: "vivienda",
    viviendaUnicaPba: true, valuacionFiscal: 3_000_000,
  }, pCostoAlquilar);
  if (pba2.ok) { cerca(pba2.sellos, 96_000); cerca(pba2.total, 2_496_000); }

  const pba3 = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "pba", destino: "comercial",
  }, pCostoAlquilar);
  if (pba3.ok) { cerca(pba3.sellos, 230_400); cerca(pba3.total, 2_630_400); }

  const pbaTur = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, plazoMeses: 3, jurisdiccion: "pba", destino: "turismo",
  }, pCostoAlquilar);
  if (pbaTur.ok) { cerca(pbaTur.sellos, 48_000); cerca(pbaTur.total, 2_448_000); }

  const cabaCom = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "caba", destino: "comercial",
  }, pCostoAlquilar);
  if (cabaCom.ok) { cerca(cabaCom.sellos, 96_000); cerca(cabaCom.total, 2_496_000); }

  const cabaViv = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "caba", destino: "vivienda",
  }, pCostoAlquilar);
  if (cabaViv.ok) { cerca(cabaViv.sellos, 0); cerca(cabaViv.total, 2_400_000); }

  const sinCom = calcularCostoAlquilar({
    ...base, alquilerMensual: 800_000, jurisdiccion: "cordoba", destino: "vivienda", mesesComision: 0,
  }, pCostoAlquilar);
  if (sinCom.ok) cerca(sinCom.total, 1_600_000);
});

test("retención ganancias: opción a SAC (RG 4003) y tope ANSES único", async () => {
  const { calcularRetencionGanancias } = await import("../lib/calc/retencionGanancias");
  const { pRetencion } = await import("../lib/params");
  assert.equal(pRetencion.topeAnsesUnico, true);
  assert.equal(pRetencion.baseImponibleMaxima, 4_861_685.38);

  const base = {
    conyuge: false,
    hijos: 0,
    hijosDiscapacidad: 0,
    alquilerMensual: 0,
    alquilerReli: false,
    otrasDeduccionesAcumuladas: 0,
  };

  const A = calcularRetencionGanancias({
    ...base, mesPago: "diciembre", brutoMensual: 4_000_000,
    sacJunio: true, sacEsteMes: true, importeSac: 4_000_000,
  }, pRetencion);
  assert.equal(A.ok, true);
  if (A.ok) {
    cerca(A.retencion, 475_271.67);
    cerca(A.impuestoAcum, 2_076_111.03);
    cerca(A.impuestoMesAnterior, 1_600_839.36);
    cerca(A.netoAprox, 6_698_241.82);
  }

  const B = calcularRetencionGanancias({
    ...base, mesPago: "diciembre", brutoMensual: 4_000_000,
    sacJunio: false, sacEsteMes: false, importeSac: 4_000_000,
  }, pRetencion);
  if (B.ok) {
    cerca(B.retencion, 58_504.11);
    cerca(B.impuestoAcum, 1_242_575.91);
    cerca(B.netoAprox, 3_261_495.89);
  }

  const C = calcularRetencionGanancias({
    ...base, mesPago: "noviembre", brutoMensual: 4_000_000,
    sacJunio: true, sacEsteMes: false, importeSac: 4_000_000,
  }, pRetencion);
  if (C.ok) {
    cerca(C.retencion, 58_504.11);
    cerca(C.impuestoAcum, 1_600_839.36);
  }

  const D = calcularRetencionGanancias({
    ...base, mesPago: "diciembre", brutoMensual: 1_500_000,
    sacJunio: true, sacEsteMes: true, importeSac: 1_500_000,
  }, pRetencion);
  if (D.ok) {
    cerca(D.retencion, 0);
    cerca(D.netoAprox, 2_490_000);
  }

  const E = calcularRetencionGanancias({
    ...base, mesPago: "diciembre", brutoMensual: 8_000_000,
    sacJunio: true, sacEsteMes: true, importeSac: 8_000_000, hijos: 1,
  }, pRetencion);
  if (E.ok) {
    cerca(E.retencion, 2_442_891.29);
    cerca(E.impuestoAcum, 16_315_993.25);
    cerca(E.netoAprox, 12_730_622.20);
  }
});
