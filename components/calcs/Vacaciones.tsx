"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularVacaciones, diasHabilesAnio } from "@/lib/calc/vacaciones";
import { pVacaciones } from "@/lib/params";
import { parsePesos, pesos } from "@/lib/format";

type Tipo = "mensual" | "jornal";

export default function Vacaciones() {
  const [ingreso, setIngreso] = useState("2019-06-01");
  const [anio, setAnio] = useState("2026");
  const [tipo, setTipo] = useState<Tipo>("mensual");
  const [sueldo, setSueldo] = useState("1.500.000");
  const [jornal, setJornal] = useState("");
  const [medioAnio, setMedioAnio] = useState(false);
  const [diasTrab, setDiasTrab] = useState("");
  const [habilesManual, setHabilesManual] = useState("");

  const anioN = Number(anio) || new Date().getFullYear();
  const habApprox = diasHabilesAnio(anioN);
  const r = calcularVacaciones({
    fechaIngreso: ingreso,
    anio: anioN,
    tipo,
    sueldoMensual: tipo === "mensual" ? parsePesos(sueldo) : undefined,
    jornalDiario: tipo === "jornal" ? parsePesos(jornal) : undefined,
    diasTrabajadosEnElAnio: medioAnio && diasTrab !== "" ? Number(diasTrab) || 0 : null,
    diasHabilesDelAnio: habilesManual !== "" ? Number(habilesManual) || null : null,
  }, pVacaciones);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de vacaciones" onSubmit={(e) => e.preventDefault()}>
        <Campo id="ing" label="Fecha de ingreso">
          <input id="ing" type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} />
        </Campo>
        <Campo id="anio" label="Año de las vacaciones" ayuda="La antigüedad se mide al 31 de diciembre de ese año (art. 150).">
          <input id="anio" inputMode="numeric" value={anio} onChange={(e) => setAnio(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <Seg name="tipo" legend="Cómo te pagan" value={tipo} onChange={setTipo} opciones={[
          { v: "mensual", label: "Sueldo mensual" },
          { v: "jornal", label: "Jornal diario" },
        ]} />
        {tipo === "mensual" ? (
          <MoneyInput id="sue" label="Sueldo bruto mensual" value={sueldo} onChange={setSueldo} />
        ) : (
          <MoneyInput id="jor" label="Jornal diario" value={jornal} onChange={setJornal} />
        )}
        <Check
          id="medio"
          label="Trabajé menos de la mitad de los días hábiles del año"
          checked={medioAnio}
          onChange={setMedioAnio}
          ayuda={`Art. 151: si no llegás a la mitad, el art. 153 da 1 día cada 20 trabajados. Aprox. hábiles ${anioN}: ${habApprox} (mitad ${habApprox / 2}).`}
        />
        {medioAnio && (
          <>
            <Campo id="dt" label="Días trabajados en el año">
              <input id="dt" inputMode="numeric" value={diasTrab} onChange={(e) => setDiasTrab(e.target.value.replace(/\D/g, ""))} />
            </Campo>
            <Campo id="hab" label="Días hábiles del año (opcional)" ayuda="Si no lo cargás, usamos los lunes a viernes del calendario (sin restar feriados).">
              <input id="hab" inputMode="numeric" value={habilesManual} onChange={(e) => setHabilesManual(e.target.value.replace(/\D/g, ""))} />
            </Campo>
          </>
        )}
      </form>

      {r.ok ? (
        <div>
          <Resultado titulo="Vacaciones" grande={`${r.dias} días`}
            lineas={[
              { label: r.proporcional ? "Días (proporcional art. 153)" : "Días (art. 150)", valor: String(r.dias) },
              { label: "Valor por día", valor: pesos(r.valorDia) },
              { label: "Total bruto", valor: pesos(r.totalBruto) },
              { label: "Plus vacacional", valor: pesos(r.plus) },
              { label: `Aportes (${(pVacaciones.tasaAportes * 100).toLocaleString("es-AR")} %)`, valor: pesos(r.aportes) },
              { label: "Neto estimado", valor: pesos(r.neto), total: true },
            ]}
            nota={r.proporcional
              ? `Con ${r.diasTrabajados} días trabajados (menos de ${r.mitadHabiles} hábiles) aplican vacaciones proporcionales.`
              : `Plus = total con divisor 25 menos esos ${r.dias} días a sueldo ÷ 30.`}
          />
          <section className="grupo" style={{ marginTop: "var(--s4)" }} aria-labelledby="goce">
            <h2 id="goce" className="rot" style={{ fontFamily: "var(--f-txt)", fontSize: "1rem", letterSpacing: 0 }}>Goce (art. 154)</h2>
            <p className="nota">{pVacaciones.goceArt154}</p>
          </section>
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
