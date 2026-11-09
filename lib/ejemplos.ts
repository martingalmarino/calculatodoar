// Ejemplos y avisos calculados con los parámetros vigentes (no hay montos escritos a mano).
import { calcularSueldoNeto } from "./calc/sueldoNeto";
import { calcularAguinaldo } from "./calc/aguinaldo";
import { calcularIndemnizacion } from "./calc/indemnizacion";
import { calcularGanancias } from "./calc/ganancias";
import { calcularMonotributo } from "./calc/monotributo";
import { pAguinaldo, pGanancias, pIndem, pMono, pSueldo } from "./params";
import { aguinaldo, anses, ansesActual, ganancias, monotributo, PROCEDENCIA } from "./data";
import { fechaAR, pesos } from "./format";
import type { CalcSlug } from "./content";

const s1 = calcularSueldoNeto({ bruto: 1_500_000, noRemunerativo: 0, cuotaSindical: 0 }, pSueldo);
const s2 = calcularSueldoNeto({ bruto: 6_000_000, noRemunerativo: 0, cuotaSindical: 0 }, pSueldo);
const a1 = calcularAguinaldo({ anio: 2026, semestre: 2, mejorRemuneracion: 1_500_000, ingreso: "2026-10-03" }, pAguinaldo);
const i1 = calcularIndemnizacion({ ingreso: "2022-01-15", egreso: "2026-10-20", mejorRemuneracion: 1_500_000, superoPrueba: true, huboPreaviso: false, topeConvenio: 0, vacacionesGozadas: 0 }, pIndem)!;
const g1 = calcularGanancias({ brutoMensual: 4_000_000, incluirSac: true, conyuge: false, hijos: 0, alquilerMensual: 0, alquilerReli: false, otrasDeducciones: 0 }, pGanancias);
const m1 = calcularMonotributo({ facturacionAnual: 20_000_000, actividad: "servicios", superficieM2: 0, energiaKw: 0, alquileresAnuales: 0, precioUnitarioMax: 0, aportaPorOtroLado: false }, pMono);
const d = ganancias.anual.deduccionesArt30;

export const EJEMPLOS: Record<CalcSlug, { aviso: string; ejemplo: string; procedencia: (keyof typeof PROCEDENCIA)[] }> = {
  "sueldo-neto": {
    aviso: `Tope vigente: base imponible máxima de ${pesos(ansesActual.baseImponibleMaxima)} y mínima de ${pesos(ansesActual.baseImponibleMinima)} desde el período devengado ${ansesActual.periodoDevengado.split("-").reverse().join("/")} (${ansesActual.norma}). Solo hay topes cargados desde ese mes: no uses la calculadora para meses anteriores. ${anses.nota.split(".")[0]}.`,
    ejemplo: `Bruto ${pesos(s1.bruto)}: jubilación ${pesos(s1.jubilacion)} + PAMI ${pesos(s1.pami)} + obra social ${pesos(s1.obraSocial)}. Neto: ${pesos(s1.neto)}. Con un bruto de ${pesos(s2.bruto)}, los aportes se calculan sobre el tope y el neto es ${pesos(s2.neto)}, antes de Ganancias.`,
    procedencia: ["aportes", "anses"],
  },
  aguinaldo: {
    aviso: `Usamos los días reales del semestre: ${aguinaldo.diasDelSemestre["2026-S1"]} en el primero de 2026 (${aguinaldo.diasDelSemestre.bisiestoS1} en años bisiestos) y ${aguinaldo.diasDelSemestre["2026-S2"]} en el segundo. La ley no fija un divisor; algunas calculadoras usan 180. Vencimientos: ${aguinaldo.vencimientos.primeraCuota} y ${aguinaldo.vencimientos.segundaCuota}, con tolerancia de ${aguinaldo.vencimientos.tolerancia}.`,
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
};
