import { diasSemestre } from "./aguinaldo";
import { diasInclusive, parseISO, semestreDe } from "./fechas";

export type CategoriaCasas =
  | "supervision"
  | "tareas-especificas"
  | "caseros"
  | "cuidado-personas"
  | "tareas-generales";

export type ModalidadRetiro = "con-retiro" | "sin-retiro";
export type FormaPago = "hora" | "mensual";
export type SituacionAportes = "activo18" | "joven16a17" | "jubilado";
export type TramoHoras = "menos12" | "de12a16" | "de16mas";

export interface EscalaCelda {
  hora: number;
  mes: number;
}

export interface AportesFila {
  importeAPagar: number;
  aportesSalud: number;
  contribucionesSipa: number;
  cuotaArt: number;
}

export interface EscalaPeriodo {
  verificadoEnPdf: boolean;
  vigencia: string;
  fuente: string;
  categorias: Record<string, Partial<Record<"conRetiro" | "sinRetiro", EscalaCelda>>>;
}

export interface AportesPeriodo {
  verificadoEnPdf: boolean;
  vigencia: string;
  fuente: string;
  filas: Record<SituacionAportes, Record<TramoHoras, AportesFila>> | null;
  nota?: string;
}

export interface CasasParticularesParams {
  fechaConsulta: string;
  escalas: Record<string, EscalaPeriodo>;
  aportes: Record<string, AportesPeriodo>;
  antiguedad: { porcentajePorAnio: number; computaDesde: string };
  zonaDesfavorable: { porcentaje: number };
  vacaciones: { tramos: { hastaAnios: number | null; dias: number }[] };
  diasDelSemestre: Record<string, number>;
  periodos: string[];
}

export interface CasasParticularesInput {
  periodo: string;
  categoria: CategoriaCasas;
  modalidad: ModalidadRetiro;
  formaPago: FormaPago;
  horasSemanales: number;
  aniosAntiguedad?: number;
  fechaIngreso?: string;
  zonaDesfavorable: boolean;
  pacto?: number | null;
  anioSac?: number;
  semestreSac?: 1 | 2;
  diasTrabajadosSac?: number | null;
  ingresoSac?: string;
  egresoSac?: string;
  situacion: SituacionAportes;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function tramoHoras(horas: number): TramoHoras {
  if (horas < 12) return "menos12";
  if (horas < 16) return "de12a16";
  return "de16mas";
}

export function minimoPorHoras(hora: number, mes: number, horasSemanales: number): number {
  if (horasSemanales < 24) return round2(hora * horasSemanales);
  if (horasSemanales < 48) return round2(mes * (horasSemanales / 48));
  return round2(mes);
}

export function aniosDesdeIngreso(fechaIngreso: string, computaDesde: string, refISO: string): number {
  const desde = new Date(Math.max(Date.parse(fechaIngreso), Date.parse(computaDesde)));
  const hasta = new Date(Date.parse(refISO));
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime()) || hasta < desde) return 0;
  let anios = hasta.getUTCFullYear() - desde.getUTCFullYear();
  const m = hasta.getUTCMonth() - desde.getUTCMonth();
  if (m < 0 || (m === 0 && hasta.getUTCDate() < desde.getUTCDate())) anios -= 1;
  return Math.max(0, anios);
}

export function diasVacacionesArt29(anios: number, tramos: { hastaAnios: number | null; dias: number }[]): number {
  for (const t of tramos) {
    if (t.hastaAnios == null || anios <= t.hastaAnios) return t.dias;
  }
  return tramos[tramos.length - 1]?.dias ?? 0;
}

function celdaDe(
  escala: EscalaPeriodo,
  categoria: CategoriaCasas,
  modalidad: ModalidadRetiro,
): EscalaCelda | null {
  const cat = escala.categorias[categoria];
  if (!cat) return null;
  const key = modalidad === "con-retiro" ? "conRetiro" : "sinRetiro";
  return cat[key] ?? null;
}

function ultimoDiaPeriodo(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 0));
  return d.toISOString().slice(0, 10);
}

export type CasasParticularesResult =
  | {
      ok: true;
      periodo: string;
      categoria: CategoriaCasas;
      modalidad: ModalidadRetiro;
      formaPago: FormaPago;
      horasSemanales: number;
      valorHoraEscala: number;
      valorMesEscala: number;
      minimoEscala: number;
      zonaAplicada: boolean;
      adicionalZona: number;
      subtotalConZona: number;
      aniosAntiguedad: number;
      adicionalAntiguedad: number;
      minimoAjustado: number;
      pacto: number | null;
      remuneracion: number;
      medioSac: number;
      diasTrabajadosSac: number;
      diasSemestreSac: number;
      sacCompleto: boolean;
      tramo: TramoHoras;
      aportes: AportesFila | null;
      aportesDisponibles: boolean;
      aportesVigencia: string | null;
      costoMensualEmpleador: number;
      diasVacaciones: number;
      escalaVigencia: string;
      notaConversion: string;
    }
  | { ok: false; error: string };

export function calcularCasasParticulares(
  i: CasasParticularesInput,
  p: CasasParticularesParams,
): CasasParticularesResult {
  const escala = p.escalas[i.periodo];
  if (!escala || !escala.verificadoEnPdf) {
    return { ok: false, error: "Falta cargar la escala oficial de este mes." };
  }

  const celda = celdaDe(escala, i.categoria, i.modalidad);
  if (!celda) {
    return {
      ok: false,
      error:
        i.categoria === "caseros" && i.modalidad === "con-retiro"
          ? "Caseros solo tiene escala sin retiro."
          : "No hay valor de escala para esa categoría y modalidad.",
    };
  }

  const horas = Math.max(0, i.horasSemanales);
  if (!(horas > 0)) return { ok: false, error: "Indicá las horas semanales." };

  const minimoEscala = minimoPorHoras(celda.hora, celda.mes, horas);
  const zonaAplicada = !!i.zonaDesfavorable;
  const adicionalZona = zonaAplicada ? round2(minimoEscala * p.zonaDesfavorable.porcentaje) : 0;
  const subtotalConZona = round2(minimoEscala + adicionalZona);

  let anios = Math.max(0, Math.floor(i.aniosAntiguedad ?? 0));
  if (i.fechaIngreso) {
    anios = aniosDesdeIngreso(i.fechaIngreso, p.antiguedad.computaDesde, ultimoDiaPeriodo(i.periodo));
  }
  const adicionalAntiguedad = round2(subtotalConZona * p.antiguedad.porcentajePorAnio * anios);
  const minimoAjustado = round2(subtotalConZona + adicionalAntiguedad);

  const pacto = i.pacto != null && i.pacto > 0 ? round2(i.pacto) : null;
  const remuneracion = pacto != null && pacto > minimoAjustado ? pacto : minimoAjustado;

  const anioSac = i.anioSac ?? Number(i.periodo.slice(0, 4));
  const semestreSac = i.semestreSac ?? 2;
  const diasSemestreSac = diasSemestre(anioSac, semestreSac, p.diasDelSemestre);
  let diasTrabajadosSac = diasSemestreSac;
  if (i.diasTrabajadosSac != null && i.diasTrabajadosSac >= 0) {
    diasTrabajadosSac = Math.min(diasSemestreSac, Math.floor(i.diasTrabajadosSac));
  } else if (i.ingresoSac || i.egresoSac) {
    const s = semestreDe(anioSac, semestreSac);
    const desde = i.ingresoSac ? new Date(Math.max(parseISO(i.ingresoSac).getTime(), s.inicio.getTime())) : s.inicio;
    const hasta = i.egresoSac ? new Date(Math.min(parseISO(i.egresoSac).getTime(), s.fin.getTime())) : s.fin;
    diasTrabajadosSac = Math.max(0, Math.min(diasSemestreSac, diasInclusive(desde, hasta)));
  }
  const medioSac = round2(remuneracion * 0.5 * (diasTrabajadosSac / diasSemestreSac));

  const tramo = tramoHoras(horas);
  const bloqueAportes = p.aportes[i.periodo];
  let aportes: AportesFila | null = null;
  let aportesDisponibles = false;
  let aportesVigencia: string | null = null;
  if (bloqueAportes?.verificadoEnPdf && bloqueAportes.filas) {
    aportes = bloqueAportes.filas[i.situacion][tramo];
    aportesDisponibles = true;
    aportesVigencia = bloqueAportes.vigencia;
  }

  const totalArca = aportes?.importeAPagar ?? 0;
  const costoMensualEmpleador = round2(remuneracion + totalArca);

  return {
    ok: true,
    periodo: i.periodo,
    categoria: i.categoria,
    modalidad: i.modalidad,
    formaPago: i.formaPago,
    horasSemanales: horas,
    valorHoraEscala: celda.hora,
    valorMesEscala: celda.mes,
    minimoEscala,
    zonaAplicada,
    adicionalZona,
    subtotalConZona,
    aniosAntiguedad: anios,
    adicionalAntiguedad,
    minimoAjustado,
    pacto,
    remuneracion,
    medioSac,
    diasTrabajadosSac,
    diasSemestreSac,
    sacCompleto: diasTrabajadosSac >= diasSemestreSac,
    tramo,
    aportes,
    aportesDisponibles,
    aportesVigencia,
    costoMensualEmpleador,
    diasVacaciones: diasVacacionesArt29(anios, p.vacaciones.tramos),
    escalaVigencia: escala.vigencia,
    notaConversion:
      "Los mensuales de la escala corresponden a 48 h semanales. Menos de 24 h: valor hora × horas. Entre 24 y menos de 48: mensual × horas/48 (criterio publicado para CABA; fuera de CABA, la autoridad provincial).",
  };
}
