import type { MonotributoCategoria } from "../data/schema";

export interface MonotributoInput {
  facturacionAnual: number;
  actividad: "servicios" | "venta";
  superficieM2: number;
  energiaKw: number;
  alquileresAnuales: number;
  precioUnitarioMax: number;
  /** Ya aporta a jubilación y obra social por relación de dependencia u otro régimen */
  aportaPorOtroLado: boolean;
}
export interface MonotributoParams { categorias: MonotributoCategoria[]; precioUnitarioMaximo: number }

export function calcularMonotributo(i: MonotributoInput, p: MonotributoParams) {
  if (i.actividad === "venta" && i.precioUnitarioMax > p.precioUnitarioMaximo) return { excluido: true as const, motivo: "precio" as const };
  const cat = p.categorias.find((c) =>
    Math.max(0, i.facturacionAnual) <= c.ingresosBrutosAnuales &&
    Math.max(0, i.superficieM2) <= c.superficieM2 &&
    Math.max(0, i.energiaKw) <= c.energiaKwAnual &&
    Math.max(0, i.alquileresAnuales) <= c.alquileresAnuales);
  if (!cat) return { excluido: true as const, motivo: "parametros" as const };
  const impuesto = i.actividad === "servicios" ? cat.impuestoIntegrado.servicios : cat.impuestoIntegrado.ventaCosasMuebles;
  const sipa = i.aportaPorOtroLado ? 0 : cat.aporteSIPA;
  const obraSocial = i.aportaPorOtroLado ? 0 : cat.aporteObraSocial;
  return { excluido: false as const, categoria: cat, impuesto, sipa, obraSocial, cuota: impuesto + sipa + obraSocial };
}
