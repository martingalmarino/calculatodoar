// Adapta los JSON de /data a los parámetros de cada módulo de cálculo.
import { aguinaldo, ansesActual, ganancias, indemnizacion, monotributo, sueldoNeto, tasaAportes } from "./data";
import { diasSemestre } from "./calc/aguinaldo";

export const pSueldo = { baseImponibleMaxima: ansesActual.baseImponibleMaxima, aportes: sueldoNeto.aportesTrabajador };
export const pAguinaldo = { tasaAportes, baseImponibleMaxima: ansesActual.baseImponibleMaxima, diasDelSemestre: aguinaldo.diasDelSemestre };
export const pIndem = {
  pisoTope: indemnizacion.antiguedad245.pisoTope,
  preaviso: indemnizacion.preaviso231,
  integracion: indemnizacion.integracionMes233.vigente,
  vacaciones: indemnizacion.vacacionesNoGozadas.diasArt150.map((v) => ({ hasta: "hastaAnios" in v ? v.hastaAnios : null, dias: v.dias })),
  diasDelSemestre: (a: number, s: 1 | 2) => diasSemestre(a, s, aguinaldo.diasDelSemestre),
};
export const pGanancias = {
  deducciones: ganancias.anual.deduccionesArt30,
  escala: ganancias.anual.escalaArt94,
  alquilerPorcentaje: ganancias.alquilerCasaHabitacion.porcentajeDeducible,
  alquilerReliPorcentaje: ganancias.alquilerCasaHabitacion.adicional10PorCientoRELI.porcentaje,
  tasaAportes,
  baseImponibleMaxima: ansesActual.baseImponibleMaxima,
};
export const pMono = { categorias: monotributo.categorias, precioUnitarioMaximo: monotributo.precioUnitarioMaximoVentaMuebles };
