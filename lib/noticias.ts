import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const ROOT = process.cwd();
const DIR_NOTICIAS = path.join(ROOT, "content", "noticias");
const DIR_PUBLIC = path.join(ROOT, "public");

export const AUTOR_NOTICIAS = "Redacción Calculalo" as const;

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoFecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "fecha ISO YYYY-MM-DD");

const imagenSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1, "imagen.alt es obligatorio"),
  credito: z.string().min(1, "imagen.credito es obligatorio"),
  epigrafe: z.string().min(1, "imagen.epigrafe es obligatorio"),
  og: z.string().min(1),
});

const frontmatterSchema = z.object({
  titulo: z.string().min(1),
  volanta: z.string().min(1).optional(),
  bajada: z.string().min(1),
  slug: z.string().regex(slugRe, "slug en minúsculas y guiones"),
  tipo: z.enum(["actualidad", "guia"]),
  categoria: z.enum(["laboral", "impuestos", "finanzas", "hogar"]),
  fechaPublicacion: isoFecha,
  fechaActualizacion: isoFecha,
  autor: z.literal(AUTOR_NOTICIAS),
  borrador: z.boolean(),
  imagen: imagenSchema,
  calculadoraRelacionada: z.object({
    categoria: z.enum(["laboral", "impuestos", "finanzas", "hogar"]),
    slug: z.string().min(1),
  }),
  enPocasPalabras: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  fuentes: z.array(z.object({ titulo: z.string().min(1), url: z.string().url() })).min(1),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })),
});

export type NotaFrontmatter = z.infer<typeof frontmatterSchema>;

export type Nota = NotaFrontmatter & {
  volanta: string;
  cuerpo: string;
  archivo: string;
};

export const TIPO_LABEL: Record<NotaFrontmatter["tipo"], string> = {
  actualidad: "Actualidad",
  guia: "Guía",
};

export const CATEGORIA_LABEL: Record<NotaFrontmatter["categoria"], string> = {
  laboral: "Laboral",
  impuestos: "Impuestos",
  finanzas: "Finanzas",
  hogar: "Hogar y auto",
};

export function volantaPorDefecto(tipo: NotaFrontmatter["tipo"], categoria: NotaFrontmatter["categoria"]): string {
  return `${TIPO_LABEL[tipo]} · ${CATEGORIA_LABEL[categoria]}`;
}

export const urlNota = (slug: string) => `/noticias/${slug}/`;

export function imagenVariante(src: string, variante: "16x9" | "4x3" | "1x1" | "og"): string {
  return src.replace(/-(16x9|4x3|1x1|og)\.(webp|avif|jpe?g|png)$/i, `-${variante}.$2`);
}

export function minutosLectura(cuerpo: string): number {
  const palabras = cuerpo.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

export type FiltroNoticias = {
  categoria?: NotaFrontmatter["categoria"] | "";
  tipo?: NotaFrontmatter["tipo"] | "";
};

export function filtrarNotas(notas: Nota[], f: FiltroNoticias): Nota[] {
  return notas.filter((n) => {
    if (f.categoria && n.categoria !== f.categoria) return false;
    if (f.tipo && n.tipo !== f.tipo) return false;
    return true;
  });
}

export const PAGE_SIZE_LISTADO = 5;

/** Separa tapa (1), destacadas (hasta 2) y el resto para el listado paginado. */
export function partirPortada(notas: Nota[]) {
  const [tapa, ...rest] = notas;
  const destacadas = rest.slice(0, 2);
  const listado = rest.slice(2);
  return { tapa, destacadas, listado };
}

export function paginasListado(totalListado: number, pageSize = PAGE_SIZE_LISTADO): number {
  if (totalListado <= 0) return 0;
  return Math.ceil(totalListado / pageSize);
}

export function sliceListado(listado: Nota[], pagina: number, pageSize = PAGE_SIZE_LISTADO): Nota[] {
  const p = Math.max(1, pagina);
  const from = (p - 1) * pageSize;
  return listado.slice(from, from + pageSize);
}

export function urlPortada(pagina: number, f: FiltroNoticias = {}): string {
  const base = pagina <= 1 ? "/noticias/" : `/noticias/pagina-${pagina}/`;
  const q = new URLSearchParams();
  if (f.categoria) q.set("categoria", f.categoria);
  if (f.tipo) q.set("tipo", f.tipo);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Otras publicadas: misma categoría primero, luego por fecha. */
export function relacionadasDeNota(nota: Nota, max = 3): Nota[] {
  return getNotasPublicadas()
    .filter((n) => n.slug !== nota.slug)
    .sort((a, b) => {
      const ac = a.categoria === nota.categoria ? 0 : 1;
      const bc = b.categoria === nota.categoria ? 0 : 1;
      if (ac !== bc) return ac - bc;
      const fa = a.tipo === "guia" ? a.fechaActualizacion : a.fechaPublicacion;
      const fb = b.tipo === "guia" ? b.fechaActualizacion : b.fechaPublicacion;
      return fa < fb ? 1 : fa > fb ? -1 : 0;
    })
    .slice(0, max);
}

export function parseFiltroNoticias(sp: { categoria?: string; tipo?: string }): FiltroNoticias {
  const cats = ["laboral", "impuestos", "finanzas", "hogar"] as const;
  const tipos = ["actualidad", "guia"] as const;
  const categoria = cats.includes(sp.categoria as NotaFrontmatter["categoria"])
    ? (sp.categoria as NotaFrontmatter["categoria"])
    : "";
  const tipo = tipos.includes(sp.tipo as NotaFrontmatter["tipo"])
    ? (sp.tipo as NotaFrontmatter["tipo"])
    : "";
  return { categoria, tipo };
}

function rutaPublica(ruta: string): string {
  if (!ruta.startsWith("/")) throw new Error(`ruta de imagen debe empezar con /: ${ruta}`);
  return path.join(DIR_PUBLIC, ruta.slice(1));
}

function assertArchivoImagen(ruta: string, campo: string) {
  const abs = rutaPublica(ruta);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    throw new Error(`${campo}: no existe el archivo en public${ruta}`);
  }
}

/** Valida frontmatter + existencia de imágenes. Usable en tests con datos inventados. */
export function validarNota(
  data: unknown,
  opts: { archivoSlug: string; cuerpo?: string; archivo?: string },
): Nota {
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    throw new Error(`Nota inválida (${opts.archivoSlug}): ${msg}`);
  }
  const fm = parsed.data;
  if (fm.slug !== opts.archivoSlug) {
    throw new Error(`Nota inválida (${opts.archivoSlug}): slug "${fm.slug}" no coincide con el archivo`);
  }
  if (!fm.imagen) throw new Error(`Nota inválida (${opts.archivoSlug}): falta imagen`);
  assertArchivoImagen(fm.imagen.src, "imagen.src");
  assertArchivoImagen(fm.imagen.og, "imagen.og");

  return {
    ...fm,
    volanta: fm.volanta ?? volantaPorDefecto(fm.tipo, fm.categoria),
    cuerpo: (opts.cuerpo ?? "").trim(),
    archivo: opts.archivo ?? `${opts.archivoSlug}.md`,
  };
}

function listarArchivosMd(): string[] {
  if (!fs.existsSync(DIR_NOTICIAS)) return [];
  return fs
    .readdirSync(DIR_NOTICIAS)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();
}

function cargarArchivo(nombre: string): Nota {
  const archivo = path.join(DIR_NOTICIAS, nombre);
  const raw = fs.readFileSync(archivo, "utf8");
  const { data, content } = matter(raw);
  const archivoSlug = nombre.replace(/\.md$/, "");
  return validarNota(data, { archivoSlug, cuerpo: content, archivo: nombre });
}

let cache: Nota[] | null = null;

/** Todas las notas (incluye borradores). Valida en build/tests. */
export function getTodasLasNotas(): Nota[] {
  if (cache) return cache;
  cache = listarArchivosMd().map(cargarArchivo);
  return cache;
}

/** Fuerza releer el directorio (tests). */
export function resetNoticiasCache() {
  cache = null;
}

function fechaOrden(n: Nota): string {
  if (n.tipo === "guia" && n.fechaActualizacion > n.fechaPublicacion) return n.fechaActualizacion;
  return n.fechaPublicacion;
}

/** Notas publicadas, más recientes primero. */
export function getNotasPublicadas(): Nota[] {
  return getTodasLasNotas()
    .filter((n) => !n.borrador)
    .sort((a, b) => (fechaOrden(a) < fechaOrden(b) ? 1 : fechaOrden(a) > fechaOrden(b) ? -1 : 0));
}

/** Solo publicadas. */
export function getNotaPorSlug(slug: string): Nota | undefined {
  return getNotasPublicadas().find((n) => n.slug === slug);
}

/** Incluye borradores (tests / validación). */
export function getNotaFixture(slug: string): Nota | undefined {
  return getTodasLasNotas().find((n) => n.slug === slug);
}

/** Valida todas las notas del disco; tira si alguna falla. */
export function assertNoticiasValidas(): void {
  resetNoticiasCache();
  getTodasLasNotas();
}
