/** Tipos de los JSON de /data (formato entregado por el equipo de verificación, ver data/FUENTES.md). */

export interface AnsesVigencia {
  periodoDevengado: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  baseImponibleMinima: number;
  baseImponibleMaxima: number;
  norma: string;
  fuente: string;
}
export interface AnsesTopesFile { id: string; fechaConsulta: string; vigencias: AnsesVigencia[]; nota: string }

export interface SueldoNetoFile {
  id: string;
  fechaConsulta: string;
  aportesTrabajador: { jubilacionSIPA: number; leyPAMI19032: number; obraSocial: number };
  total: number;
  fuentes: string[];
}

export interface AguinaldoFile {
  id: string;
  fechaConsulta: string;
  diasDelSemestre: Record<string, number>;
  criterioDivisor: string;
  vencimientos: { primeraCuota: string; segundaCuota: string };
  fuentes: string[];
}

export interface Tramo { desde: number; hasta: number | null; fijo: number; alicuota: number }
export interface DeduccionesArt30 {
  gni: number; conyuge: number; hijo: number; hijoIncapacitado: number;
  deduccionEspecialAp1: number; deduccionEspecialAp1NuevosProfesionales: number; deduccionEspecialAp2Empleados: number;
}
export interface GananciasFile {
  id: string;
  periodoFiscal: number;
  fechaConsulta: string;
  anual: { uso: string; deduccionesArt30: DeduccionesArt30; escalaArt94: Tramo[]; fuentes: string[] };
  alquilerCasaHabitacion: { porcentajeDeducible: number; adicional10PorCientoRELI: { porcentaje: number }; fuente: string };
}

export interface IndemnizacionFile {
  id: string;
  fechaConsulta: string;
  norma: string;
  antiguedad245: { pisoTope: number };
  preaviso231: { hasta5Anios: number; masDe5Anios: number };
  integracionMes233: { vigente: boolean };
  vacacionesNoGozadas: { diasArt150: ({ hastaAnios: number; dias: number } | { masDe: number; dias: number })[] };
  ganancias: { antiguedadExenta: boolean };
  fuentes: string[];
}

export interface MonotributoCategoria {
  categoria: string;
  ingresosBrutosAnuales: number;
  superficieM2: number;
  energiaKwAnual: number;
  alquileresAnuales: number;
  impuestoIntegrado: { servicios: number; ventaCosasMuebles: number };
  aporteSIPA: number;
  aporteObraSocial: number;
  total: { servicios: number; ventaCosasMuebles: number };
}
export interface MonotributoFile {
  id: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  fechaConsulta: string;
  precioUnitarioMaximoVentaMuebles: number;
  categorias: MonotributoCategoria[];
  fuente: string;
}

/** Series diarias: [fecha ISO, valor] */
export type SerieDiaria = [string, number];
/** Series mensuales IPC: [periodo AAAA-MM, índice, varMensual %, varInteranual %] */
export type SerieIpc = [string, number, number | null, number | null];

export interface SerieDiariaFile {
  id: string;
  nombre: string;
  fechaConsulta: string;
  base: string;
  decimales: number;
  periodicidad: string;
  primerFecha: string;
  ultimaFecha: string;
  norma: string;
  uso?: string;
  fuentes: string[];
  serie: SerieDiaria[];
}

export interface IpcFile {
  id: string;
  nombre: string;
  fechaConsulta: string;
  base: string;
  primerPeriodo: string;
  ultimoPeriodo: string;
  proximaPublicacion: { periodo: string; fecha: string; hora: string; fuente: string };
  nota: string;
  columnas: string[];
  fuentes: string[];
  serie: SerieIpc[];
}

export interface DolarReglasFile {
  id: string;
  fechaConsulta: string;
  impuestoPais: { vigente: boolean; finVigencia: string; detalle: string; fuente: string };
  percepcionGananciasBienesPersonales: {
    norma: string; estado: string; alicuota: number; alcanza: string[]; noAlcanza: string[];
    baseCalculo: string; naturaleza: string; fuentes: string[];
  };
  ivaServiciosDigitales: { alicuota: number; norma: string; fuente: string; pendiente?: string };
  iibbServiciosDigitales: { valor: number | null; detalle: string };
  referencias: { clave: string; nombre: string; fecha: string; valor: number; fuente: string; nota?: string }[];
  dolarMEP: { valor: number | null; detalle: string };
}

export interface TasasReferenciaFile {
  id: string;
  fechaConsulta: string;
  aviso: string;
  series: { clave: string; nombre: string; unidad: string; fecha: string; valor: number; fuente: string }[];
  noDisponibleOficial: string[];
}

export interface PlazoFijoReglasFile {
  id: string;
  fechaConsulta: string;
  norma: string;
  divisor: number;
  divisorNota: string;
  tea: string;
  plazoMinimo: {
    tasaFijaPesos: number; uva: number; uvaPrecancelablePersonasHumanas: number;
    uvaPrecancelableCancelacionDesde: number; unidad: string;
  };
  uva: { valorConstitucion: string; capitalAlVencimiento: string; interes: string };
  tasaMinima: string;
  seguroDepositos: { montoMaximo: number; vigenciaDesde: string; norma: string; alcance: string; fuentes: string[] };
  fuentes: string[];
}

export interface AlquileresReglasFile {
  id: string;
  fechaConsulta: string;
  vigente: { norma: string; regla: string; fuente: string };
  regimenes: { clave: string; nombre: string; desde: string; hasta: string | null; ajuste: string; formula: string; estado: string }[];
  convencionIPC: string;
  fuentes: string[];
}

export interface PrestamosReglasFile {
  id: string;
  fechaConsulta: string;
  sistemaFrances: string;
  ivaIntereses: { alicuota: number; aplica: string; exencion: string; fuente: string };
  uva: { capitalEnUVA: string; cuotaEnPesos: string; proyeccion: string };
  noOficial: string[];
  fuentes: string[];
}

export interface CombustibleFile {
  id: string;
  fechaConsulta: string;
  precios: null;
  detalle: string;
  dondeConsultar: { nombre: string; url: string }[];
  unidades: { nafta: string; gnc: string };
  nota: string;
}

export interface VacacionesHorasExtrasFile {
  id: string;
  fechaConsulta: string;
  vacaciones: {
    diasArt150: ({ hastaAnios: number; dias: number } | { masDe: number; dias: number })[];
    antiguedadAl: string;
    requisitoArt151: string;
    proporcionalArt153: string;
    valorDiaArt155: string;
    divisor: number;
    pago: string;
    goceArt154: string;
    egresoArt156: string;
    norma: string;
    fuentes: string[];
  };
  horasExtras: {
    jornadaMaxima: { diaria: number; semanal: number; norma: string };
    recargos: { clave: string; descripcion: string; recargo: number }[];
    normaRecargos: string;
    limites: { mensual: number; anual: number; norma: string; fuente: string };
    bancoDeHoras: string;
    valorHora: string;
    fuentes: string[];
  };
}

export interface LiquidacionFinalFile {
  id: string;
  fechaConsulta: string;
  reutiliza: string[];
  motivos: { clave: string; nombre: string; rubros: string[]; nota: string }[];
  sacSobreVacaciones: string;
  fuentes: string[];
}

export interface ContribucionesPatronalesFile {
  id: string;
  fechaConsulta: string;
  seguridadSocial: {
    norma: string;
    alicuotas: { clave: string; alicuota: number; descripcion: string }[];
    tope: string;
    fuentes: string[];
  };
  detracciones: {
    general: number;
    sectoresDecretos1067_128_688: number;
    adicionalHasta25Empleados: number;
    detalle: string;
    pendiente?: string;
    fuente: string;
  };
  obraSocial: { alicuota: number; norma: string; nota: string; fuente: string };
  art: { valor: number | null; detalle: string; referenciaFFEP: { valor: number; periodo: string; fuente: string; nota: string } };
  seguroVidaObligatorio: { valor: number; vigenciaDesde: string; norma: string; fuente: string };
  rifl: {
    nombre: string; alicuotaTotal: number;
    detalle: Record<string, number>;
    distribucion: Record<string, number>;
    altasDesde: string; altasHasta: string; duracionMeses: number;
    requisitos: string; noIncluye: string; pendiente?: string; fuentes: string[];
  };
  fal: {
    nombre: string; vigenciaDesde: string; primerPeriodoDevengado: string;
    alicuotas: { grandes: number; mipyme: number };
    compensacion: string; pendiente?: string; fuentes: string[];
  };
  aportesTrabajador: string;
}

/** Vigencia y fuentes normalizadas para mostrar en la UI */
export interface Procedencia { nombre: string; vigencia: string; consultado: string; fuentes: string[] }
