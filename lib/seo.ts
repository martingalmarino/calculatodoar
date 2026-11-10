import { SITE, urlCalc, type Calculadora, type CalcSlug, type Categoria } from "./content";
import { alquileres, icl, ipc, plazoFijo, prestamos, tasas, uva } from "./data";
import type { Miga } from "@/components/Migas";

/** Fecha en que se cargaron los datos de la tanda 2 (tras data:series). */
export const FECHA_MODIFICACION = "2026-11-10";
export const abs = (p: string) => `${SITE.url}${p}`;

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
