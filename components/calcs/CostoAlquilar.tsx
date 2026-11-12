"use client";
import { useState } from "react";
import Link from "next/link";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import {
  calcularCostoAlquilar,
  type DestinoAlquiler,
  type JurisdiccionAlquiler,
  type ModoComision,
} from "@/lib/calc/costoAlquilar";
import { pCostoAlquilar } from "@/lib/params";
import { parsePesos, pct, pesos } from "@/lib/format";

export default function CostoAlquilar() {
  const [alquiler, setAlquiler] = useState("800.000");
  const [plazo, setPlazo] = useState("24");
  const [jurisdiccion, setJurisdiccion] = useState<JurisdiccionAlquiler>("cordoba");
  const [destino, setDestino] = useState<DestinoAlquiler>("vivienda");
  const [depositoMeses, setDepositoMeses] = useState("1");
  const [adelantado, setAdelantado] = useState(true);
  const [modoComision, setModoComision] = useState<ModoComision>("meses");
  const [mesesComision, setMesesComision] = useState("1");
  const [pctComision, setPctComision] = useState("0");
  const [expensas, setExpensas] = useState("0");
  const [viviendaUnica, setViviendaUnica] = useState(true);
  const [valuacion, setValuacion] = useState("1.000.000");
  const [alicuotaOtra, setAlicuotaOtra] = useState("0");
  const [exentoOtra, setExentoOtra] = useState(false);

  const r = calcularCostoAlquilar(
    {
      alquilerMensual: parsePesos(alquiler),
      plazoMeses: Number(plazo) || 0,
      jurisdiccion,
      destino,
      mesesDeposito: Number(depositoMeses) || 0,
      mesAdelantado: adelantado,
      modoComision,
      mesesComision: Number(mesesComision) || 0,
      porcentajeComision: (Number(pctComision.replace(",", ".")) || 0) / 100,
      expensas: parsePesos(expensas),
      viviendaUnicaPba: viviendaUnica,
      valuacionFiscal: parsePesos(valuacion),
      urbanoCordoba: destino !== "rural",
      alicuotaOtra: (Number(alicuotaOtra.replace(",", ".")) || 0) / 1000,
      exentoOtra,
    },
    pCostoAlquilar,
    pCostoAlquilar.notaComision,
  );

  const destinos: { v: DestinoAlquiler; label: string }[] =
    jurisdiccion === "caba"
      ? [
          { v: "vivienda", label: "Vivienda permanente" },
          { v: "comercial", label: "Comercial" },
          { v: "turismo", label: "Turístico / temporario" },
        ]
      : jurisdiccion === "pba"
        ? [
            { v: "vivienda", label: "Vivienda" },
            { v: "comercial", label: "Comercial" },
            { v: "turismo", label: "Turismo (≤ 3 meses)" },
          ]
        : jurisdiccion === "cordoba"
          ? [
              { v: "vivienda", label: "Vivienda / urbano" },
              { v: "comercial", label: "Comercial / urbano" },
              { v: "rural", label: "Rural" },
            ]
          : [
              { v: "vivienda", label: "Vivienda" },
              { v: "comercial", label: "Comercial" },
              { v: "turismo", label: "Turístico" },
            ];

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del costo de entrar a un alquiler" onSubmit={(e) => e.preventDefault()}>
        <MoneyInput id="alquiler" label="Alquiler mensual" value={alquiler} onChange={setAlquiler} />
        <Campo id="plazo" label="Plazo del contrato (meses)">
          <input id="plazo" inputMode="numeric" value={plazo} onChange={(e) => setPlazo(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <Campo id="jur" label="Jurisdicción">
          <select id="jur" value={jurisdiccion} onChange={(e) => setJurisdiccion(e.target.value as JurisdiccionAlquiler)}>
            <option value="caba">CABA</option>
            <option value="pba">Provincia de Buenos Aires</option>
            <option value="cordoba">Córdoba</option>
            <option value="otra">Otra (cargo el sello a mano)</option>
          </select>
        </Campo>
        <Campo id="destino" label="Destino">
          <select id="destino" value={destino} onChange={(e) => setDestino(e.target.value as DestinoAlquiler)}>
            {destinos.map((d) => (
              <option key={d.v} value={d.v}>
                {d.label}
              </option>
            ))}
          </select>
        </Campo>

        {jurisdiccion === "pba" && destino === "vivienda" && (
          <>
            <Check
              id="unica"
              label="Vivienda única, familiar y de ocupación permanente"
              checked={viviendaUnica}
              onChange={setViviendaUnica}
              ayuda="Define si aplica 0% o 5‰ según la valuación fiscal (art. 39 inc. 9.c/d)."
            />
            {viviendaUnica && (
              <MoneyInput id="val" label="Valuación fiscal" value={valuacion} onChange={setValuacion} />
            )}
          </>
        )}

        {jurisdiccion === "otra" && (
          <>
            <Check id="exOtra" label="Exento de sellos" checked={exentoOtra} onChange={setExentoOtra} />
            {!exentoOtra && (
              <Campo id="aliOtra" label="Alícuota de sellos (‰)" ayuda="Por mil. Ejemplo: 5 = 5‰.">
                <input
                  id="aliOtra"
                  inputMode="decimal"
                  value={alicuotaOtra}
                  onChange={(e) => setAlicuotaOtra(e.target.value.replace(/[^\d,.]/g, ""))}
                />
              </Campo>
            )}
          </>
        )}

        <Campo id="dep" label="Depósito (meses de alquiler)" ayuda="Práctica / pacto; no es una alícuota legal nacional.">
          <input id="dep" inputMode="decimal" value={depositoMeses} onChange={(e) => setDepositoMeses(e.target.value.replace(/[^\d,.]/g, ""))} />
        </Campo>
        <Check id="adel" label="Mes adelantado" checked={adelantado} onChange={setAdelantado} />

        <Seg
          name="modoCom"
          legend="Comisión inmobiliaria"
          value={modoComision}
          onChange={setModoComision}
          opciones={[
            { v: "meses", label: "Meses de alquiler" },
            { v: "porcentaje", label: "% del canon total" },
          ]}
        />
        <p className="ayuda" style={{ marginTop: 0 }}>
          {pCostoAlquilar.notaComision}
        </p>
        {modoComision === "meses" ? (
          <Campo id="comMeses" label="Meses de comisión" ayuda="Editable; puede ser 0.">
            <input
              id="comMeses"
              inputMode="decimal"
              value={mesesComision}
              onChange={(e) => setMesesComision(e.target.value.replace(/[^\d,.]/g, ""))}
            />
          </Campo>
        ) : (
          <Campo id="comPct" label="Porcentaje del canon (%)">
            <input
              id="comPct"
              inputMode="decimal"
              value={pctComision}
              onChange={(e) => setPctComision(e.target.value.replace(/[^\d,.]/g, ""))}
            />
          </Campo>
        )}

        <MoneyInput id="exp" label="Expensas adelantadas (opcional)" value={expensas} onChange={setExpensas} />
      </form>

      {r.ok ? (
        <Resultado
          titulo="Total a juntar"
          grande={pesos(r.total)}
          lineas={[
            { label: "Mes adelantado", valor: pesos(r.adelantado) },
            { label: "Depósito", valor: pesos(r.deposito) },
            { label: "Comisión inmobiliaria", valor: pesos(r.comision) },
            { label: "Expensas adelantadas", valor: pesos(r.expensas) },
            {
              label: r.sellosExento
                ? "Sellos (exento)"
                : `Sellos (${pct(r.sellosAlicuota)} sobre ${pesos(r.canonTotal)})`,
              valor: pesos(r.sellos),
            },
            { label: "Total a juntar", valor: pesos(r.total), total: true },
          ]}
          nota={
            <>
              {r.sellosMotivo} {r.notaComision} La base de sellos es el canon del contrato (
              {pesos(r.canonTotal)}). Para el ajuste del alquiler ya firmado usá la{" "}
              <Link href="/finanzas/actualizacion-alquiler/">calculadora de actualización de alquiler</Link>.
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
