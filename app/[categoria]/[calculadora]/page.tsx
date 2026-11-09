import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { Fuentes } from "@/components/Fuentes";
import SueldoNeto from "@/components/calcs/SueldoNeto";
import Aguinaldo from "@/components/calcs/Aguinaldo";
import Indemnizacion from "@/components/calcs/Indemnizacion";
import Ganancias from "@/components/calcs/Ganancias";
import Monotributo from "@/components/calcs/Monotributo";
import { CALCULADORAS, SITE, getCalc, getCategoria, urlCalc, type CalcSlug } from "@/lib/content";
import { EJEMPLOS } from "@/lib/ejemplos";
import { PROCEDENCIA } from "@/lib/data";
import { fechaAR } from "@/lib/format";
import { breadcrumb, faqPage, FECHA_MODIFICACION, webApp } from "@/lib/seo";

const COMPONENTES: Record<CalcSlug, () => React.JSX.Element> = { "sueldo-neto": SueldoNeto, aguinaldo: Aguinaldo, indemnizacion: Indemnizacion, ganancias: Ganancias, monotributo: Monotributo };

export const dynamicParams = false;
export const generateStaticParams = () => CALCULADORAS.map((c) => ({ categoria: c.categoria, calculadora: c.slug }));

type P = { params: Promise<{ categoria: string; calculadora: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { categoria, calculadora } = await params;
  const c = getCalc(categoria, calculadora);
  if (!c) return {};
  return { title: { absolute: c.title }, description: c.description, alternates: { canonical: urlCalc(c) }, openGraph: { title: c.title, description: c.description, url: urlCalc(c), type: "website" } };
}

export default async function CalcPage({ params }: P) {
  const { categoria, calculadora } = await params;
  const c = getCalc(categoria, calculadora);
  const cat = getCategoria(categoria);
  if (!c || !cat) notFound();
  const Calc = COMPONENTES[c.slug];
  const ej = EJEMPLOS[c.slug];
  const migas = [{ nombre: "Inicio", href: "/" }, { nombre: cat.nombre, href: `/${cat.slug}/` }, { nombre: c.nombre, href: urlCalc(c) }];
  return (
    <>
      <JsonLd data={webApp(c)} />
      <JsonLd data={faqPage(c.faq)} />
      <JsonLd data={breadcrumb(migas)} />
      <Header actual={cat.slug} />
      <main id="contenido">
        <div className="wrap">
          <Migas items={migas} />
          <h1>{c.h1}</h1>
          <p className="meta">Actualizada el <time dateTime={FECHA_MODIFICACION}>{fechaAR(FECHA_MODIFICACION)}</time> · <a href="#fuentes">Fuentes y vigencia</a></p>
          <p className="prosa">{c.intro}</p>
          <Calc />
          <p className="descargo">{SITE.descargo}</p>
          <div className="dos">
            <div className="prosa">
              <section aria-labelledby="como">
                <h2 id="como">Cómo se calcula</h2>
                <p className="formula">{c.formula}</p>
                <p className="aviso">{ej.aviso}</p>
                {ej.ejemplo && (<><h3>Ejemplo</h3><p>{ej.ejemplo}</p></>)}
              </section>
              <section aria-labelledby="pf">
                <h2 id="pf">Preguntas frecuentes</h2>
                {c.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
              </section>
              <Fuentes sets={ej.procedencia.map((k) => PROCEDENCIA[k])} />
            </div>
            <aside>
              <section className="grupo" aria-labelledby="sig">
                <h2 id="sig">Seguí con</h2>
                <ul className="relacionadas">
                  {c.relacionadas.map((r) => { const x = getCalc(r.categoria, r.slug)!; return <li key={x.slug}><Link href={urlCalc(x)}>{x.nombre}</Link></li>; })}
                  <li><Link href={`/${cat.slug}/`}>Todas las de {cat.nombre.toLowerCase()}</Link></li>
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
