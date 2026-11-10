// Adapta los JSON de /data a los parámetros de cada módulo de cálculo.
import {
  aguinaldo, alquileres, ansesActual, combustible, contribuciones, dolar,
  ganancias, iclEn, ipc, ipcEn, indemnizacion, monotributo, plazoFijo, prestamos,
  rangoICL, rangoIPC, sueldoNeto, tasaAportes, tasas, ultimoIPC, ultimaUVA, uvaEn,
  vacacionesHoras, liquidacion,
} from "./data";
import { diasSemestre } from "./calc/aguinaldo";

export const pSueldo = { baseImponibleMaxima: ansesActual.baseImponibleMaxima, aportes: sueldoNeto.aportesTrabajador };
export const pAguinaldo = { tasaAportes, baseImponibleMaxima: ansesActual.baseImponibleMaxima, diasDelSemestre: aguinaldo.diasDelSemestre };
const escalaVacacionesArt150 = vacacionesHoras.vacaciones.diasArt150.map((v) => ({
  hasta: "hastaAnios" in v ? v.hastaAnios : null,
  dias: v.dias,
}));

export const pIndem = {
  pisoTope: indemnizacion.antiguedad245.pisoTope,
  preaviso: indemnizacion.preaviso231,
  integracion: indemnizacion.integracionMes233.vigente,
  vacaciones: escalaVacacionesArt150,
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

export const pAlquiler = {
  vigente: alquileres.vigente,
  regimenes: alquileres.regimenes,
  convencionIPC: alquileres.convencionIPC,
  iclEn,
  ipcEn,
  ultimoIPC,
  rangoICL,
  rangoIPC,
};
export const pCuotas = { avisoTasas: tasas.aviso, series: tasas.series };
export const pDolar = {
  impuestoPais: dolar.impuestoPais,
  percepcion: dolar.percepcionGananciasBienesPersonales,
  ivaServiciosDigitales: dolar.ivaServiciosDigitales,
  iibbServiciosDigitales: dolar.iibbServiciosDigitales,
  referencias: dolar.referencias,
  mep: dolar.dolarMEP,
};
export const pPlazoFijo = {
  divisor: plazoFijo.divisor,
  plazoMinimo: plazoFijo.plazoMinimo,
  plazoMinimoTradicional: plazoFijo.plazoMinimo.tasaFijaPesos,
  plazoMinimoUva: plazoFijo.plazoMinimo.uva,
  uva: plazoFijo.uva,
  seguroDepositos: plazoFijo.seguroDepositos,
  tasaRefDepositos: tasas.series.find((s) => s.clave === "depositos30d") ?? null,
  remInflacion12m: tasas.series.find((s) => s.clave === "remInflacion12m") ?? null,
  uvaEn,
  ultimaUVA,
};
export const pInflacion = {
  ipcEn,
  ultimoIPC,
  rangoIPC,
  proximaPublicacion: ipc.proximaPublicacion,
  serie: ipc.serie,
};
export const pBilletera = {
  seguroDepositos: plazoFijo.seguroDepositos,
  avisoTasas: tasas.aviso,
  series: tasas.series,
};
export const pPrestamo = {
  sistemaFrances: prestamos.sistemaFrances,
  ivaIntereses: prestamos.ivaIntereses,
  ivaAlicuota: prestamos.ivaIntereses.alicuota,
  uva: prestamos.uva,
  tasaRefPersonales: tasas.series.find((s) => s.clave === "prestamosPersonales") ?? null,
  remInflacion12m: tasas.series.find((s) => s.clave === "remInflacion12m") ?? null,
  uvaEn,
  ultimaUVA,
};
export const pCombustible = {
  unidades: combustible.unidades,
  dondeConsultar: combustible.dondeConsultar,
  detalle: combustible.detalle,
  nota: combustible.nota,
};
export const pVacaciones = {
  diasArt150: escalaVacacionesArt150,
  divisor: vacacionesHoras.vacaciones.divisor,
  goceArt154: vacacionesHoras.vacaciones.goceArt154,
  norma: vacacionesHoras.vacaciones.norma,
  tasaAportes,
  baseImponibleMaxima: ansesActual.baseImponibleMaxima,
};
export const pHorasExtras = {
  jornadaMaxima: vacacionesHoras.horasExtras.jornadaMaxima,
  recargos: vacacionesHoras.horasExtras.recargos,
  limites: vacacionesHoras.horasExtras.limites,
  bancoDeHoras: vacacionesHoras.horasExtras.bancoDeHoras,
  valorHoraNota: vacacionesHoras.horasExtras.valorHora,
  normaRecargos: vacacionesHoras.horasExtras.normaRecargos,
  tasaAportes,
  baseImponibleMaxima: ansesActual.baseImponibleMaxima,
};
/** Reutiliza pIndem y pAguinaldo; no los duplica. */
export const pLiquidacion = {
  motivos: liquidacion.motivos,
  sacSobreVacaciones: liquidacion.sacSobreVacaciones,
  indem: pIndem,
  aguinaldo: pAguinaldo,
};
export const pCosto = {
  seguridadSocial: contribuciones.seguridadSocial,
  detracciones: contribuciones.detracciones,
  obraSocial: contribuciones.obraSocial,
  art: contribuciones.art,
  seguroVidaObligatorio: contribuciones.seguroVidaObligatorio,
  rifl: contribuciones.rifl,
  fal: contribuciones.fal,
  baseImponibleMaxima: ansesActual.baseImponibleMaxima,
  aportesTrabajador: sueldoNeto.aportesTrabajador,
  alicuotaA: contribuciones.seguridadSocial.alicuotas.find((a) => a.clave === "A")!.alicuota,
  alicuotaB: contribuciones.seguridadSocial.alicuotas.find((a) => a.clave === "B")!.alicuota,
  detractionGeneral: contribuciones.detracciones.general,
  detractionSectorial: contribuciones.detracciones.sectoresDecretos1067_128_688,
  adicionalHasta25: contribuciones.detracciones.adicionalHasta25Empleados,
  obraSocialAlicuota: contribuciones.obraSocial.alicuota,
  scvo: contribuciones.seguroVidaObligatorio.valor,
  riflAlicuota: contribuciones.rifl.alicuotaTotal,
  falGrandes: contribuciones.fal.alicuotas.grandes,
  falMipyme: contribuciones.fal.alicuotas.mipyme,
  falDesde: contribuciones.fal.primerPeriodoDevengado,
  sueldo: pSueldo,
};
