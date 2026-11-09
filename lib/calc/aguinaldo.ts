import { diasInclusive, parseISO, semestreDe } from "./fechas";

export interface AguinaldoInput { anio: number; semestre: 1 | 2; mejorRemuneracion: number; ingreso?: string; egreso?: string }
export interface AguinaldoParams { tasaAportes: number; baseImponibleMaxima: number; diasDelSemestre: Record<string, number> }

/** Días reales del semestre: primero busca en los datos, si no los calcula */
export function diasSemestre(anio: number, semestre: 1 | 2, tabla: Record<string, number>) {
  const s = semestreDe(anio, semestre);
  return tabla[`${anio}-S${semestre}`] ?? diasInclusive(s.inicio, s.fin);
}

export function calcularAguinaldo(i: AguinaldoInput, p: AguinaldoParams) {
  const s = semestreDe(i.anio, i.semestre);
  const desde = i.ingreso ? new Date(Math.max(parseISO(i.ingreso).getTime(), s.inicio.getTime())) : s.inicio;
  const hasta = i.egreso ? new Date(Math.min(parseISO(i.egreso).getTime(), s.fin.getTime())) : s.fin;
  const divisor = diasSemestre(i.anio, i.semestre, p.diasDelSemestre);
  const diasTrabajados = Math.max(0, Math.min(divisor, diasInclusive(desde, hasta)));
  const rem = Math.max(0, i.mejorRemuneracion);
  const bruto = (rem / 2) * (diasTrabajados / divisor);
  const aportes = Math.min(bruto, p.baseImponibleMaxima / 2) * p.tasaAportes;
  return { bruto, aportes, neto: bruto - aportes, diasTrabajados, diasSemestre: divisor, completo: diasTrabajados >= divisor };
}
