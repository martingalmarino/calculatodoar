export interface AutonomosCategoria {
  id: string;
  etiqueta: string;
  descripcion: string;
  importeMensual: number;
}

export interface AutonomosParams {
  categorias: AutonomosCategoria[];
  vigenciaDesde: string;
}

export type AutonomosResult =
  | {
      ok: true;
      categoria: AutonomosCategoria;
      aporte: number;
      vigenciaDesde: string;
    }
  | { ok: false; error: string };

/** Aporte mensual = importe fijo de la categoría en la tabla de ARCA. Sin prorrateo. */
export function calcularAutonomos(
  i: { categoria: string },
  p: AutonomosParams,
): AutonomosResult {
  const cat = p.categorias.find((c) => c.id === i.categoria);
  if (!cat) return { ok: false, error: "Elegí una categoría de la tabla." };
  return {
    ok: true,
    categoria: cat,
    aporte: cat.importeMensual,
    vigenciaDesde: p.vigenciaDesde,
  };
}
