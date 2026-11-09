"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularGanancias } from "@/lib/calc/ganancias";
import { pGanancias } from "@/lib/params";
import { parsePesos, pct, pesos } from "@/lib/format";

export default function Ganancias() {
  const [bruto, setBruto] = useState("4.000.000");
  const [sac, setSac] = useState(true);
  const [conyuge, setConyuge] = useState(false);
  const [hijos, setHijos] = useState("0");
  const [alq, setAlq] = useState("0");
  const [reli, setReli] = useState(false);
  const [otras, setOtras] = useState("0");
  const r = calcularGanancias({ brutoMensual: parsePesos(bruto), incluirSac: sac, conyuge, hijos: Number(hijos) || 0, alquilerMensual: parsePesos(alq), alquilerReli: reli, otrasDeducciones: parsePesos(otras) }, pGanancias);
  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos para Ganancias" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="bruto" label="Sueldo bruto mensual" ayuda="Promedio del año. Se calcula sobre 12 meses, o 13 con aguinaldo." value={bruto} onChange={setBruto} />
        <Check id="sac" label="Sumar el aguinaldo" checked={sac} onChange={setSac} />
        <Check id="conyuge" label="Tengo cónyuge o conviviente a cargo" checked={conyuge} onChange={setConyuge} />
        <Campo id="hijos" label="Hijos a cargo"><input id="hijos" inputMode="numeric" value={hijos} onChange={(e) => setHijos(e.target.value.replace(/\D/g, ""))} /></Campo>
        <MoneyInput id="alq" label="Alquiler mensual de tu vivienda" ayuda="Deducís el 40%, con tope en la ganancia no imponible, si no sos dueño de ningún inmueble." value={alq} onChange={setAlq} />
        <Check id="reli" label="El contrato está registrado en RELI (+10%)" checked={reli} onChange={setReli} />
        <MoneyInput id="otras" label="Otras deducciones anuales" ayuda="Prepaga, seguros, intereses hipotecarios, servicio doméstico, con sus topes." value={otras} onChange={setOtras} />
      </form>
      <Resultado titulo="Impuesto anual estimado" grande={pesos(r.impuesto)}
        lineas={[
          { label: "Ganancia bruta anual", valor: pesos(r.brutoAnual) },
          { label: "Aportes (17%)", valor: `− ${pesos(r.aportes)}` },
          { label: "Deducciones personales y generales", valor: `− ${pesos(r.deducciones)}` },
          { label: "Ganancia neta imponible", valor: pesos(r.gni) },
          { label: "Promedio por mes", valor: pesos(r.promedioMensual) },
          { label: "Alícuota efectiva sobre el bruto", valor: pct(r.alicuotaEfectiva) },
          { label: "Impuesto anual", valor: pesos(r.impuesto), total: true },
        ]}
        nota="Con la escala y deducciones de la liquidación anual 2026. La retención de cada mes sigue la tabla acumulada del mes de pago y puede variar." />
    </div>
  );
}
