"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularMonotributo } from "@/lib/calc/monotributo";
import { pMono } from "@/lib/params";
import { parsePesos, pesos } from "@/lib/format";

export default function Monotributo() {
  const [fact, setFact] = useState("20.000.000");
  const [act, setAct] = useState<"servicios" | "venta">("servicios");
  const [sup, setSup] = useState("0");
  const [kw, setKw] = useState("0");
  const [alq, setAlq] = useState("0");
  const [precio, setPrecio] = useState("0");
  const [otro, setOtro] = useState(false);
  const r = calcularMonotributo({ facturacionAnual: parsePesos(fact), actividad: act, superficieM2: Number(sup) || 0, energiaKw: Number(kw) || 0, alquileresAnuales: parsePesos(alq), precioUnitarioMax: parsePesos(precio), aportaPorOtroLado: otro }, pMono);
  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del monotributo" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="fact" label="Facturación de los últimos 12 meses" value={fact} onChange={setFact} />
        <Seg name="act" legend="Actividad" value={act} onChange={setAct} opciones={[{ v: "servicios", label: "Servicios" }, { v: "venta", label: "Venta de cosas muebles" }]} />
        <Campo id="sup" label="Superficie afectada (m²)" ayuda="0 si trabajás sin local. No se considera en ciudades de menos de 40.000 habitantes."><input id="sup" inputMode="numeric" value={sup} onChange={(e) => setSup(e.target.value.replace(/\D/g, ""))} /></Campo>
        <Campo id="kw" label="Energía consumida en 12 meses (kW)" ayuda="0 si no tenés local."><input id="kw" inputMode="numeric" value={kw} onChange={(e) => setKw(e.target.value.replace(/\D/g, ""))} /></Campo>
        <MoneyInput id="alq" label="Alquileres devengados en 12 meses" ayuda="Del local o lugar de trabajo." value={alq} onChange={setAlq} />
        {act === "venta" && <MoneyInput id="precio" label="Precio unitario más alto que vendiste" value={precio} onChange={setPrecio} />}
        <Check id="otro" label="Ya aporto por relación de dependencia u otro régimen" checked={otro} onChange={setOtro} ayuda="En ese caso no pagás SIPA ni obra social." />
      </form>
      {r.excluido ? (
        <section className="resultado" aria-labelledby="rt">
          <h2 id="rt" className="rot" style={{ fontFamily: "var(--f-txt)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
          <output className="grande" aria-live="polite" data-testid="resultado">Excluido</output>
          <p className="nota">{r.motivo === "precio" ? `Superás el precio unitario máximo de ${pesos(pMono.precioUnitarioMaximo)} por venta.` : "Superás los parámetros de la categoría K: corresponde el régimen general."}</p>
        </section>
      ) : (
        <Resultado titulo={`Categoría ${r.categoria.categoria}: cuota mensual`} grande={pesos(r.cuota)}
          lineas={[
            { label: "Impuesto integrado", valor: pesos(r.impuesto) },
            { label: "Aporte jubilatorio (SIPA)", valor: pesos(r.sipa) },
            { label: "Obra social", valor: pesos(r.obraSocial) },
            { label: "Cuota mensual", valor: pesos(r.cuota), total: true },
            { label: "Tope de facturación de la categoría", valor: pesos(r.categoria.ingresosBrutosAnuales) },
          ]} />
      )}
    </div>
  );
}
