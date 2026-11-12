import Image from "next/image";
import Link from "next/link";
import { Migas } from "@/components/Migas";
import { SITE, getCalc, urlCalc } from "@/lib/content";
import { fechaLargaAR } from "@/lib/format";
import {
  minutosLectura,
  relacionadasDeNota,
  urlNota,
  type Nota,
} from "@/lib/noticias";
import { Compartir } from "./Compartir";
import { CuerpoNota } from "./CuerpoNota";
import { VolantaNota } from "./VolantaNota";

export function NotaCompleta({ nota }: { nota: Nota }) {
  const canonical = `${SITE.url}${urlNota(nota.slug)}`;
  const mins = minutosLectura(nota.cuerpo);
  const calc = getCalc(nota.calculadoraRelacionada.categoria, nota.calculadoraRelacionada.slug);
  const relacionadas = relacionadasDeNota(nota);
  const migas = [
    { nombre: "Inicio", href: "/" },
    { nombre: "Noticias", href: "/noticias/" },
    { nombre: nota.titulo, href: urlNota(nota.slug) },
  ];

  return (
    <div className="wrap">
      <Migas items={migas} />
      <header className="nota-cabeza">
        <VolantaNota nota={nota} />
        <h1 className="titular">{nota.titulo}</h1>
        <p className="bajada">{nota.bajada}</p>
        <figure className="figura-destacada">
          <div className="marco">
            <Image
              src={nota.imagen.src}
              alt={nota.imagen.alt}
              width={1600}
              height={900}
              sizes="(min-width:1100px) 42rem, 100vw"
              priority
            />
          </div>
          <figcaption>
            <span className="epigrafe">{nota.imagen.epigrafe}</span>
            <span className="credito">{nota.imagen.credito}</span>
          </figcaption>
        </figure>
        <p className="nota-meta-fila">
          <span>{nota.autor}</span>
          {nota.tipo === "actualidad" ? (
            <>
              <span>Publicada el <time dateTime={nota.fechaPublicacion}>{fechaLargaAR(nota.fechaPublicacion)}</time></span>
              <span>Actualizada el <time dateTime={nota.fechaActualizacion}>{fechaLargaAR(nota.fechaActualizacion)}</time></span>
              <span>{mins} min de lectura</span>
            </>
          ) : (
            <>
              <span>Actualizada el <time dateTime={nota.fechaActualizacion}>{fechaLargaAR(nota.fechaActualizacion)}</time></span>
              <span>{mins} min de lectura</span>
            </>
          )}
        </p>
        <Compartir url={canonical} titulo={nota.titulo} />
      </header>

      <section className="en-pocas" aria-labelledby="en-pocas">
        <h2 id="en-pocas">En pocas palabras</h2>
        <ol>
          {nota.enPocasPalabras.map((p) => <li key={p}>{p}</li>)}
        </ol>
      </section>

      <CuerpoNota markdown={nota.cuerpo} />

      {calc && (
        <aside className="caja-calc" aria-labelledby="caja-calc">
          <p className="rotulo">Calculadora relacionada</p>
          <h2 id="caja-calc">{calc.nombre}</h2>
          <p>{calc.resumen}</p>
          <Link className="boton" href={urlCalc(calc)}>Ir a la calculadora</Link>
        </aside>
      )}

      <section className="fuentes-nota" id="fuentes" aria-labelledby="fuentes-tit">
        <h2 id="fuentes-tit">Fuentes</h2>
        <ul>
          {nota.fuentes.map((f) => (
            <li key={f.url + f.titulo}>
              <a href={f.url} rel="noopener noreferrer" target="_blank">{f.titulo}</a>
            </li>
          ))}
        </ul>
      </section>

      {nota.faq.length > 0 && (
        <section className="nota-faq" aria-labelledby="faq-tit">
          <h2 id="faq-tit">Preguntas frecuentes</h2>
          <div className="preguntas">
            {nota.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {relacionadas.length > 0 && (
        <aside className="relacionadas-notas" aria-labelledby="rel-tit">
          <h2 id="rel-tit">Notas relacionadas</h2>
          <ul>
            {relacionadas.map((r) => (
              <li key={r.slug}><Link href={urlNota(r.slug)}>{r.titulo}</Link></li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
