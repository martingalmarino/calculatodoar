export type AlquilerModo = "icl" | "ipc" | "acuerdo" | "otro";

export type AlquilerInput =
  | { modo: "icl"; alquilerInicial: number; fechaInicio: string; fechaAjuste: string }
  | { modo: "ipc"; alquilerActual: number; mesBase: string; mesFinal: string }
  | { modo: "acuerdo"; alquilerActual: number; porcentaje: number; periodos: number }
  | { modo: "otro"; alquilerActual: number; coeficiente: number };

export interface AlquilerParams {
  iclEn: (fechaISO: string) => number | null;
  ipcEn: (periodo: string) => number | null;
}

export type AlquilerOk = {
  ok: true;
  base: number;
  nuevo: number;
  aumento: number;
  aumentoPct: number;
  coeficiente: number;
  indices: { etiqueta: string; fecha: string; valor: number }[];
};
export type AlquilerErr = { ok: false; error: string };
export type AlquilerResult = AlquilerOk | AlquilerErr;

const SIN_DATO = "Todavía no hay dato publicado para esa fecha";

function ok(base: number, coeficiente: number, indices: AlquilerOk["indices"]): AlquilerOk {
  const nuevo = base * coeficiente;
  const aumento = nuevo - base;
  return { ok: true, base, nuevo, aumento, aumentoPct: base ? aumento / base : 0, coeficiente, indices };
}

export function calcularAlquiler(i: AlquilerInput, p: AlquilerParams): AlquilerResult {
  if (i.modo === "icl") {
    const base = Math.max(0, i.alquilerInicial);
    const i0 = p.iclEn(i.fechaInicio);
    const i1 = p.iclEn(i.fechaAjuste);
    if (i0 == null) return { ok: false, error: `${SIN_DATO} (ICL ${i.fechaInicio}).` };
    if (i1 == null) return { ok: false, error: `${SIN_DATO} (ICL ${i.fechaAjuste}).` };
    if (i0 === 0) return { ok: false, error: "El ICL de la fecha de inicio es 0: no se puede calcular." };
    return ok(base, i1 / i0, [
      { etiqueta: "ICL inicio", fecha: i.fechaInicio, valor: i0 },
      { etiqueta: "ICL ajuste", fecha: i.fechaAjuste, valor: i1 },
    ]);
  }
  if (i.modo === "ipc") {
    const base = Math.max(0, i.alquilerActual);
    const a = p.ipcEn(i.mesBase);
    const b = p.ipcEn(i.mesFinal);
    if (a == null) return { ok: false, error: `${SIN_DATO} (IPC ${i.mesBase}).` };
    if (b == null) return { ok: false, error: `${SIN_DATO} (IPC ${i.mesFinal}).` };
    if (a === 0) return { ok: false, error: "El IPC del mes base es 0: no se puede calcular." };
    return ok(base, b / a, [
      { etiqueta: "IPC base", fecha: i.mesBase, valor: a },
      { etiqueta: "IPC final", fecha: i.mesFinal, valor: b },
    ]);
  }
  if (i.modo === "acuerdo") {
    const base = Math.max(0, i.alquilerActual);
    const n = Math.max(0, Math.floor(i.periodos));
    const r = Math.max(0, i.porcentaje);
    const coeficiente = (1 + r) ** n;
    return ok(base, coeficiente, [
      { etiqueta: "Aumento por período", fecha: `${n} períodos`, valor: r },
    ]);
  }
  const base = Math.max(0, i.alquilerActual);
  const coeficiente = Math.max(0, i.coeficiente);
  return ok(base, coeficiente, [
    { etiqueta: "Coeficiente ingresado", fecha: "manual", valor: coeficiente },
  ]);
}
