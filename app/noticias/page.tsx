import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { PortadaNoticias } from "@/components/noticias/PortadaNoticias";
import { SITE } from "@/lib/content";
import { getNotasPublicadas, parseFiltroNoticias } from "@/lib/noticias";
import { PORTADA_NOTICIAS, collectionNoticias } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const tapa = getNotasPublicadas()[0];
  const canonical = `${SITE.url}${PORTADA_NOTICIAS.path}`;
  const base: Metadata = {
    title: { absolute: PORTADA_NOTICIAS.title },
    description: PORTADA_NOTICIAS.description,
    alternates: { canonical },
    openGraph: {
      title: PORTADA_NOTICIAS.name,
      description: PORTADA_NOTICIAS.description,
      url: canonical,
      type: "website",
    },
  };
  if (!tapa) return base;
  const image = {
    url: tapa.imagen.og,
    width: 1200,
    height: 630,
    alt: tapa.imagen.alt,
  };
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [image] },
    twitter: { card: "summary_large_image", title: PORTADA_NOTICIAS.name, description: PORTADA_NOTICIAS.description, images: [image] },
  };
}

type SP = Promise<{ categoria?: string; tipo?: string }>;

export default async function NoticiasPage({ searchParams }: { searchParams: SP }) {
  const filtro = parseFiltroNoticias(await searchParams);
  return (
    <>
      <JsonLd data={collectionNoticias()} />
      <Header actual="noticias" />
      <main id="contenido">
        <PortadaNoticias pagina={1} filtro={filtro} />
      </main>
      <Footer />
    </>
  );
}
