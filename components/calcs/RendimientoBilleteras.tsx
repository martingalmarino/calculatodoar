"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularBilletera, saldoConInflacion } from "@/lib/calc/billetera";
import { calcularPlazoFijo } from "@/lib/calc/plazoFijo";
import { pBilletera, pPlazoFijo } from "@/lib/params";
import { parsePesos, pct, pesos, pesos0 } from "@/lib/format";

type Plazo = "30" | "90" | "365" | "otro";
type Tipo = "banco" | "billetera" | "fci";

export default function RendimientoBilleteras() {
  const [saldo, setSaldo] = useState("1.000.000");
  const [tna, setTna] = useState("");
  const [plazo, setPlazo] = useState<Plazo>("30");
  const [diasOtro, setDiasOtro] = useState("60");
  const [conTope, setConTope] = useState(false);
  const [tope, setTope] = useState("500.000");
  const [tipo, setTipo] = useState<Tipo>("billetera");
  const [comparar, setComparar] = useState(false);
  const [tnaPf, setTnaPf] = useState("");
  const [infl, setInfl] = useState("");

  const dias = plazo === "otro" ? Number(diasOtro) || 0 : Number(plazo);
  const tnaN = tna === "" ? NaN : parsePesos(tna) / 100;
  const r = tna === ""
    ? ({ ok: false as const, error: "Ingresá la TNA que muestra tu app." })
    : calcularBilletera({
      saldo: parsePesos(saldo),
      tna: tnaN,
      dias,
      topeRemunerado: conTope ? parsePesos(tope) : null,
    });

  const pf = comparar && tnaPf !== "" && dias >= pPlazoFijo.plazoMinimoTradicional
    ? calcularPlazoFijo({ capital: parsePesos(saldo), tna: parsePesos(tnaPf) / 100, dias }, pPlazoFijo)
    : null;
  const conInfl = comparar && infl !== "" && r.ok
    ? saldoConInflacion(r.saldo, parsePesos(infl) / 100, dias)
    : null;

  const seguro = pBilletera.seguroDepositos;
  const notaSeguro = tipo === "banco"
    ? `Hasta ${pesos0(seguro.montoMaximo)} por persona y por banco están cubiertos por el Seguro de Garantía de los Depósitos (${seguro.norma}).`
    : tipo === "billetera"
      ? "El saldo en billeteras o cuentas de pago no está cubierto por el Seguro de Garantía de los Depósitos."
      : "Los fondos money market (FCI) no están cubiertos por el Seguro de Garantía de los Depósitos.";

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de la cuenta remunerada" onSubmit={(e) => e.preventDefault()}>
        <Seg name="tipo" legend="Tipo de cuenta" value={tipo} onChange={setTipo} opciones={[
          { v: "banco", label: "Cuenta de banco" },
          { v: "billetera", label: "Billetera o cuenta de pago" },
          { v: "fci", label: "Fondo money market" },
        ]} />
        <MoneyInput id="saldo" label="Saldo" value={saldo} onChange={setSaldo} />
        <Campo id="tna" label="TNA (%)" ayuda="La TNA vigente está en tu app y cambia seguido.">
          <input id="tna" inputMode="decimal" value={tna} onChange={(e) => setTna(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" />
        </Campo>
        <Seg name="plazo" legend="Plazo" value={plazo} onChange={setPlazo} opciones={[
          { v: "30", label: "30 días" },
          { v: "90", label: "90 días" },
          { v: "365", label: "365 días" },
          { v: "otro", label: "Otro" },
        ]} />
        {plazo === "otro" && (
          <Campo id="dias" label="Días">
            <input id="dias" inputMode="numeric" value={diasOtro} onChange={(e) => setDiasOtro(e.target.value.replace(/\D/g, ""))} />
          </Campo>
        )}
        <Check id="tope" label="Hay tope remunerado" checked={conTope} onChange={setConTope} ayuda="Algunas cuentas solo pagan interés hasta cierto saldo." />
        {conTope && <MoneyInput id="tope-val" label="Tope remunerado" value={tope} onChange={setTope} />}
        <Check id="comp" label="Comparar con plazo fijo e inflación" checked={comparar} onChange={setComparar} />
        {comparar && (
          <>
            <Campo id="tnapf" label="TNA del plazo fijo (%)" ayuda="La que te cotiza el banco (interés simple ÷ 365).">
              <input id="tnapf" inputMode="decimal" value={tnaPf} onChange={(e) => setTnaPf(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Campo id="infl" label="Inflación mensual esperada (%)">
              <input id="infl" inputMode="decimal" value={infl} onChange={(e) => setInfl(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
          </>
        )}
      </form>

      {r.ok ? (
        <Resultado titulo="Al cabo del plazo tenés" grande={pesos0(r.final)}
          lineas={[
            { label: "Saldo inicial", valor: pesos(r.saldo) },
            ...(r.topeRemunerado != null ? [{ label: "Saldo que rinde", valor: pesos(r.saldoRemunerado) }] : []),
            { label: "Interés", valor: pesos(r.interes) },
            { label: "TEA", valor: pct(r.tea) },
            { label: "Equivalente mensual", valor: pct(r.equivalenteMensual) },
            { label: "Saldo final", valor: pesos(r.final), total: true },
            ...(pf?.ok ? [{ label: "Plazo fijo (mismo capital y plazo)", valor: pesos(pf.total) }] : []),
            ...(conInfl != null ? [{ label: "Saldo ajustado por inflación esperada", valor: pesos(conInfl) }] : []),
          ]}
          nota={notaSeguro} />
      ) : (
        <section className="resultado" aria-labelledby="rt">
          <h2 id="rt" className="rot" style={{ fontFamily: "var(--fuente)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
          <output className="grande" aria-live="polite" data-testid="resultado">Cargá la TNA</output>
          <p className="nota">{r.error}</p>
        </section>
      )}
    </div>
  );
}
