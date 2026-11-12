// Ejemplos y avisos calculados con los parámetros vigentes (no hay montos escritos a mano).
import { calcularSueldoNeto } from "./calc/sueldoNeto";
import { calcularAguinaldo } from "./calc/aguinaldo";
import { calcularIndemnizacion } from "./calc/indemnizacion";
import { calcularGanancias } from "./calc/ganancias";
import { calcularMonotributo } from "./calc/monotributo";
import { calcularAlquiler } from "./calc/alquiler";
import { calcularCuotas } from "./calc/cuotas";
import { calcularDolar } from "./calc/dolar";
import { calcularPlazoFijo } from "./calc/plazoFijo";
import { calcularInflacion } from "./calc/inflacion";
import { calcularBilletera } from "./calc/billetera";
import { calcularPrestamoPersonal } from "./calc/prestamo";
import { compararGNC, costoViaje, litrosPor100DesdeKmL } from "./calc/combustible";
import { calcularVacaciones } from "./calc/vacaciones";
import { calcularHorasExtras } from "./calc/horasExtras";
import { calcularLiquidacionFinal } from "./calc/liquidacionFinal";
import { calcularCostoLaboral } from "./calc/costoLaboral";
import { pAguinaldo, pAlquiler, pBilletera, pCombustible, pCosto, pDolar, pGanancias, pHorasExtras, pIndem, pInflacion, pLiquidacion, pMono, pPlazoFijo, pPrestamo, pSueldo, pVacaciones } from "./params";
import { aguinaldo, anses, ansesActual, ganancias, monotributo, rangoICL, rangoIPC, tasas, ultimoIPC, PROCEDENCIA } from "./data";
import { fechaAR, pesos, pct } from "./format";
import type { CalcSlug } from "./content";

const s1 = calcularSueldoNeto({ bruto: 1_500_000, noRemunerativo: 0, cuotaSindical: 0 }, pSueldo);
const s2 = calcularSueldoNeto({ bruto: 6_000_000, noRemunerativo: 0, cuotaSindical: 0 }, pSueldo);
const a1 = calcularAguinaldo({ anio: 2026, semestre: 2, mejorRemuneracion: 1_500_000, ingreso: "2026-10-03" }, pAguinaldo);
const i1 = calcularIndemnizacion({ ingreso: "2022-01-15", egreso: "2026-10-20", mejorRemuneracion: 1_500_000, superoPrueba: true, huboPreaviso: false, topeConvenio: 0, vacacionesGozadas: 0 }, pIndem)!;
const g1 = calcularGanancias({ brutoMensual: 4_000_000, incluirSac: true, conyuge: false, hijos: 0, alquilerMensual: 0, alquilerReli: false, otrasDeducciones: 0 }, pGanancias);
const m1 = calcularMonotributo({ facturacionAnual: 20_000_000, actividad: "servicios", superficieM2: 0, energiaKw: 0, alquileresAnuales: 0, precioUnitarioMax: 0, aportaPorOtroLado: false }, pMono);
const alq = calcularAlquiler({ modo: "icl", alquilerInicial: 200_000, fechaInicio: "2023-12-01", fechaAjuste: "2024-12-01" }, pAlquiler);
const cuo = calcularCuotas({ precioContado: 1_080_000, cantidadCuotas: 6, valorCuota: 200_000, tasaMensual: 0.019, primeraCuotaHoy: false });
const cotOficial = pDolar.referencias.find((r) => r.clave === "oficialMinorista")!.valor;
const dol = calcularDolar({ montoUSD: 100, modo: "tarjeta", cotizacion: cotOficial }, { percepcionAlicuota: pDolar.percepcion.alicuota, ivaAlicuota: pDolar.ivaServiciosDigitales.alicuota });
const inflMensual = tasas.series.find((s) => s.clave === "inflacionMensual")!;
const d = ganancias.anual.deduccionesArt30;

export const EJEMPLOS: Partial<Record<CalcSlug, { aviso: string; ejemplo: string; procedencia: (keyof typeof PROCEDENCIA)[] }>> = {
  "sueldo-neto": {
    aviso: `Tope vigente: base imponible máxima de ${pesos(ansesActual.baseImponibleMaxima)} y mínima de ${pesos(ansesActual.baseImponibleMinima)} desde el período devengado ${ansesActual.periodoDevengado.split("-").reverse().join("/")} (${ansesActual.norma}). Solo hay topes cargados desde ese mes: no uses la calculadora para meses anteriores. ${anses.nota.split(".")[0]}.`,
    ejemplo: `Bruto ${pesos(s1.bruto)}: jubilación ${pesos(s1.jubilacion)} + PAMI ${pesos(s1.pami)} + obra social ${pesos(s1.obraSocial)}. Neto: ${pesos(s1.neto)}. Con un bruto de ${pesos(s2.bruto)}, los aportes se calculan sobre el tope y el neto es ${pesos(s2.neto)}, antes de Ganancias.`,
    procedencia: ["aportes", "anses"],
  },
  aguinaldo: {
    aviso: `Usamos los días reales del semestre: ${aguinaldo.diasDelSemestre["2026-S1"]} en el primero de 2026 (${aguinaldo.diasDelSemestre.bisiestoS1} en años bisiestos) y ${aguinaldo.diasDelSemestre["2026-S2"]} en el segundo. La ley no fija un divisor; algunas calculadoras usan 180. Vencimientos: ${aguinaldo.vencimientos.primeraCuota} y ${aguinaldo.vencimientos.segundaCuota} (art. 122, LCT).`,
    ejemplo: `Mejor sueldo del semestre ${pesos(1_500_000)}, ingreso el 3/10/2026: ${a1.diasTrabajados} días de ${a1.diasSemestre}. Aguinaldo bruto ${pesos(a1.bruto)}, neto ${pesos(a1.neto)}.`,
    procedencia: ["sac", "aportes", "anses"],
  },
  indemnizacion: {
    aviso: "Desde el 6/3/2026 rige la Ley 27.802: la base del art. 245 tiene un tope de 3 veces el salario promedio del convenio, sin bajar del 67% de tu mejor remuneración, y no hay preaviso en el período de prueba. El SAC proporcional usa los días reales del semestre.",
    ejemplo: `Ingreso 15/1/2022, despido sin preaviso el 20/10/2026, mejor sueldo ${pesos(1_500_000)}: ${i1.aniosComputados} sueldos de antigüedad (${pesos(i1.antiguedad)}), preaviso ${pesos(i1.preaviso)}, integración ${pesos(i1.integracion)}. Total con vacaciones y SAC: ${pesos(i1.total)}.`,
    procedencia: ["indemnizacion", "sac"],
  },
  ganancias: {
    aviso: `Valores de la liquidación anual 2026: ganancia no imponible ${pesos(d.gni)}, deducción especial para empleados ${pesos(d.deduccionEspecialAp2Empleados)}, cónyuge ${pesos(d.conyuge)} e hijo ${pesos(d.hijo)}.`,
    ejemplo: `Bruto ${pesos(4_000_000)} por mes, con aguinaldo: ganancia anual ${pesos(g1.brutoAnual)}, aportes ${pesos(g1.aportes)}, ganancia neta imponible ${pesos(g1.gni)}. Impuesto anual: ${pesos(g1.impuesto)}.`,
    procedencia: ["ganancias", "aportes", "anses"],
  },
  monotributo: {
    aviso: `Categorías vigentes desde el ${fechaAR(monotributo.vigenciaDesde)}. Precio unitario máximo para venta de cosas muebles: ${pesos(monotributo.precioUnitarioMaximoVentaMuebles)}.`,
    ejemplo: m1.excluido ? "" : `Servicios con ${pesos(20_000_000)} facturados en 12 meses: categoría ${m1.categoria.categoria}, cuota mensual ${pesos(m1.cuota)}.`,
    procedencia: ["monotributo"],
  },
  "actualizacion-alquiler": {
    aviso: `ICL del BCRA del ${fechaAR(rangoICL.primera)} al ${fechaAR(rangoICL.ultima)}. IPC nacional del ${rangoIPC.primera} al ${rangoIPC.ultima} (último publicado: ${ultimoIPC().periodo}). Sin interpolar: si falta el dato de un día o mes, no se calcula.`,
    ejemplo: alq.ok ? `Alquiler original ${pesos(200_000)}, inicio 1/12/2023 y ajuste 1/12/2024: coeficiente ${alq.coeficiente.toLocaleString("es-AR", { maximumFractionDigits: 4 })}, nuevo alquiler ${pesos(alq.nuevo)}.` : alq.error,
    procedencia: ["icl", "ipc", "alquileres"],
  },
  "cuotas-o-contado": {
    aviso: `La tasa se precarga con la inflación mensual del INDEC (${inflMensual.valor.toLocaleString("es-AR")} % al ${fechaAR(inflMensual.fecha)}), solo como referencia editable. ${tasas.aviso}`,
    ejemplo: cuo.ok ? `6 cuotas de ${pesos(200_000)} vs. contado ${pesos(1_080_000)} con 1,9 % mensual: valor de hoy de las cuotas ${pesos(cuo.vp)}. Conviene ${cuo.conviene}; diferencia ${pesos(cuo.diferencia)}.` : cuo.error,
    procedencia: ["tasas", "ipc"],
  },
  "dolar-tarjeta": {
    aviso: `Percepción del ${(pDolar.percepcion.alicuota * 100).toLocaleString("es-AR")} % (RG 5617). Impuesto PAIS: ${pDolar.impuestoPais.vigente ? "vigente" : `no rige desde el ${fechaAR(pDolar.impuestoPais.finVigencia)}`}. Cotización de referencia BCRA: ${pesos(cotOficial)} (${fechaAR(pDolar.referencias.find((r) => r.clave === "oficialMinorista")!.fecha)}).`,
    ejemplo: dol.ok ? `USD 100 con tarjeta a ${pesos(cotOficial)}: pesos ${pesos(dol.pesos)} + percepción ${pesos(dol.percepcion)} = ${pesos(dol.total)}.` : dol.error,
    procedencia: ["dolar"],
  },
  "plazo-fijo": {
    aviso: (() => {
      const dep = pPlazoFijo.tasaRefDepositos;
      const rem = pPlazoFijo.remInflacion12m;
      const remM = rem ? (1 + rem.valor / 100) ** (1 / 12) - 1 : 0;
      return `TNA de referencia: promedio de depósitos a 30 días del BCRA${dep ? ` (${dep.valor.toLocaleString("es-AR")} % al ${fechaAR(dep.fecha)})` : ""}; tu banco puede pagar otra. Inflación esperada precargada con el REM a 12 meses${rem ? ` (${rem.valor.toLocaleString("es-AR")} % al ${fechaAR(rem.fecha)} → ${(remM * 100).toLocaleString("es-AR", { maximumFractionDigits: 3 })} % mensual)` : ""}. Seguro de depósitos: hasta ${pesos(pPlazoFijo.seguroDepositos.montoMaximo)} por persona y entidad (${pPlazoFijo.seguroDepositos.norma}).`;
    })(),
    ejemplo: (() => {
      const t = calcularPlazoFijo({ capital: 1_000_000, tna: 0.2118, dias: 30 }, pPlazoFijo);
      return t.ok ? `$1.000.000 a TNA 21,18 % por 30 días: interés ${pesos(t.interes)}, total ${pesos(t.total)}, TEA ${pct(t.tea)}.` : t.error;
    })(),
    procedencia: ["plazoFijo", "uva", "tasas"],
  },
  inflacion: {
    aviso: `IPC nacional del INDEC (${rangoIPC.primera} a ${rangoIPC.ultima}; último publicado: ${ultimoIPC().periodo}). Base diciembre 2016 = 100. Próxima publicación prevista: ${fechaAR(pInflacion.proximaPublicacion.fecha)} (${pInflacion.proximaPublicacion.periodo}).`,
    ejemplo: (() => {
      const r = calcularInflacion({ monto: 100_000, mesOrigen: "2020-01", mesDestino: "2026-09" }, pInflacion);
      return r.ok ? `$100.000 de ene 2020 equivalen a ${pesos(r.montoActualizado)} en sep 2026 (inflación acumulada ${pct(r.inflacionAcumulada)}).` : r.error;
    })(),
    procedencia: ["ipc"],
  },
  "rendimiento-billeteras": {
    aviso: `La TNA la cargás vos: está en tu app y cambia seguido. ${pBilletera.avisoTasas} Seguro de depósitos: hasta ${pesos(pBilletera.seguroDepositos.montoMaximo)} en cuentas bancarias; no cubre billeteras ni FCI (${pBilletera.seguroDepositos.norma}).`,
    ejemplo: (() => {
      const r = calcularBilletera({ saldo: 1_000_000, tna: 0.2, dias: 30 });
      return r.ok ? `Ejemplo con TNA de prueba 20 % (no es de ninguna marca): $1.000.000 a 30 días → interés ${pesos(r.interes)}, saldo final ${pesos(r.final)}, TEA ${pct(r.tea)}.` : r.error;
    })(),
    procedencia: ["plazoFijo", "tasas"],
  },
  prestamos: {
    aviso: (() => {
      const ref = pPrestamo.tasaRefPersonales;
      return `TNA de préstamos personales: promedio orientativo BCRA${ref ? ` (${ref.valor.toLocaleString("es-AR")} % al ${fechaAR(ref.fecha)})` : ""}; no es la tasa de un banco puntual. IVA ${((pPrestamo.ivaAlicuota) * 100).toLocaleString("es-AR")} % sobre intereses de préstamos personales; vivienda exenta.`;
    })(),
    ejemplo: (() => {
      const r = calcularPrestamoPersonal({ capital: 1_000_000, tna: 0.6, cuotas: 12, sumarIVA: true }, pPrestamo);
      return r.ok ? `$1.000.000 a TNA 60 % en 12 cuotas: cuota pura ${pesos(r.cuotaPura)}, cuota 1 con IVA ${pesos(r.filas[0]!.cuotaConIva!)}, total a pagar ${pesos(r.total)}.` : r.error;
    })(),
    procedencia: ["prestamos", "uva", "tasas"],
  },
  combustible: {
    aviso: `${pCombustible.unidades.nafta} ${pCombustible.detalle} Consultá: ${pCombustible.dondeConsultar.map((d) => d.nombre).join("; ")}.`,
    ejemplo: (() => {
      const v = costoViaje({ km: 700, consumoL100km: 8, precioLitro: 1500 });
      const g = compararGNC({ km: 700, consumoNafta: 8, precioNafta: 1500, consumoGNCm3100km: 7, precioM3: 800, costoEquipo: 1_500_000 });
      const conv = litrosPor100DesdeKmL(12.5);
      return v.ok && g.ok
        ? `Ejemplo con precios de prueba (no reales): 700 km a 8 l/100 km → ${v.litros.toLocaleString("es-AR")} l y ${pesos(v.costo)}. Con GNC el ahorro es ${pesos(g.ahorro)}; el equipo se recupera en ${g.kmRecupero?.toLocaleString("es-AR")} km. 12,5 km/l = ${conv?.toLocaleString("es-AR")} l/100 km.`
        : "Cargá km, consumo y precio.";
    })(),
    procedencia: ["combustible"],
  },
  vacaciones: {
    aviso: `${pVacaciones.norma}. Divisor art. 155: ${pVacaciones.divisor}. Goce art. 154: ${pVacaciones.goceArt154}.`,
    ejemplo: (() => {
      const r = calcularVacaciones({ fechaIngreso: "2019-06-01", anio: 2026, sueldoMensual: 1_500_000 }, pVacaciones);
      return r.ok
        ? `Ingreso 1/6/2019, vacaciones 2026: ${r.dias} días × ${pesos(r.valorDia)} = ${pesos(r.totalBruto)} brutos (plus ${pesos(r.plus)}, neto ${pesos(r.neto)}).`
        : r.error;
    })(),
    procedencia: ["vacaciones"],
  },
  "horas-extras": {
    aviso: `${pHorasExtras.normaRecargos}. Límites: ${pHorasExtras.limites.mensual} h/mes y ${pHorasExtras.limites.anual} h/año (${pHorasExtras.limites.norma}). ${pHorasExtras.valorHoraNota}`,
    ejemplo: (() => {
      const r = calcularHorasExtras({ sueldoMensual: 1_500_000, horasMensualesNormales: 200, horas50: 10, horas100: 4 }, pHorasExtras);
      return r.ok
        ? `Sueldo ${pesos(1_500_000)} / 200 h = ${pesos(r.valorHora)} la hora. 10 h al 50%: ${pesos(r.extra50)}; 4 h al 100%: ${pesos(r.extra100)}; total ${pesos(r.total)}.`
        : r.error;
    })(),
    procedencia: ["horasExtras"],
  },
  "liquidacion-final": {
    aviso: `Motivos según LCT y Ley 27.802. ${pLiquidacion.sacSobreVacaciones} Los rubros de indemnización salen del mismo motor que /laboral/indemnizacion/.`,
    ejemplo: (() => {
      const base = { ingreso: "2022-03-01", egreso: "2026-11-15", mejorRemuneracion: 1_500_000, vacacionesGozadas: 0, topeConvenio: 0, huboPreaviso: false };
      const r = calcularLiquidacionFinal({ ...base, motivo: "renuncia" }, pLiquidacion);
      return r.ok
        ? `Renuncia el 15/11/2026 con ingreso 1/3/2022 y sueldo ${pesos(1_500_000)}: días ${pesos(r.indem.diasMes)} + vacaciones ${pesos(r.indem.vacaciones)} + SAC ${pesos(r.indem.sacProporcional)} = ${pesos(r.total)}.`
        : r.error;
    })(),
    procedencia: ["liquidacion", "indemnizacion", "sac"],
  },
  "costo-laboral": {
    aviso: `${pCosto.seguridadSocial.norma}. Detracción general ${pesos(pCosto.detracciones.general)}. SCVO ${pesos(pCosto.seguroVidaObligatorio.valor)} desde ${fechaAR(pCosto.seguroVidaObligatorio.vigenciaDesde)}. ${pCosto.seguridadSocial.tope}`,
    ejemplo: (() => {
      const r = calcularCostoLaboral({
        bruto: 1_500_000, tipoEmpleador: "B", mipyme: true, rifl: false, detraccion: "general",
        empleadosNomina: 1, periodo: "2026-11",
      }, pCosto);
      return r.ok
        ? `Bruto ${pesos(1_500_000)}, tipo B: SS ${pesos(r.ssBruta)}, OS ${pesos(r.obraSocial)}, SCVO ${pesos(r.scvo)} → costo mensual ${pesos(r.costoMensual)} (${pct(r.pctSobreBruto)} sobre el bruto).`
        : r.error;
    })(),
    procedencia: ["contribuciones", "aportes", "anses"],
  },
};
