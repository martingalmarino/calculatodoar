"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularSueldoNeto } from "@/lib/calc/sueldoNeto";
import { anses, sueldoNeto } from "@/lib/data";
import { parsePesos, pesos, pesos0 } from "@/lib/format";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const nombreMes = (p: string) => { const [y, m] = p.split("-"); return `${MESES[Number(m) - 1]} ${y}`; };

export default function SueldoNeto() {
  const [bruto, setBruto] = useState("1.500.000");
  const [nr, setNr] = useState("0");
  const [sind, setSind] = useState("0");
  const [periodo, setPeriodo] = useState(anses.vigencias[anses.vigencias.length - 1].periodoDevengado);
  const v = anses.vigencias.find((x) => x.periodoDevengado === periodo)!;
  const a = sueldoNeto.aportesTrabajador;
  const r = calcularSueldoNeto({ bruto: parsePesos(bruto), noRemunerativo: parsePesos(nr), cuotaSindical: parsePesos(sind) / 100 }, { baseImponibleMaxima: v.baseImponibleMaxima, aportes: a });
  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del sueldo" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="bruto" label="Sueldo bruto remunerativo" ayuda="Lo que figura como total remunerativo en tu recibo." value={bruto} onChange={setBruto} />
        <MoneyInput id="nr" label="Montos no remunerativos" ayuda="Sumas fijas o bonos de convenio. Si no tenés, dejalo en 0." value={nr} onChange={setNr} />
        <Campo id="mes" label="Mes devengado" ayuda={`Hay topes cargados desde ${nombreMes(anses.vigencias[0].periodoDevengado)}. Para meses anteriores el resultado no es válido.`}>
          <select id="mes" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            {anses.vigencias.map((x) => <option key={x.periodoDevengado} value={x.periodoDevengado}>{nombreMes(x.periodoDevengado)} (tope {pesos(x.baseImponibleMaxima)})</option>)}
          </select>
        </Campo>
        <Campo id="sind" label="Cuota sindical (%)" ayuda="Según tu convenio. Si no estás afiliado, dejalo en 0.">
          <input id="sind" inputMode="decimal" value={sind} onChange={(e) => setSind(e.target.value.replace(/[^\d,]/g, ""))} />
        </Campo>
      </form>
      <Resultado titulo="Cobrás en mano" grande={pesos0(r.neto)}
        lineas={[
          { label: "Sueldo bruto", valor: pesos(r.bruto) },
          { label: `Jubilación (${a.jubilacionSIPA * 100}%)`, valor: `− ${pesos(r.jubilacion)}` },
          { label: `PAMI, Ley 19.032 (${a.leyPAMI19032 * 100}%)`, valor: `− ${pesos(r.pami)}` },
          { label: `Obra social (${a.obraSocial * 100}%)`, valor: `− ${pesos(r.obraSocial)}` },
          { label: "Cuota sindical", valor: `− ${pesos(r.sindical)}` },
          { label: "No remunerativo", valor: `+ ${pesos(r.noRemunerativo)}` },
          { label: "Neto", valor: pesos(r.neto), total: true },
        ]}
        nota={`${r.superaTope ? `Tu sueldo supera el tope: los aportes se calculan sobre ${pesos(v.baseImponibleMaxima)}. ` : ""}Antes de la retención de Ganancias.`} />
    </div>
  );
}
