// Adapta los JSON de /data a los parámetros de cada módulo de cálculo.
import {
  aguinaldo, alquileres, ansesActual, asignacionesFamiliares, autonomos, casasParticulares, combustible, contribuciones, dolar,
  ganancias, iclEn, ipc, ipcEn, indemnizacion, iva, monotributo, plazoFijo, prestamos, sellosAlquiler,
  rangoICL, rangoIPC, sueldoNeto, tasaAportes, tasas, ultimoIPC, ultimaUVA, uvaEn,
  vacacionesHoras, liquidacion,
} from "./data";
import retencionReglasJson from "@/data/retencion-ganancias-reglas.json";
import { diasSemestre } from "./calc/aguinaldo";
import type { AportesPeriodo, EscalaPeriodo, SituacionAportes, TramoHoras } from "./calc/casasParticulares";
import type { AsignacionesParams, CategoriaMono, ZonaAaff, ZonaAuh } from "./calc/asignaciones";
import type { SellosAlquilerParams } from "./calc/costoAlquilar";
import { MESES_RETENCION, type DeduccionesMensuales, type MesRetencion, type RetencionGananciasParams } from "./calc/retencionGanancias";
import type { Tramo } from "./data/schema";

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

const rm = (ganancias as unknown as {
  retencionMensual: {
    escalaArt94Acumulada: Record<MesRetencion, (Tramo & { sobreExcedente?: number })[]>;
    deduccionesArt30Acumuladas: DeduccionesMensuales & Record<string, Record<MesRetencion, number>>;
  };
}).retencionMensual;

export const pRetencion: RetencionGananciasParams & {
  avisoAlcance: string;
  topeAnsesNota: string;
  procedimientoSac: string;
} = {
  escalaPorMes: Object.fromEntries(
    MESES_RETENCION.map((m) => [
      m,
      rm.escalaArt94Acumulada[m].map((t) => ({
        desde: t.desde,
        hasta: t.hasta,
        fijo: t.fijo,
        alicuota: t.alicuota,
      })),
    ]),
  ) as Record<MesRetencion, Tramo[]>,
  deducciones: {
    gni: rm.deduccionesArt30Acumuladas.gni,
    conyuge: rm.deduccionesArt30Acumuladas.conyuge,
    hijo: rm.deduccionesArt30Acumuladas.hijo,
    hijoIncapacitado: rm.deduccionesArt30Acumuladas.hijoIncapacitado,
    deduccionEspecialAp2Empleados: rm.deduccionesArt30Acumuladas.deduccionEspecialAp2Empleados,
  },
  alquilerPorcentaje: ganancias.alquilerCasaHabitacion.porcentajeDeducible,
  alquilerReliPorcentaje: ganancias.alquilerCasaHabitacion.adicional10PorCientoRELI.porcentaje,
  tasaAportes,
  baseImponibleMaxima: ansesActual.baseImponibleMaxima,
  topeAnsesUnico: retencionReglasJson.topeAnsesUnico,
  avisoAlcance:
    "V1: un empleador, trabajo desde enero, sueldo mensual constante. Tope ANSES de noviembre 2026 en todos los meses. No es el aplicativo de ARCA ni el F. 1357.",
  topeAnsesNota: retencionReglasJson.topeAnsesNota,
  procedimientoSac: retencionReglasJson.procedimientoSac,
};
export const pMono = { categorias: monotributo.categorias, precioUnitarioMaximo: monotributo.precioUnitarioMaximoVentaMuebles };
export const pIva = { alicuotas: iva.alicuotas, fechaConsulta: iva.fechaConsulta, norma: iva.norma, nota: iva.nota };
export const pAutonomos = {
  grupos: autonomos.grupos,
  categorias: autonomos.grupos.flatMap((g) => g.categorias),
  vigenciaDesde: autonomos.vigenciaDesde,
  fechaConsulta: autonomos.fechaConsulta,
};
export const pCasas = {
  fechaConsulta: casasParticulares.fechaConsulta,
  periodos: Object.keys(casasParticulares.escalas).sort(),
  escalas: casasParticulares.escalas as Record<string, EscalaPeriodo>,
  aportes: casasParticulares.aportes as Record<string, AportesPeriodo>,
  antiguedad: casasParticulares.antiguedad,
  zonaDesfavorable: casasParticulares.zonaDesfavorable,
  vacaciones: casasParticulares.vacaciones,
  diasDelSemestre: aguinaldo.diasDelSemestre,
  ordenAjustes: casasParticulares.ordenAjustes,
  conversionHoras: casasParticulares.conversionHoras,
  situaciones: ["activo18", "joven16a17", "jubilado"] as SituacionAportes[],
  tramos: ["menos12", "de12a16", "de16mas"] as TramoHoras[],
};

const aI = asignacionesFamiliares.anexoI as {
  prenatalHijo: AsignacionesParams["anexoI"]["prenatalHijo"];
  hijoDiscapacidad: AsignacionesParams["anexoI"]["hijoDiscapacidad"];
  ayudaEscolar: AsignacionesParams["anexoI"]["ayudaEscolar"];
  pagosUnicos: AsignacionesParams["anexoI"]["pagosUnicos"];
  zonas: Record<ZonaAaff, { etiqueta: string; detalle: string }>;
};
const aV = asignacionesFamiliares.anexoV as {
  montos: AsignacionesParams["anexoV"]["montos"];
  zonas: Record<ZonaAuh, { etiqueta: string; detalle: string }>;
};
const aVI = asignacionesFamiliares.anexoVI as {
  categorias: AsignacionesParams["anexoVI"]["categorias"];
};

export const pAsignaciones: AsignacionesParams & {
  notaIgf: string;
  topePorIntegrante: number;
  vigenciaDesde: string;
  fechaConsulta: string;
  zonasAnexoI: typeof aI.zonas;
  zonasAnexoV: typeof aV.zonas;
  categoriasMono: CategoriaMono[];
} = {
  topeIgf: asignacionesFamiliares.topeIgf,
  topePorIntegrante: asignacionesFamiliares.topePorIntegrante.monto,
  auhCobro: asignacionesFamiliares.auhRetencion.cobroMensual,
  auhRetenido: asignacionesFamiliares.auhRetencion.retenido,
  anexoI: {
    prenatalHijo: aI.prenatalHijo,
    hijoDiscapacidad: aI.hijoDiscapacidad,
    ayudaEscolar: aI.ayudaEscolar,
    pagosUnicos: aI.pagosUnicos,
  },
  anexoV: { montos: aV.montos },
  anexoVI: { categorias: aVI.categorias },
  notaIgf: asignacionesFamiliares.notaIgf,
  vigenciaDesde: asignacionesFamiliares.vigenciaDesde,
  fechaConsulta: asignacionesFamiliares.fechaConsulta,
  zonasAnexoI: aI.zonas,
  zonasAnexoV: aV.zonas,
  categoriasMono: Object.keys(aVI.categorias) as CategoriaMono[],
};

const j = sellosAlquiler.jurisdicciones as {
  pba: {
    general: { alicuota: number };
    turismo: { alicuota: number; plazoMaximoMeses: number };
    viviendaUnica: { valuacionTope: number; hastaTope: { alicuota: number }; sobreTope: { alicuota: number } };
    agro: { alicuota: number };
  };
  cordoba: {
    urbano: { alicuota: number };
    rural: { alicuota: number };
    exencionUrbana: { promedioMensualMaximo: number };
  };
  caba: {
    viviendaPermanente: { alicuota: number; verificadoEnNorma: boolean };
    comercialTuristico: { alicuota: number; verificadoEnNorma: boolean };
  };
};

export const pCostoAlquilar: SellosAlquilerParams & {
  notaComision: string;
  fechaConsulta: string;
  cabaViviendaVerificada: boolean;
  cabaComercialVerificada: boolean;
} = {
  pba: {
    general: j.pba.general.alicuota,
    turismo: j.pba.turismo.alicuota,
    turismoPlazoMax: j.pba.turismo.plazoMaximoMeses,
    viviendaValuacionTope: j.pba.viviendaUnica.valuacionTope,
    viviendaHastaTope: j.pba.viviendaUnica.hastaTope.alicuota,
    viviendaSobreTope: j.pba.viviendaUnica.sobreTope.alicuota,
    agro: j.pba.agro.alicuota,
  },
  cordoba: {
    urbano: j.cordoba.urbano.alicuota,
    rural: j.cordoba.rural.alicuota,
    exencionPromedioMax: j.cordoba.exencionUrbana.promedioMensualMaximo,
  },
  caba: {
    vivienda: j.caba.viviendaPermanente.alicuota,
    comercialTuristico: j.caba.comercialTuristico.alicuota,
  },
  notaComision: sellosAlquiler.notaComision,
  fechaConsulta: sellosAlquiler.fechaConsulta,
  cabaViviendaVerificada: j.caba.viviendaPermanente.verificadoEnNorma,
  cabaComercialVerificada: j.caba.comercialTuristico.verificadoEnNorma,
};

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
