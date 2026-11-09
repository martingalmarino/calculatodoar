import type { DeduccionesArt30, Tramo } from "../data/schema";

export interface GananciasInput {
  brutoMensual: number;
  incluirSac: boolean;
  conyuge: boolean;
  hijos: number;
  alquilerMensual: number;
  alquilerReli: boolean;
  otrasDeducciones: number;
}
export interface GananciasParams {
  deducciones: DeduccionesArt30;
  escala: Tramo[];
  alquilerPorcentaje: number;
  alquilerReliPorcentaje: number;
  tasaAportes: number;
  baseImponibleMaxima: number;
}

export function impuestoEscala(gni: number, escala: Tramo[]) {
  if (gni <= 0) return 0;
  const t = escala.find((x) => x.hasta === null || gni <= x.hasta) ?? escala[escala.length - 1];
  return t.fijo + t.alicuota * (gni - t.desde);
}

/** Liquidación anual del período fiscal (tabla anual de ARCA) */
export function calcularGanancias(i: GananciasInput, p: GananciasParams) {
  const meses = i.incluirSac ? 13 : 12;
  const mensual = Math.max(0, i.brutoMensual);
  const brutoAnual = mensual * meses;
  const aportes = Math.min(mensual, p.baseImponibleMaxima) * p.tasaAportes * meses;
  const neta = brutoAnual - aportes;
  const d = p.deducciones;
  const alqAnual = Math.max(0, i.alquilerMensual) * 12;
  const alquiler = Math.min(alqAnual * p.alquilerPorcentaje, d.gni) + (i.alquilerReli ? alqAnual * p.alquilerReliPorcentaje : 0);
  const deducciones = d.gni + d.deduccionEspecialAp2Empleados + (i.conyuge ? d.conyuge : 0) + Math.max(0, Math.floor(i.hijos)) * d.hijo + alquiler + Math.max(0, i.otrasDeducciones);
  const gni = Math.max(0, neta - deducciones);
  const impuesto = impuestoEscala(gni, p.escala);
  return { brutoAnual, aportes, neta, alquiler, deducciones, gni, impuesto, promedioMensual: impuesto / meses, alicuotaEfectiva: brutoAnual ? impuesto / brutoAnual : 0 };
}
