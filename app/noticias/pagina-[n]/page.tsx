import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PortadaNoticias } from "@/components/noticias/PortadaNoticias";
import { SITE } from "@/lib/content";
import {
  filtrarNotas,
  getNotasPublicadas,
  paginasListado,
  parseFiltroNoticias,
  partirPortada,
} from "@/lib/noticias";

export const dynamicParams = true;

type P = { params: Promise<{ n: string }>; searchParams: Promise<{ categoria?: string; tipo?: string }> };

export async function generateStaticParams() {
  const { listado } = partirPortada(getNotasPublicadas());
  const total = paginasListado(listado.length);
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { n } = await params;
  const pagina = Number(n);
  if (!Number.isInteger(pagina) || pagina < 2) return {};
  return {
    title: { absolute: `Noticias, página ${pagina} | calculalo` },
    description: "Más notas y guías de calculalo, con los números oficiales vigentes.",
    alternates: { canonical: `${SITE.url}/noticias/pagina-${pagina}/` },
  };
}

export default async function NoticiasPaginaN({ params, searchParams }: P) {
  const { n } = await params;
  const pagina = Number(n);
  if (!Number.isInteger(pagina) || pagina < 2) notFound();

  const filtro = parseFiltroNoticias(await searchParams);
  const { listado } = partirPortada(filtrarNotas(getNotasPublicadas(), filtro));
  const total = paginasListado(listado.length);
  if (total === 0 || pagina > total) notFound();

  return (
    <>
      <Header actual="noticias" />
      <main id="contenido">
        <PortadaNoticias pagina={pagina} filtro={filtro} />
      </main>
      <Footer />
    </>
  );
}
