export type RegimenAsignaciones = "aaff" | "auh" | "monotributo";
export type ZonaAaff = "general" | "zona1" | "zona2" | "zona3" | "zona4";
export type ZonaAuh = "general" | "zona1";
export type CategoriaMono = "A" | "B" | "C" | "D-G" | "H-K";

export interface TramoZonas {
  desde?: number;
  hasta: number | null;
  general: number;
  zona1: number;
  zona2: number;
  zona3: number;
  zona4: number;
}

export interface AsignacionesParams {
  topeIgf: number;
  topePorIntegrante: number;
  auhCobro: number;
  auhRetenido: number;
  anexoI: {
    prenatalHijo: { tramos: TramoZonas[] };
    hijoDiscapacidad: { tramos: TramoZonas[] };
    ayudaEscolar: {
      conTope: { hasta: number } & Record<ZonaAaff, number>;
      sinTopeDiscapacidad: Record<ZonaAaff, number>;
    };
    pagosUnicos: {
      topeIgf: number;
      nacimiento: number;
      matrimonio: number;
      adopcion: number;
    };
  };
  anexoV: {
    montos: Record<ZonaAuh, {
      embarazo: number;
      hijo: number;
      hijoDiscapacidad: number;
      ayudaEscolar: number;
      nacimiento: number;
      adopcion: number;
    }>;
  };
  anexoVI: {
    categorias: Record<CategoriaMono, {
      prenatalHijo: number | null;
      hijoDiscapacidad: number;
      ayudaEscolar: number | null;
      ayudaEscolarDiscapacidad: number;
    }>;
  };
}

export interface AsignacionesInput {
  regimen: RegimenAsignaciones;
  zona: ZonaAaff;
  igf: number;
  hijos: number;
  hijosDiscapacidad: number;
  prenatal: boolean;
  ayudaEscolar: boolean;
  nacimiento: boolean;
  matrimonio: boolean;
  adopcion: boolean;
  integranteSuperaTope: boolean;
  categoriaMono?: CategoriaMono;
}

export interface LineaAsignacion {
  concepto: string;
  monto: number;
  detalle?: string;
}

export type AsignacionesResult =
  | {
      ok: true;
      regimen: RegimenAsignaciones;
      totalMensual: number;
      lineasMensuales: LineaAsignacion[];
      lineasAnuales: LineaAsignacion[];
      lineasUnicas: LineaAsignacion[];
      auh?: { total: number; cobroMensual: number; retenido: number };
      mensajes: string[];
      zonaEfectiva: string;
    }
  | { ok: false; error: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

function montoTramo(tramos: TramoZonas[], igf: number, zona: ZonaAaff): number | null {
  for (const t of tramos) {
    const desde = t.desde ?? 0;
    const hasta = t.hasta;
    if (igf + 1e-9 < desde) continue;
    if (hasta == null || igf <= hasta + 1e-9) return t[zona];
  }
  return null;
}

export function calcularAsignaciones(i: AsignacionesInput, p: AsignacionesParams): AsignacionesResult {
  const hijos = Math.max(0, Math.floor(i.hijos));
  const disc = Math.max(0, Math.floor(i.hijosDiscapacidad));
  const igf = Math.max(0, i.igf);
  const mensajes: string[] = [];

  if (i.regimen === "aaff") return calcAaff(i, p, hijos, disc, igf, mensajes);
  if (i.regimen === "auh") return calcAuh(i, p, hijos, disc, mensajes);
  return calcMono(i, p, hijos, disc, mensajes);
}

function calcAaff(
  i: AsignacionesInput,
  p: AsignacionesParams,
  hijos: number,
  disc: number,
  igf: number,
  mensajes: string[],
): AsignacionesResult {
  const zona = i.zona;
  const lineasMensuales: LineaAsignacion[] = [];
  const lineasAnuales: LineaAsignacion[] = [];
  const lineasUnicas: LineaAsignacion[] = [];
  const excluidoPorIntegrante = i.integranteSuperaTope;
  const excluidoPorIgf = igf > p.topeIgf;

  if (excluidoPorIntegrante) {
    mensajes.push(`No corresponde (salvo hijo con discapacidad): algún integrante supera $${p.topePorIntegrante.toLocaleString("es-AR")} (Res. 303/2026 art. 4°).`);
  }
  if (excluidoPorIgf) {
    mensajes.push(`No corresponde: el IGF supera el tope de $${p.topeIgf.toLocaleString("es-AR")}.`);
  }

  // Hijo / prenatal: excluidos por IGF tope o por integrante
  if (!excluidoPorIntegrante && !excluidoPorIgf) {
    const unit = montoTramo(p.anexoI.prenatalHijo.tramos, igf, zona);
    if (unit != null && hijos > 0) {
      lineasMensuales.push({ concepto: `Hijo (${hijos})`, monto: round2(unit * hijos) });
    }
    if (unit != null && i.prenatal) {
      lineasMensuales.push({ concepto: "Prenatal", monto: unit });
    }
    if (unit == null && (hijos > 0 || i.prenatal)) {
      mensajes.push("No hay tramo de hijo/prenatal para ese IGF.");
    }
  }

  // Discapacidad: no aplica tope por integrante; tercer tramo sin techo de IGF
  if (disc > 0) {
    const unitD = montoTramo(p.anexoI.hijoDiscapacidad.tramos, igf, zona);
    if (unitD != null) {
      lineasMensuales.push({
        concepto: `Hijo con discapacidad (${disc})`,
        monto: round2(unitD * disc),
        detalle: excluidoPorIntegrante ? "No se aplica el tope por integrante a esta prestación." : undefined,
      });
    } else {
      mensajes.push("No hay tramo de hijo con discapacidad para ese IGF.");
    }
  }

  if (i.ayudaEscolar) {
    if (disc > 0) {
      const m = p.anexoI.ayudaEscolar.sinTopeDiscapacidad[zona];
      lineasAnuales.push({
        concepto: `Ayuda escolar anual (hijo con discapacidad × ${disc})`,
        monto: round2(m * disc),
      });
    }
    if (hijos > 0) {
      if (!excluidoPorIntegrante && igf <= p.anexoI.ayudaEscolar.conTope.hasta) {
        const m = p.anexoI.ayudaEscolar.conTope[zona];
        lineasAnuales.push({
          concepto: `Ayuda escolar anual (× ${hijos})`,
          monto: round2(m * hijos),
        });
      } else if (excluidoPorIntegrante || igf > p.anexoI.ayudaEscolar.conTope.hasta) {
        mensajes.push("Ayuda escolar general: no corresponde por tope de IGF o por integrante.");
      }
    }
  }

  const pu = p.anexoI.pagosUnicos;
  if (!excluidoPorIntegrante && igf <= pu.topeIgf) {
    if (i.nacimiento) lineasUnicas.push({ concepto: "Nacimiento", monto: pu.nacimiento });
    if (i.matrimonio) lineasUnicas.push({ concepto: "Matrimonio", monto: pu.matrimonio });
    if (i.adopcion) lineasUnicas.push({ concepto: "Adopción", monto: pu.adopcion });
  } else if ((i.nacimiento || i.matrimonio || i.adopcion) && (excluidoPorIntegrante || igf > pu.topeIgf)) {
    mensajes.push("Pagos únicos: no corresponden por tope de IGF o por integrante.");
  }

  const totalMensual = round2(lineasMensuales.reduce((s, l) => s + l.monto, 0));
  return {
    ok: true,
    regimen: "aaff",
    totalMensual,
    lineasMensuales,
    lineasAnuales,
    lineasUnicas,
    mensajes,
    zonaEfectiva: zona,
  };
}

function calcAuh(
  i: AsignacionesInput,
  p: AsignacionesParams,
  hijos: number,
  disc: number,
  mensajes: string[],
): AsignacionesResult {
  let zona: ZonaAuh = i.zona === "zona1" ? "zona1" : "general";
  if (i.zona === "zona2" || i.zona === "zona3" || i.zona === "zona4") {
    zona = "general";
    mensajes.push("En AUH el Anexo V solo distingue Valor general y Zona 1: se usó Valor general.");
  }
  const m = p.anexoV.montos[zona];
  const lineasMensuales: LineaAsignacion[] = [];
  const lineasAnuales: LineaAsignacion[] = [];
  const lineasUnicas: LineaAsignacion[] = [];

  let auhBruto = 0;
  if (hijos > 0) {
    const t = round2(m.hijo * hijos);
    auhBruto += t;
    lineasMensuales.push({ concepto: `AUH hijo (${hijos})`, monto: t });
  }
  if (disc > 0) {
    const t = round2(m.hijoDiscapacidad * disc);
    auhBruto += t;
    lineasMensuales.push({ concepto: `AUH hijo con discapacidad (${disc})`, monto: t });
  }
  if (i.prenatal) {
    auhBruto = round2(auhBruto + m.embarazo);
    lineasMensuales.push({ concepto: "AUE (embarazo)", monto: m.embarazo });
  }

  const cobroMensual = round2(auhBruto * p.auhCobro);
  const retenido = round2(auhBruto * p.auhRetenido);

  if (i.ayudaEscolar) {
    const n = hijos + disc;
    if (n > 0) {
      lineasAnuales.push({
        concepto: `Ayuda escolar anual (× ${n})`,
        monto: round2(m.ayudaEscolar * n),
      });
    }
  }
  if (i.nacimiento) lineasUnicas.push({ concepto: "Nacimiento", monto: m.nacimiento });
  if (i.adopcion) lineasUnicas.push({ concepto: "Adopción", monto: m.adopcion });
  if (i.matrimonio) mensajes.push("El Anexo V no publica matrimonio: no se suma ese pago único.");

  return {
    ok: true,
    regimen: "auh",
    totalMensual: auhBruto,
    lineasMensuales,
    lineasAnuales,
    lineasUnicas,
    auh: { total: auhBruto, cobroMensual, retenido },
    mensajes,
    zonaEfectiva: zona,
  };
}

function calcMono(
  i: AsignacionesInput,
  p: AsignacionesParams,
  hijos: number,
  disc: number,
  mensajes: string[],
): AsignacionesResult {
  const cat = i.categoriaMono ?? "A";
  const fila = p.anexoVI.categorias[cat];
  if (!fila) return { ok: false, error: "Elegí una categoría de monotributo." };

  const lineasMensuales: LineaAsignacion[] = [];
  const lineasAnuales: LineaAsignacion[] = [];
  const lineasUnicas: LineaAsignacion[] = [];
  const excluidoPorIntegrante = i.integranteSuperaTope;

  if (excluidoPorIntegrante) {
    mensajes.push(`No corresponde (salvo hijo con discapacidad): algún integrante supera el tope del art. 4°.`);
  }

  if (!excluidoPorIntegrante) {
    if (fila.prenatalHijo != null) {
      if (hijos > 0) {
        lineasMensuales.push({ concepto: `Hijo (${hijos})`, monto: round2(fila.prenatalHijo * hijos) });
      }
      if (i.prenatal) {
        lineasMensuales.push({ concepto: "Prenatal", monto: fila.prenatalHijo });
      }
    } else if (hijos > 0 || i.prenatal) {
      mensajes.push(`Categoría ${cat}: no corresponde asignación por hijo ni prenatal.`);
    }
  }

  if (disc > 0) {
    lineasMensuales.push({
      concepto: `Hijo con discapacidad (${disc})`,
      monto: round2(fila.hijoDiscapacidad * disc),
    });
  }

  if (i.ayudaEscolar) {
    if (disc > 0) {
      lineasAnuales.push({
        concepto: `Ayuda escolar anual (discapacidad × ${disc})`,
        monto: round2(fila.ayudaEscolarDiscapacidad * disc),
      });
    }
    if (hijos > 0) {
      if (!excluidoPorIntegrante && fila.ayudaEscolar != null) {
        lineasAnuales.push({
          concepto: `Ayuda escolar anual (× ${hijos})`,
          monto: round2(fila.ayudaEscolar * hijos),
        });
      } else if (fila.ayudaEscolar == null) {
        mensajes.push(`Categoría ${cat}: no corresponde ayuda escolar general.`);
      }
    }
  }

  if (i.nacimiento || i.matrimonio || i.adopcion) {
    mensajes.push("El Anexo VI no publica pagos únicos de nacimiento, matrimonio o adopción.");
  }

  return {
    ok: true,
    regimen: "monotributo",
    totalMensual: round2(lineasMensuales.reduce((s, l) => s + l.monto, 0)),
    lineasMensuales,
    lineasAnuales,
    lineasUnicas,
    mensajes,
    zonaEfectiva: "sin-zona",
  };
}
