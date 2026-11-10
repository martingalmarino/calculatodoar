import { calcularSueldoNeto, type SueldoNetoParams } from "./sueldoNeto";

export interface CostoLaboralParams {
  alicuotaA: number;
  alicuotaB: number;
  detractionGeneral: number;
  detractionSectorial: number;
  adicionalHasta25: number;
  obraSocialAlicuota: number;
  scvo: number;
  riflAlicuota: number;
  falGrandes: number;
  falMipyme: number;
  falDesde: string;
  sueldo: SueldoNetoParams;
}

export type CostoLaboralResult =
  | {
      ok: true;
      bruto: number;
      tipoEmpleador: "A" | "B";
      alicuotaSS: number;
      detraccionAplicada: number;
      baseSS: number;
      ssBruta: number;
      ss: number;
      obraSocial: number;
      artPct: number;
      artFijo: number;
      art: number | null;
      scvo: number;
      costoMensual: number;
      pctSobreBruto: number;
      costoAnual: number;
      fal: number | null;
      falAlicuota: number | null;
      rifl: boolean;
      trabajador: { aportes: number; neto: number; superaTope: boolean };
    }
  | { ok: false; error: string };

export function calcularCostoLaboral(
  i: {
    bruto: number;
    tipoEmpleador: "A" | "B";
    mipyme: boolean;
    rifl: boolean;
    detraccion: "general" | "sectorial";
    empleadosNomina: number;
    aplicarAdicional25?: boolean;
    artPct?: number | null;
    artFijo?: number | null;
    periodo: string;
  },
  p: CostoLaboralParams,
): CostoLaboralResult {
  const bruto = Math.max(0, i.bruto);
  if (!(bruto > 0)) return { ok: false, error: "Ingresá el sueldo bruto." };

  const artPct = i.artPct != null && !Number.isNaN(i.artPct) && i.artPct >= 0 ? i.artPct : null;
  const artFijo = i.artFijo != null && !Number.isNaN(i.artFijo) && i.artFijo >= 0 ? i.artFijo : null;
  const tieneArt = artPct != null || artFijo != null;
  const artPctN = artPct ?? 0;
  const artFijoN = artFijo ?? 0;
  const art = tieneArt ? artPctN * bruto + artFijoN : null;

  let alicuotaSS: number;
  let detraccionAplicada = 0;
  let baseSS: number;

  if (i.rifl) {
    alicuotaSS = p.riflAlicuota;
    baseSS = bruto;
  } else {
    alicuotaSS = i.tipoEmpleador === "A" ? p.alicuotaA : p.alicuotaB;
    detraccionAplicada = i.detraccion === "sectorial" ? p.detractionSectorial : p.detractionGeneral;
    if (i.aplicarAdicional25 && i.empleadosNomina > 0 && i.empleadosNomina <= 25) {
      detraccionAplicada += p.adicionalHasta25 / i.empleadosNomina;
    }
    baseSS = Math.max(0, bruto - detraccionAplicada);
  }

  const ssBruta = alicuotaSS * baseSS;
  let fal: number | null = null;
  let falAlicuota: number | null = null;
  let ss = ssBruta;

  if (!i.rifl && i.periodo >= p.falDesde) {
    falAlicuota = i.mipyme ? p.falMipyme : p.falGrandes;
    fal = falAlicuota * bruto;
    ss = ssBruta - fal;
  }

  const obraSocial = p.obraSocialAlicuota * bruto;
  const scvo = p.scvo;
  const artMensual = art ?? 0;
  const costoMensual = bruto + ssBruta + obraSocial + artMensual + scvo;
  const pctSobreBruto = costoMensual / bruto - 1;

  const costoAnual =
    12 * (bruto + ssBruta + obraSocial + artPctN * bruto)
    + bruto * (1 + alicuotaSS + p.obraSocialAlicuota + artPctN)
    + 12 * (artFijoN + scvo);

  const neto = calcularSueldoNeto({ bruto, noRemunerativo: 0, cuotaSindical: 0 }, p.sueldo);

  return {
    ok: true,
    bruto,
    tipoEmpleador: i.tipoEmpleador,
    alicuotaSS,
    detraccionAplicada,
    baseSS,
    ssBruta,
    ss,
    obraSocial,
    artPct: artPctN,
    artFijo: artFijoN,
    art,
    scvo,
    costoMensual,
    pctSobreBruto,
    costoAnual,
    fal,
    falAlicuota,
    rifl: i.rifl,
    trabajador: {
      aportes: neto.jubilacion + neto.pami + neto.obraSocial,
      neto: neto.neto,
      superaTope: neto.superaTope,
    },
  };
}
