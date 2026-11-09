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
  vencimientos: { primeraCuota: string; segundaCuota: string; tolerancia: string };
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

/** Vigencia y fuentes normalizadas para mostrar en la UI */
export interface Procedencia { nombre: string; vigencia: string; consultado: string; fuentes: string[] }
