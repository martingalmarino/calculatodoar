import { parseISO } from "./fechas";

export interface PlazoFijoParams {
  divisor: number;
  plazoMinimoTradicional: number;
  plazoMinimoUva: number;
  uvaEn: (fechaISO: string) => number | null;
  ultimaUVA: () => { fecha: string; valor: number };
}

const DIA = 86_400_000;

export function addDaysISO(fechaISO: string, dias: number) {
  const d = parseISO(fechaISO);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Día hábil bancario anterior (lun→vie). */
export function diaHabilAnterior(fechaISO: string) {
  const d = parseISO(fechaISO);
  d.setUTCDate(d.getUTCDate() - 1);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function uvaEnOAnterior(fechaISO: string, uvaEn: PlazoFijoParams["uvaEn"]) {
  let f = fechaISO;
  for (let i = 0; i < 10; i++) {
    const v = uvaEn(f);
    if (v != null) return { fecha: f, valor: v };
    f = addDaysISO(f, -1);
  }
  return null;
}

export type PlazoFijoTradResult =
  | { ok: true; capital: number; dias: number; tna: number; interes: number; total: number; tea: number }
  | { ok: false; error: string };

export function calcularPlazoFijo(i: { capital: number; tna: number; dias: number }, p: Pick<PlazoFijoParams, "divisor" | "plazoMinimoTradicional">): PlazoFijoTradResult {
  const capital = Math.max(0, i.capital);
  const tna = Math.max(0, i.tna);
  const dias = Math.floor(i.dias);
  if (!(capital > 0)) return { ok: false, error: "Ingresá un capital mayor a 0." };
  if (dias < p.plazoMinimoTradicional) return { ok: false, error: `El plazo mínimo del plazo fijo tradicional es de ${p.plazoMinimoTradicional} días.` };
  const interes = capital * tna * dias / p.divisor;
  const tea = (1 + tna * dias / p.divisor) ** (p.divisor / dias) - 1;
  return { ok: true, capital, dias, tna, interes, total: capital + interes, tea };
}

export type PlazoFijoUvaResult =
  | {
      ok: true;
      capital: number;
      dias: number;
      fechaConstitucion: string;
      fechaUvaInicial: string;
      uvaInicial: number;
      cantidadUVA: number;
      vencimiento: string;
      uvaFinal: number;
      capitalAjustado: number;
      tnaAdicional: number;
      interes: number;
      total: number;
      esEstimacion: boolean;
    }
  | { ok: false; error: string };

export function calcularPlazoFijoUVA(
  i: { capital: number; fechaConstitucion: string; dias: number; tnaAdicional: number; inflacionMensualEsperada: number },
  p: PlazoFijoParams,
): PlazoFijoUvaResult {
  const capital = Math.max(0, i.capital);
  const dias = Math.floor(i.dias);
  const tnaAdicional = Math.max(0, i.tnaAdicional);
  if (!(capital > 0)) return { ok: false, error: "Ingresá un capital mayor a 0." };
  if (dias < p.plazoMinimoUva) return { ok: false, error: `El plazo mínimo del plazo fijo UVA es de ${p.plazoMinimoUva} días.` };

  const fechaUvaInicial = diaHabilAnterior(i.fechaConstitucion);
  const ini = uvaEnOAnterior(fechaUvaInicial, p.uvaEn);
  if (!ini) return { ok: false, error: `Todavía no hay dato publicado para esa fecha (UVA ${fechaUvaInicial}).` };

  const vencimiento = addDaysISO(i.fechaConstitucion, dias);
  const cantidadUVA = capital / ini.valor;
  let uvaFinal: number;
  let esEstimacion = false;
  const pub = p.uvaEn(vencimiento);
  if (pub != null) {
    uvaFinal = pub;
  } else {
    const ult = p.ultimaUVA();
    const diasProy = Math.max(0, Math.floor((parseISO(vencimiento).getTime() - parseISO(ult.fecha).getTime()) / DIA));
    uvaFinal = ult.valor * (1 + Math.max(0, i.inflacionMensualEsperada)) ** (diasProy / 30);
    esEstimacion = true;
  }

  const capitalAjustado = cantidadUVA * uvaFinal;
  const interes = capitalAjustado * tnaAdicional * dias / p.divisor;
  return {
    ok: true,
    capital,
    dias,
    fechaConstitucion: i.fechaConstitucion,
    fechaUvaInicial: ini.fecha,
    uvaInicial: ini.valor,
    cantidadUVA,
    vencimiento,
    uvaFinal,
    capitalAjustado,
    tnaAdicional,
    interes,
    total: capitalAjustado + interes,
    esEstimacion,
  };
}

/** Inflación mensual a partir de la cual el UVA supera al tradicional (misma TNA adicional fija). */
export function inflacionEquilibrioUva(
  i: { capital: number; fechaConstitucion: string; dias: number; tna: number; tnaAdicional: number },
  p: PlazoFijoParams,
) {
  const trad = calcularPlazoFijo({ capital: i.capital, tna: i.tna, dias: i.dias }, p);
  if (!trad.ok) return null;
  let lo = 0;
  let hi = 0.2;
  for (let n = 0; n < 80; n++) {
    const mid = (lo + hi) / 2;
    const u = calcularPlazoFijoUVA({
      capital: i.capital,
      fechaConstitucion: i.fechaConstitucion,
      dias: i.dias,
      tnaAdicional: i.tnaAdicional,
      inflacionMensualEsperada: mid,
    }, p);
    if (!u.ok) return null;
    if (u.total < trad.total) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
