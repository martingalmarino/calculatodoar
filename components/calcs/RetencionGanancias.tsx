"use client";
import { useState } from "react";
import Link from "next/link";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularRetencionGanancias, MESES_RETENCION, type MesRetencion } from "@/lib/calc/retencionGanancias";
import { pRetencion } from "@/lib/params";
import { parsePesos, pesos } from "@/lib/format";

const LABELS: Record<MesRetencion, string> = {
  enero: "Enero", febrero: "Febrero", marzo: "Marzo", abril: "Abril",
  mayo: "Mayo", junio: "Junio", julio: "Julio", agosto: "Agosto",
  septiembre: "Septiembre", octubre: "Octubre", noviembre: "Noviembre", diciembre: "Diciembre",
};

export default function RetencionGanancias() {
  const [mes, setMes] = useState<MesRetencion>("diciembre");
  const [bruto, setBruto] = useState("4.000.000");
  const [sacJunio, setSacJunio] = useState(true);
  const [sacEste, setSacEste] = useState(true);
  const [importeSac, setImporteSac] = useState("");
  const [conyuge, setConyuge] = useState(false);
  const [hijos, setHijos] = useState("0");
  const [hijosDisc, setHijosDisc] = useState("0");
  const [alq, setAlq] = useState("0");
  const [reli, setReli] = useState(false);
  const [otras, setOtras] = useState("0");
  const [retPrev, setRetPrev] = useState("");
  const [brutoAcumOv, setBrutoAcumOv] = useState("");
  const [aportesAcumOv, setAportesAcumOv] = useState("");

  const brutoN = parsePesos(bruto);
  const sacN = importeSac.trim() === "" ? brutoN : parsePesos(importeSac);

  const r = calcularRetencionGanancias(
    {
      mesPago: mes,
      brutoMensual: brutoN,
      sacJunio,
      sacEsteMes: sacEste,
      importeSac: sacN,
      conyuge,
      hijos: Number(hijos) || 0,
      hijosDiscapacidad: Number(hijosDisc) || 0,
      alquilerMensual: parsePesos(alq),
      alquilerReli: reli,
      otrasDeduccionesAcumuladas: parsePesos(otras),
      retencionesAnteriores: retPrev.trim() === "" ? null : parsePesos(retPrev),
      brutoAcumOverride: brutoAcumOv.trim() === "" ? null : parsePesos(brutoAcumOv),
      aportesAcumOverride: aportesAcumOv.trim() === "" ? null : parsePesos(aportesAcumOv),
    },
    pRetencion,
  );

  return (
    <div className="calc">
      <p className="nota" role="note">
        {pRetencion.avisoAlcance} Para el impuesto de todo el año usá la{" "}
        <Link href="/impuestos/ganancias/">calculadora de Ganancias</Link>.
      </p>
      <form className="campos" noValidate aria-label="Datos de retención de Ganancias" onSubmit={(e) => e.preventDefault()}>
        <Campo id="mes" label="Mes de pago" ayuda="Tabla acumulada del mes (ARCA). Vigencia declarada de esta actualización: julio a diciembre 2026.">
          <select id="mes" value={mes} onChange={(e) => {
            const m = e.target.value as MesRetencion;
            setMes(m);
            if (m === "diciembre") setSacEste(true);
            if (MESES_RETENCION.indexOf(m) >= 5) setSacJunio(true);
          }}>
            {MESES_RETENCION.map((m) => (
              <option key={m} value={m}>{LABELS[m]} 2026</option>
            ))}
          </select>
        </Campo>
        <MoneyInput id="bruto" label="Sueldo bruto mensual habitual" value={bruto} onChange={setBruto} />
        <Check id="sacJun" label="En junio cobré el aguinaldo" checked={sacJunio} onChange={setSacJunio} />
        <Check id="sacEste" label="En este mes también cobro el aguinaldo" checked={sacEste} onChange={setSacEste} />
        {sacEste && (
          <MoneyInput id="sacImp" label="Importe del SAC de este mes" value={importeSac === "" ? bruto : importeSac} onChange={setImporteSac} ayuda="Por defecto, un sueldo." />
        )}
        <Check id="conyuge" label="Cónyuge o conviviente a cargo" checked={conyuge} onChange={setConyuge} />
        <Campo id="hijos" label="Hijos a cargo">
          <input id="hijos" inputMode="numeric" value={hijos} onChange={(e) => setHijos(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <Campo id="hijosd" label="Hijos con discapacidad">
          <input id="hijosd" inputMode="numeric" value={hijosDisc} onChange={(e) => setHijosDisc(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <MoneyInput id="alq" label="Alquiler mensual de vivienda" value={alq} onChange={setAlq} ayuda="40% con tope en la GNI acumulada del mes." />
        <Check id="reli" label="Contrato registrado en RELI (+10%)" checked={reli} onChange={setReli} />
        <MoneyInput id="otras" label="Otras deducciones acumuladas al mes" value={otras} onChange={setOtras} ayuda="Art. 85 y similares: el total acumulado al mes de pago, sin prorrateo automático." />
        <MoneyInput id="retprev" label="Retenciones ya practicadas (hasta el mes anterior)" value={retPrev} onChange={setRetPrev} ayuda="Vacío = se estiman mes a mes con las mismas reglas." />

        <details>
          <summary>Modo avanzado: acumulados cargados a mano</summary>
          <MoneyInput id="brutoAcum" label="Ganancia bruta acumulada al mes" value={brutoAcumOv} onChange={setBrutoAcumOv} />
          <MoneyInput id="aportesAcum" label="Aportes acumulados al mes" value={aportesAcumOv} onChange={setAportesAcumOv} />
          <p className="ayuda">Si completás ambos, sustituyen la acumulación automática (sueldo constante).</p>
        </details>
      </form>

      {r.ok ? (
        <Resultado
          titulo="Retención de este pago"
          grande={pesos(r.retencion)}
          lineas={[
            { label: "Bruto de este pago", valor: pesos(r.brutoEstePago) },
            { label: "Aportes de este mes (17%)", valor: pesos(r.aportesEsteMes) },
            { label: "Ganancia bruta acumulada", valor: pesos(r.brutoAcum) },
            { label: "Aportes acumulados", valor: pesos(r.aportesAcum) },
            { label: "Deducciones art. 30 / alquiler / otras", valor: pesos(r.deducciones) },
            { label: "Ganancia neta sujeta a impuesto", valor: pesos(r.gni) },
            { label: "Impuesto acumulado (escala del mes)", valor: pesos(r.impuestoAcum) },
            {
              label: r.retencionesEstimadas ? "Retenciones anteriores (estimadas)" : "Retenciones anteriores (cargadas)",
              valor: pesos(r.retencionesAnteriores),
            },
            { label: "Retención de este pago", valor: pesos(r.retencion), total: true },
            { label: "Neto aproximado de este pago", valor: pesos(r.netoAprox) },
          ]}
          nota={
            <>
              {r.aviso} {pRetencion.topeAnsesNota} Si no marcás ninguna cuota de SAC, igual se provisiona 1/12 todos los meses.{" "}
              <Link href="/noticias/como-se-calcula-el-aguinaldo/">Cómo se calcula el aguinaldo</Link>.
            </>
          }
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
