import Image from "next/image";
import Link from "next/link";
import { getNotasPublicadas, miniaturaNota, urlNota, type Nota } from "@/lib/noticias";

function fechaBloque(nota: Nota): { label: string; datetime: string } {
  if (nota.tipo === "guia") {
    return { label: "Actualizada", datetime: nota.fechaActualizacion };
  }
  const [y, m, d] = nota.fechaPublicacion.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return { label: `${Number(d)} ${meses[Number(m) - 1]} ${y}`, datetime: nota.fechaPublicacion };
}

/** Hasta 3 publicadas. Si no hay, no renderiza nada. */
export function BloqueUltimas() {
  const notas = getNotasPublicadas().slice(0, 3);
  if (notas.length === 0) return null;

  return (
    <section className="bloque-noticias" aria-labelledby="bloque-noticias-tit">
      <div className="cabeza">
        <h2 id="bloque-noticias-tit">Noticias</h2>
        <Link className="ver-todas" href="/noticias/">Ver todas las noticias</Link>
      </div>
      <ul className="ultimas-notas">
        {notas.map((n) => {
          const f = fechaBloque(n);
          const thumb = miniaturaNota(n, "4x3");
          return (
            <li key={n.slug}>
              <Link href={urlNota(n.slug)}>
                <figure className="media media-4x3">
                  <Image src={thumb} alt={n.imagen.alt} width={800} height={600} sizes="88px" />
                </figure>
                <time className="fecha" dateTime={f.datetime}>{f.label}</time>
                <span className="titular">{n.titulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
