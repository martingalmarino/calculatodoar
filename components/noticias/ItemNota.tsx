import Image from "next/image";
import Link from "next/link";
import { fechaAR } from "@/lib/format";
import { imagenVariante, urlNota, type Nota } from "@/lib/noticias";
import { VolantaNota } from "./VolantaNota";

function fechaListado(nota: Nota): { label: string; datetime: string } {
  if (nota.tipo === "guia") {
    return { label: "Actualizada", datetime: nota.fechaActualizacion };
  }
  const [y, m, d] = nota.fechaPublicacion.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return {
    label: `${Number(d)} ${meses[Number(m) - 1]} ${y}`,
    datetime: nota.fechaPublicacion,
  };
}

export function ItemNota({ nota }: { nota: Nota }) {
  const thumb = imagenVariante(nota.imagen.src, "4x3");
  const f = fechaListado(nota);
  return (
    <li data-nota data-cat={nota.categoria} data-tipo={nota.tipo}>
      <Link className="item-nota" href={urlNota(nota.slug)}>
        <time className="fecha" dateTime={f.datetime}>{f.label}</time>
        <span className="item-cuerpo">
          <VolantaNota nota={nota} as="span" />
          <span className="titular">{nota.titulo}</span>
          <span className="bajada">{nota.bajada}</span>
        </span>
        <figure className="media media-4x3">
          <Image src={thumb} alt={nota.imagen.alt} width={800} height={600} sizes="120px" />
        </figure>
      </Link>
    </li>
  );
}

/** Fecha larga para meta de tapa/destacadas. */
export function metaFecha(nota: Nota): string {
  return fechaAR(nota.tipo === "guia" ? nota.fechaActualizacion : nota.fechaPublicacion);
}
