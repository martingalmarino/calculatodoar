import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Render seguro del cuerpo Markdown (párrafos, H2, listas, links). */
export function CuerpoNota({ markdown }: { markdown: string }) {
  const html = marked.parse(markdown, { async: false }) as string;
  return <article className="nota-cuerpo" dangerouslySetInnerHTML={{ __html: html }} />;
}
