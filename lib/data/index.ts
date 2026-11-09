import type { AguinaldoFile, AnsesTopesFile, GananciasFile, IndemnizacionFile, MonotributoFile, Procedencia, SueldoNetoFile } from "./schema";
import ansesJson from "@/data/anses-topes.json";
import sueldoJson from "@/data/sueldo-neto.json";
import aguinaldoJson from "@/data/aguinaldo.json";
import ganJson from "@/data/ganancias-4ta-2026.json";
import indemJson from "@/data/indemnizacion-despido.json";
import monoJson from "@/data/monotributo.json";
import { fechaAR } from "../format";

export const anses = ansesJson as AnsesTopesFile;
export const sueldoNeto = sueldoJson as SueldoNetoFile;
export const aguinaldo = aguinaldoJson as AguinaldoFile;
export const ganancias = ganJson as unknown as GananciasFile;
export const indemnizacion = indemJson as unknown as IndemnizacionFile;
export const monotributo = monoJson as MonotributoFile;

/** Tope vigente más reciente */
export const ansesActual = [...anses.vigencias].sort((a, b) => b.vigenciaDesde.localeCompare(a.vigenciaDesde))[0];
export const tasaAportes = sueldoNeto.aportesTrabajador.jubilacionSIPA + sueldoNeto.aportesTrabajador.leyPAMI19032 + sueldoNeto.aportesTrabajador.obraSocial;

const vigAnses = (v = ansesActual) => `desde el período devengado ${v.periodoDevengado.split("-").reverse().join("/")}`;

export const PROCEDENCIA: Record<string, Procedencia> = {
  anses: { nombre: `Base imponible ANSES (${ansesActual.norma})`, vigencia: vigAnses(), consultado: fechaAR(anses.fechaConsulta), fuentes: anses.vigencias.map((v) => v.fuente) },
  aportes: { nombre: "Aportes del trabajador: 11% jubilación (Ley 24.241), 3% PAMI (Ley 19.032), 3% obra social (Ley 23.660)", vigencia: "permanente", consultado: fechaAR(sueldoNeto.fechaConsulta), fuentes: sueldoNeto.fuentes },
  sac: { nombre: "Sueldo anual complementario (LCT arts. 121-123, Ley 23.041)", vigencia: "permanente", consultado: fechaAR(aguinaldo.fechaConsulta), fuentes: aguinaldo.fuentes },
  ganancias: { nombre: `Ganancias: escala art. 94 y deducciones art. 30, ${ganancias.anual.uso}`, vigencia: `período fiscal ${ganancias.periodoFiscal}`, consultado: fechaAR(ganancias.fechaConsulta), fuentes: [...ganancias.anual.fuentes, ganancias.alquilerCasaHabitacion.fuente] },
  indemnizacion: { nombre: `Indemnización: ${indemnizacion.norma}`, vigencia: "desde el 6/3/2026", consultado: fechaAR(indemnizacion.fechaConsulta), fuentes: indemnizacion.fuentes },
  monotributo: { nombre: "Monotributo: categorías, parámetros y cuotas (ARCA)", vigencia: `desde el ${fechaAR(monotributo.vigenciaDesde)}`, consultado: fechaAR(monotributo.fechaConsulta), fuentes: [monotributo.fuente] },
};
