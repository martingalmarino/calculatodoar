import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE, calcsDe, categoriasConContenido, destacadas, urlCalc } from "@/lib/content";
import { aguinaldo, ansesActual, tasaAportes } from "@/lib/data";
import { fechaAR, pct, pesos } from "@/lib/format";
import { abs, FECHA_MODIFICACION } from "@/lib/seo";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "calculalo", url: abs("/"), inLanguage: "es-AR",
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: abs("/buscar/?q={search_term_string}") }, "query-input": "required name=search_term_string" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "calculalo", url: SITE.url, logo: abs("/icon.svg") }} />
      <Header />
      <main id="contenido">
        <div className="wrap">
          <section className="hero" aria-labelledby="h1">
            <h1 id="h1">Hacé la cuenta.<br />Con la norma de este mes.</h1>
            <p className="bajada">Sueldo, aguinaldo, despido, Ganancias y monotributo, con los topes de ANSES y ARCA vigentes. Cada resultado dice de dónde sale.</p>
            <form className="buscar" role="search" action="/buscar/">
              <label htmlFor="q" className="saltar">Buscar calculadora</label>
              <input id="q" name="q" type="search" placeholder="¿Qué querés calcular? Ej.: aguinaldo" autoComplete="off" />
              <button>Buscar</button>
            </form>
          </section>
          <div className="dos">
            <section aria-labelledby="mas">
              <h2 id="mas">Calculadoras</h2>
              <ol className="ranking">
                {destacadas().map((c, i) => (
                  <li key={c.slug}><span className="pos">{i + 1}</span><span><Link href={urlCalc(c)}>{c.nombre}</Link><small>{c.resumen}</small></span></li>
                ))}
              </ol>
            </section>
            <aside className="valores" aria-labelledby="val">
              <h2 id="val">Valores vigentes</h2>
              <dl className="num">
                <dt>Tope ANSES ({ansesActual.periodoDevengado.split("-").reverse().join("/")})</dt><dd>{pesos(ansesActual.baseImponibleMaxima)}</dd>
                <dt>Base mínima</dt><dd>{pesos(ansesActual.baseImponibleMinima)}</dd>
                <dt>Aportes del trabajador</dt><dd>{pct(tasaAportes)}</dd>
                <dt>Vencimiento SAC 2º semestre</dt><dd>{aguinaldo.vencimientos.segundaCuota}</dd>
              </dl>
              <p>Fuente: {ansesActual.norma}. Revisado el {fechaAR(FECHA_MODIFICACION)}.</p>
            </aside>
          </div>
          <section aria-labelledby="cat">
            <h2 id="cat">Por tema</h2>
            <div className="cats">
              {categoriasConContenido().map((cat) => (
                <div className="cat" key={cat.slug}>
                  <h3><Link href={`/${cat.slug}/`}>{cat.nombre}</Link></h3>
                  <ul>{calcsDe(cat.slug).map((c) => <li key={c.slug}><Link href={urlCalc(c)}>{c.nombre}</Link></li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
