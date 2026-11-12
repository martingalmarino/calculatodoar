"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularIva, type IvaModo } from "@/lib/calc/iva";
import { pIva } from "@/lib/params";
import { parsePesos, pct, pesos, pesos0 } from "@/lib/format";

type AlicuotaKey = string;

const ALICUOTAS_UI = pIva.alicuotas.filter((a) => a.valor > 0);
const DEFAULT = ALICUOTAS_UI.find((a) => a.valor === 0.21) ?? ALICUOTAS_UI[0]!;

export default function Iva() {
  const [monto, setMonto] = useState("10.000");
  const [modo, setModo] = useState<IvaModo>("sumar");
  const [alic, setAlic] = useState<AlicuotaKey>(String(DEFAULT.valor));

  const alicuota = Number(alic);
  const r = calcularIva({ monto: parsePesos(monto), modo, alicuota });
  const etiqueta = ALICUOTAS_UI.find((a) => a.valor === alicuota)?.etiqueta ?? pct(alicuota);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del IVA" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="monto" label="Monto" ayuda="Precio neto o precio con IVA, según lo que elijas abajo." value={monto} onChange={setMonto} />
        <Seg
          name="modo"
          legend="El monto"
          value={modo}
          onChange={setModo}
          opciones={[
            { v: "sumar", label: "Es neto (quiero sumar el IVA)" },
            { v: "quitar", label: "Ya tiene IVA (quiero sacarlo)" },
          ]}
        />
        <Seg
          name="alicuota"
          legend="Alícuota"
          value={alic}
          onChange={setAlic}
          opciones={ALICUOTAS_UI.map((a) => ({ v: String(a.valor), label: a.etiqueta }))}
        />
      </form>
      {r.ok ? (
        <Resultado
          titulo={modo === "sumar" ? "Total con IVA" : "Neto sin IVA"}
          grande={pesos0(modo === "sumar" ? r.total : r.neto)}
          lineas={[
            { label: "Neto", valor: pesos(r.neto) },
            { label: `IVA (${etiqueta})`, valor: pesos(r.iva) },
            { label: "Total", valor: pesos(r.total), total: true },
            { label: "Alícuota aplicada", valor: etiqueta },
          ]}
          nota="Para sacar el IVA se divide por 1 + alícuota; no se resta el 21% del total."
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
