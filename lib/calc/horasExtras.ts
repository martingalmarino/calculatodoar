export interface HorasExtrasParams {
  recargos: { clave: string; descripcion: string; recargo: number }[];
  limites: { mensual: number; anual: number; norma: string };
  jornadaMaxima: { diaria: number; semanal: number; norma: string };
  tasaAportes: number;
  baseImponibleMaxima: number;
}

export type HorasExtrasResult =
  | {
      ok: true;
      valorHora: number;
      horas50: number;
      horas100: number;
      multiplicador50: number;
      multiplicador100: number;
      extra50: number;
      extra100: number;
      total: number;
      aportes: number;
      neto: number;
      alertaMensual: boolean;
      alertaAnual: boolean;
      horasMes: number;
      horasAnio: number | null;
      limites: { mensual: number; anual: number; norma: string };
    }
  | { ok: false; error: string };

function multiplicador(p: HorasExtrasParams, clave: string) {
  const r = p.recargos.find((x) => x.clave === clave);
  return 1 + (r?.recargo ?? 0);
}

export function calcularHorasExtras(
  i: {
    sueldoMensual?: number;
    horasMensualesNormales?: number;
    horas50: number;
    horas100: number;
    adicionalesHabituales?: number;
    horasAnioAcumuladas?: number | null;
    modo?: "mensual" | "jornal";
    jornalDiario?: number;
    horasJornada?: number;
  },
  p: HorasExtrasParams,
): HorasExtrasResult {
  const horas50 = Math.max(0, i.horas50);
  const horas100 = Math.max(0, i.horas100);
  const modo = i.modo ?? "mensual";

  let valorHora: number;
  if (modo === "jornal") {
    const jornal = i.jornalDiario ?? 0;
    const horasJornada = i.horasJornada ?? p.jornadaMaxima.diaria;
    if (!(jornal > 0)) return { ok: false, error: "Ingresá el jornal diario." };
    if (!(horasJornada > 0)) return { ok: false, error: "Ingresá las horas de la jornada." };
    valorHora = jornal / horasJornada;
  } else {
    const sueldo = Math.max(0, i.sueldoMensual ?? 0);
    const horasNormales = i.horasMensualesNormales ?? 200;
    const adicionales = Math.max(0, i.adicionalesHabituales ?? 0);
    if (!(sueldo > 0)) return { ok: false, error: "Ingresá el sueldo mensual bruto." };
    if (!(horasNormales > 0)) return { ok: false, error: "Ingresá las horas mensuales normales." };
    valorHora = (sueldo + adicionales) / horasNormales;
  }

  const multiplicador50 = multiplicador(p, "comun");
  const multiplicador100 = multiplicador(p, "descanso");
  const extra50 = horas50 * valorHora * multiplicador50;
  const extra100 = horas100 * valorHora * multiplicador100;
  const total = extra50 + extra100;
  const baseAportes = Math.min(total, p.baseImponibleMaxima);
  const aportes = baseAportes * p.tasaAportes;
  const horasMes = horas50 + horas100;
  const horasAnio = i.horasAnioAcumuladas != null ? Math.max(0, i.horasAnioAcumuladas) : null;

  return {
    ok: true,
    valorHora,
    horas50,
    horas100,
    multiplicador50,
    multiplicador100,
    extra50,
    extra100,
    total,
    aportes,
    neto: total - aportes,
    alertaMensual: horasMes > p.limites.mensual,
    alertaAnual: horasAnio != null && horasAnio > p.limites.anual,
    horasMes,
    horasAnio,
    limites: p.limites,
  };
}
