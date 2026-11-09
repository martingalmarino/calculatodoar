import { SITE, urlCalc, type Calculadora, type Categoria } from "./content";
import type { Miga } from "@/components/Migas";

export const FECHA_MODIFICACION = "2026-11-01";
export const abs = (p: string) => `${SITE.url}${p}`;

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
  applicationCategory: "FinanceApplication", operatingSystem: "Web", inLanguage: "es-AR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
  dateModified: FECHA_MODIFICACION,
});

export const collection = (c: Categoria) => ({
  "@context": "https://schema.org", "@type": "CollectionPage", name: c.title, url: abs(`/${c.slug}/`), description: c.description, dateModified: FECHA_MODIFICACION,
});
