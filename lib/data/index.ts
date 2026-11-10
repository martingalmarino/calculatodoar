import type {
  AguinaldoFile, AlquileresReglasFile, AnsesTopesFile, CombustibleFile, ContribucionesPatronalesFile,
  DolarReglasFile, GananciasFile, IndemnizacionFile, IpcFile, LiquidacionFinalFile, MonotributoFile,
  PlazoFijoReglasFile, PrestamosReglasFile, Procedencia, SerieDiariaFile, SueldoNetoFile,
  TasasReferenciaFile, VacacionesHorasExtrasFile,
} from "./schema";
import ansesJson from "@/data/anses-topes.json";
import sueldoJson from "@/data/sueldo-neto.json";
import aguinaldoJson from "@/data/aguinaldo.json";
import ganJson from "@/data/ganancias-4ta-2026.json";
import indemJson from "@/data/indemnizacion-despido.json";
import monoJson from "@/data/monotributo.json";
import iclJson from "@/data/icl.json";
import uvaJson from "@/data/uva.json";
import ipcJson from "@/data/ipc.json";
import dolarJson from "@/data/dolar-reglas.json";
import tasasJson from "@/data/tasas-referencia.json";
import plazoFijoJson from "@/data/plazo-fijo-reglas.json";
import alquileresJson from "@/data/alquileres-reglas.json";
import prestamosJson from "@/data/prestamos-reglas.json";
import combustibleJson from "@/data/combustible.json";
import vacacionesJson from "@/data/vacaciones-horas-extras.json";
import liquidacionJson from "@/data/liquidacion-final.json";
import contribucionesJson from "@/data/contribuciones-patronales.json";
import { fechaAR } from "../format";

export const anses = ansesJson as AnsesTopesFile;
export const sueldoNeto = sueldoJson as SueldoNetoFile;
export const aguinaldo = aguinaldoJson as AguinaldoFile;
export const ganancias = ganJson as unknown as GananciasFile;
export const indemnizacion = indemJson as unknown as IndemnizacionFile;
export const monotributo = monoJson as MonotributoFile;

export const icl = iclJson as SerieDiariaFile;
export const uva = uvaJson as SerieDiariaFile;
export const ipc = ipcJson as unknown as IpcFile;
export const dolar = dolarJson as unknown as DolarReglasFile;
export const tasas = tasasJson as TasasReferenciaFile;
export const plazoFijo = plazoFijoJson as unknown as PlazoFijoReglasFile;
export const alquileres = alquileresJson as AlquileresReglasFile;
export const prestamos = prestamosJson as PrestamosReglasFile;
export const combustible = combustibleJson as CombustibleFile;
export const vacacionesHoras = vacacionesJson as unknown as VacacionesHorasExtrasFile;
export const liquidacion = liquidacionJson as LiquidacionFinalFile;
export const contribuciones = contribucionesJson as unknown as ContribucionesPatronalesFile;

/** Tope vigente más reciente */
export const ansesActual = [...anses.vigencias].sort((a, b) => b.vigenciaDesde.localeCompare(a.vigenciaDesde))[0];
export const tasaAportes = sueldoNeto.aportesTrabajador.jubilacionSIPA + sueldoNeto.aportesTrabajador.leyPAMI19032 + sueldoNeto.aportesTrabajador.obraSocial;

const mapaDiario = (serie: [string, number][]) => new Map(serie);
const iclMap = mapaDiario(icl.serie);
const uvaMap = mapaDiario(uva.serie);
const ipcMap = new Map(ipc.serie.map(([periodo, indice, varMensual, varInteranual]) => [periodo, { indice, varMensual, varInteranual }]));

/** Valor exacto del día o null. No interpola. */
export const iclEn = (fechaISO: string): number | null => iclMap.has(fechaISO) ? iclMap.get(fechaISO)! : null;
export const uvaEn = (fechaISO: string): number | null => uvaMap.has(fechaISO) ? uvaMap.get(fechaISO)! : null;
/** Índice del período AAAA-MM o null. No interpola. */
export const ipcEn = (periodo: string): number | null => ipcMap.has(periodo) ? ipcMap.get(periodo)!.indice : null;
export const ipcFila = (periodo: string) => ipcMap.get(periodo) ?? null;

export const ultimoICL = () => { const [fecha, valor] = icl.serie[icl.serie.length - 1]; return { fecha, valor }; };
export const ultimaUVA = () => { const [fecha, valor] = uva.serie[uva.serie.length - 1]; return { fecha, valor }; };
export const ultimoIPC = () => { const [periodo, valor] = ipc.serie[ipc.serie.length - 1]; return { periodo, valor }; };

export const rangoICL = { primera: icl.primerFecha, ultima: icl.ultimaFecha };
export const rangoUVA = { primera: uva.primerFecha, ultima: uva.ultimaFecha };
export const rangoIPC = { primera: ipc.primerPeriodo, ultima: ipc.ultimoPeriodo };

const vigAnses = (v = ansesActual) => `desde el período devengado ${v.periodoDevengado.split("-").reverse().join("/")}`;

export const PROCEDENCIA: Record<string, Procedencia> = {
  anses: { nombre: `Base imponible ANSES (${ansesActual.norma})`, vigencia: vigAnses(), consultado: fechaAR(anses.fechaConsulta), fuentes: anses.vigencias.map((v) => v.fuente) },
  aportes: { nombre: "Aportes del trabajador: 11% jubilación (Ley 24.241), 3% PAMI (Ley 19.032), 3% obra social (Ley 23.660)", vigencia: "permanente", consultado: fechaAR(sueldoNeto.fechaConsulta), fuentes: sueldoNeto.fuentes },
  sac: { nombre: "Sueldo anual complementario (LCT arts. 121-123, Ley 23.041)", vigencia: "permanente", consultado: fechaAR(aguinaldo.fechaConsulta), fuentes: aguinaldo.fuentes },
  ganancias: { nombre: `Ganancias: escala art. 94 y deducciones art. 30, ${ganancias.anual.uso}`, vigencia: `período fiscal ${ganancias.periodoFiscal}`, consultado: fechaAR(ganancias.fechaConsulta), fuentes: [...ganancias.anual.fuentes, ganancias.alquilerCasaHabitacion.fuente] },
  indemnizacion: { nombre: `Indemnización: ${indemnizacion.norma}`, vigencia: "desde el 6/3/2026", consultado: fechaAR(indemnizacion.fechaConsulta), fuentes: indemnizacion.fuentes },
  monotributo: { nombre: "Monotributo: categorías, parámetros y cuotas (ARCA)", vigencia: `desde el ${fechaAR(monotributo.vigenciaDesde)}`, consultado: fechaAR(monotributo.fechaConsulta), fuentes: [monotributo.fuente] },
  icl: { nombre: "Índice para Contratos de Locación (ICL, BCRA)", vigencia: `${fechaAR(icl.primerFecha)} a ${fechaAR(icl.ultimaFecha)}`, consultado: fechaAR(icl.fechaConsulta), fuentes: icl.fuentes },
  uva: { nombre: "Unidad de Valor Adquisitivo (UVA, BCRA)", vigencia: `${fechaAR(uva.primerFecha)} a ${fechaAR(uva.ultimaFecha)}`, consultado: fechaAR(uva.fechaConsulta), fuentes: uva.fuentes },
  ipc: { nombre: "IPC nacional nivel general (INDEC)", vigencia: `${ipc.primerPeriodo} a ${ipc.ultimoPeriodo}`, consultado: fechaAR(ipc.fechaConsulta), fuentes: ipc.fuentes },
  dolar: { nombre: "Dólar: percepción RG 5617, IVA servicios digitales y referencias BCRA", vigencia: `consulta ${fechaAR(dolar.fechaConsulta)}`, consultado: fechaAR(dolar.fechaConsulta), fuentes: dolar.percepcionGananciasBienesPersonales.fuentes },
  tasas: { nombre: "Tasas de referencia BCRA (orientativas para precargar campos)", vigencia: tasas.series.map((s) => `${s.clave} ${fechaAR(s.fecha)}`).join("; "), consultado: fechaAR(tasas.fechaConsulta), fuentes: tasas.series.map((s) => s.fuente) },
  plazoFijo: { nombre: `Plazo fijo: ${plazoFijo.norma}`, vigencia: `seguro de depósitos desde ${fechaAR(plazoFijo.seguroDepositos.vigenciaDesde)}`, consultado: fechaAR(plazoFijo.fechaConsulta), fuentes: plazoFijo.fuentes },
  alquileres: { nombre: `Alquileres: ${alquileres.vigente.norma}`, vigencia: "régimen vigente (DNU 70/2023) y regímenes anteriores", consultado: fechaAR(alquileres.fechaConsulta), fuentes: alquileres.fuentes },
  prestamos: { nombre: "Préstamos: sistema francés, IVA sobre intereses y UVA", vigencia: `consulta ${fechaAR(prestamos.fechaConsulta)}`, consultado: fechaAR(prestamos.fechaConsulta), fuentes: prestamos.fuentes },
  combustible: { nombre: "Combustible: sin precios precargados (input del usuario)", vigencia: `consulta ${fechaAR(combustible.fechaConsulta)}`, consultado: fechaAR(combustible.fechaConsulta), fuentes: combustible.dondeConsultar.map((d) => d.url) },
  vacaciones: { nombre: `Vacaciones: ${vacacionesHoras.vacaciones.norma}`, vigencia: "LCT vigente (art. 154 según Ley 27.802)", consultado: fechaAR(vacacionesHoras.fechaConsulta), fuentes: vacacionesHoras.vacaciones.fuentes },
  horasExtras: { nombre: `Horas extras: ${vacacionesHoras.horasExtras.normaRecargos}`, vigencia: "LCT y Decreto 484/2000", consultado: fechaAR(vacacionesHoras.fechaConsulta), fuentes: vacacionesHoras.horasExtras.fuentes },
  liquidacion: { nombre: "Liquidación final según motivo de egreso", vigencia: `consulta ${fechaAR(liquidacion.fechaConsulta)}`, consultado: fechaAR(liquidacion.fechaConsulta), fuentes: liquidacion.fuentes },
  contribuciones: { nombre: "Contribuciones patronales, RIFL y FAL", vigencia: `consulta ${fechaAR(contribuciones.fechaConsulta)}`, consultado: fechaAR(contribuciones.fechaConsulta), fuentes: contribuciones.seguridadSocial.fuentes },
};
