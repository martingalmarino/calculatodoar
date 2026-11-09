import type { Procedencia } from "@/lib/data/schema";

const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

/** Vigencia y fuentes de los parámetros usados */
export function Fuentes({ sets }: { sets: Procedencia[] }) {
  return (
    <section id="fuentes" aria-labelledby="fu">
      <h2 id="fu">Fuentes y vigencia</h2>
      <ul>
        {sets.map((s) => (
          <li key={s.nombre}>
            <strong>{s.nombre}</strong>. Vigencia: {s.vigencia}. Consultado el {s.consultado}. Fuente:{" "}
            {s.fuentes.map((f, i) => <span key={f}>{i > 0 && ", "}<a href={f} rel="noopener" target="_blank">{host(f)}</a></span>)}.
          </li>
        ))}
      </ul>
    </section>
  );
}
