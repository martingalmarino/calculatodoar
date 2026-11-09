"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularAguinaldo } from "@/lib/calc/aguinaldo";
import { pAguinaldo } from "@/lib/params";
import { parsePesos, pesos, pesos0 } from "@/lib/format";

export default function Aguinaldo() {
  const [rem, setRem] = useState("1.500.000");
  const [sem, setSem] = useState<"1" | "2">("2");
  const [ingreso, setIngreso] = useState("");
  const [egreso, setEgreso] = useState("");
  const r = calcularAguinaldo({ anio: 2026, semestre: sem === "1" ? 1 : 2, mejorRemuneracion: parsePesos(rem), ingreso: ingreso || undefined, egreso: egreso || undefined }, pAguinaldo);
  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del aguinaldo" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="rem" label="Mejor sueldo bruto del semestre" ayuda="El mayor total remunerativo mensual entre enero y junio, o entre julio y diciembre." value={rem} onChange={setRem} />
        <Seg name="sem" legend="Semestre de 2026" value={sem} onChange={setSem} opciones={[{ v: "1", label: "1º (junio)" }, { v: "2", label: "2º (diciembre)" }]} />
        <Campo id="ingreso" label="Fecha de ingreso (opcional)" ayuda="Solo si empezaste a trabajar dentro del semestre.">
          <input id="ingreso" type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} />
        </Campo>
        <Campo id="egreso" label="Fecha de egreso (opcional)" ayuda="Solo si dejaste de trabajar dentro del semestre.">
          <input id="egreso" type="date" value={egreso} onChange={(e) => setEgreso(e.target.value)} />
        </Campo>
      </form>
      <Resultado titulo={r.completo ? "Aguinaldo completo en mano" : "Aguinaldo proporcional en mano"} grande={pesos0(r.neto)}
        lineas={[
          { label: "Días trabajados", valor: `${r.diasTrabajados} de ${r.diasSemestre}` },
          { label: "Aguinaldo bruto", valor: pesos(r.bruto) },
          { label: "Aportes (17%)", valor: `− ${pesos(r.aportes)}` },
          { label: "Aguinaldo neto", valor: pesos(r.neto), total: true },
        ]}
        nota={`Proporcional sobre los ${r.diasSemestre} días reales del semestre. Antes de Ganancias.`} />
    </div>
  );
}
