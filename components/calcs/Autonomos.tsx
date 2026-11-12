"use client";
import { useState } from "react";
import Link from "next/link";
import { Campo } from "../Campos";
import { Resultado } from "../Resultado";
import { calcularAutonomos } from "@/lib/calc/autonomos";
import { pAutonomos } from "@/lib/params";
import { fechaAR, pesos } from "@/lib/format";

const DEFAULT = "minima-III";

export default function Autonomos() {
  const [categoria, setCategoria] = useState(DEFAULT);
  const r = calcularAutonomos({ categoria }, pAutonomos);

  return (
    <div className="calc">
      <form className="campos" noValidate aria-label="Datos de autónomos" onSubmit={(e) => e.preventDefault()}>
        <Campo id="cat" label="Categoría" ayuda="Régimen actual (I–V e I′–V′) primero; categorías de revista A–J al final, para quien todavía revista ahí.">
          <select id="cat" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {pAutonomos.grupos.map((g) => (
              <optgroup key={g.id} label={g.nombre}>
                {g.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.etiqueta} — {pesos(c.importeMensual)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Campo>
      </form>
      {r.ok ? (
        <Resultado
          titulo="Aporte mensual"
          grande={pesos(r.aporte)}
          lineas={[
            { label: "Categoría", valor: r.categoria.etiqueta },
            { label: "Descripción", valor: r.categoria.descripcion },
            { label: "Vigencia", valor: `desde el ${fechaAR(r.vigenciaDesde)}` },
            { label: "Importe", valor: pesos(r.aporte), total: true },
          ]}
          nota={
            <>
              Si estás en el monotributo, la cuota es otra: usá la{" "}
              <Link href="/impuestos/monotributo/">calculadora de monotributo</Link>
              . Esta página no asesora el encuadre.
            </>
          }
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
