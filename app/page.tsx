import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { GrillaCalcs } from "@/components/TarjetaCalc";
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

/** Orden visual del catálogo (densas primero). Nav/footer siguen categoriasConContenido(). */
const ORDEN_CATALOGO: CategoriaSlug[] = ["laboral", "finanzas", "impuestos", "hogar"];

const atajosPosibles = [
  { label: "sueldo neto", cat: "laboral" as const, slug: "sueldo-neto" as const },
  { label: "alquiler", cat: "finanzas" as const, slug: "actualizacion-alquiler" as const },
  { label: "dólar", cat: "finanzas" as const, slug: "dolar-tarjeta" as const },
  { label: "aguinaldo", cat: "laboral" as const, slug: "aguinaldo" as const },
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
              <button type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                Buscar
              </button>
            </form>
            {atajos.length > 0 && (
              <p className="sugeridas">
                <span className="sugeridas-rotulo">Atajos:</span>
                {atajos.map((a) => (
                  <Link key={a.href} className="atajo" href={a.href}>{a.label}</Link>
                ))}
              </p>
            )}
          </section>

          <section className="catalogo" aria-label="Calculadoras por tema">
            {bloques.map((cat) => {
              const items = calcsDe(cat.slug);
              const n = items.length;
              return (
                <section className="categoria" key={cat.slug} id={cat.slug}>
                  <div className="cabeza">
                    <h2><Link href={`/${cat.slug}/`}>{cat.nombre}</Link></h2>
                    <span className="cuenta">{n} {n === 1 ? "calculadora" : "calculadoras"}</span>
                  </div>
                  <GrillaCalcs items={items.map((c) => ({ nombre: c.nombre, resumen: c.resumen, href: urlCalc(c) }))} />
                </section>
              );
            })}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
