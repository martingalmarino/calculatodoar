"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularPlazoFijo, calcularPlazoFijoUVA, inflacionEquilibrioUva } from "@/lib/calc/plazoFijo";
import { pPlazoFijo } from "@/lib/params";
import { fechaAR, parsePesos, pct, pesos, pesos0 } from "@/lib/format";

type Modo = "tradicional" | "uva" | "comparar";

const dep = pPlazoFijo.tasaRefDepositos;
const rem = pPlazoFijo.remInflacion12m;
const remMensual = rem ? (1 + rem.valor / 100) ** (1 / 12) - 1 : 0.01657;
const fmt = (n: number, d = 2) => n.toLocaleString("es-AR", { maximumFractionDigits: d, minimumFractionDigits: d });

export default function PlazoFijo() {
  const [modo, setModo] = useState<Modo>("tradicional");
  const [capital, setCapital] = useState("1.000.000");
  const [tna, setTna] = useState(dep ? String(dep.valor).replace(".", ",") : "30");
  const [dias, setDias] = useState(modo === "uva" ? "90" : "30");
  const [fecha, setFecha] = useState("2026-08-04");
  const [tnaAdic, setTnaAdic] = useState("1");
  const [infl, setInfl] = useState(fmt(remMensual * 100, 3).replace(".", ","));
  const [precan, setPrecan] = useState(false);
  const [tasaPrecan, setTasaPrecan] = useState("");

  const cap = parsePesos(capital);
  const d = Number(dias) || 0;
  const trad = calcularPlazoFijo({ capital: cap, tna: parsePesos(tna) / 100, dias: d }, pPlazoFijo);
  const uva = calcularPlazoFijoUVA({
    capital: cap,
    fechaConstitucion: fecha,
    dias: Math.max(d, pPlazoFijo.plazoMinimoUva),
    tnaAdicional: parsePesos(tnaAdic) / 100,
    inflacionMensualEsperada: parsePesos(infl) / 100,
  }, pPlazoFijo);
  const uvaCalc = calcularPlazoFijoUVA({
    capital: cap,
    fechaConstitucion: fecha,
    dias: d,
    tnaAdicional: parsePesos(tnaAdic) / 100,
    inflacionMensualEsperada: parsePesos(infl) / 100,
  }, pPlazoFijo);
  const eq = modo === "comparar" ? inflacionEquilibrioUva({
    capital: cap, fechaConstitucion: fecha, dias: Math.max(d, pPlazoFijo.plazoMinimoUva),
    tna: parsePesos(tna) / 100, tnaAdicional: parsePesos(tnaAdic) / 100,
  }, pPlazoFijo) : null;

  const seguro = `Hasta ${pesos0(pPlazoFijo.seguroDepositos.montoMaximo)} por persona y por banco están cubiertos por el Seguro de Garantía de los Depósitos (${pPlazoFijo.seguroDepositos.norma}).`;

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del plazo fijo" onSubmit={(e) => e.preventDefault()}>
        <Seg name="modo" legend="Tipo" value={modo} onChange={(v) => {
          setModo(v);
          if (v === "uva" || v === "comparar") setDias((prev) => Number(prev) < 90 ? "90" : prev);
        }} opciones={[
          { v: "tradicional", label: "Tradicional" },
          { v: "uva", label: "UVA" },
          { v: "comparar", label: "Comparar" },
        ]} />
        <MoneyInput id="cap" label="Capital" value={capital} onChange={setCapital} />
        {(modo === "tradicional" || modo === "comparar") && (
          <Campo id="tna" label="TNA (%)" ayuda={dep ? `Promedio del sistema según el BCRA (${fechaAR(dep.fecha)}: ${fmt(dep.valor)} %). Tu banco puede pagar otra tasa.` : "Tasa nominal anual que te ofrece el banco."}>
            <input id="tna" inputMode="decimal" value={tna} onChange={(e) => setTna(e.target.value.replace(/[^\d,]/g, ""))} />
          </Campo>
        )}
        {(modo === "uva" || modo === "comparar") && (
          <>
            <Campo id="fecha" label="Fecha de constitución">
              <input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </Campo>
            <Campo id="tnaa" label="TNA adicional UVA (%)" ayuda="Tasa fija pactada sobre el capital ajustado por UVA.">
              <input id="tnaa" inputMode="decimal" value={tnaAdic} onChange={(e) => setTnaAdic(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Campo id="infl" label="Inflación mensual esperada (%)" ayuda={rem ? `Precargada con el REM a 12 meses (${fmt(rem.valor)} % al ${fechaAR(rem.fecha)} → ${(remMensual * 100).toLocaleString("es-AR", { maximumFractionDigits: 3 })} % mensual). Editable.` : undefined}>
              <input id="infl" inputMode="decimal" value={infl} onChange={(e) => setInfl(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Check id="precan" label="Es precancelable (personas humanas)" checked={precan} onChange={setPrecan} ayuda={`Se puede cancelar desde los ${pPlazoFijo.plazoMinimo.uvaPrecancelableCancelacionDesde} días, con la tasa de precancelación que fije el banco.`} />
            {precan && (
              <Campo id="tp" label="Tasa de precancelación TNA (%)" ayuda="La fija el banco; es input opcional.">
                <input id="tp" inputMode="decimal" value={tasaPrecan} onChange={(e) => setTasaPrecan(e.target.value.replace(/[^\d,]/g, ""))} />
              </Campo>
            )}
          </>
        )}
        <Campo id="dias" label="Plazo (días)" ayuda={modo === "tradicional" ? `Mínimo ${pPlazoFijo.plazoMinimoTradicional} días.` : `Mínimo ${pPlazoFijo.plazoMinimoUva} días.`}>
          <input id="dias" inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value.replace(/\D/g, ""))} />
        </Campo>
      </form>

      {modo === "tradicional" && (trad.ok ? (
        <Resultado titulo="Al vencimiento cobrás" grande={pesos0(trad.total)}
          lineas={[
            { label: "Capital", valor: pesos(trad.capital) },
            { label: "Interés", valor: pesos(trad.interes) },
            { label: "TEA", valor: pct(trad.tea) },
            { label: "Total", valor: pesos(trad.total), total: true },
          ]}
          nota={seguro} />
      ) : (
        <Err msg={trad.error} />
      ))}

      {modo === "uva" && (uvaCalc.ok ? (
        <Resultado titulo="Al vencimiento cobrás" grande={pesos0(uvaCalc.total)}
          lineas={[
            { label: `UVA inicial (${fechaAR(uvaCalc.fechaUvaInicial)})`, valor: uvaCalc.uvaInicial.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
            { label: "Cantidad de UVA", valor: uvaCalc.cantidadUVA.toLocaleString("es-AR", { maximumFractionDigits: 4 }) },
            { label: `UVA al ${fechaAR(uvaCalc.vencimiento)}${uvaCalc.esEstimacion ? " (proyectada)" : ""}`, valor: uvaCalc.uvaFinal.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
            { label: "Capital ajustado", valor: pesos(uvaCalc.capitalAjustado) },
            { label: "Interés adicional", valor: pesos(uvaCalc.interes) },
            { label: uvaCalc.esEstimacion ? "Total (estimación)" : "Total", valor: pesos(uvaCalc.total), total: true },
          ]}
          nota={seguro} />
      ) : (
        <Err msg={uvaCalc.error} />
      ))}

      {modo === "comparar" && trad.ok && uva.ok && (
        <Resultado titulo={trad.total >= uva.total ? "Rinde más el tradicional" : "Rinde más el UVA"} grande={pesos0(Math.max(trad.total, uva.total))}
          lineas={[
            { label: "Tradicional al vencimiento", valor: pesos(trad.total) },
            { label: uva.esEstimacion ? "UVA al vencimiento (estimación)" : "UVA al vencimiento", valor: pesos(uva.total) },
            { label: "Diferencia", valor: pesos(Math.abs(trad.total - uva.total)) },
            ...(eq != null ? [{ label: "Inflación mensual de equilibrio", valor: pct(eq), total: true as const }] : []),
          ]}
          nota={`Si la inflación mensual supera ${eq != null ? pct(eq) : "—" }, conviene el UVA (a igual capital y plazo). ${seguro}`} />
      )}
      {modo === "comparar" && (!trad.ok || !uva.ok) && (
        <Err msg={!trad.ok ? trad.error : !uva.ok ? uva.error : "Revisá los datos"} />
      )}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <section className="resultado" aria-labelledby="rt">
      <h2 id="rt" className="rot" style={{ fontFamily: "var(--f-txt)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
      <output className="grande" aria-live="polite" data-testid="resultado">Revisá el plazo</output>
      <p className="nota">{msg}</p>
    </section>
  );
}
