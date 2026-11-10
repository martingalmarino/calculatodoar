export interface FilaFrances {
  n: number;
  interes: number;
  amortizacion: number;
  cuota: number;
  saldo: number;
  iva?: number;
  cuotaConIva?: number;
}

export function cuadroFrances({ capital, tna, cuotas }: { capital: number; tna: number; cuotas: number }): {
  i: number;
  cuota: number;
  filas: FilaFrances[];
} {
  const n = Math.floor(cuotas);
  const i = tna / 12;
  if (!(capital > 0) || !(n > 0)) return { i, cuota: 0, filas: [] };
  const cuota = i === 0 ? capital / n : capital * i / (1 - (1 + i) ** -n);
  const filas: FilaFrances[] = [];
  let saldo = capital;
  for (let k = 1; k <= n; k++) {
    const interes = saldo * i;
    let amortizacion = cuota - interes;
    if (k === n) amortizacion = saldo; // cierra el saldo residual por redondeo
    const cuotaReal = k === n ? amortizacion + interes : cuota;
    saldo = Math.max(0, saldo - amortizacion);
    filas.push({ n: k, interes, amortizacion, cuota: cuotaReal, saldo });
  }
  return { i, cuota, filas };
}

export interface PrestamoParams {
  ivaAlicuota: number;
  uvaEn: (fechaISO: string) => number | null;
  ultimaUVA: () => { fecha: string; valor: number };
}

export type PrestamoPersonalResult =
  | {
      ok: true;
      capital: number;
      tna: number;
      cuotas: number;
      cuotaPura: number;
      sumarIVA: boolean;
      ivaAlicuota: number;
      filas: FilaFrances[];
      intereses: number;
      ivaTotal: number;
      total: number;
    }
  | { ok: false; error: string };

export function calcularPrestamoPersonal(
  i: { capital: number; tna: number; cuotas: number; sumarIVA?: boolean },
  p: Pick<PrestamoParams, "ivaAlicuota">,
): PrestamoPersonalResult {
  const capital = Math.max(0, i.capital);
  const tna = Math.max(0, i.tna);
  const cuotas = Math.floor(i.cuotas);
  const sumarIVA = i.sumarIVA !== false;
  if (!(capital > 0)) return { ok: false, error: "Ingresá un capital mayor a 0." };
  if (!(cuotas > 0)) return { ok: false, error: "Ingresá la cantidad de cuotas." };

  const { cuota, filas: base } = cuadroFrances({ capital, tna, cuotas });
  const filas = base.map((f) => {
    const iva = sumarIVA ? f.interes * p.ivaAlicuota : 0;
    return { ...f, iva, cuotaConIva: f.cuota + iva };
  });
  const intereses = filas.reduce((s, f) => s + f.interes, 0);
  const ivaTotal = filas.reduce((s, f) => s + (f.iva ?? 0), 0);
  return {
    ok: true,
    capital,
    tna,
    cuotas,
    cuotaPura: cuota,
    sumarIVA,
    ivaAlicuota: p.ivaAlicuota,
    filas,
    intereses,
    ivaTotal,
    total: capital + intereses + ivaTotal,
  };
}

export type PrestamoUvaResult =
  | {
      ok: true;
      capital: number;
      fechaDesembolso: string;
      uvaDesembolso: number;
      capitalUVA: number;
      tna: number;
      cuotas: number;
      cuotaUVA: number;
      uvaHoy: { fecha: string; valor: number };
      cuotaPesosHoy: number;
      filas: FilaFrances[];
      interesesUVA: number;
      proyecciones: { meses: number; uvaEstimada: number; cuotaPesos: number; esEstimacion: true }[];
      relacionCuotaIngreso: number | null;
    }
  | { ok: false; error: string };

export function calcularPrestamoUVA(
  i: {
    capital: number;
    fechaDesembolso: string;
    tna: number;
    cuotas: number;
    inflacionMensualEsperada: number;
    ingresoMensual?: number | null;
  },
  p: PrestamoParams,
): PrestamoUvaResult {
  const capital = Math.max(0, i.capital);
  const tna = Math.max(0, i.tna);
  const cuotas = Math.floor(i.cuotas);
  if (!(capital > 0)) return { ok: false, error: "Ingresá un capital mayor a 0." };
  if (!(cuotas > 0)) return { ok: false, error: "Ingresá la cantidad de cuotas." };

  const uvaDesembolso = p.uvaEn(i.fechaDesembolso);
  if (uvaDesembolso == null) {
    return { ok: false, error: `Todavía no hay UVA publicada para el ${i.fechaDesembolso}.` };
  }

  const capitalUVA = capital / uvaDesembolso;
  const { cuota: cuotaUVA, filas } = cuadroFrances({ capital: capitalUVA, tna, cuotas });
  const uvaHoy = p.ultimaUVA();
  const cuotaPesosHoy = cuotaUVA * uvaHoy.valor;
  const interesesUVA = filas.reduce((s, f) => s + f.interes, 0);
  const infl = Math.max(0, i.inflacionMensualEsperada);
  const proyecciones = [12, 24, 60].map((meses) => {
    const uvaEstimada = uvaHoy.valor * (1 + infl) ** meses;
    return { meses, uvaEstimada, cuotaPesos: cuotaUVA * uvaEstimada, esEstimacion: true as const };
  });
  const ingreso = i.ingresoMensual != null && i.ingresoMensual > 0 ? i.ingresoMensual : null;

  return {
    ok: true,
    capital,
    fechaDesembolso: i.fechaDesembolso,
    uvaDesembolso,
    capitalUVA,
    tna,
    cuotas,
    cuotaUVA,
    uvaHoy,
    cuotaPesosHoy,
    filas,
    interesesUVA,
    proyecciones,
    relacionCuotaIngreso: ingreso != null ? cuotaPesosHoy / ingreso : null,
  };
}
