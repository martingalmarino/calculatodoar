"use client";
import { useState, type CSSProperties } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularCuotas } from "@/lib/calc/cuotas";
import { pCuotas } from "@/lib/params";
import { fechaAR, parsePesos, pct, pesos, pesos0 } from "@/lib/format";

const inflacion = pCuotas.series.find((s) => s.clave === "inflacionMensual")!;
const depositos = pCuotas.series.find((s) => s.clave === "depositos30d");
const mesInflacion = (() => {
  const [y, m] = inflacion.fecha.split("-");
  const nombres = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${nombres[Number(m) - 1]} de ${y}`;
})();
const fmt = (n: number, d = 2) => n.toLocaleString("es-AR", { maximumFractionDigits: d });
const btnStyle: CSSProperties = {
  border: 0, background: "var(--tinta)", color: "var(--superficie)", font: "700 0.9rem var(--fuente)",
  padding: "var(--s2) var(--s4)", borderRadius: "var(--radio)", cursor: "pointer",
};

export default function CuotasOContado() {
  const [contado, setContado] = useState("1.080.000");
  const [n, setN] = useState("6");
  const [cuota, setCuota] = useState("200.000");
  const [total, setTotal] = useState("1.200.000");
  const [tasa, setTasa] = useState(String(inflacion.valor).replace(".", ","));
  const [tna, setTna] = useState(depositos ? String(depositos.valor).replace(".", ",") : "30");
  const [hoy, setHoy] = useState(false);
  const [precarga, setPrecarga] = useState(`Inflación de ${mesInflacion}: ${fmt(inflacion.valor)} % · ${fechaAR(inflacion.fecha)} · INDEC`);

  const syncDesdeCuota = (c: string, cant: string) => {
    setCuota(c);
    const nn = Number(cant) || 0;
    if (nn > 0) setTotal(new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.round(parsePesos(c) * nn)));
  };
  const syncDesdeTotal = (t: string, cant: string) => {
    setTotal(t);
    const nn = Number(cant) || 0;
    if (nn > 0) setCuota(new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(parsePesos(t) / nn));
  };

  const r = calcularCuotas({
    precioContado: parsePesos(contado),
    cantidadCuotas: Number(n) || 0,
    valorCuota: parsePesos(cuota),
    tasaMensual: parsePesos(tasa) / 100,
    primeraCuotaHoy: hoy,
  });

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de la compra" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="contado" label="Precio de contado" ayuda="Con el descuento por pago en efectivo, si lo hay." value={contado} onChange={setContado} />
        <Campo id="n" label="Cantidad de cuotas" ayuda="Entre 1 y 60.">
          <input id="n" inputMode="numeric" value={n} onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setN(v);
            syncDesdeCuota(cuota, v);
          }} />
        </Campo>
        <MoneyInput id="cuota" label="Valor de cada cuota" value={cuota} onChange={(v) => syncDesdeCuota(v, n)} />
        <MoneyInput id="total" label="Total en cuotas" ayuda="Si conocés el total, lo cargás acá y se calcula la cuota." value={total} onChange={(v) => syncDesdeTotal(v, n)} />
        <Campo id="tasa" label="Tasa mensual para comparar (%)" ayuda={`${pCuotas.avisoTasas} Precarga actual: ${precarga}.`}>
          <input id="tasa" inputMode="decimal" value={tasa} onChange={(e) => setTasa(e.target.value.replace(/[^\d,]/g, ""))} />
        </Campo>
        <Campo id="tna" label="TNA que conseguís (%)" ayuda="Para el botón de rendimiento: se divide por 12.">
          <input id="tna" inputMode="decimal" value={tna} onChange={(e) => setTna(e.target.value.replace(/[^\d,]/g, ""))} />
        </Campo>
        <div className="campo" style={{ display: "flex", flexWrap: "wrap", gap: "var(--s2)" }}>
          <button type="button" style={btnStyle} onClick={() => {
            setTasa(String(inflacion.valor).replace(".", ","));
            setPrecarga(`Inflación de ${mesInflacion}: ${fmt(inflacion.valor)} % · ${fechaAR(inflacion.fecha)} · INDEC`);
          }}>Inflación del último mes</button>
          <button type="button" style={btnStyle} onClick={() => {
            const mensual = parsePesos(tna) / 12;
            setTasa(fmt(mensual, 4).replace(".", ","));
            setPrecarga(`TNA ${fmt(parsePesos(tna))} % ÷ 12 = ${fmt(mensual, 4)} % mensual (tu rendimiento)`);
          }}>Rendimiento que conseguís (TNA ÷ 12)</button>
        </div>
        <Check id="hoy" label="La primera cuota se paga hoy" checked={hoy} onChange={setHoy} />
      </form>
      {r.ok ? (
        <Resultado titulo={r.conviene === "cuotas" ? "Convienen las cuotas" : "Conviene de contado"} grande={pesos0(r.conviene === "cuotas" ? r.vp : r.precioContado)}
          lineas={[
            { label: "Valor de hoy de las cuotas", valor: pesos(r.vp) },
            { label: "Precio de contado", valor: pesos(r.precioContado) },
            { label: "Total nominal de las cuotas", valor: pesos(r.totalCuotas) },
            { label: r.conviene === "cuotas" ? "Ahorrás pagando en cuotas" : "Ahorrás pagando de contado", valor: pesos(r.diferencia) },
            { label: "Tasa de equilibrio mensual", valor: pct(r.tasaEquilibrio), total: true },
          ]}
          nota={`Si esperás más de ${pct(r.tasaEquilibrio)} de inflación (o rendimiento) mensual, convienen las cuotas. Si las cuotas tienen interés o recargo, cargá el total real.`} />
      ) : (
        <section className="resultado" aria-labelledby="rt">
          <h2 id="rt" className="rot" style={{ fontFamily: "var(--fuente)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
          <output className="grande" aria-live="polite" data-testid="resultado">Revisá los datos</output>
          <p className="nota">{r.error}</p>
        </section>
      )}
    </div>
  );
}
