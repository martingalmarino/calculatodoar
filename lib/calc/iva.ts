export type IvaModo = "sumar" | "quitar";

export interface IvaInput {
  monto: number;
  modo: IvaModo;
  /** Alícuota en tanto por uno (p. ej. 0,21). */
  alicuota: number;
}

export type IvaResult =
  | { ok: true; neto: number; iva: number; total: number; alicuota: number; modo: IvaModo }
  | { ok: false; error: string };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Suma o saca el IVA. La alícuota se lee de data (pIva), no se hardcodea acá. */
export function calcularIva(i: IvaInput): IvaResult {
  const monto = i.monto;
  const a = i.alicuota;
  if (!(monto > 0)) return { ok: false, error: "Ingresá un monto mayor a 0." };
  if (!(a >= 0) || a > 1) return { ok: false, error: "La alícuota tiene que estar entre 0% y 100%." };

  if (i.modo === "sumar") {
    const neto = r2(monto);
    const iva = r2(neto * a);
    const total = r2(neto + iva);
    return { ok: true, neto, iva, total, alicuota: a, modo: "sumar" };
  }

  const total = r2(monto);
  const neto = r2(total / (1 + a));
  const iva = r2(total - neto);
  return { ok: true, neto, iva, total, alicuota: a, modo: "quitar" };
}
