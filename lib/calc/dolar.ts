export type DolarModo = "tarjeta" | "digital" | "dolaresPropios" | "compraOficial" | "mep";

export interface DolarInput {
  montoUSD: number;
  modo: DolarModo;
  cotizacion: number;
  cotizacionMEP?: number;
  iibbPct?: number;
}

export interface DolarParams {
  percepcionAlicuota: number;
  ivaAlicuota: number;
}

export type DolarOk = {
  ok: true;
  modo: DolarModo;
  montoUSD: number;
  cotizacionUsada: number;
  pesos: number;
  iva: number;
  percepcion: number;
  iibb: number;
  total: number;
};
export type DolarErr = { ok: false; error: string };
export type DolarResult = DolarOk | DolarErr;

export function calcularDolar(i: DolarInput, p: DolarParams): DolarResult {
  const usd = Math.max(0, i.montoUSD);
  if (!(usd > 0)) return { ok: false, error: "Ingresá un monto en dólares mayor a 0." };

  if (i.modo === "dolaresPropios") {
    return { ok: true, modo: i.modo, montoUSD: usd, cotizacionUsada: 1, pesos: usd, iva: 0, percepcion: 0, iibb: 0, total: usd };
  }

  if (i.modo === "mep") {
    const cot = i.cotizacionMEP;
    if (cot == null || !(cot > 0)) return { ok: false, error: "Cargá la cotización MEP que ves en tu banco o broker." };
    const pesos = usd * cot;
    return { ok: true, modo: i.modo, montoUSD: usd, cotizacionUsada: cot, pesos, iva: 0, percepcion: 0, iibb: 0, total: pesos };
  }

  const cot = i.cotizacion;
  if (!(cot > 0)) return { ok: false, error: "Ingresá una cotización oficial mayor a 0." };
  const pesos = usd * cot;

  if (i.modo === "compraOficial") {
    return { ok: true, modo: i.modo, montoUSD: usd, cotizacionUsada: cot, pesos, iva: 0, percepcion: 0, iibb: 0, total: pesos };
  }

  if (i.modo === "tarjeta") {
    const percepcion = pesos * p.percepcionAlicuota;
    return { ok: true, modo: i.modo, montoUSD: usd, cotizacionUsada: cot, pesos, iva: 0, percepcion, iibb: 0, total: pesos + percepcion };
  }

  // digital: percepción sobre el importe SIN IVA
  const iva = pesos * p.ivaAlicuota;
  const percepcion = pesos * p.percepcionAlicuota;
  const iibb = Math.max(0, i.iibbPct ?? 0) * pesos;
  return { ok: true, modo: i.modo, montoUSD: usd, cotizacionUsada: cot, pesos, iva, percepcion, iibb, total: pesos + iva + percepcion + iibb };
}
