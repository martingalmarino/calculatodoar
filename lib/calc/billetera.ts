import { calcularPlazoFijo, type PlazoFijoParams } from "./plazoFijo";

export type BilleteraResult =
  | {
      ok: true;
      saldo: number;
      tna: number;
      dias: number;
      topeRemunerado: number | null;
      saldoRemunerado: number;
      final: number;
      interes: number;
      tea: number;
      equivalenteMensual: number;
    }
  | { ok: false; error: string };

export function calcularBilletera(i: {
  saldo: number;
  tna: number;
  dias: number;
  topeRemunerado?: number | null;
}): BilleteraResult {
  const saldo = Math.max(0, i.saldo);
  const tna = i.tna;
  const dias = Math.floor(i.dias);
  if (!(saldo > 0)) return { ok: false, error: "Ingresá un saldo mayor a 0." };
  if (!(tna >= 0) || Number.isNaN(tna)) return { ok: false, error: "Ingresá la TNA que muestra tu app." };
  if (!(dias > 0)) return { ok: false, error: "Ingresá un plazo en días." };

  const tope = i.topeRemunerado != null && i.topeRemunerado > 0 ? i.topeRemunerado : null;
  const saldoRemunerado = tope != null ? Math.min(saldo, tope) : saldo;
  const exceso = saldo - saldoRemunerado;
  const finalRemunerado = saldoRemunerado * (1 + tna / 365) ** dias;
  const final = finalRemunerado + exceso;
  const tea = (1 + tna / 365) ** 365 - 1;
  const equivalenteMensual = (1 + tea) ** (1 / 12) - 1;

  return {
    ok: true,
    saldo,
    tna,
    dias,
    topeRemunerado: tope,
    saldoRemunerado,
    final,
    interes: final - saldo,
    tea,
    equivalenteMensual,
  };
}

export function compararBilleteraConPlazoFijo(
  i: { saldo: number; tnaBilletera: number; tnaPlazoFijo: number; dias: number; topeRemunerado?: number | null },
  p: Pick<PlazoFijoParams, "divisor" | "plazoMinimoTradicional">,
) {
  const bil = calcularBilletera({ saldo: i.saldo, tna: i.tnaBilletera, dias: i.dias, topeRemunerado: i.topeRemunerado });
  const pf = calcularPlazoFijo({ capital: i.saldo, tna: i.tnaPlazoFijo, dias: i.dias }, p);
  return { billetera: bil, plazoFijo: pf };
}

/** Inflación esperada sobre el saldo en `dias` días (compuesta mensual). */
export function saldoConInflacion(saldo: number, inflacionMensual: number, dias: number) {
  return saldo * (1 + Math.max(0, inflacionMensual)) ** (dias / 30);
}
