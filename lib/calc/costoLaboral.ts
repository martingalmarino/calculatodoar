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
      /** Base del FAL: bruto − detracción del régimen general. Null si el período es anterior al FAL. */
      baseFal: number | null;
      rifl: boolean;
      trabajador: { aportes: number; neto: number; superaTope: boolean };
    }
  | { ok: false; error: string };

/** Detracción de la Ley 27.541 (art. 22 por trabajador + art. 23, $10.000 del empleador repartidos). */
function detraccionRegimenGeneral(
  i: {
    detraccion: "general" | "sectorial";
    empleadosNomina: number;
    aplicarAdicional25?: boolean;
  },
  p: CostoLaboralParams,
): number {
  let detraccion = i.detraccion === "sectorial" ? p.detractionSectorial : p.detractionGeneral;
  if (i.aplicarAdicional25 && i.empleadosNomina > 0 && i.empleadosNomina <= 25) {
    detraccion += p.adicionalHasta25 / i.empleadosNomina;
  }
  return detraccion;
}

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
    // El 5% sigue sobre el bruto: no está confirmado que la detracción del art. 22
    // se reste de la base RIFL. Criterio conservador, sin cambio.
    alicuotaSS = p.riflAlicuota;
    baseSS = bruto;
  } else {
    alicuotaSS = i.tipoEmpleador === "A" ? p.alicuotaA : p.alicuotaB;
    detraccionAplicada = detraccionRegimenGeneral(i, p);
    baseSS = Math.max(0, bruto - detraccionAplicada);
  }

  const ssBruta = alicuotaSS * baseSS;
  let fal: number | null = null;
  let falAlicuota: number | null = null;
  let baseFal: number | null = null;
  let ss = ssBruta;

  if (i.periodo >= p.falDesde) {
    falAlicuota = i.mipyme ? p.falMipyme : p.falGrandes;
    // Ley 27.802 art. 60 y RG 5907/2026 art. 8: el FAL se aplica sobre las
    // remuneraciones que son base de las contribuciones patronales al SIPA.
    // En el régimen general esa base es bruto − detracción. El art. 15 dice que
    // una reducción de alícuota no cambia este cálculo: en el RIFL se usa la
    // misma base, aunque el 5% siga sobre el bruto.
    baseFal = Math.max(0, bruto - detraccionRegimenGeneral(i, p));
    fal = falAlicuota * baseFal;
    if (!i.rifl) {
      // Art. 76: reducción equivalente. Si el FAL superara las contribuciones,
      // la RG 5907 art. 9 limita el descuento a lo determinado en el período.
      ss = ssBruta - Math.min(fal, ssBruta);
    }
  }

  const obraSocial = p.obraSocialAlicuota * bruto;
  const scvo = p.scvo;
  const artMensual = art ?? 0;
  // En el RIFL el FAL no se compensa (art. 76; Decreto 408/26 art. 24): es costo extra.
  const falExtra = fal == null ? 0 : i.rifl ? fal : Math.max(0, fal - ssBruta);
  const costoMensual = bruto + ssBruta + falExtra + obraSocial + artMensual + scvo;
  const pctSobreBruto = costoMensual / bruto - 1;

  // El SAC anual sigue sin detracción (criterio de la calculadora). En el RIFL,
  // el FAL de ese SAC usa la misma base bruta que las contribuciones del SAC.
  const falSac = i.rifl && falAlicuota != null ? falAlicuota * bruto : 0;
  const costoAnual =
    12 * (bruto + ssBruta + falExtra + obraSocial + artPctN * bruto)
    + bruto * (1 + alicuotaSS + p.obraSocialAlicuota + artPctN)
    + falSac
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
    baseFal,
    rifl: i.rifl,
    trabajador: {
      aportes: neto.jubilacion + neto.pami + neto.obraSocial,
      neto: neto.neto,
      superaTope: neto.superaTope,
    },
  };
}
