export interface InflacionParams {
  ipcEn: (periodo: string) => number | null;
  rangoIPC: { primera: string; ultima: string };
}

function mesesEntre(a: string, b: string) {
  const [ya, ma] = a.split("-").map(Number);
  const [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
}

export type InflacionResult =
  | {
      ok: true;
      monto: number;
      mesOrigen: string;
      mesDestino: string;
      ipcOrigen: number;
      ipcDestino: number;
      coef: number;
      montoActualizado: number;
      inflacionAcumulada: number;
      poderDeCompra: number;
      inflacionMensualPromedio: number | null;
      meses: number;
      inverso: boolean;
    }
  | { ok: false; error: string };

export function calcularInflacion(
  i: { monto: number; mesOrigen: string; mesDestino: string; inverso?: boolean },
  p: InflacionParams,
): InflacionResult {
  const monto = Math.max(0, i.monto);
  if (!(monto > 0)) return { ok: false, error: "Ingresá un monto mayor a 0." };
  if (i.mesOrigen < p.rangoIPC.primera || i.mesOrigen > p.rangoIPC.ultima) {
    return { ok: false, error: `El IPC nacional arranca en ${p.rangoIPC.primera}. No hay dato oficial para ${i.mesOrigen}.` };
  }
  if (i.mesDestino < p.rangoIPC.primera || i.mesDestino > p.rangoIPC.ultima) {
    return { ok: false, error: `Todavía no hay IPC publicado para ${i.mesDestino}. El último es ${p.rangoIPC.ultima}.` };
  }
  const ipcOrigen = p.ipcEn(i.mesOrigen);
  const ipcDestino = p.ipcEn(i.mesDestino);
  if (ipcOrigen == null) return { ok: false, error: `No hay IPC para ${i.mesOrigen}.` };
  if (ipcDestino == null) return { ok: false, error: `No hay IPC para ${i.mesDestino}.` };

  const coef = ipcDestino / ipcOrigen;
  const inverso = !!i.inverso;
  const montoActualizado = inverso ? monto / coef : monto * coef;
  const meses = Math.abs(mesesEntre(i.mesOrigen, i.mesDestino));
  const inflacionMensualPromedio = meses > 0 ? coef ** (1 / meses) - 1 : null;

  return {
    ok: true,
    monto,
    mesOrigen: i.mesOrigen,
    mesDestino: i.mesDestino,
    ipcOrigen,
    ipcDestino,
    coef,
    montoActualizado,
    inflacionAcumulada: coef - 1,
    poderDeCompra: 1 / coef,
    inflacionMensualPromedio,
    meses,
    inverso,
  };
}
