"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularLiquidacionFinal, type MotivoLiquidacion } from "@/lib/calc/liquidacionFinal";
import { pLiquidacion } from "@/lib/params";
import { parsePesos, pesos, pesos0 } from "@/lib/format";

const MOTIVOS = pLiquidacion.motivos.map((m) => ({ v: m.clave as MotivoLiquidacion, label: m.nombre }));

export default function LiquidacionFinal() {
  const [motivo, setMotivo] = useState<MotivoLiquidacion>("renuncia");
  const [ingreso, setIngreso] = useState("2022-03-01");
  const [egreso, setEgreso] = useState("2026-11-15");
  const [rem, setRem] = useState("1.500.000");
  const [promedio, setPromedio] = useState("");
  const [preaviso, setPreaviso] = useState(false);
  const [vac, setVac] = useState("0");
  const [grat, setGrat] = useState("3.000.000");

  const prom = parsePesos(promedio);
  const r = calcularLiquidacionFinal({
    motivo,
    ingreso,
    egreso,
    mejorRemuneracion: parsePesos(rem),
    vacacionesGozadas: Number(vac) || 0,
    topeConvenio: prom * 3,
    huboPreaviso: preaviso,
    gratificacion: motivo === "mutuoAcuerdo" ? parsePesos(grat) : 0,
  }, pLiquidacion);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de la liquidación final" onSubmit={(e) => e.preventDefault()}>
        <Seg name="motivo" legend="Motivo de egreso" value={motivo} onChange={setMotivo} opciones={MOTIVOS} />
        <Campo id="ingreso" label="Fecha de ingreso">
          <input id="ingreso" type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} />
        </Campo>
        <Campo id="egreso" label="Fecha de egreso">
          <input id="egreso" type="date" value={egreso} onChange={(e) => setEgreso(e.target.value)} />
        </Campo>
        <MoneyInput id="rem" label="Mejor remuneración mensual, normal y habitual" ayuda="Del último año. Sin aguinaldo, vacaciones ni premios no mensuales." value={rem} onChange={setRem} />
        {(motivo === "despidoSinCausa") && (
          <MoneyInput id="prom" label="Salario promedio de tu convenio (opcional)" ayuda="El tope es 3 veces este promedio. Lo fijan las partes del convenio; si no lo conocés, dejalo vacío." value={promedio} onChange={setPromedio} />
        )}
        <Campo id="vac" label="Días de vacaciones ya gozados este año">
          <input id="vac" inputMode="numeric" value={vac} onChange={(e) => setVac(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        {motivo === "despidoSinCausa" && (
          <Check id="preaviso" label="Me preavisaron el despido" checked={preaviso} onChange={setPreaviso} />
        )}
        {motivo === "mutuoAcuerdo" && (
          <MoneyInput id="grat" label="Gratificación pactada" ayuda="Lo que acuerden las partes (art. 241)." value={grat} onChange={setGrat} />
        )}
      </form>

      {r.ok ? (
        <div>
          {motivo === "despidoConCausa" && (
            <p className="aviso" role="status">Si la causa no se puede probar, corresponde lo mismo que en un despido sin causa.</p>
          )}
          <Resultado titulo={`Liquidación: ${r.nombreMotivo}`} grande={pesos0(r.total)}
            lineas={[
              ...r.rubros.map((x) => ({
                label: x.clave === "vacacionesNoGozadas"
                  ? `${x.label} (${r.diasVacaciones.toFixed(1).replace(".", ",")} días)`
                  : x.label,
                valor: pesos(x.monto),
              })),
              { label: "Total", valor: pesos(r.total), total: true },
            ]}
            nota={[
              r.notaMotivo,
              "No sumamos SAC sobre vacaciones no gozadas (criterio del plenario CNAT «Tulosai», 2009).",
              r.preavisoTrabajador15dias ? "Dato: en renuncia el trabajador debe preavisar 15 días (art. 231 inc. a); la calculadora no lo descuenta." : null,
            ].filter(Boolean).join(" ")}
          />
          <table className="tabla" style={{ marginTop: "var(--s4)" }}>
            <caption className="saltar">Rubros y fundamento</caption>
            <thead>
              <tr>
                <th scope="col">Rubro</th>
                <th scope="col">Por qué</th>
                <th scope="col">Monto</th>
              </tr>
            </thead>
            <tbody>
              {r.rubros.map((x) => (
                <tr key={x.clave}>
                  <td>{x.label}</td>
                  <td>{x.porque}</td>
                  <td>{pesos(x.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="resultado" aria-labelledby="rt">
          <h2 id="rt" className="rot" style={{ fontFamily: "var(--f-txt)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
          <output className="grande" aria-live="polite" data-testid="resultado">Revisá los datos</output>
          <p className="nota">{r.error}</p>
        </section>
      )}
    </div>
  );
}
