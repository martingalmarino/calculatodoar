export interface CuotasInput {
  precioContado: number;
  cantidadCuotas: number;
  valorCuota: number;
  tasaMensual: number;
  primeraCuotaHoy: boolean;
}

export type CuotasResult =
  | {
      ok: true;
      totalCuotas: number;
      vp: number;
      precioContado: number;
      conviene: "cuotas" | "contado";
      diferencia: number;
      tasaEquilibrio: number;
    }
  | { ok: false; error: string };

function valorPresente(valorCuota: number, n: number, tasa: number, primeraCuotaHoy: boolean) {
  let vp = 0;
  for (let i = 0; i < n; i++) {
    const k = primeraCuotaHoy ? i : i + 1;
    vp += valorCuota / (1 + tasa) ** k;
  }
  return vp;
}

/** Bisección: tasa mensual que hace VP = precioContado. */
function tasaEquilibrio(valorCuota: number, n: number, precioContado: number, primeraCuotaHoy: boolean) {
  let lo = 0;
  let hi = 0.2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const vp = valorPresente(valorCuota, n, mid, primeraCuotaHoy);
    if (vp > precioContado) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function calcularCuotas(i: CuotasInput): CuotasResult {
  const n = Math.floor(i.cantidadCuotas);
  const cuota = i.valorCuota;
  const contado = i.precioContado;
  const tasa = i.tasaMensual;
  if (!(n >= 1 && n <= 60)) return { ok: false, error: "La cantidad de cuotas tiene que estar entre 1 y 60." };
  if (!(cuota > 0 && contado > 0)) return { ok: false, error: "El precio de contado y el valor de cada cuota tienen que ser mayores a 0." };
  if (tasa < 0) return { ok: false, error: "La tasa mensual no puede ser negativa." };

  const vp = valorPresente(cuota, n, tasa, i.primeraCuotaHoy);
  const conviene = vp < contado ? "cuotas" : "contado";
  return {
    ok: true,
    totalCuotas: cuota * n,
    vp,
    precioContado: contado,
    conviene,
    diferencia: Math.abs(contado - vp),
    tasaEquilibrio: tasaEquilibrio(cuota, n, contado, i.primeraCuotaHoy),
  };
}
