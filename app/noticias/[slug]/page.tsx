import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { NotaCompleta } from "@/components/noticias/NotaCompleta";
import { SITE } from "@/lib/content";
import { breadcrumbNota, faqPage, schemaNota } from "@/lib/seo";
import { getNotaPorSlug, getNotasPublicadas, urlNota } from "@/lib/noticias";

export const dynamicParams = false;

type P = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNotasPublicadas().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const nota = getNotaPorSlug(slug);
  if (!nota) return {};
  const canonical = `${SITE.url}${urlNota(nota.slug)}`;
  const image = {
    url: nota.imagen.og,
    width: 1200,
    height: 630,
    alt: nota.imagen.alt,
  };
  return {
    title: { absolute: `${nota.titulo} | calculalo` },
    description: nota.bajada,
    alternates: { canonical },
    openGraph: {
      title: nota.titulo,
      description: nota.bajada,
      url: canonical,
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: nota.titulo,
      description: nota.bajada,
      images: [image],
    },
  };
}

export default async function NotaPage({ params }: P) {
  const { slug } = await params;
  const nota = getNotaPorSlug(slug);
  if (!nota) notFound();

  return (
    <>
      <JsonLd data={schemaNota(nota)} />
      <JsonLd data={breadcrumbNota(nota)} />
      {nota.faq.length > 0 ? <JsonLd data={faqPage(nota.faq)} /> : null}
      <Header actual="noticias" />
      <main id="contenido">
        <NotaCompleta nota={nota} />
      </main>
      <Footer />
    </>
  );
}
