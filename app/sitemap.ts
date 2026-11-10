import type { MetadataRoute } from "next";
import { CALCULADORAS, categoriasConContenido, urlCalc } from "@/lib/content";
import { abs, dateModifiedDe, FECHA_MODIFICACION } from "@/lib/seo";

export const dynamic = "force-static";

const asDate = (iso: string) => new Date(`${iso}T00:00:00-03:00`);

export default function sitemap(): MetadataRoute.Sitemap {
  const hubDate = asDate(FECHA_MODIFICACION);
  return [
    { url: abs("/"), lastModified: hubDate, priority: 1 },
    ...categoriasConContenido().map((c) => ({ url: abs(`/${c.slug}/`), lastModified: hubDate, priority: 0.8 })),
    ...CALCULADORAS.filter((c) => categoriasConContenido().some((cat) => cat.slug === c.categoria)).map((c) => ({
      url: abs(urlCalc(c)),
      lastModified: asDate(dateModifiedDe(c)),
      priority: 0.9,
    })),
  ];
}
