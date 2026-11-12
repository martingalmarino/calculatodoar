import { SITE, urlCalc, type Calculadora, type CalcSlug, type Categoria } from "./content";
import { alquileres, icl, ipc, plazoFijo, prestamos, tasas, uva } from "./data";
import {
  CATEGORIA_LABEL,
  getNotasPublicadas,
  paginasListado,
  partirPortada,
  urlNota,
  type Nota,
} from "./noticias";
import type { Miga } from "@/components/Migas";

/** Fecha en que se cargaron los datos de la tanda 2 (tras data:series). */
export const FECHA_MODIFICACION = "2026-11-10";
export const abs = (p: string) => `${SITE.url}${p}`;

export const PORTADA_NOTICIAS = {
  name: "Noticias",
  title: "Noticias: normas, índices y guías para hacer la cuenta | calculalo",
  description:
    "Actualidad y guías de sueldo, impuestos, inflación, alquileres y monotributo, con los números oficiales vigentes. Cada nota enlaza a una calculadora.",
  path: "/noticias/",
} as const;

const maxFecha = (...fs: string[]) => fs.reduce((a, b) => (a > b ? a : b));

/** dateModified por calculadora: FECHA_MODIFICACION, o la fechaConsulta de series si es más reciente. */
export function dateModifiedDe(c: Calculadora): string {
  const series: Partial<Record<CalcSlug, string>> = {
    "actualizacion-alquiler": maxFecha(icl.fechaConsulta, ipc.fechaConsulta, alquileres.fechaConsulta),
    inflacion: ipc.fechaConsulta,
    "plazo-fijo": maxFecha(plazoFijo.fechaConsulta, uva.fechaConsulta, tasas.fechaConsulta),
    prestamos: maxFecha(prestamos.fechaConsulta, uva.fechaConsulta, tasas.fechaConsulta),
  };
  const d = series[c.slug];
  return d && d > FECHA_MODIFICACION ? d : FECHA_MODIFICACION;
}

export const breadcrumb = (items: Miga[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nombre, item: abs(m.href) })),
});

export const faqPage = (faq: { q: string; a: string }[]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const webApp = (c: Calculadora) => ({
  "@context": "https://schema.org", "@type": "WebApplication",
  name: c.h1, url: abs(urlCalc(c)), description: c.description,
  applicationCategory: c.categoria === "hogar" ? "UtilitiesApplication" : "FinanceApplication",
  operatingSystem: "Web", inLanguage: "es-AR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
  dateModified: dateModifiedDe(c),
});

export const collection = (c: Categoria) => ({
  "@context": "https://schema.org", "@type": "CollectionPage", name: c.title, url: abs(`/${c.slug}/`), description: c.description, dateModified: FECHA_MODIFICACION,
});

/** NewsArticle (actualidad) o Article (guía). Solo para notas publicadas. */
export function schemaNota(nota: Nota) {
  const pageUrl = abs(urlNota(nota.slug));
  const base = {
    "@context": "https://schema.org",
    "@type": nota.tipo === "actualidad" ? "NewsArticle" : "Article",
    headline: nota.titulo,
    description: nota.bajada,
    inLanguage: "es-AR",
    author: { "@type": "Organization", name: "Redacción Calculalo" },
    publisher: { "@type": "Organization", name: "calculalo", url: SITE.url },
    mainEntityOfPage: pageUrl,
    image: abs(nota.imagen.og),
    articleSection: CATEGORIA_LABEL[nota.categoria],
    dateModified: nota.fechaActualizacion,
  };
  if (nota.tipo === "actualidad") {
    return { ...base, datePublished: nota.fechaPublicacion };
  }
  // Guía: datePublished ayuda al buscador; la UI no lo muestra como fecha de tapa.
  return { ...base, datePublished: nota.fechaPublicacion };
}

export function breadcrumbNota(nota: Nota) {
  return breadcrumb([
    { nombre: "Inicio", href: "/" },
    { nombre: "Noticias", href: PORTADA_NOTICIAS.path },
    { nombre: nota.titulo, href: urlNota(nota.slug) },
  ]);
}

export function collectionNoticias() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PORTADA_NOTICIAS.name,
    url: abs(PORTADA_NOTICIAS.path),
    description: PORTADA_NOTICIAS.description,
    inLanguage: "es-AR",
    isPartOf: { "@type": "WebSite", name: "calculalo", url: SITE.url },
  };
}

/** Entradas de sitemap de la sección (sin borradores). */
export function entradasSitemapNoticias(): { url: string; lastModified: string; priority: number }[] {
  const notas = getNotasPublicadas();
  const lastPortada = notas.reduce((acc, n) => (n.fechaActualizacion > acc ? n.fechaActualizacion : acc), FECHA_MODIFICACION);
  const out: { url: string; lastModified: string; priority: number }[] = [
    { url: abs(PORTADA_NOTICIAS.path), lastModified: lastPortada, priority: 0.7 },
  ];
  for (const n of notas) {
    out.push({ url: abs(urlNota(n.slug)), lastModified: n.fechaActualizacion, priority: 0.65 });
  }
  const { listado } = partirPortada(notas);
  const total = paginasListado(listado.length);
  for (let p = 2; p <= total; p++) {
    out.push({ url: abs(`/noticias/pagina-${p}/`), lastModified: lastPortada, priority: 0.5 });
  }
  return out;
}
