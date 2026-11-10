"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { compararGNC, costoViaje, kmPorLitroDesdeL100, litrosPor100DesdeKmL } from "@/lib/calc/combustible";
import { pCombustible } from "@/lib/params";
import { parsePesos, pesos, pesos0 } from "@/lib/format";

type Modo = "viaje" | "gnc";
type Unidad = "l100" | "kml";

const linkEnergia = pCombustible.dondeConsultar[0]!;

export default function Combustible() {
  const [modo, setModo] = useState<Modo>("viaje");
  const [km, setKm] = useState("700");
  const [unidad, setUnidad] = useState<Unidad>("l100");
  const [consumo, setConsumo] = useState("");
  const [precio, setPrecio] = useState("");
  const [idaVuelta, setIdaVuelta] = useState(false);
  const [personas, setPersonas] = useState("1");
  const [peajes, setPeajes] = useState("");
  const [consNafta, setConsNafta] = useState("");
  const [precioNafta, setPrecioNafta] = useState("");
  const [consGnc, setConsGnc] = useState("");
  const [precioGnc, setPrecioGnc] = useState("");
  const [equipo, setEquipo] = useState("");

  const consN = consumo === "" ? NaN : parsePesos(consumo);
  const l100 = unidad === "l100" ? consN : (litrosPor100DesdeKmL(consN) ?? NaN);
  const kmlEquiv = unidad === "kml" ? consN : (kmPorLitroDesdeL100(consN) ?? NaN);

  const viaje = modo === "viaje"
    ? (precio === "" || consumo === ""
      ? ({ ok: false as const, error: "Cargá consumo y precio para ver el resultado." })
      : costoViaje({
        km: parsePesos(km),
        consumoL100km: unidad === "l100" ? consN : null,
        kmPorLitro: unidad === "kml" ? consN : null,
        precioLitro: parsePesos(precio),
        idaYVuelta: idaVuelta,
        personas: Number(personas) || 1,
        peajes: peajes === "" ? 0 : parsePesos(peajes),
      }))
    : null;

  const gnc = modo === "gnc"
    ? (consNafta === "" || precioNafta === "" || consGnc === "" || precioGnc === ""
      ? ({ ok: false as const, error: "Cargá consumos y precios de nafta y GNC." })
      : compararGNC({
        km: parsePesos(km),
        consumoNafta: parsePesos(consNafta),
        precioNafta: parsePesos(precioNafta),
        consumoGNCm3100km: parsePesos(consGnc),
        precioM3: parsePesos(precioGnc),
        costoEquipo: equipo === "" ? null : parsePesos(equipo),
      }))
    : null;

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de combustible" onSubmit={(e) => e.preventDefault()}>
        <Seg name="modo" legend="Qué querés calcular" value={modo} onChange={setModo} opciones={[
          { v: "viaje", label: "Costo del viaje" },
          { v: "gnc", label: "Nafta vs. GNC" },
        ]} />
        <Campo id="km" label="Kilómetros">
          <input id="km" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value.replace(/[^\d,]/g, ""))} />
        </Campo>
        <p className="ayuda" style={{ marginTop: 0 }}>
          Cargá el precio de tu estación. Podés consultar los precios oficiales por estación en{" "}
          <a href={linkEnergia.url} rel="noopener noreferrer" target="_blank">datos.gob.ar (Secretaría de Energía)</a>.
        </p>

        {modo === "viaje" && (
          <>
            <Seg name="unidad" legend="Cómo medís el consumo" value={unidad} onChange={setUnidad} opciones={[
              { v: "l100", label: "l/100 km" },
              { v: "kml", label: "km/l" },
            ]} />
            <Campo id="cons" label={unidad === "l100" ? "Consumo (l/100 km)" : "Consumo (km/l)"}
              ayuda={consumo !== "" && Number.isFinite(l100) && Number.isFinite(kmlEquiv)
                ? (unidad === "l100" ? `Equivale a ${kmlEquiv.toLocaleString("es-AR", { maximumFractionDigits: 2 })} km/l.` : `Equivale a ${l100.toLocaleString("es-AR", { maximumFractionDigits: 2 })} l/100 km.`)
                : undefined}>
              <input id="cons" inputMode="decimal" value={consumo} onChange={(e) => setConsumo(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" />
            </Campo>
            <Campo id="precio" label="Precio por litro ($)">
              <div className="peso"><span aria-hidden>$</span><input id="precio" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" /></div>
            </Campo>
            <Check id="iv" label="Ida y vuelta" checked={idaVuelta} onChange={setIdaVuelta} />
            <Campo id="pers" label="Personas (reparto)">
              <input id="pers" inputMode="numeric" value={personas} onChange={(e) => setPersonas(e.target.value.replace(/\D/g, ""))} />
            </Campo>
            <MoneyInput id="peajes" label="Peajes (opcional)" value={peajes} onChange={setPeajes} />
          </>
        )}

        {modo === "gnc" && (
          <>
            <Campo id="cn" label="Consumo nafta/gasoil (l/100 km)">
              <input id="cn" inputMode="decimal" value={consNafta} onChange={(e) => setConsNafta(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" />
            </Campo>
            <Campo id="pn" label="Precio nafta/gasoil ($/l)">
              <div className="peso"><span aria-hidden>$</span><input id="pn" inputMode="decimal" value={precioNafta} onChange={(e) => setPrecioNafta(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" /></div>
            </Campo>
            <Campo id="cg" label="Consumo GNC (m³/100 km)">
              <input id="cg" inputMode="decimal" value={consGnc} onChange={(e) => setConsGnc(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" />
            </Campo>
            <Campo id="pg" label="Precio GNC ($/m³)">
              <div className="peso"><span aria-hidden>$</span><input id="pg" inputMode="decimal" value={precioGnc} onChange={(e) => setPrecioGnc(e.target.value.replace(/[^\d,]/g, ""))} required aria-required="true" /></div>
            </Campo>
            <MoneyInput id="eq" label="Costo del equipo GNC (opcional)" value={equipo} onChange={setEquipo} />
          </>
        )}
      </form>

      {modo === "viaje" && viaje && (viaje.ok ? (
        <Resultado titulo="Costo del viaje" grande={pesos0(viaje.costo)}
          lineas={[
            { label: "Kilómetros totales", valor: viaje.kmTotales.toLocaleString("es-AR") },
            { label: "Litros", valor: viaje.litros.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
            { label: "Combustible", valor: pesos(viaje.costoCombustible) },
            ...(viaje.peajes > 0 ? [{ label: "Peajes", valor: pesos(viaje.peajes) }] : []),
            ...(viaje.personas > 1 ? [{ label: "Por persona", valor: pesos(viaje.costoPorPersona) }] : []),
            { label: "Total", valor: pesos(viaje.costo), total: true },
          ]} />
      ) : (
        <Err msg={viaje.error} />
      ))}

      {modo === "gnc" && gnc && (gnc.ok ? (
        <Resultado titulo={gnc.ahorro >= 0 ? "Ahorrás con GNC" : "Sale más caro el GNC"} grande={pesos0(Math.abs(gnc.ahorro))}
          lineas={[
            { label: `Nafta (${gnc.litrosNafta.toLocaleString("es-AR", { maximumFractionDigits: 2 })} l)`, valor: pesos(gnc.costoNafta) },
            { label: `GNC (${gnc.m3Gnc.toLocaleString("es-AR", { maximumFractionDigits: 2 })} m³)`, valor: pesos(gnc.costoGnc) },
            { label: "Ahorro en el tramo", valor: pesos(gnc.ahorro) },
            { label: "Ahorro por km", valor: pesos(gnc.ahorroPorKm) },
            ...(gnc.noSeRecupera
              ? [{ label: "Recupero del equipo", valor: "No se recupera con estos precios", total: true as const }]
              : gnc.kmRecupero != null
                ? [{ label: "Km para recuperar el equipo", valor: gnc.kmRecupero.toLocaleString("es-AR", { maximumFractionDigits: 1 }), total: true as const }]
                : []),
          ]}
          nota={gnc.noSeRecupera ? "Con estos precios y consumos el GNC no ahorra por kilómetro: el equipo no se recupera." : undefined} />
      ) : (
        <Err msg={gnc.error} />
      ))}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <section className="resultado" aria-labelledby="rt">
      <h2 id="rt" className="rot" style={{ fontFamily: "var(--f-txt)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
      <output className="grande" aria-live="polite" data-testid="resultado">Cargá los precios</output>
      <p className="nota">{msg}</p>
    </section>
  );
}
