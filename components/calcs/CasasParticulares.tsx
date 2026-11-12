"use client";
import { useState } from "react";
import Link from "next/link";
import { MoneyInput } from "../MoneyInput";
import { Campo, Check, Seg } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularCasasParticulares, type CategoriaCasas, type ModalidadRetiro, type SituacionAportes } from "@/lib/calc/casasParticulares";
import { pCasas } from "@/lib/params";
import { parsePesos, pesos } from "@/lib/format";

const CATEGORIAS: { id: CategoriaCasas; label: string }[] = [
  { id: "supervision", label: "Supervisión" },
  { id: "tareas-especificas", label: "Tareas específicas" },
  { id: "caseros", label: "Caseros" },
  { id: "cuidado-personas", label: "Cuidado de personas" },
  { id: "tareas-generales", label: "Tareas generales" },
];

const SITUACIONES: { id: SituacionAportes; label: string }[] = [
  { id: "activo18", label: "Activo/a mayor de 18" },
  { id: "joven16a17", label: "De 16 a 17 años" },
  { id: "jubilado", label: "Jubilada/o" },
];

const TRAMO_LABEL: Record<string, string> = {
  menos12: "Menos de 12 horas",
  de12a16: "12 a menos de 16 horas",
  de16mas: "16 o más horas",
};

export default function CasasParticulares() {
  const [periodo, setPeriodo] = useState("2026-11");
  const [categoria, setCategoria] = useState<CategoriaCasas>("tareas-generales");
  const [modalidad, setModalidad] = useState<ModalidadRetiro>("con-retiro");
  const [forma, setForma] = useState<"hora" | "mensual">("mensual");
  const [horas, setHoras] = useState("48");
  const [anios, setAnios] = useState("0");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [zona, setZona] = useState(false);
  const [pacto, setPacto] = useState("");
  const [semestre, setSemestre] = useState<"1" | "2">("2");
  const [diasSac, setDiasSac] = useState("");
  const [situacion, setSituacion] = useState<SituacionAportes>("activo18");

  const modalidadEfectiva: ModalidadRetiro = categoria === "caseros" ? "sin-retiro" : modalidad;

  const r = calcularCasasParticulares(
    {
      periodo,
      categoria,
      modalidad: modalidadEfectiva,
      formaPago: forma,
      horasSemanales: Number(horas) || 0,
      aniosAntiguedad: fechaIngreso ? undefined : Number(anios) || 0,
      fechaIngreso: fechaIngreso || undefined,
      zonaDesfavorable: zona,
      pacto: pacto.trim() === "" ? null : parsePesos(pacto),
      anioSac: 2026,
      semestreSac: semestre === "1" ? 1 : 2,
      diasTrabajadosSac: diasSac.trim() === "" ? null : Number(diasSac),
      situacion,
    },
    pCasas,
  );

  const aportesMes = pCasas.aportes[periodo];
  const sinAportesPeriodo = aportesMes && !aportesMes.verificadoEnPdf;

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de casas particulares" onSubmit={(e) => e.preventDefault()}>
        <Campo id="periodo" label="Período" ayuda="Mes de la escala salarial y de la tabla de aportes ARCA.">
          <select id="periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            {pCasas.periodos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="categoria" label="Categoría">
          <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaCasas)}>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Campo>
        {categoria === "caseros" ? (
          <p className="ayuda">Caseros: la escala solo publica valores sin retiro.</p>
        ) : (
          <Seg
            name="retiro"
            legend="Modalidad"
            value={modalidad}
            onChange={setModalidad}
            opciones={[
              { v: "con-retiro", label: "Con retiro" },
              { v: "sin-retiro", label: "Sin retiro" },
            ]}
          />
        )}
        <Seg
          name="forma"
          legend="Forma de pago"
          value={forma}
          onChange={setForma}
          opciones={[
            { v: "mensual", label: "Mensual" },
            { v: "hora", label: "Por hora" },
          ]}
        />
        <Campo id="horas" label="Horas semanales" ayuda="Define el mínimo (regla de 24/48 h) y el tramo de aportes ARCA.">
          <input id="horas" inputMode="decimal" value={horas} onChange={(e) => setHoras(e.target.value.replace(/[^\d.,]/g, ""))} />
        </Campo>
        <Campo id="anios" label="Antigüedad (años desde el 1/9/2020)" ayuda="1 % por año sobre el salario mensual ya con zona, si aplica. Si cargás fecha de ingreso, se usa esa.">
          <input
            id="anios"
            inputMode="numeric"
            value={anios}
            disabled={!!fechaIngreso}
            onChange={(e) => setAnios(e.target.value.replace(/\D/g, ""))}
          />
        </Campo>
        <Campo id="ingreso" label="Fecha de ingreso (opcional)" ayuda="Si la completás, los años se cuentan desde el máximo entre esta fecha y el 1/9/2020.">
          <input id="ingreso" type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
        </Campo>
        <Check
          id="zona"
          label="Zona desfavorable (+31 %)"
          checked={zona}
          onChange={setZona}
          ayuda="La Pampa, Río Negro, Chubut, Neuquén, Santa Cruz, Tierra del Fuego, Antártida e Islas del Atlántico Sur, y Patagones (PBA)."
        />
        <MoneyInput id="pacto" label="Remuneración pactada (opcional)" value={pacto} onChange={setPacto} ayuda="Si es mayor al mínimo ajustado, el SAC y el costo se calculan sobre este importe." />
        <Seg
          name="sem"
          legend="Semestre del aguinaldo (2026)"
          value={semestre}
          onChange={setSemestre}
          opciones={[
            { v: "1", label: "1º (junio)" },
            { v: "2", label: "2º (diciembre)" },
          ]}
        />
        <Campo id="diasSac" label="Días trabajados en el semestre (opcional)" ayuda="Vacío = semestre completo. En el 2.º semestre de 2026 son 184 días.">
          <input id="diasSac" inputMode="numeric" value={diasSac} onChange={(e) => setDiasSac(e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <Campo id="situacion" label="Situación para aportes ARCA">
          <select id="situacion" value={situacion} onChange={(e) => setSituacion(e.target.value as SituacionAportes)}>
            {SITUACIONES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Campo>
      </form>

      {r.ok ? (
        <Resultado
          titulo="Costo del mes para quien emplea"
          grande={pesos(r.costoMensualEmpleador)}
          lineas={[
            { label: "Mínimo de escala (según horas)", valor: pesos(r.minimoEscala) },
            ...(r.zonaAplicada
              ? [
                  { label: "Adicional zona desfavorable (31%)", valor: pesos(r.adicionalZona) },
                  { label: "Subtotal con zona", valor: pesos(r.subtotalConZona) },
                ]
              : []),
            ...(r.aniosAntiguedad > 0
              ? [{ label: `Adicional antigüedad (${r.aniosAntiguedad} × 1%)`, valor: pesos(r.adicionalAntiguedad) }]
              : []),
            { label: "Mínimo ajustado", valor: pesos(r.minimoAjustado) },
            ...(r.pacto != null ? [{ label: "Pacto cargado", valor: pesos(r.pacto) }] : []),
            { label: "Remuneración del mes", valor: pesos(r.remuneracion) },
            {
              label: r.sacCompleto
                ? "Medio aguinaldo (semestre completo)"
                : `Medio aguinaldo (${r.diasTrabajadosSac} de ${r.diasSemestreSac} días)`,
              valor: pesos(r.medioSac),
            },
            { label: "Tramo de horas (F. 102)", valor: TRAMO_LABEL[r.tramo] },
            ...(r.aportesDisponibles && r.aportes
              ? [
                  { label: "Aportes (Agentes de Seguro de Salud)", valor: pesos(r.aportes.aportesSalud) },
                  { label: "Contribuciones (SIPA)", valor: pesos(r.aportes.contribucionesSipa) },
                  { label: "Cuota ART", valor: pesos(r.aportes.cuotaArt) },
                  { label: "Importe a pagar (ARCA)", valor: pesos(r.aportes.importeAPagar) },
                ]
              : [{ label: "Aportes ARCA", valor: "sin tabla publicada para este mes" }]),
            { label: "Costo mensual (remuneración + ARCA)", valor: pesos(r.costoMensualEmpleador), total: true },
            { label: "Vacaciones (días corridos, art. 29)", valor: `${r.diasVacaciones} días` },
          ]}
          nota={
            <>
              {r.notaConversion} El medio aguinaldo se paga en la última jornada laboral de junio y de diciembre (Ley 26.844 arts. 26–27), no el 18/12 de la LCT.{" "}
              {r.aportesDisponibles
                ? "Quien emplea suele depositar el total del F. 102 y descontar del recibo los aportes a cargo de la persona trabajadora."
                : sinAportesPeriodo
                  ? "Todavía no hay PDF de aportes de este mes en ARCA: el costo no suma un importe inventado. Si necesitás el F. 102, elegí noviembre u octubre."
                  : null}{" "}
              Días de vacaciones: informativos; no se liquida el plus del 30% del art. 32.{" "}
              Más sobre el SAC en régimen general:{" "}
              <Link href="/laboral/aguinaldo/">calculadora de aguinaldo</Link>.
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
