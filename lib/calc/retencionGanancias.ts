import { impuestoEscala } from "./ganancias";
import type { Tramo } from "../data/schema";

export const MESES_RETENCION = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

export type MesRetencion = (typeof MESES_RETENCION)[number];

export interface DeduccionesMensuales {
  gni: Record<MesRetencion, number>;
  conyuge: Record<MesRetencion, number>;
  hijo: Record<MesRetencion, number>;
  hijoIncapacitado: Record<MesRetencion, number>;
  deduccionEspecialAp2Empleados: Record<MesRetencion, number>;
}

export interface RetencionGananciasParams {
  escalaPorMes: Record<MesRetencion, Tramo[]>;
  deducciones: DeduccionesMensuales;
  alquilerPorcentaje: number;
  alquilerReliPorcentaje: number;
  tasaAportes: number;
  baseImponibleMaxima: number;
  topeAnsesUnico: boolean;
}

export interface RetencionGananciasInput {
  mesPago: MesRetencion;
  brutoMensual: number;
  sacJunio: boolean;
  sacEsteMes: boolean;
  importeSac: number;
  conyuge: boolean;
  hijos: number;
  hijosDiscapacidad: number;
  alquilerMensual: number;
  alquilerReli: boolean;
  otrasDeduccionesAcumuladas: number;
  /** Si null/undefined, se estima mes a mes */
  retencionesAnteriores?: number | null;
  /** Modo avanzado */
  brutoAcumOverride?: number | null;
  aportesAcumOverride?: number | null;
}

export type RetencionGananciasResult =
  | {
      ok: true;
      mesPago: MesRetencion;
      brutoEstePago: number;
      aportesEsteMes: number;
      brutoAcum: number;
      aportesAcum: number;
      deducciones: number;
      gni: number;
      impuestoAcum: number;
      impuestoMesAnterior: number;
      retencionesAnteriores: number;
      retencionesEstimadas: boolean;
      retencion: number;
      netoAprox: number;
      aviso: string;
    }
  | { ok: false; error: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

function mesIndex(m: MesRetencion): number {
  return MESES_RETENCION.indexOf(m) + 1;
}

function deduccionesDelMes(
  m: MesRetencion,
  nMes: number,
  i: RetencionGananciasInput,
  p: RetencionGananciasParams,
  incluirOtras: boolean,
): number {
  const d = p.deducciones;
  const art30 =
    d.gni[m] +
    d.deduccionEspecialAp2Empleados[m] +
    (i.conyuge ? d.conyuge[m] : 0) +
    Math.max(0, Math.floor(i.hijos)) * d.hijo[m] +
    Math.max(0, Math.floor(i.hijosDiscapacidad)) * d.hijoIncapacitado[m];
  const alqBase = Math.max(0, i.alquilerMensual) * nMes;
  const alquiler =
    Math.min(alqBase * p.alquilerPorcentaje, d.gni[m]) +
    (i.alquilerReli ? alqBase * p.alquilerReliPorcentaje : 0);
  const otras = incluirOtras ? Math.max(0, i.otrasDeduccionesAcumuladas) : 0;
  return art30 + alquiler + otras;
}

interface MesCalc {
  brutoLiq: number;
  aportesLiq: number;
  brutoAcum: number;
  aportesAcum: number;
  deducciones: number;
  gni: number;
  impuestoAcum: number;
  retencion: number;
  brutoEstePago: number;
  aportesEstePago: number;
}

function simularHasta(
  i: RetencionGananciasInput,
  p: RetencionGananciasParams,
  hasta: MesRetencion,
): MesCalc[] {
  const sueldo = Math.max(0, i.brutoMensual);
  const sacImporte = Math.max(0, i.importeSac);
  const tope = p.baseImponibleMaxima;
  const hastaN = mesIndex(hasta);
  const cadena: MesCalc[] = [];

  let brutoAcum = 0;
  let aportesAcum = 0;
  let doceavasBrutoSem = 0;
  let doceavasAportesSem = 0;

  for (let n = 1; n <= hastaN; n++) {
    const mes = MESES_RETENCION[n - 1]!;
    const aportesSueldo = round2(Math.min(sueldo, tope) * p.tasaAportes);
    const doceavaBruto = sueldo / 12;
    const doceavaAportes = aportesSueldo / 12;
    const pagaCuota = (n === 6 && i.sacJunio) || (n === mesIndex(i.mesPago) && i.sacEsteMes);

    let brutoLiq: number;
    let aportesLiq: number;
    let brutoEstePago: number;
    let aportesEstePago: number;

    if (pagaCuota) {
      const brutoPagado = sueldo + sacImporte;
      const aportesPagados = round2(Math.min(brutoPagado, tope) * p.tasaAportes);
      brutoLiq = sueldo + sacImporte - doceavasBrutoSem;
      aportesLiq = aportesPagados - doceavasAportesSem;
      brutoEstePago = brutoPagado;
      aportesEstePago = aportesPagados;
      doceavasBrutoSem = 0;
      doceavasAportesSem = 0;
    } else {
      brutoLiq = sueldo + doceavaBruto;
      aportesLiq = aportesSueldo + doceavaAportes;
      brutoEstePago = sueldo;
      aportesEstePago = aportesSueldo;
      doceavasBrutoSem += doceavaBruto;
      doceavasAportesSem += doceavaAportes;
    }

    brutoAcum += brutoLiq;
    aportesAcum += aportesLiq;

    const deducciones = deduccionesDelMes(mes, n, i, p, n === mesIndex(i.mesPago));
    const gni = round2(Math.max(0, brutoAcum - aportesAcum - deducciones));
    const impuestoAcum = round2(impuestoEscala(gni, p.escalaPorMes[mes]));
    const prev = cadena[cadena.length - 1]?.impuestoAcum ?? 0;
    const retencion = round2(Math.max(0, impuestoAcum - prev));

    cadena.push({
      brutoLiq,
      aportesLiq,
      brutoAcum: round2(brutoAcum),
      aportesAcum: round2(aportesAcum),
      deducciones: round2(deducciones),
      gni,
      impuestoAcum,
      retencion,
      brutoEstePago,
      aportesEstePago,
    });
  }

  return cadena;
}

export function calcularRetencionGanancias(
  i: RetencionGananciasInput,
  p: RetencionGananciasParams,
): RetencionGananciasResult {
  if (!MESES_RETENCION.includes(i.mesPago)) {
    return { ok: false, error: "Elegí un mes de pago válido." };
  }
  if (!(i.brutoMensual > 0) && !(i.brutoAcumOverride != null && i.brutoAcumOverride > 0)) {
    return { ok: false, error: "Indicá el sueldo bruto mensual." };
  }

  const aviso =
    "V1: un empleador, trabajo desde enero, sueldo mensual constante. Tope ANSES de noviembre 2026 en todos los meses. Procedimiento SAC: opción a) de la RG 4003 (doceava mensual y ajuste en la cuota). No reemplaza el recibo ni el F. 1357.";

  const tieneOverride =
    i.brutoAcumOverride != null &&
    i.brutoAcumOverride >= 0 &&
    i.aportesAcumOverride != null &&
    i.aportesAcumOverride >= 0;

  if (tieneOverride) {
    const mes = i.mesPago;
    const n = mesIndex(mes);
    const sueldo = Math.max(0, i.brutoMensual);
    const pagaCuota = i.sacEsteMes;
    const brutoEstePago = pagaCuota ? sueldo + Math.max(0, i.importeSac) : sueldo;
    const aportesEstePago = round2(Math.min(brutoEstePago, p.baseImponibleMaxima) * p.tasaAportes);
    const brutoAcum = round2(i.brutoAcumOverride!);
    const aportesAcum = round2(i.aportesAcumOverride!);
    const deducciones = deduccionesDelMes(mes, n, i, p, true);
    const gni = round2(Math.max(0, brutoAcum - aportesAcum - deducciones));
    const impuestoAcum = round2(impuestoEscala(gni, p.escalaPorMes[mes]));
    const retencionesEstimadas = i.retencionesAnteriores == null || i.retencionesAnteriores === undefined;
    const retencionesAnteriores = retencionesEstimadas ? 0 : round2(Math.max(0, i.retencionesAnteriores!));
    const retencion = round2(Math.max(0, impuestoAcum - retencionesAnteriores));
    return {
      ok: true,
      mesPago: mes,
      brutoEstePago,
      aportesEsteMes: aportesEstePago,
      brutoAcum,
      aportesAcum,
      deducciones: round2(deducciones),
      gni,
      impuestoAcum,
      impuestoMesAnterior: retencionesAnteriores,
      retencionesAnteriores,
      retencionesEstimadas,
      retencion,
      netoAprox: round2(brutoEstePago - aportesEstePago - retencion),
      aviso,
    };
  }

  const cadena = simularHasta(i, p, i.mesPago);
  const actual = cadena[cadena.length - 1]!;
  const anterior = cadena.length > 1 ? cadena[cadena.length - 2]! : null;

  const retencionesEstimadas = i.retencionesAnteriores == null;
  const retencionesAnteriores = retencionesEstimadas
    ? (anterior?.impuestoAcum ?? 0)
    : round2(Math.max(0, i.retencionesAnteriores!));
  const retencion = round2(Math.max(0, actual.impuestoAcum - retencionesAnteriores));

  return {
    ok: true,
    mesPago: i.mesPago,
    brutoEstePago: actual.brutoEstePago,
    aportesEsteMes: actual.aportesEstePago,
    brutoAcum: actual.brutoAcum,
    aportesAcum: actual.aportesAcum,
    deducciones: actual.deducciones,
    gni: actual.gni,
    impuestoAcum: actual.impuestoAcum,
    impuestoMesAnterior: anterior?.impuestoAcum ?? 0,
    retencionesAnteriores,
    retencionesEstimadas,
    retencion,
    netoAprox: round2(actual.brutoEstePago - actual.aportesEstePago - retencion),
    aviso,
  };
}
