"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import {
  calcularAsignaciones,
  type CategoriaMono,
  type RegimenAsignaciones,
  type ZonaAaff,
} from "@/lib/calc/asignaciones";
import { pAsignaciones } from "@/lib/params";
import { parsePesos, pesos } from "@/lib/format";

const REGIMENES: { v: RegimenAsignaciones; label: string }[] = [
  { v: "aaff", label: "Relación de dependencia / LRT" },
  { v: "auh", label: "AUH / AUE" },
  { v: "monotributo", label: "Monotributo" },
];

const ZONAS: { v: ZonaAaff; label: string }[] = [
  { v: "general", label: "Valor general" },
  { v: "zona1", label: "Zona 1" },
  { v: "zona2", label: "Zona 2" },
  { v: "zona3", label: "Zona 3" },
  { v: "zona4", label: "Zona 4" },
];

const CATS: CategoriaMono[] = ["A", "B", "C", "D-G", "H-K"];

export default function AsignacionesFamiliares() {
  const [regimen, setRegimen] = useState<RegimenAsignaciones>("aaff");
  const [zona, setZona] = useState<ZonaAaff>("general");
  const [igf, setIgf] = useState("1.000.000");
  const [hijos, setHijos] = useState("1");
  const [disc, setDisc] = useState("0");
  const [prenatal, setPrenatal] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const [nacimiento, setNacimiento] = useState(false);
  const [matrimonio, setMatrimonio] = useState(false);
  const [adopcion, setAdopcion] = useState(false);
  const [topeIntegrante, setTopeIntegrante] = useState(false);
  const [cat, setCat] = useState<CategoriaMono>("A");

  const r = calcularAsignaciones(
    {
      regimen,
      zona,
      igf: parsePesos(igf),
      hijos: Number(hijos) || 0,
      hijosDiscapacidad: Number(disc) || 0,
      prenatal,
      ayudaEscolar: ayuda,
      nacimiento,
      matrimonio,
      adopcion,
      integranteSuperaTope: topeIntegrante,
      categoriaMono: cat,
    },
    pAsignaciones,
  );

  const zonasUi =
    regimen === "auh"
      ? ZONAS.filter((z) => z.v === "general" || z.v === "zona1")
      : regimen === "monotributo"
        ? []
        : ZONAS;

  const zonaDetalle =
    regimen === "aaff"
      ? pAsignaciones.zonasAnexoI[zona]?.detalle
      : regimen === "auh"
        ? pAsignaciones.zonasAnexoV[zona === "zona1" ? "zona1" : "general"]?.detalle
        : null;

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de asignaciones familiares" onSubmit={(e) => e.preventDefault()}>
        <Campo id="regimen" label="Régimen">
          <select
            id="regimen"
            value={regimen}
            onChange={(e) => {
              const v = e.target.value as RegimenAsignaciones;
              setRegimen(v);
              if (v === "auh" && zona !== "general" && zona !== "zona1") setZona("general");
            }}
          >
            {REGIMENES.map((x) => (
              <option key={x.v} value={x.v}>
                {x.label}
              </option>
            ))}
          </select>
        </Campo>

        {regimen === "monotributo" ? (
          <Campo id="cat" label="Categoría de monotributo">
            <select id="cat" value={cat} onChange={(e) => setCat(e.target.value as CategoriaMono)}>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>
        ) : (
          <Campo id="zona" label="Zona" ayuda={zonaDetalle ?? undefined}>
            <select id="zona" value={zona} onChange={(e) => setZona(e.target.value as ZonaAaff)}>
              {zonasUi.map((z) => (
                <option key={z.v} value={z.v}>
                  {z.label}
                </option>
              ))}
            </select>
          </Campo>
        )}

        {regimen !== "auh" && (
          <MoneyInput
            id="igf"
            label="Ingreso del grupo familiar (IGF)"
            value={igf}
            onChange={setIgf}
            ayuda={pAsignaciones.notaIgf}
          />
        )}

        <Campo id="hijos" label="Hijos a cargo">
          <input id="hijos" inputMode="numeric" value={hijos} onChange={(e) => setHijos(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <Campo id="disc" label="Hijos con discapacidad">
          <input id="disc" inputMode="numeric" value={disc} onChange={(e) => setDisc(e.target.value.replace(/\D/g, ""))} />
        </Campo>

        <Check id="prenatal" label={regimen === "auh" ? "Embarazo (AUE)" : "Prenatal"} checked={prenatal} onChange={setPrenatal} />
        <Check id="ayuda" label="Ayuda escolar anual" checked={ayuda} onChange={setAyuda} />
        <Check id="nac" label="Nacimiento (pago único)" checked={nacimiento} onChange={setNacimiento} />
        {regimen !== "auh" && (
          <Check id="mat" label="Matrimonio (pago único)" checked={matrimonio} onChange={setMatrimonio} />
        )}
        <Check id="adop" label="Adopción (pago único)" checked={adopcion} onChange={setAdopcion} />

        {(regimen === "aaff" || regimen === "monotributo") && (
          <Check
            id="topeInt"
            label={`Algún integrante supera ${pesos(pAsignaciones.topePorIntegrante)}`}
            checked={topeIntegrante}
            onChange={setTopeIntegrante}
            ayuda="Art. 4° Res. 303/2026. No aplica a hijo con discapacidad ni a la AUH."
          />
        )}
      </form>

      {r.ok ? (
        <Resultado
          titulo="Total mensual"
          grande={pesos(r.totalMensual)}
          lineas={[
            ...r.lineasMensuales.map((l) => ({ label: l.concepto, valor: pesos(l.monto) })),
            ...(r.auh
              ? [
                  { label: "Total AUH/AUE (100%)", valor: pesos(r.auh.total) },
                  { label: "Cobro mensual (80%)", valor: pesos(r.auh.cobroMensual) },
                  { label: "Retenido hasta acreditar (20%)", valor: pesos(r.auh.retenido) },
                ]
              : []),
            ...r.lineasAnuales.map((l) => ({ label: l.concepto, valor: pesos(l.monto) })),
            ...r.lineasUnicas.map((l) => ({ label: l.concepto, valor: pesos(l.monto) })),
            { label: "Total mensual (sin anuales ni pagos únicos)", valor: pesos(r.totalMensual), total: true },
          ]}
          nota={
            <>
              {pAsignaciones.notaIgf}{" "}
              {r.mensajes.length > 0 ? r.mensajes.join(" ") : null}{" "}
              Vigencia: haberes de noviembre de 2026 (Res. ANSES 303/2026).
            </>
          }
        />
      ) : (
        <section className="resultado" aria-labelledby="rt">
          <h2 id="rt" className="rot" style={{ fontFamily: "var(--fuente)", fontSize: "1rem", letterSpacing: 0 }}>
            Resultado
          </h2>
          <output className="grande" aria-live="polite" data-testid="resultado">
            Revisá los datos
          </output>
          <p className="nota">{r.error}</p>
        </section>
      )}
    </div>
  );
}
