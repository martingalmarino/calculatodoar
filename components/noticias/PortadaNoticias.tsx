import Image from "next/image";
import Link from "next/link";
import { Migas } from "@/components/Migas";
import {
  filtrarNotas,
  getNotasPublicadas,
  minutosLectura,
  paginasListado,
  partirPortada,
  sliceListado,
  urlNota,
  urlPortada,
  type FiltroNoticias,
  type Nota,
} from "@/lib/noticias";
import { Agenda } from "./Agenda";
import { Filtros } from "./Filtros";
import { ItemNota, metaFecha } from "./ItemNota";
import { VolantaNota } from "./VolantaNota";

function Tapa({ nota }: { nota: Nota }) {
  const mins = minutosLectura(nota.cuerpo);
  return (
    <article className="tapa-principal" data-nota data-cat={nota.categoria} data-tipo={nota.tipo}>
      <div className="tapa-texto">
        <VolantaNota nota={nota} />
        <h2 className="titular"><Link href={urlNota(nota.slug)}>{nota.titulo}</Link></h2>
        <p className="bajada">{nota.bajada}</p>
        <p className="meta-nota">
          {nota.autor} · <time dateTime={nota.fechaPublicacion}>{metaFecha(nota)}</time>
          {nota.tipo === "actualidad" ? ` · ${mins} min de lectura` : null}
        </p>
      </div>
      <Link className="media-link" href={urlNota(nota.slug)}>
        <figure className="media media-16x9">
          <Image src={nota.imagen.src} alt={nota.imagen.alt} width={1600} height={900} sizes="(min-width:900px) 45vw, 100vw" priority />
        </figure>
      </Link>
    </article>
  );
}

function Destacada({ nota }: { nota: Nota }) {
  return (
    <article className="destacada" data-nota data-cat={nota.categoria} data-tipo={nota.tipo}>
      <Link className="media-link" href={urlNota(nota.slug)}>
        <figure className="media media-16x9">
          <Image src={nota.imagen.src} alt={nota.imagen.alt} width={1600} height={900} sizes="(min-width:800px) 40vw, 100vw" />
        </figure>
      </Link>
      <VolantaNota nota={nota} />
      <h2 className="titular"><Link href={urlNota(nota.slug)}>{nota.titulo}</Link></h2>
      <p className="bajada">{nota.bajada}</p>
      <p className="meta-nota">
        {nota.autor} · <time dateTime={nota.tipo === "guia" ? nota.fechaActualizacion : nota.fechaPublicacion}>{metaFecha(nota)}</time>
      </p>
    </article>
  );
}

function Paginacion({ pagina, totalPaginas, filtro }: { pagina: number; totalPaginas: number; filtro: FiltroNoticias }) {
  if (totalPaginas <= 1) return null;
  const nums = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  return (
    <nav className="paginacion" aria-label="Paginación">
      {pagina > 1 && <Link href={urlPortada(pagina - 1, filtro)}>Anterior</Link>}
      {nums.map((n) =>
        n === pagina ? (
          <span key={n} aria-current="page">{n}</span>
        ) : (
          <Link key={n} href={urlPortada(n, filtro)}>{n}</Link>
        ),
      )}
      {pagina < totalPaginas && <Link href={urlPortada(pagina + 1, filtro)}>Siguiente</Link>}
    </nav>
  );
}

export function PortadaNoticias({ pagina, filtro }: { pagina: number; filtro: FiltroNoticias }) {
  const publicadas = getNotasPublicadas();
  const filtradas = filtrarNotas(publicadas, filtro);
  const vacioTotal = publicadas.length === 0;
  const vacioFiltro = !vacioTotal && filtradas.length === 0;
  const { tapa, destacadas, listado } = partirPortada(filtradas);
  const totalPaginas = Math.max(1, paginasListado(listado.length) || (filtradas.length ? 1 : 0));
  const paginaSegura = Math.min(Math.max(1, pagina), Math.max(1, totalPaginas));
  const listadoPagina = sliceListado(listado, paginaSegura);
  const esPagina1 = paginaSegura === 1;
  const hayFiltro = Boolean(filtro.categoria || filtro.tipo);

  const h1 = esPagina1 ? "Noticias" : `Noticias, página ${paginaSegura}`;
  const bajada = esPagina1
    ? "Normas, índices y guías para hacer la cuenta, con los números vigentes."
    : "Más notas y guías, con los números vigentes.";

  return (
    <div className="wrap">
      {!esPagina1 && (
        <Migas items={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Noticias", href: "/noticias/" },
          { nombre: `Página ${paginaSegura}`, href: urlPortada(paginaSegura, filtro) },
        ]} />
      )}
      <header className="noticias-cabeza">
        <h1>{h1}</h1>
        <p className="bajada">{bajada}</p>
      </header>

      {esPagina1 && tapa && (
        <section className="tapa" aria-label="Destacadas">
          <Tapa nota={tapa} />
          {destacadas.length > 0 && (
            <div className="destacadas">
              {destacadas.map((n) => <Destacada key={n.slug} nota={n} />)}
            </div>
          )}
        </section>
      )}

      <div className="noticias-cuerpo">
        <div>
          {esPagina1 && <Filtros filtro={filtro} />}

          {vacioTotal && (
            <p className="noticias-vacio">Todavía no hay notas publicadas.</p>
          )}
          {vacioFiltro && (
            <p className="noticias-vacio">No hay notas con estos filtros.</p>
          )}

          {listadoPagina.length > 0 && (
            <ol className="listado-noticias">
              {listadoPagina.map((n) => <ItemNota key={n.slug} nota={n} />)}
            </ol>
          )}

          {/* Si en página 1 solo hay tapa/destacadas y no listado, no mostrar lista vacía */}
          {!vacioTotal && !vacioFiltro && esPagina1 && !tapa && filtradas.length === 0 && null}

          <Paginacion
            pagina={paginaSegura}
            totalPaginas={paginasListado(listado.length)}
            filtro={filtro}
          />

          {hayFiltro && esPagina1 && !vacioTotal && (
            <p className="ayuda-filtro">
              <Link href="/noticias/">Ver todas las notas</Link>
            </p>
          )}
        </div>
        {esPagina1 && <Agenda />}
      </div>
    </div>
  );
}
