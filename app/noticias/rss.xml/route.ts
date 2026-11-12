import { getNotasPublicadas, urlNota } from "@/lib/noticias";
import { abs, FECHA_MODIFICACION, PORTADA_NOTICIAS } from "@/lib/seo";

export const dynamic = "force-static";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(iso: string): string {
  return new Date(`${iso}T12:00:00-03:00`).toUTCString();
}

/** RSS de notas publicadas (más recientes primero). Los borradores no entran. */
export function GET() {
  const notas = getNotasPublicadas();
  const last = notas.reduce((acc, n) => (n.fechaActualizacion > acc ? n.fechaActualizacion : acc), FECHA_MODIFICACION);
  const items = notas.map((n) => {
    const link = abs(urlNota(n.slug));
    const pub = n.tipo === "guia" ? n.fechaActualizacion : n.fechaPublicacion;
    const og = abs(n.imagen.og);
    return `    <item>
      <title>${esc(n.titulo)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${rfc822(pub)}</pubDate>
      <description>${esc(n.bajada)}</description>
      <enclosure url="${esc(og)}" type="image/webp" length="0" />
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(`calculalo — ${PORTADA_NOTICIAS.name}`)}</title>
    <link>${esc(abs(PORTADA_NOTICIAS.path))}</link>
    <description>${esc(PORTADA_NOTICIAS.description)}</description>
    <language>es-ar</language>
    <lastBuildDate>${rfc822(last)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
