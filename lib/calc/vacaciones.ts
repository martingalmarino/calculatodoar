import { parseISO } from "./fechas";

export interface VacacionesParams {
  diasArt150: { hasta: number | null; dias: number }[];
  divisor: number;
  tasaAportes: number;
  baseImponibleMaxima: number;
}

/** Agrega N años calendario a una fecha ISO (UTC). */
function addYearsISO(fechaISO: string, anios: number) {
  const d = parseISO(fechaISO);
  d.setUTCFullYear(d.getUTCFullYear() + anios);
  return d;
}

/** Días hábiles (lun–vie) del año calendario. Aproximación si el usuario no carga el dato. */
export function diasHabilesAnio(anio: number) {
  let n = 0;
  const d = new Date(Date.UTC(anio, 0, 1));
  const fin = new Date(Date.UTC(anio, 11, 31));
  while (d <= fin) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) n++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return n;
}

/** Escala art. 150: “no excede N años” = referencia ≤ ingreso + N años (igualdad = no excede). */
export function diasPorAntiguedad(fechaIngreso: string, anio: number, escala: VacacionesParams["diasArt150"]) {
  const ref = new Date(Date.UTC(anio, 11, 31));
  const ordenada = [...escala].sort((a, b) => (a.hasta ?? Infinity) - (b.hasta ?? Infinity));
  for (const tramo of ordenada) {
    if (tramo.hasta == null) return tramo.dias;
    const limite = addYearsISO(fechaIngreso, tramo.hasta);
    if (ref.getTime() <= limite.getTime()) return tramo.dias;
  }
  return ordenada[ordenada.length - 1]!.dias;
}

export type VacacionesResult =
  | {
      ok: true;
      anio: number;
      fechaIngreso: string;
      diasEscala: number;
      dias: number;
      proporcional: boolean;
      diasTrabajados: number | null;
      diasHabiles: number;
      mitadHabiles: number;
      valorDia: number;
      totalBruto: number;
      plus: number;
      aportes: number;
      neto: number;
      baseAportes: number;
      superaTope: boolean;
      tipo: "mensual" | "jornal";
    }
  | { ok: false; error: string };

export function calcularVacaciones(
  i: {
    fechaIngreso: string;
    anio: number;
    sueldoMensual?: number;
    diasTrabajadosEnElAnio?: number | null;
    diasHabilesDelAnio?: number | null;
    tipo?: "mensual" | "jornal";
    jornalDiario?: number | null;
  },
  p: VacacionesParams,
): VacacionesResult {
  const anio = Math.floor(i.anio);
  const ing = parseISO(i.fechaIngreso);
  if (Number.isNaN(ing.getTime())) return { ok: false, error: "Ingresá una fecha de ingreso válida." };
  if (!(anio >= 1900 && anio <= 2100)) return { ok: false, error: "Ingresá el año de las vacaciones." };

  const ref = new Date(Date.UTC(anio, 11, 31));
  if (ing > ref) return { ok: false, error: "La fecha de ingreso no puede ser posterior al 31/12 del año." };

  const tipo = i.tipo ?? "mensual";
  let valorDia: number;
  if (tipo === "jornal") {
    const j = i.jornalDiario ?? 0;
    if (!(j > 0)) return { ok: false, error: "Ingresá el jornal diario." };
    valorDia = j;
  } else {
    const sueldo = i.sueldoMensual ?? 0;
    if (!(sueldo > 0)) return { ok: false, error: "Ingresá el sueldo mensual bruto." };
    valorDia = sueldo / p.divisor;
  }

  const diasEscala = diasPorAntiguedad(i.fechaIngreso, anio, p.diasArt150);
  const diasHabiles = i.diasHabilesDelAnio != null && i.diasHabilesDelAnio > 0
    ? Math.floor(i.diasHabilesDelAnio)
    : diasHabilesAnio(anio);
  const mitadHabiles = diasHabiles / 2;

  let dias = diasEscala;
  let proporcional = false;
  const trabajados = i.diasTrabajadosEnElAnio != null ? Math.max(0, Math.floor(i.diasTrabajadosEnElAnio)) : null;
  if (trabajados != null && trabajados < mitadHabiles) {
    dias = Math.floor(trabajados / 20);
    proporcional = true;
  }

  const totalBruto = dias * valorDia;
  const sueldoMes = tipo === "jornal" ? valorDia * 30 : (i.sueldoMensual ?? 0);
  const plus = totalBruto - dias * (sueldoMes / 30);
  const baseAportes = Math.min(totalBruto, p.baseImponibleMaxima);
  const aportes = baseAportes * p.tasaAportes;

  return {
    ok: true,
    anio,
    fechaIngreso: i.fechaIngreso,
    diasEscala,
    dias,
    proporcional,
    diasTrabajados: trabajados,
    diasHabiles,
    mitadHabiles,
    valorDia,
    totalBruto,
    plus,
    aportes,
    neto: totalBruto - aportes,
    baseAportes,
    superaTope: totalBruto > p.baseImponibleMaxima,
    tipo,
  };
}
