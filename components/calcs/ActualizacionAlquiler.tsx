"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularAlquiler, type AlquilerModo } from "@/lib/calc/alquiler";
import { ipc, rangoICL, rangoIPC, ultimoIPC } from "@/lib/data";
import { pAlquiler } from "@/lib/params";
import { fechaAR, parsePesos, pct, pesos, pesos0 } from "@/lib/format";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const labelMes = (p: string) => { const [y, m] = p.split("-"); return `${MESES[Number(m) - 1]} ${y}`; };
const periodosIPC = ipc.serie.map(([p]) => p);

export default function ActualizacionAlquiler() {
  const [modo, setModo] = useState<AlquilerModo>("icl");
  const [alquiler, setAlquiler] = useState("200.000");
  const [fechaInicio, setFechaInicio] = useState("2023-12-01");
  const [fechaAjuste, setFechaAjuste] = useState("2024-12-01");
  const [mesBase, setMesBase] = useState("2025-12");
  const [mesFinal, setMesFinal] = useState(ultimoIPC().periodo);
  const [porcentaje, setPorcentaje] = useState("5");
  const [periodos, setPeriodos] = useState("2");
  const [coef, setCoef] = useState("1,1");

  const r = (() => {
    const base = parsePesos(alquiler);
    if (modo === "icl") return calcularAlquiler({ modo, alquilerInicial: base, fechaInicio, fechaAjuste }, pAlquiler);
    if (modo === "ipc") return calcularAlquiler({ modo, alquilerActual: base, mesBase, mesFinal }, pAlquiler);
    if (modo === "acuerdo") return calcularAlquiler({ modo, alquilerActual: base, porcentaje: parsePesos(porcentaje) / 100, periodos: Number(periodos) || 0 }, pAlquiler);
    return calcularAlquiler({ modo: "otro", alquilerActual: base, coeficiente: parsePesos(coef) }, pAlquiler);
  })();

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del alquiler" onSubmit={(e) => e.preventDefault()}>
        <Seg name="modo" legend="Cómo se ajusta tu contrato" value={modo} onChange={setModo} opciones={[
          { v: "icl", label: "ICL" },
          { v: "ipc", label: "IPC" },
          { v: "acuerdo", label: "Acuerdo %" },
          { v: "otro", label: "Otro índice" },
        ]} />
        <p className="ayuda" style={{ marginTop: 0 }}>
          {pAlquiler.regimenes.map((reg) => `${reg.nombre} (${fechaAR(reg.desde)}${reg.hasta ? `–${fechaAR(reg.hasta)}` : " en adelante"}): ${reg.ajuste}.`).join(" ")}
        </p>
        <MoneyInput id="alq" label={modo === "icl" ? "Alquiler original del contrato" : "Alquiler actual"} ayuda={modo === "icl" ? "Si el contrato es anual y ya tuvo ajustes, cargá el alquiler ORIGINAL y la fecha de inicio: el ICL acumula los aumentos." : undefined} value={alquiler} onChange={setAlquiler} />
        {modo === "icl" && (
          <>
            <Campo id="fi" label="Fecha de inicio del contrato (o del período)" ayuda={`Serie ICL disponible: ${fechaAR(rangoICL.primera)} a ${fechaAR(rangoICL.ultima)}.`}>
              <input id="fi" type="date" min={rangoICL.primera} max={rangoICL.ultima} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </Campo>
            <Campo id="fa" label="Fecha de ajuste">
              <input id="fa" type="date" min={rangoICL.primera} max={rangoICL.ultima} value={fechaAjuste} onChange={(e) => setFechaAjuste(e.target.value)} />
            </Campo>
          </>
        )}
        {modo === "ipc" && (
          <>
            <Campo id="mb" label="Mes base (IPC)" ayuda={`${pAlquiler.convencionIPC} Qué meses se toman lo dice tu contrato. Disponible: ${rangoIPC.primera} a ${rangoIPC.ultima}.`}>
              <select id="mb" value={mesBase} onChange={(e) => setMesBase(e.target.value)}>
                {periodosIPC.map((p) => <option key={p} value={p}>{labelMes(p)}</option>)}
              </select>
            </Campo>
            <Campo id="mf" label="Mes final (IPC)" ayuda="Por defecto, el último IPC publicado.">
              <select id="mf" value={mesFinal} onChange={(e) => setMesFinal(e.target.value)}>
                {periodosIPC.map((p) => <option key={p} value={p}>{labelMes(p)}</option>)}
              </select>
            </Campo>
          </>
        )}
        {modo === "acuerdo" && (
          <>
            <Campo id="pct" label="Aumento por período (%)" ayuda="El porcentaje que pactaron por cada período de ajuste.">
              <input id="pct" inputMode="decimal" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Campo id="n" label="Cantidad de períodos">
              <input id="n" inputMode="numeric" value={periodos} onChange={(e) => setPeriodos(e.target.value.replace(/\D/g, ""))} />
            </Campo>
          </>
        )}
        {modo === "otro" && (
          <Campo id="coef" label="Coeficiente de ajuste" ayuda="Para Casa Propia u otro índice privado: si el índice pasó de 1 a 1,1, cargá 1,1.">
            <input id="coef" inputMode="decimal" value={coef} onChange={(e) => setCoef(e.target.value.replace(/[^\d,]/g, ""))} />
          </Campo>
        )}
      </form>
      {r.ok ? (
        <Resultado titulo="Alquiler actualizado" grande={pesos0(r.nuevo)}
          lineas={[
            { label: "Alquiler de partida", valor: pesos(r.base) },
            { label: "Coeficiente", valor: r.coeficiente.toLocaleString("es-AR", { maximumFractionDigits: 6 }) },
            ...r.indices.map((x) => ({ label: `${x.etiqueta} (${x.fecha})`, valor: x.fecha === "manual" || x.etiqueta.startsWith("Aumento") ? (x.etiqueta.startsWith("Aumento") ? pct(x.valor) : x.valor.toLocaleString("es-AR", { maximumFractionDigits: 6 })) : x.valor.toLocaleString("es-AR", { maximumFractionDigits: 4 }) })),
            { label: "Aumento", valor: `${pesos(r.aumento)} (${pct(r.aumentoPct)})` },
            { label: "Nuevo alquiler", valor: pesos(r.nuevo), total: true },
          ]}
          nota={modo === "ipc" ? "Qué meses de IPC se toman lo dice tu contrato." : modo === "icl" ? "El ICL se sigue publicando (Com. B 13249/2026)." : undefined} />
      ) : (
        <section className="resultado" aria-labelledby="rt">
          <h2 id="rt" className="rot" style={{ fontFamily: "var(--fuente)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
          <output className="grande" aria-live="polite" data-testid="resultado">Sin dato</output>
          <p className="nota">{r.error}</p>
        </section>
      )}
    </div>
  );
}
