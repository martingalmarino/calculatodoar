import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE,
  calcsDe,
  categoriasConContenido,
  getCalc,
  urlCalc,
  type CategoriaSlug,
} from "@/lib/content";
import { abs } from "@/lib/seo";

export const metadata = { alternates: { canonical: "/" } };

/** Orden visual del catálogo: densas arriba. Nav/footer siguen categoriasConContenido(). */
const ORDEN_CATALOGO: CategoriaSlug[] = ["laboral", "finanzas", "impuestos", "hogar"];

const atajosPosibles = [
  { label: "sueldo en mano", cat: "laboral" as const, slug: "sueldo-neto" as const },
  { label: "aumento de alquiler", cat: "finanzas" as const, slug: "actualizacion-alquiler" as const },
  { label: "dólar tarjeta", cat: "finanzas" as const, slug: "dolar-tarjeta" as const },
];

export default function Home() {
  const conContenido = categoriasConContenido();
  const bloques = ORDEN_CATALOGO
    .map((slug) => conContenido.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const atajos = atajosPosibles
    .map((a) => {
      const calc = getCalc(a.cat, a.slug);
      return calc ? { label: a.label, href: urlCalc(calc) } : null;
    })
    .filter((a): a is { label: string; href: string } => !!a);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "calculalo", url: abs("/"), inLanguage: "es-AR",
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: abs("/buscar/?q={search_term_string}") }, "query-input": "required name=search_term_string" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "calculalo", url: SITE.url, logo: abs("/icon.svg") }} />
      <Header />
      <main id="contenido">
        <div className="wrap">
          <section className="hero" aria-labelledby="h1">
            <h1 id="h1">Calculadoras online para tus cuentas de todos los días.</h1>
            <p className="bajada">Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.</p>
            <form className="buscar" role="search" action="/buscar/" method="get">
              <label htmlFor="q" className="saltar">Buscar calculadora</label>
              <input id="q" name="q" type="search" placeholder="¿Qué querés calcular?" autoComplete="off" />
              <button type="submit">Buscar</button>
            </form>
            {atajos.length > 0 && (
              <p className="sugeridas">
                Atajos:{" "}
                {atajos.map((a, i) => (
                  <span key={a.href}>
                    {i > 0 ? " · " : null}
                    <Link href={a.href}>{a.label}</Link>
                  </span>
                ))}
              </p>
            )}
          </section>

          <section className="catalogo" aria-label="Calculadoras por tema">
            <div className="tablero">
              {bloques.map((cat) => {
                const items = calcsDe(cat.slug);
                const n = items.length;
                return (
                  <div className="bloque" key={cat.slug}>
                    <div className="cabeza">
                      <h2><Link href={`/${cat.slug}/`}>{cat.nombre}</Link></h2>
                      <span className="cuenta">{n} {n === 1 ? "calculadora" : "calculadoras"}</span>
                    </div>
                    <ul className="lista">
                      {items.map((c) => (
                        <li key={c.slug}>
                          <Link href={urlCalc(c)}>
                            <span className="fila"><span className="nombre">{c.nombre}</span></span>
                            <span className="resumen">{c.resumen}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
