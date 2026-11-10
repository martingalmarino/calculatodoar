import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { calcsDe, categoriasConContenido, getCategoria, urlCalc } from "@/lib/content";
import { breadcrumb, collection } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => categoriasConContenido().map((c) => ({ categoria: c.slug }));

type P = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = getCategoria((await params).categoria);
  if (!c) return {};
  return { title: { absolute: c.title }, description: c.description, alternates: { canonical: `/${c.slug}/` }, openGraph: { title: c.title, description: c.description, url: `/${c.slug}/` } };
}

export default async function CategoriaPage({ params }: P) {
  const cat = getCategoria((await params).categoria);
  if (!cat) notFound();
  const migas = [{ nombre: "Inicio", href: "/" }, { nombre: cat.nombre, href: `/${cat.slug}/` }];
  return (
    <>
      <JsonLd data={collection(cat)} />
      <JsonLd data={breadcrumb(migas)} />
      <Header actual={cat.slug} />
      <main id="contenido">
        <div className="wrap">
          <Migas items={migas} />
          <h1>{cat.title}</h1>
          <p className="prosa">{cat.intro}</p>
          <ul className="lista-calc">
            {calcsDe(cat.slug).map((c) => (
              <li key={c.slug}><h2><Link href={urlCalc(c)}>{c.nombre}</Link></h2><p>{c.resumen}</p></li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
