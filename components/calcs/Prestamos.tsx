"use client";
import { useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularPrestamoPersonal, calcularPrestamoUVA } from "@/lib/calc/prestamo";
import { rangoUVA } from "@/lib/data";
import { pPrestamo } from "@/lib/params";
import { fechaAR, parsePesos, pct, pesos, pesos0 } from "@/lib/format";

type Modo = "personal" | "uva";

const rem = pPrestamo.remInflacion12m;
const remMensual = rem ? (1 + rem.valor / 100) ** (1 / 12) - 1 : 0.01657;
const fmt = (n: number, d = 2) => n.toLocaleString("es-AR", { maximumFractionDigits: d, minimumFractionDigits: Math.min(d, 2) });
const hoyISO = () => {
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
  return iso > rangoUVA.ultima ? rangoUVA.ultima : iso < rangoUVA.primera ? rangoUVA.primera : iso;
};

function Cuadro({ filas, uva }: { filas: { n: number; interes: number; amortizacion: number; cuota: number; saldo: number; iva?: number; cuotaConIva?: number }[]; uva?: boolean }) {
  const primeras = filas.slice(0, 12);
  const ultima = filas.length > 12 ? filas[filas.length - 1] : null;
  const money = (n: number) => uva ? fmt(n, 4) : pesos(n);
  return (
    <details style={{ marginTop: "var(--s4)" }}>
      <summary>Cuadro de amortización</summary>
      <table className="tabla">
        <caption className="saltar">Primeras 12 cuotas{ultima ? " y la última" : ""}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Interés</th>
            <th scope="col">Amortización</th>
            {!uva && <th scope="col">IVA</th>}
            <th scope="col">Cuota</th>
            <th scope="col">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {primeras.map((f) => (
            <tr key={f.n}>
              <td>{f.n}</td>
              <td>{money(f.interes)}</td>
              <td>{money(f.amortizacion)}</td>
              {!uva && <td>{pesos(f.iva ?? 0)}</td>}
              <td>{money(f.cuotaConIva ?? f.cuota)}</td>
              <td>{money(f.saldo)}</td>
            </tr>
          ))}
          {ultima && (
            <tr>
              <td>{ultima.n}</td>
              <td>{money(ultima.interes)}</td>
              <td>{money(ultima.amortizacion)}</td>
              {!uva && <td>{pesos(ultima.iva ?? 0)}</td>}
              <td>{money(ultima.cuotaConIva ?? ultima.cuota)}</td>
              <td>{money(ultima.saldo)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </details>
  );
}

export default function Prestamos() {
  const ref = pPrestamo.tasaRefPersonales;
  const [modo, setModo] = useState<Modo>("personal");
  const [capital, setCapital] = useState(modo === "uva" ? "50.000.000" : "1.000.000");
  const [tna, setTna] = useState(ref ? String(ref.valor).replace(".", ",") : "60");
  const [cuotas, setCuotas] = useState("12");
  const [cft, setCft] = useState("");
  const [iva, setIva] = useState(true);
  const [fecha, setFecha] = useState(hoyISO());
  const [tnaUva, setTnaUva] = useState("4,5");
  const [cuotasUva, setCuotasUva] = useState("240");
  const [infl, setInfl] = useState(fmt(remMensual * 100, 3).replace(".", ","));
  const [ingreso, setIngreso] = useState("");

  const personal = calcularPrestamoPersonal({
    capital: parsePesos(capital),
    tna: parsePesos(tna) / 100,
    cuotas: Number(cuotas) || 0,
    sumarIVA: iva,
  }, pPrestamo);

  const uvaDes = pPrestamo.uvaEn(fecha);
  const uva = calcularPrestamoUVA({
    capital: parsePesos(capital),
    fechaDesembolso: fecha,
    tna: parsePesos(tnaUva) / 100,
    cuotas: Number(cuotasUva) || 0,
    inflacionMensualEsperada: parsePesos(infl) / 100,
    ingresoMensual: ingreso ? parsePesos(ingreso) : null,
  }, pPrestamo);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos del préstamo" onSubmit={(e) => e.preventDefault()}>
        <Seg name="modo" legend="Tipo" value={modo} onChange={(v) => {
          setModo(v);
          setCapital(v === "uva" ? "50.000.000" : "1.000.000");
          setCuotas(v === "uva" ? "240" : "12");
        }} opciones={[
          { v: "personal", label: "Personal en pesos" },
          { v: "uva", label: "Hipotecario UVA" },
        ]} />
        <MoneyInput id="cap" label="Capital" value={capital} onChange={setCapital} />
        {modo === "personal" ? (
          <>
            <Campo id="tna" label="TNA (%)" ayuda={ref ? `Promedio orientativo BCRA (${fechaAR(ref.fecha)}: ${fmt(ref.valor)} %). Tu banco cotiza otra.` : "Tasa que te cotiza el banco."}>
              <input id="tna" inputMode="decimal" value={tna} onChange={(e) => setTna(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Campo id="n" label="Cantidad de cuotas">
              <input id="n" inputMode="numeric" value={cuotas} onChange={(e) => setCuotas(e.target.value.replace(/\D/g, ""))} />
            </Campo>
            <Campo id="cft" label="CFT del banco (%)" ayuda="Opcional. No lo calculamos: faltan seguros y gastos.">
              <input id="cft" inputMode="decimal" value={cft} onChange={(e) => setCft(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Check id="iva" label="Sumar IVA 21% sobre intereses" checked={iva} onChange={setIva} ayuda={pPrestamo.ivaIntereses.aplica} />
          </>
        ) : (
          <>
            <Campo id="fecha" label="Fecha de desembolso" ayuda={`Serie UVA: ${fechaAR(rangoUVA.primera)} a ${fechaAR(rangoUVA.ultima)}.`}>
              <input id="fecha" type="date" min={rangoUVA.primera} max={rangoUVA.ultima} value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </Campo>
            {uvaDes != null && (
              <p className="ayuda" style={{ marginTop: 0 }}>UVA del {fechaAR(fecha)}: {fmt(uvaDes, 2)} (BCRA).</p>
            )}
            <Campo id="tnau" label="TNA (%)" ayuda="Tasa del crédito UVA que te ofrece el banco.">
              <input id="tnau" inputMode="decimal" value={tnaUva} onChange={(e) => setTnaUva(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <Campo id="nu" label="Cantidad de cuotas">
              <input id="nu" inputMode="numeric" value={cuotasUva} onChange={(e) => setCuotasUva(e.target.value.replace(/\D/g, ""))} />
            </Campo>
            <Campo id="infl" label="Inflación mensual esperada (%)" ayuda={rem ? `REM a 12 meses (${fmt(rem.valor)} % al ${fechaAR(rem.fecha)} → ${(remMensual * 100).toLocaleString("es-AR", { maximumFractionDigits: 3 })} % mensual). Editable.` : undefined}>
              <input id="infl" inputMode="decimal" value={infl} onChange={(e) => setInfl(e.target.value.replace(/[^\d,]/g, ""))} />
            </Campo>
            <MoneyInput id="ing" label="Ingreso mensual (opcional)" ayuda="Para ver la relación cuota/ingreso. El máximo lo fija cada banco." value={ingreso} onChange={setIngreso} />
          </>
        )}
      </form>

      {modo === "personal" && (personal.ok ? (
        <div>
          <Resultado titulo="Cuota mensual" grande={pesos0(personal.filas[0]?.cuotaConIva ?? personal.cuotaPura)}
            lineas={[
              { label: "Cuota pura (sin IVA)", valor: pesos(personal.cuotaPura) },
              { label: "Interés cuota 1", valor: pesos(personal.filas[0]?.interes ?? 0) },
              ...(personal.sumarIVA ? [
                { label: "IVA cuota 1", valor: pesos(personal.filas[0]?.iva ?? 0) },
                { label: "Cuota 1 con IVA", valor: pesos(personal.filas[0]?.cuotaConIva ?? 0) },
              ] : []),
              { label: "Intereses totales", valor: pesos(personal.intereses) },
              ...(personal.sumarIVA ? [{ label: "IVA total", valor: pesos(personal.ivaTotal) }] : []),
              ...(cft ? [{ label: "CFT informado por el banco", valor: `${fmt(parsePesos(cft))} %` }] : []),
              { label: "Total a pagar", valor: pesos(personal.total), total: true },
            ]}
            nota="El CFT del banco incluye seguros y gastos que acá no estimamos." />
          <Cuadro filas={personal.filas} />
        </div>
      ) : (
        <Err msg={personal.error} />
      ))}

      {modo === "uva" && (uva.ok ? (
        <div>
          <Resultado titulo="Cuota en pesos (hoy)" grande={pesos0(uva.cuotaPesosHoy)}
            lineas={[
              { label: `Capital en UVA (${fechaAR(uva.fechaDesembolso)})`, valor: fmt(uva.capitalUVA, 4) },
              { label: "Cuota en UVA", valor: fmt(uva.cuotaUVA, 4) },
              { label: `UVA hoy (${fechaAR(uva.uvaHoy.fecha)})`, valor: fmt(uva.uvaHoy.valor, 2) },
              { label: "Cuota en pesos hoy", valor: pesos(uva.cuotaPesosHoy) },
              ...uva.proyecciones.map((p) => ({
                label: `Cuota estimada a ${p.meses} meses`,
                valor: pesos(p.cuotaPesos),
              })),
              ...(uva.relacionCuotaIngreso != null ? [{ label: "Relación cuota/ingreso", valor: pct(uva.relacionCuotaIngreso), total: true as const }] : [{ label: "Intereses totales (UVA)", valor: fmt(uva.interesesUVA, 4), total: true as const }]),
            ]}
            nota={`La cuota UVA sube con la inflación. Si los salarios suben menos que los precios, la cuota pesa más en tu ingreso. Intereses de vivienda: ${pPrestamo.ivaIntereses.exencion}`} />
          <Cuadro filas={uva.filas} uva />
        </div>
      ) : (
        <Err msg={uva.error} />
      ))}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <section className="resultado" aria-labelledby="rt">
      <h2 id="rt" className="rot" style={{ fontFamily: "var(--f-txt)", fontSize: "1rem", letterSpacing: 0 }}>Resultado</h2>
      <output className="grande" aria-live="polite" data-testid="resultado">Revisá los datos</output>
      <p className="nota">{msg}</p>
    </section>
  );
}
