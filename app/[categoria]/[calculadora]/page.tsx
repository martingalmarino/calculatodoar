import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { Fuentes } from "@/components/Fuentes";
import { Prosa } from "@/components/Prosa";
import SueldoNeto from "@/components/calcs/SueldoNeto";
import Aguinaldo from "@/components/calcs/Aguinaldo";
import Indemnizacion from "@/components/calcs/Indemnizacion";
import Ganancias from "@/components/calcs/Ganancias";
import Monotributo from "@/components/calcs/Monotributo";
import ActualizacionAlquiler from "@/components/calcs/ActualizacionAlquiler";
import CuotasOContado from "@/components/calcs/CuotasOContado";
import DolarTarjeta from "@/components/calcs/DolarTarjeta";
import PlazoFijo from "@/components/calcs/PlazoFijo";
import Inflacion from "@/components/calcs/Inflacion";
import RendimientoBilleteras from "@/components/calcs/RendimientoBilleteras";
import Prestamos from "@/components/calcs/Prestamos";
import Combustible from "@/components/calcs/Combustible";
import Vacaciones from "@/components/calcs/Vacaciones";
import HorasExtras from "@/components/calcs/HorasExtras";
import LiquidacionFinal from "@/components/calcs/LiquidacionFinal";
import CostoLaboral from "@/components/calcs/CostoLaboral";
import { CALCULADORAS, SITE, getCalc, getCategoria, relacionadasDe, urlCalc, type CalcSlug } from "@/lib/content";
import { EJEMPLOS } from "@/lib/ejemplos";
import { PROCEDENCIA } from "@/lib/data";
import { fechaAR } from "@/lib/format";
import { breadcrumb, dateModifiedDe, faqPage, webApp } from "@/lib/seo";

const COMPONENTES: Partial<Record<CalcSlug, () => React.JSX.Element>> = {
  "sueldo-neto": SueldoNeto, aguinaldo: Aguinaldo, indemnizacion: Indemnizacion, ganancias: Ganancias, monotributo: Monotributo,
  "actualizacion-alquiler": ActualizacionAlquiler, "cuotas-o-contado": CuotasOContado, "dolar-tarjeta": DolarTarjeta,
  "plazo-fijo": PlazoFijo, inflacion: Inflacion, "rendimiento-billeteras": RendimientoBilleteras, prestamos: Prestamos,
  combustible: Combustible, vacaciones: Vacaciones, "horas-extras": HorasExtras, "liquidacion-final": LiquidacionFinal,
  "costo-laboral": CostoLaboral,
};

export const dynamicParams = false;
export const generateStaticParams = () => CALCULADORAS.map((c) => ({ categoria: c.categoria, calculadora: c.slug }));

type P = { params: Promise<{ categoria: string; calculadora: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { categoria, calculadora } = await params;
  const c = getCalc(categoria, calculadora);
  if (!c) return {};
  return { title: { absolute: c.title }, description: c.description, alternates: { canonical: urlCalc(c) }, openGraph: { title: c.title, description: c.description, url: urlCalc(c), type: "website" } };
}

function fechaVisible(c: NonNullable<ReturnType<typeof getCalc>>) {
  return dateModifiedDe(c);
}

export default async function CalcPage({ params }: P) {
  const { categoria, calculadora } = await params;
  const c = getCalc(categoria, calculadora);
  const cat = getCategoria(categoria);
  if (!c || !cat) notFound();
  const Calc = COMPONENTES[c.slug];
  const ej = EJEMPLOS[c.slug];
  if (!Calc || !ej) notFound();
  const migas = [{ nombre: "Inicio", href: "/" }, { nombre: cat.nombre, href: `/${cat.slug}/` }, { nombre: c.nombre, href: urlCalc(c) }];
  const descargo = c.descargo ?? cat.descargo ?? SITE.descargo;
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
          <p className="meta">Actualizada el <time dateTime={fechaVisible(c)}>{fechaAR(fechaVisible(c))}</time> · <a href="#fuentes">Fuentes y vigencia</a></p>
          <Prosa>{c.intro}</Prosa>
          <Calc />
          <p className="descargo">{descargo}</p>
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
                  {relacionadasDe(c).map((x) => <li key={x.slug}><Link href={urlCalc(x)}>{x.nombre}</Link></li>)}
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
