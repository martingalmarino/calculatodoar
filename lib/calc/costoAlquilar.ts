export type JurisdiccionAlquiler = "caba" | "pba" | "cordoba" | "otra";
export type DestinoAlquiler = "vivienda" | "comercial" | "turismo" | "rural";
export type ModoComision = "meses" | "porcentaje";

export interface SellosAlquilerParams {
  pba: {
    general: number;
    turismo: number;
    turismoPlazoMax: number;
    viviendaValuacionTope: number;
    viviendaHastaTope: number;
    viviendaSobreTope: number;
    agro: number;
  };
  cordoba: {
    urbano: number;
    rural: number;
    exencionPromedioMax: number;
  };
  caba: {
    vivienda: number;
    comercialTuristico: number;
  };
}

export interface CostoAlquilarInput {
  alquilerMensual: number;
  plazoMeses: number;
  jurisdiccion: JurisdiccionAlquiler;
  destino: DestinoAlquiler;
  mesesDeposito: number;
  mesAdelantado: boolean;
  modoComision: ModoComision;
  mesesComision: number;
  porcentajeComision: number;
  expensas: number;
  /** PBA: vivienda única, familiar y ocupación permanente */
  viviendaUnicaPba?: boolean;
  valuacionFiscal?: number;
  /** Córdoba: inmueble urbano (default true) */
  urbanoCordoba?: boolean;
  /** Otra jurisdicción */
  alicuotaOtra?: number;
  exentoOtra?: boolean;
}

export type CostoAlquilarResult =
  | {
      ok: true;
      alquilerMensual: number;
      plazoMeses: number;
      canonTotal: number;
      adelantado: number;
      deposito: number;
      comision: number;
      expensas: number;
      sellos: number;
      total: number;
      sellosAlicuota: number;
      sellosExento: boolean;
      sellosMotivo: string;
      notaComision: string;
    }
  | { ok: false; error: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calcularCostoAlquilar(
  i: CostoAlquilarInput,
  p: SellosAlquilerParams,
  notaComision = "La comisión la pactás con la inmobiliaria; no hay un porcentaje nacional único.",
): CostoAlquilarResult {
  const alquiler = Math.max(0, i.alquilerMensual);
  const plazo = Math.max(0, Math.floor(i.plazoMeses));
  if (!(alquiler > 0)) return { ok: false, error: "Indicá el alquiler mensual." };
  if (!(plazo > 0)) return { ok: false, error: "Indicá el plazo del contrato en meses." };

  const canonTotal = round2(alquiler * plazo);
  const adelantado = i.mesAdelantado ? alquiler : 0;
  const deposito = round2(alquiler * Math.max(0, i.mesesDeposito));
  const comision =
    i.modoComision === "porcentaje"
      ? round2(canonTotal * Math.max(0, i.porcentajeComision))
      : round2(alquiler * Math.max(0, i.mesesComision));
  const expensas = round2(Math.max(0, i.expensas));

  const { sellos, alicuota, exento, motivo } = calcularSellos(i, p, alquiler, plazo, canonTotal);

  return {
    ok: true,
    alquilerMensual: alquiler,
    plazoMeses: plazo,
    canonTotal,
    adelantado,
    deposito,
    comision,
    expensas,
    sellos: round2(sellos),
    total: round2(adelantado + deposito + comision + expensas + sellos),
    sellosAlicuota: alicuota,
    sellosExento: exento,
    sellosMotivo: motivo,
    notaComision,
  };
}

function calcularSellos(
  i: CostoAlquilarInput,
  p: SellosAlquilerParams,
  alquiler: number,
  plazo: number,
  canonTotal: number,
): { sellos: number; alicuota: number; exento: boolean; motivo: string } {
  if (i.jurisdiccion === "otra") {
    if (i.exentoOtra) {
      return { sellos: 0, alicuota: 0, exento: true, motivo: "Marcaste exento en la jurisdicción “Otra”." };
    }
    const a = Math.max(0, i.alicuotaOtra ?? 0);
    return {
      sellos: round2(canonTotal * a),
      alicuota: a,
      exento: a === 0,
      motivo: a === 0 ? "Alícuota en cero (cargada a mano)." : `Alícuota cargada a mano: ${(a * 1000).toLocaleString("es-AR")} ‰.`,
    };
  }

  if (i.jurisdiccion === "caba") {
    if (i.destino === "vivienda") {
      return {
        sellos: 0,
        alicuota: 0,
        exento: true,
        motivo: "CABA: locación con destino vivienda exenta (art. 365 inc. 6 CF T.O. 2026).",
      };
    }
    const a = p.caba.comercialTuristico;
    return {
      sellos: round2(canonTotal * a),
      alicuota: a,
      exento: false,
      motivo:
        "CABA comercial/turístico: 0,50% sobre el canon (v1; alícuota pendiente de correlación art. 35 / art. 340). No se consulta el VLR.",
    };
  }

  if (i.jurisdiccion === "cordoba") {
    const rural = i.destino === "rural";
    if (rural) {
      const a = p.cordoba.rural;
      return {
        sellos: round2(canonTotal * a),
        alicuota: a,
        exento: false,
        motivo: "Córdoba rural: 7,50‰ (Ley 11.090 art. 45 inc. 6.1). No aplica la exención urbana del art. 48.",
      };
    }
    const promedio = alquiler;
    if (promedio <= p.cordoba.exencionPromedioMax && i.urbanoCordoba !== false) {
      return {
        sellos: 0,
        alicuota: 0,
        exento: true,
        motivo: `Córdoba urbana: exento (promedio mensual ${promedio.toLocaleString("es-AR")} ≤ $1.230.000, art. 48).`,
      };
    }
    const a = p.cordoba.urbano;
    return {
      sellos: round2(canonTotal * a),
      alicuota: a,
      exento: false,
      motivo: "Córdoba: 5,00‰ sobre el canon (art. 45 inc. 3.1); el promedio mensual supera el tope de exención.",
    };
  }

  // PBA
  if (i.destino === "turismo" && plazo <= p.pba.turismoPlazoMax) {
    const a = p.pba.turismo;
    return {
      sellos: round2(canonTotal * a),
      alicuota: a,
      exento: false,
      motivo: "PBA turismo (plazo ≤ 3 meses): 2% (Ley Impositiva 2026 art. 39 inc. 9.b).",
    };
  }

  if (i.destino === "vivienda" && i.viviendaUnicaPba) {
    const val = i.valuacionFiscal ?? 0;
    if (val <= p.pba.viviendaValuacionTope) {
      return {
        sellos: 0,
        alicuota: 0,
        exento: true,
        motivo: `PBA vivienda única: valuación fiscal ≤ $1.731.600 → 0% (inc. 9.c).`,
      };
    }
    const a = p.pba.viviendaSobreTope;
    return {
      sellos: round2(canonTotal * a),
      alicuota: a,
      exento: false,
      motivo: "PBA vivienda única: valuación fiscal > $1.731.600 → 5‰ (inc. 9.d).",
    };
  }

  if (i.destino === "rural") {
    const a = p.pba.agro;
    return {
      sellos: round2(canonTotal * a),
      alicuota: a,
      exento: false,
      motivo: "PBA agro (inc. 9.e): 15‰.",
    };
  }

  const a = p.pba.general;
  return {
    sellos: round2(canonTotal * a),
    alicuota: a,
    exento: false,
    motivo: "PBA regla general: 12‰ (art. 39 inc. 9.a).",
  };
}
