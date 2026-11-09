import type { MetadataRoute } from "next";
import { CALCULADORAS, CATEGORIAS, urlCalc } from "@/lib/content";
import { abs, FECHA_MODIFICACION } from "@/lib/seo";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${FECHA_MODIFICACION}T00:00:00-03:00`);
  return [
    { url: abs("/"), lastModified, priority: 1 },
    ...CATEGORIAS.map((c) => ({ url: abs(`/${c.slug}/`), lastModified, priority: 0.8 })),
    ...CALCULADORAS.map((c) => ({ url: abs(urlCalc(c)), lastModified, priority: 0.9 })),
  ];
}
