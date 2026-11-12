"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularInflacion } from "@/lib/calc/inflacion";
import { ipc } from "@/lib/data";
import { pInflacion } from "@/lib/params";
import { fechaAR, parsePesos, pct, pesos, pesos0 } from "@/lib/format";

type Modo = "hoy" | "pasado";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const labelMes = (p: string) => { const [y, m] = p.split("-"); return `${MESES[Number(m) - 1]} ${y}`; };
const periodos = ipc.serie.map(([p]) => p);
const ultimos12 = ipc.serie.slice(-12);

export default function Inflacion() {
  const ultimo = pInflacion.ultimoIPC().periodo;
  const [modo, setModo] = useState<Modo>("hoy");
  const [monto, setMonto] = useState("100.000");
  const [origen, setOrigen] = useState("2020-01");
  const [destino, setDestino] = useState(ultimo);

  const r = calcularInflacion({
    monto: parsePesos(monto),
    mesOrigen: origen,
    mesDestino: destino,
    inverso: modo === "pasado",
  }, pInflacion);

  const prox = pInflacion.proximaPublicacion;

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de inflación" onSubmit={(e) => e.preventDefault()}>
        <Seg name="modo" legend="Dirección" value={modo} onChange={setModo} opciones={[
          { v: "hoy", label: "Llevar a hoy" },
          { v: "pasado", label: "Traer al pasado" },
        ]} />
        <MoneyInput
          id="monto"
          label={modo === "hoy" ? "Monto de entonces" : "Monto de hoy"}
          value={monto}
          onChange={setMonto}
        />
        <Campo id="origen" label={modo === "hoy" ? "Mes de origen" : "Mes del pasado"} ayuda={`Serie IPC: ${pInflacion.rangoIPC.primera} a ${pInflacion.rangoIPC.ultima}.`}>
          <select id="origen" value={origen} onChange={(e) => setOrigen(e.target.value)}>
            {periodos.map((p) => <option key={p} value={p}>{labelMes(p)}</option>)}
          </select>
        </Campo>
        <Campo id="destino" label={modo === "hoy" ? "Mes de destino" : "Mes de referencia (hoy)"} ayuda="Por defecto, el último IPC publicado.">
          <select id="destino" value={destino} onChange={(e) => setDestino(e.target.value)}>
            {periodos.map((p) => <option key={p} value={p}>{labelMes(p)}</option>)}
          </select>
        </Campo>
      </form>

      {r.ok ? (
        <div>
          <Resultado
            titulo={modo === "hoy" ? "Ese monto hoy equivale a" : `Ese monto en ${labelMes(origen)} equivalía a`}
            grande={pesos0(r.montoActualizado)}
            lineas={[
              { label: modo === "hoy" ? "Monto de entonces" : "Monto de hoy", valor: pesos(r.monto) },
              { label: `IPC ${labelMes(origen)}`, valor: r.ipcOrigen.toLocaleString("es-AR", { maximumFractionDigits: 4 }) },
              { label: `IPC ${labelMes(destino)}`, valor: r.ipcDestino.toLocaleString("es-AR", { maximumFractionDigits: 4 }) },
              { label: "Inflación acumulada", valor: pct(r.inflacionAcumulada) },
              ...(r.inflacionMensualPromedio != null ? [{ label: "Promedio mensual", valor: pct(r.inflacionMensualPromedio) }] : []),
              { label: "Poder de compra del monto nominal", valor: pct(r.poderDeCompra) },
              { label: modo === "hoy" ? "Monto actualizado" : "Monto en el pasado", valor: pesos(r.montoActualizado), total: true },
            ]}
            nota={`Último dato: IPC ${labelMes(ultimo)} publicado por INDEC. Próximo dato: ${fechaAR(prox.fecha)} (${labelMes(prox.periodo)}).`}
          />
          <table className="tabla" style={{ marginTop: "var(--s4)" }}>
            <caption className="saltar">Variación mensual de los últimos 12 meses</caption>
            <thead>
              <tr><th scope="col">Mes</th><th scope="col">Var. mensual</th></tr>
            </thead>
            <tbody>
              {ultimos12.map(([periodo, , varMensual]) => (
                <tr key={periodo}>
                  <td>{labelMes(periodo)}</td>
                  <td>{varMensual == null ? "—" : `${varMensual.toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
