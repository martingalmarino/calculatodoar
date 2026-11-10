"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularHorasExtras } from "@/lib/calc/horasExtras";
import { pHorasExtras } from "@/lib/params";
import { parsePesos, pesos, pesos0 } from "@/lib/format";

type Modo = "mensual" | "jornal";

const r50 = pHorasExtras.recargos.find((x) => x.clave === "comun")!;
const r100 = pHorasExtras.recargos.find((x) => x.clave === "descanso")!;

export default function HorasExtras() {
  const [modo, setModo] = useState<Modo>("mensual");
  const [sueldo, setSueldo] = useState("1.500.000");
  const [horasMes, setHorasMes] = useState("200");
  const [adicionales, setAdicionales] = useState("");
  const [jornal, setJornal] = useState("");
  const [horasJornada, setHorasJornada] = useState(String(pHorasExtras.jornadaMaxima.diaria));
  const [h50, setH50] = useState("10");
  const [h100, setH100] = useState("4");
  const [conAnio, setConAnio] = useState(false);
  const [horasAnio, setHorasAnio] = useState("");

  const r = calcularHorasExtras({
    modo,
    sueldoMensual: modo === "mensual" ? parsePesos(sueldo) : undefined,
    horasMensualesNormales: Number(horasMes) || 0,
    adicionalesHabituales: adicionales === "" ? 0 : parsePesos(adicionales),
    jornalDiario: modo === "jornal" ? parsePesos(jornal) : undefined,
    horasJornada: Number(horasJornada) || pHorasExtras.jornadaMaxima.diaria,
    horas50: Number(h50) || 0,
    horas100: Number(h100) || 0,
    horasAnioAcumuladas: conAnio && horasAnio !== "" ? Number(horasAnio) || 0 : null,
  }, pHorasExtras);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de horas extras" onSubmit={(e) => e.preventDefault()}>
        <Seg name="modo" legend="Cómo te pagan" value={modo} onChange={setModo} opciones={[
          { v: "mensual", label: "Sueldo mensual" },
          { v: "jornal", label: "Jornal diario" },
        ]} />
        {modo === "mensual" ? (
          <>
            <MoneyInput id="sue" label="Sueldo bruto mensual" value={sueldo} onChange={setSueldo} />
            <Campo id="hm" label="Horas mensuales normales" ayuda="48 h semanales ≈ 200 h al mes; tu convenio puede usar otro número.">
              <input id="hm" inputMode="decimal" value={horasMes} onChange={(e) => setHorasMes(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <MoneyInput id="ad" label="Adicionales habituales (opcional)" value={adicionales} onChange={setAdicionales} />
          </>
        ) : (
          <>
            <MoneyInput id="jor" label="Jornal diario" value={jornal} onChange={setJornal} />
            <Campo id="hj" label="Horas de la jornada" ayuda={`Jornada máxima legal: ${pHorasExtras.jornadaMaxima.diaria} h diarias / ${pHorasExtras.jornadaMaxima.semanal} semanales (${pHorasExtras.jornadaMaxima.norma}).`}>
              <input id="hj" inputMode="decimal" value={horasJornada} onChange={(e) => setHorasJornada(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
          </>
        )}
        <Campo id="h50" label={`Horas al 50% (${r50.descripcion})`}>
          <input id="h50" inputMode="decimal" value={h50} onChange={(e) => setH50(e.target.value.replace(/[^\d,]/g, ""))} />
        </Campo>
        <Campo id="h100" label={`Horas al 100% (${r100.descripcion})`}>
          <input id="h100" inputMode="decimal" value={h100} onChange={(e) => setH100(e.target.value.replace(/[^\d,]/g, ""))} />
        </Campo>
        <Check id="anio" label="Controlar límite anual (200 h)" checked={conAnio} onChange={setConAnio} ayuda={`Límite ${pHorasExtras.limites.anual} h/año (${pHorasExtras.limites.norma}).`} />
        {conAnio && (
          <Campo id="ha" label="Horas extras acumuladas en el año (incluye este mes)">
            <input id="ha" inputMode="decimal" value={horasAnio} onChange={(e) => setHorasAnio(e.target.value.replace(/[^\d,]/g, ""))} />
          </Campo>
        )}
      </form>

      {r.ok ? (
        <div>
          <Resultado titulo="Total de horas extras" grande={pesos0(r.total)}
            lineas={[
              { label: "Valor de la hora normal", valor: pesos(r.valorHora) },
              { label: `Extras al 50% (${r.horas50} h × ${r.multiplicador50})`, valor: pesos(r.extra50) },
              { label: `Extras al 100% (${r.horas100} h × ${r.multiplicador100})`, valor: pesos(r.extra100) },
              { label: `Aportes (${(pHorasExtras.tasaAportes * 100).toLocaleString("es-AR")} %)`, valor: pesos(r.aportes) },
              { label: "Neto estimado", valor: pesos(r.neto), total: true },
            ]}
            nota={[
              r.alertaMensual ? `Superás el límite mensual del ${r.limites.norma} (${r.limites.mensual} h; cargaste ${r.horasMes}).` : null,
              r.alertaAnual ? `Superás el límite anual del ${r.limites.norma} (${r.limites.anual} h).` : null,
              pHorasExtras.bancoDeHoras,
              `Jornada máxima: ${pHorasExtras.jornadaMaxima.diaria} h diarias o ${pHorasExtras.jornadaMaxima.semanal} semanales (${pHorasExtras.jornadaMaxima.norma}).`,
            ].filter(Boolean).join(" ")}
          />
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
