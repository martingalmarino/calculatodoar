import { antiguedad, diasDelMes, diasInclusive, parseISO } from "./fechas";

export interface IndemnizacionInput {
  ingreso: string;
  egreso: string;
  mejorRemuneracion: number;
  /** true si el despido ocurrió superado el período de prueba */
  superoPrueba: boolean;
  huboPreaviso: boolean;
  /** Tope del art. 245: 3 veces el salario promedio del convenio (0 si no aplica) */
  topeConvenio: number;
  vacacionesGozadas: number;
}
export interface IndemnizacionParams {
  pisoTope: number;
  preaviso: { hasta5Anios: number; masDe5Anios: number };
  integracion: boolean;
  vacaciones: { hasta: number | null; dias: number }[];
  diasDelSemestre: (anio: number, semestre: 1 | 2) => number;
}

export function calcularIndemnizacion(i: IndemnizacionInput, p: IndemnizacionParams) {
  const ing = parseISO(i.ingreso);
  const egr = parseISO(i.egreso);
  if (Number.isNaN(ing.getTime()) || Number.isNaN(egr.getTime()) || egr < ing) return null;
  const rem = Math.max(0, i.mejorRemuneracion);
  const ant = antiguedad(ing, egr);

  // Art. 245 (Ley 27.802): base con tope de convenio y piso del 67%
  let base = rem;
  if (i.topeConvenio > 0) base = Math.max(Math.min(rem, i.topeConvenio), rem * p.pisoTope);
  const anios = Math.max(1, ant.anios + (ant.mesesRestantes > 3 ? 1 : 0));
  const antiguedadMonto = i.superoPrueba ? anios * base : 0;

  // Preaviso (art. 231): no corresponde en período de prueba
  const preaviso = !i.huboPreaviso && i.superoPrueba ? rem * (ant.anios >= 5 ? p.preaviso.masDe5Anios : p.preaviso.hasta5Anios) : 0;
  const y = egr.getUTCFullYear(), m = egr.getUTCMonth();
  const dm = diasDelMes(y, m);
  const integracion = p.integracion && !i.huboPreaviso && i.superoPrueba ? (rem / dm) * (dm - egr.getUTCDate()) : 0;
  const diasMes = (rem / dm) * egr.getUTCDate();

  // Vacaciones no gozadas proporcionales (arts. 150, 155, 156)
  const escala = p.vacaciones.find((v) => v.hasta === null || ant.anios < v.hasta) ?? p.vacaciones[p.vacaciones.length - 1];
  const inicioAnio = new Date(Date.UTC(y, 0, 1));
  const diasAnio = diasInclusive(ing > inicioAnio ? ing : inicioAnio, egr);
  const diasVac = Math.max(0, (escala.dias * diasAnio) / 365 - Math.max(0, i.vacacionesGozadas));
  const vacaciones = (rem / 25) * diasVac;

  // SAC proporcional con los días reales del semestre, y SAC sobre preaviso e integración (1/12)
  const sem: 1 | 2 = m < 6 ? 1 : 2;
  const inicioSem = new Date(Date.UTC(y, sem === 1 ? 0 : 6, 1));
  const divisor = p.diasDelSemestre(y, sem);
  const sacProporcional = (rem / 2) * (diasInclusive(ing > inicioSem ? ing : inicioSem, egr) / divisor);
  const sacPreaviso = (preaviso + integracion) / 12;

  const total = antiguedadMonto + preaviso + integracion + diasMes + vacaciones + sacProporcional + sacPreaviso;
  return { anios: ant.anios, meses: ant.mesesRestantes, aniosComputados: i.superoPrueba ? anios : 0, base, antiguedad: antiguedadMonto, preaviso, integracion, diasMes, diasVacaciones: diasVac, vacaciones, sacProporcional, sacPreaviso, total };
}
