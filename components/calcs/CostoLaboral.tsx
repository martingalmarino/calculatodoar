"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularCostoLaboral } from "@/lib/calc/costoLaboral";
import { pCosto } from "@/lib/params";
import { parsePesos, pct, pesos, pesos0 } from "@/lib/format";

type Tipo = "A" | "B";
type Det = "general" | "sectorial";

const tipos = pCosto.seguridadSocial.alicuotas;

export default function CostoLaboral() {
  const [bruto, setBruto] = useState("1.500.000");
  const [tipo, setTipo] = useState<Tipo>("B");
  const [mipyme, setMipyme] = useState(true);
  const [periodo, setPeriodo] = useState("2026-11");
  const [rifl, setRifl] = useState(false);
  const [det, setDet] = useState<Det>("general");
  const [empleados, setEmpleados] = useState("1");
  const [adic25, setAdic25] = useState(false);
  const [artPct, setArtPct] = useState("");
  const [artFijo, setArtFijo] = useState("");

  const r = calcularCostoLaboral({
    bruto: parsePesos(bruto),
    tipoEmpleador: tipo,
    mipyme,
    rifl,
    detraccion: det,
    empleadosNomina: Number(empleados) || 0,
    aplicarAdicional25: adic25,
    artPct: artPct === "" ? null : parsePesos(artPct) / 100,
    artFijo: artFijo === "" ? null : parsePesos(artFijo),
    periodo,
  }, pCosto);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del costo laboral" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="bruto" label="Sueldo bruto" value={bruto} onChange={setBruto} />
        <Seg name="tipo" legend="Tipo de empleador" value={tipo} onChange={setTipo} opciones={tipos.map((t) => ({
          v: t.clave as Tipo,
          label: `${t.clave} (${(t.alicuota * 100).toLocaleString("es-AR")} %)`,
        }))} />
        <p className="ayuda" style={{ marginTop: 0 }}>
          {tipos.map((t) => `${t.clave}: ${t.descripcion}.`).join(" ")}
        </p>
        <Check id="mipyme" label="Certificado MiPyME vigente" checked={mipyme} onChange={setMipyme} ayuda="Define la alícuota del FAL (1 % grandes / 2,5 % MiPyME) desde dic-2026." />
        <Campo id="per" label="Período (AAAA-MM)" ayuda={`FAL desde ${pCosto.fal.primerPeriodoDevengado}.`}>
          <input id="per" value={periodo} onChange={(e) => setPeriodo(e.target.value)} pattern="\d{4}-\d{2}" />
        </Campo>
        <Check id="rifl" label="Alta nueva en el RIFL" checked={rifl} onChange={setRifl} ayuda={`Alícuota ${(pCosto.rifl.alicuotaTotal * 100).toLocaleString("es-AR")} % durante ${pCosto.rifl.duracionMeses} meses (altas ${pCosto.rifl.altasDesde} a ${pCosto.rifl.altasHasta}).`} />
        {rifl && (
          <details>
            <summary>Requisitos del art. 157 (RIFL)</summary>
            <p className="nota">{pCosto.rifl.requisitos} {pCosto.rifl.pendiente}</p>
          </details>
        )}
        {!rifl && (
          <Seg name="det" legend="Detracción de seguridad social" value={det} onChange={setDet} opciones={[
            { v: "general", label: `General (${pesos(pCosto.detracciones.general)})` },
            { v: "sectorial", label: `Sectorial (${pesos(pCosto.detracciones.sectoresDecretos1067_128_688)})` },
          ]} />
        )}
        <Campo id="emp" label="Empleados en nómina">
          <input id="emp" inputMode="numeric" value={empleados} onChange={(e) => setEmpleados(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        {!rifl && (
          <Check id="adic" label="Aplicar detracción adicional ($10.000 / empleados, nómina ≤ 25)" checked={adic25} onChange={setAdic25} ayuda={pCosto.detracciones.pendiente} />
        )}
        <Campo id="artp" label="ART alícuota (%)" ayuda={pCosto.art.detalle}>
          <input id="artp" inputMode="decimal" value={artPct} onChange={(e) => setArtPct(e.target.value.replace(/[^\d,]/g, ""))} placeholder="Vacío = sin ART" />
        </Campo>
        <MoneyInput id="artf" label="ART suma fija (opcional)" value={artFijo} onChange={setArtFijo} />
      </form>

      {r.ok ? (
        <Resultado titulo="Costo mensual para el empleador" grande={pesos0(r.costoMensual)}
          lineas={[
            { label: "Bruto", valor: pesos(r.bruto) },
            { label: r.rifl ? `Contribuciones SS (RIFL ${(r.alicuotaSS * 100).toLocaleString("es-AR")} %)` : `Contribuciones SS (${(r.alicuotaSS * 100).toLocaleString("es-AR")} %)${r.detraccionAplicada > 0 ? ` − detracción ${pesos(r.detraccionAplicada)}` : ""}`, valor: pesos(r.ss) },
            ...(r.fal != null && r.falAlicuota != null ? [{ label: `De esto, FAL (${pct(r.falAlicuota)}) al Fondo de Asistencia Laboral`, valor: pesos(r.fal) }] : []),
            { label: `Obra social (${(pCosto.obraSocial.alicuota * 100).toLocaleString("es-AR")} %)`, valor: pesos(r.obraSocial) },
            { label: "ART", valor: r.art == null ? "sin ART" : pesos(r.art) },
            { label: "Seguro de vida obligatorio", valor: pesos(r.scvo) },
            { label: `Costo mensual (${pct(r.pctSobreBruto)} sobre el bruto)`, valor: pesos(r.costoMensual) },
            { label: "Costo anual (con SAC)", valor: pesos(r.costoAnual), total: true },
            { label: "Aportes del trabajador (dato)", valor: pesos(r.trabajador.aportes) },
            { label: "Neto que cobra el trabajador", valor: pesos(r.trabajador.neto) },
          ]}
          nota={r.rifl
            ? pCosto.rifl.pendiente
            : r.fal != null
              ? `${pCosto.fal.compensacion} El total no cambia: solo se redistribuye.`
              : pCosto.seguridadSocial.tope}
        />
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
