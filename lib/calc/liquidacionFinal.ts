import { calcularIndemnizacion, type IndemnizacionParams } from "./indemnizacion";

export type MotivoLiquidacion =
  | "renuncia"
  | "despidoSinCausa"
  | "despidoConCausa"
  | "mutuoAcuerdo"
  | "periodoPrueba";

export interface MotivoConfig {
  clave: string;
  nombre: string;
  rubros: string[];
  nota: string;
}

export interface LiquidacionParams {
  motivos: MotivoConfig[];
  sacSobreVacaciones: string;
  indem: IndemnizacionParams;
}

export interface RubroLiquidacion {
  clave: string;
  label: string;
  porque: string;
  monto: number;
}

const META: Record<string, { label: string; porque: string }> = {
  diasTrabajados: { label: "Días trabajados del mes", porque: "Remuneración proporcional del mes (LCT)" },
  vacacionesNoGozadas: { label: "Vacaciones no gozadas", porque: "Arts. 150, 155 y 156 LCT" },
  sacProporcional: { label: "SAC proporcional", porque: "Arts. 121–123 LCT" },
  antiguedad245: { label: "Indemnización por antigüedad", porque: "Art. 245 LCT" },
  preaviso: { label: "Preaviso omitido", porque: "Art. 231 inc. b LCT" },
  integracionMes: { label: "Integración del mes", porque: "Art. 233 LCT" },
  sacSobrePreavisoIntegracion: { label: "SAC sobre preaviso e integración", porque: "Criterio usual (1/12)" },
  gratificacionPactada: { label: "Gratificación pactada", porque: "Art. 241 LCT" },
};

export type LiquidacionResult =
  | {
      ok: true;
      motivo: string;
      nombreMotivo: string;
      notaMotivo: string;
      rubros: RubroLiquidacion[];
      total: number;
      diasVacaciones: number;
      preavisoTrabajador15dias: boolean;
      indem: NonNullable<ReturnType<typeof calcularIndemnizacion>>;
    }
  | { ok: false; error: string };

export function calcularLiquidacionFinal(
  i: {
    motivo: MotivoLiquidacion;
    ingreso: string;
    egreso: string;
    mejorRemuneracion: number;
    vacacionesGozadas: number;
    topeConvenio: number;
    huboPreaviso: boolean;
    gratificacion?: number;
  },
  p: LiquidacionParams,
): LiquidacionResult {
  const config = p.motivos.find((m) => m.clave === i.motivo);
  if (!config) return { ok: false, error: "Elegí el motivo de egreso." };

  const indem = calcularIndemnizacion({
    ingreso: i.ingreso,
    egreso: i.egreso,
    mejorRemuneracion: i.mejorRemuneracion,
    vacacionesGozadas: i.vacacionesGozadas,
    topeConvenio: i.topeConvenio,
    huboPreaviso: i.huboPreaviso,
    superoPrueba: i.motivo !== "periodoPrueba",
  }, p.indem);
  if (!indem) return { ok: false, error: "Revisá las fechas de ingreso y egreso." };

  const montos: Record<string, number> = {
    diasTrabajados: indem.diasMes,
    vacacionesNoGozadas: indem.vacaciones,
    sacProporcional: indem.sacProporcional,
    antiguedad245: indem.antiguedad,
    preaviso: indem.preaviso,
    integracionMes: indem.integracion,
    sacSobrePreavisoIntegracion: indem.sacPreaviso,
    gratificacionPactada: Math.max(0, i.gratificacion ?? 0),
  };

  const rubros: RubroLiquidacion[] = config.rubros.map((clave) => {
    const meta = META[clave] ?? { label: clave, porque: "" };
    return { clave, label: meta.label, porque: meta.porque, monto: montos[clave] ?? 0 };
  });

  return {
    ok: true,
    motivo: i.motivo,
    nombreMotivo: config.nombre,
    notaMotivo: config.nota,
    rubros,
    total: rubros.reduce((s, r) => s + r.monto, 0),
    diasVacaciones: indem.diasVacaciones,
    preavisoTrabajador15dias: i.motivo === "renuncia",
    indem,
  };
}
