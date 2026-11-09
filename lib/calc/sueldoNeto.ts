import type { SueldoNetoFile } from "../data/schema";

export interface SueldoNetoInput { bruto: number; noRemunerativo: number; cuotaSindical: number }
export interface SueldoNetoParams { baseImponibleMaxima: number; aportes: SueldoNetoFile["aportesTrabajador"] }

export function calcularSueldoNeto(i: SueldoNetoInput, p: SueldoNetoParams) {
  const bruto = Math.max(0, i.bruto);
  const base = Math.min(bruto, p.baseImponibleMaxima);
  const jubilacion = base * p.aportes.jubilacionSIPA;
  const pami = base * p.aportes.leyPAMI19032;
  const obraSocial = base * p.aportes.obraSocial;
  const sindical = bruto * Math.max(0, i.cuotaSindical);
  const noRem = Math.max(0, i.noRemunerativo);
  const neto = bruto - jubilacion - pami - obraSocial - sindical + noRem;
  return { bruto, base, jubilacion, pami, obraSocial, sindical, noRemunerativo: noRem, neto, superaTope: bruto > p.baseImponibleMaxima };
}
