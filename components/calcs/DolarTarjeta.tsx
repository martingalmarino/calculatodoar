"use client";
import { useState } from "react";
import { Campo, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularDolar, type DolarModo } from "@/lib/calc/dolar";
import { pDolar } from "@/lib/params";
import { fechaAR, maskPesos, parsePesos, pesos, pesos0 } from "@/lib/format";

const oficial = pDolar.referencias.find((r) => r.clave === "oficialMinorista")!;
const MODES: { v: DolarModo; label: string }[] = [
  { v: "tarjeta", label: "Tarjeta" },
  { v: "digital", label: "Digital" },
  { v: "dolaresPropios", label: "USD propios" },
  { v: "compraOficial", label: "Compra oficial" },
  { v: "mep", label: "MEP" },
];
const labelModo = (m: DolarModo) => MODES.find((x) => x.v === m)!.label;

export default function DolarTarjeta() {
  const [usd, setUsd] = useState("100");
  const [modo, setModo] = useState<DolarModo>("tarjeta");
  const [cot, setCot] = useState(oficial.valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
  const [mep, setMep] = useState("");
  const [iibb, setIibb] = useState("");

  const params = { percepcionAlicuota: pDolar.percepcion.alicuota, ivaAlicuota: pDolar.ivaServiciosDigitales.alicuota };
  const cotN = parsePesos(cot);
  const mepN = mep ? parsePesos(mep) : undefined;
  const r = calcularDolar({ montoUSD: parsePesos(usd), modo, cotizacion: cotN, cotizacionMEP: mepN, iibbPct: iibb ? parsePesos(iibb) / 100 : undefined }, params);

  const comparativa = MODES.map((m) => ({
    modo: m.v,
    label: m.label,
    r: calcularDolar({ montoUSD: parsePesos(usd), modo: m.v, cotizacion: cotN, cotizacionMEP: mepN, iibbPct: iibb ? parsePesos(iibb) / 100 : undefined }, params),
  })).filter((x) => x.r.ok);

  return (
    <>
      <div className="calc">
        <form className="campos" noValidate aria-label="Datos del dólar" onSubmit={(e) => e.preventDefault()}>
          <Seg name="modo" legend="Cómo lo pagás" value={modo} onChange={setModo} opciones={MODES} />
          <Campo id="usd" label="Monto en dólares (USD)">
            <div className="peso"><span aria-hidden>US$</span><input id="usd" inputMode="decimal" value={usd} onChange={(e) => setUsd(maskPesos(e.target.value))} /></div>
          </Campo>
          {modo !== "dolaresPropios" && modo !== "mep" && (
            <Campo id="cot" label="Cotización oficial ($ por USD)" ayuda={`Referencia BCRA del ${fechaAR(oficial.fecha)}: ${pesos(oficial.valor)}. Tu banco usa su propio tipo de cambio vendedor (la percepción usa el del Banco Nación).`}>
              <div className="peso"><span aria-hidden>$</span><input id="cot" inputMode="decimal" value={cot} onChange={(e) => setCot(maskPesos(e.target.value))} /></div>
            </Campo>
          )}
          <Campo id="mep" label="Cotización MEP ($ por USD)" ayuda="Cargá la cotización que ves en tu banco o broker. No hay publicación oficial central.">
            <div className="peso"><span aria-hidden>$</span><input id="mep" inputMode="decimal" value={mep} onChange={(e) => setMep(maskPesos(e.target.value))} placeholder="Sin valor por defecto" /></div>
          </Campo>
          {modo === "digital" && (
            <Campo id="iibb" label="IIBB provincial (%)" ayuda={pDolar.iibbServiciosDigitales.detalle}>
              <input id="iibb" inputMode="decimal" value={iibb} onChange={(e) => setIibb(e.target.value.replace(/[^\d,]/g, ""))} placeholder="Opcional" />
            </Campo>
          )}
        </form>
        {r.ok ? (
          <Resultado titulo={modo === "dolaresPropios" ? "Pagás en dólares" : `Total en ${labelModo(modo).toLowerCase()}`} grande={modo === "dolaresPropios" ? `US$ ${r.total.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` : pesos0(r.total)}
            lineas={[
              ...(modo !== "dolaresPropios" ? [{ label: "Importe en pesos", valor: pesos(r.pesos) }] : []),
              ...(r.iva ? [{ label: `IVA (${(params.ivaAlicuota * 100).toLocaleString("es-AR")} %)`, valor: pesos(r.iva) }] : []),
              { label: `Percepción RG 5617 (${(params.percepcionAlicuota * 100).toLocaleString("es-AR")} %)`, valor: pesos(r.percepcion) },
              ...(r.iibb ? [{ label: "IIBB provincial", valor: pesos(r.iibb) }] : []),
              { label: "Total", valor: modo === "dolaresPropios" ? `US$ ${r.total.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` : pesos(r.total), total: true },
            ]}
            nota={modo === "digital" ? pDolar.ivaServiciosDigitales.pendiente : modo === "compraOficial" ? "Personas humanas: sin percepción (RG 5617 art. 2 inc. e)." : undefined} />
        ) : (
          <section className="resultado" aria-labelledby="rt">
            <h2 id="rt" className="rot" style={{ fontFamily: "var(--fuente)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
            <output className="grande" aria-live="polite" data-testid="resultado">Falta un dato</output>
            <p className="nota">{r.error}</p>
          </section>
        )}
      </div>
      {comparativa.length > 0 && (
        <section className="prosa" aria-labelledby="comp">
          <h2 id="comp">Comparativa para el mismo monto</h2>
          <table className="tabla">
            <thead><tr><th>Modo</th><th>Total</th></tr></thead>
            <tbody>
              {comparativa.map((c) => c.r.ok && (
                <tr key={c.modo}>
                  <td>{c.label}</td>
                  <td>{c.modo === "dolaresPropios" ? `US$ ${c.r.total.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` : pesos(c.r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!mepN && <p className="ayuda">El modo MEP aparece en la tabla cuando cargás una cotización MEP.</p>}
        </section>
      )}
      <section className="prosa" aria-labelledby="na">
        <h2 id="na">Qué no paga percepción</h2>
        <ul>{pDolar.percepcion.noAlcanza.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>Cómo recuperar la percepción</h3>
        <p>{pDolar.percepcion.naturaleza}</p>
        {!pDolar.impuestoPais.vigente && <p className="aviso">El Impuesto PAIS no rige desde el {fechaAR(pDolar.impuestoPais.finVigencia)}.</p>}
      </section>
    </>
  );
}
