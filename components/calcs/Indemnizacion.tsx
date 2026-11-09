"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularIndemnizacion } from "@/lib/calc/indemnizacion";
import { pIndem } from "@/lib/params";
import { parsePesos, pesos, pesos0 } from "@/lib/format";

export default function Indemnizacion() {
  const [ingreso, setIngreso] = useState("2022-01-15");
  const [egreso, setEgreso] = useState("2026-10-20");
  const [rem, setRem] = useState("1.500.000");
  const [promedio, setPromedio] = useState("");
  const [prueba, setPrueba] = useState(true);
  const [preaviso, setPreaviso] = useState(false);
  const [vac, setVac] = useState("0");
  const prom = parsePesos(promedio);
  const r = calcularIndemnizacion({ ingreso, egreso, mejorRemuneracion: parsePesos(rem), superoPrueba: prueba, huboPreaviso: preaviso, topeConvenio: prom * 3, vacacionesGozadas: Number(vac) || 0 }, pIndem);
  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del despido" onSubmit={(e) => e.preventDefault()}>
        <Campo id="ingreso" label="Fecha de ingreso"><input id="ingreso" type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} /></Campo>
        <Campo id="egreso" label="Fecha de despido"><input id="egreso" type="date" value={egreso} onChange={(e) => setEgreso(e.target.value)} /></Campo>
        <MoneyInput id="rem" label="Mejor remuneración mensual, normal y habitual" ayuda="Del último año. Sin aguinaldo, vacaciones ni premios no mensuales." value={rem} onChange={setRem} />
        <MoneyInput id="prom" label="Salario promedio de tu convenio (opcional)" ayuda="El tope es 3 veces este promedio. Lo fijan las partes del convenio; si no lo conocés, dejalo vacío." value={promedio} onChange={setPromedio} />
        <Campo id="vac" label="Días de vacaciones ya gozados este año"><input id="vac" inputMode="numeric" value={vac} onChange={(e) => setVac(e.target.value.replace(/\D/g, ""))} /></Campo>
        <Check id="prueba" label="Ya había superado el período de prueba" checked={prueba} onChange={setPrueba} ayuda="En el período de prueba no corresponden antigüedad ni preaviso." />
        <Check id="preaviso" label="Me preavisaron el despido" checked={preaviso} onChange={setPreaviso} />
      </form>
      {r ? (
        <Resultado titulo="Te corresponde en total" grande={pesos0(r.total)}
          lineas={[
            { label: `Antigüedad, art. 245 (${r.aniosComputados} ${r.aniosComputados === 1 ? "sueldo" : "sueldos"} de ${pesos(r.base)})`, valor: pesos(r.antiguedad) },
            { label: "Preaviso, art. 231", valor: pesos(r.preaviso) },
            { label: "Integración del mes, art. 233", valor: pesos(r.integracion) },
            { label: "Días trabajados del mes", valor: pesos(r.diasMes) },
            { label: `Vacaciones no gozadas (${r.diasVacaciones.toFixed(1).replace(".", ",")} días)`, valor: pesos(r.vacaciones) },
            { label: "SAC proporcional", valor: pesos(r.sacProporcional) },
            { label: "SAC sobre preaviso e integración", valor: pesos(r.sacPreaviso) },
            { label: "Total", valor: pesos(r.total), total: true },
          ]}
          nota={`Antigüedad: ${r.anios} años y ${r.meses} meses.${prom > 0 && r.base < parsePesos(rem) ? " Se aplicó el tope de convenio con el piso del 67%." : ""} Montos brutos; la indemnización por antigüedad está exenta de Ganancias.`} />
      ) : (
        <section className="resultado"><output data-testid="resultado" className="grande">Revisá las fechas</output></section>
      )}
    </div>
  );
}
