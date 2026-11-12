import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertNoticiasValidas,
  getNotaFixture,
  getNotaPorSlug,
  getNotasPublicadas,
  getTodasLasNotas,
  resetNoticiasCache,
  validarNota,
  volantaPorDefecto,
} from "../lib/noticias";

const baseOk = {
  titulo: "Nota de prueba",
  bajada: "Una bajada.",
  slug: "nota-de-prueba",
  tipo: "actualidad" as const,
  categoria: "impuestos" as const,
  fechaPublicacion: "2026-11-11",
  fechaActualizacion: "2026-11-11",
  autor: "Redacción Calculalo" as const,
  borrador: true,
  imagen: {
    src: "/noticias/imagenes/ipc-octubre-2026-16x9.webp",
    alt: "Gráfico de prueba con datos del IPC.",
    credito: "Elaboración calculalo, con datos del INDEC.",
    epigrafe: "Variación mensual de prueba.",
    og: "/noticias/imagenes/ipc-octubre-2026-og.webp",
  },
  calculadoraRelacionada: { categoria: "finanzas" as const, slug: "inflacion" },
  enPocasPalabras: ["Uno.", "Dos.", "Tres."] as [string, string, string],
  fuentes: [{ titulo: "INDEC", url: "https://www.indec.gob.ar/" }],
  faq: [] as { q: string; a: string }[],
};

test("el loader lee los dos fixtures en borrador", () => {
  resetNoticiasCache();
  const todas = getTodasLasNotas();
  assert.equal(todas.length, 2);
  const ipc = getNotaFixture("indec-publica-ipc-octubre-2026");
  const agu = getNotaFixture("como-se-calcula-el-aguinaldo");
  assert.ok(ipc);
  assert.ok(agu);
  assert.equal(ipc!.borrador, true);
  assert.equal(agu!.borrador, true);
  assert.equal(ipc!.slug, "indec-publica-ipc-octubre-2026");
  assert.equal(agu!.slug, "como-se-calcula-el-aguinaldo");
  assert.equal(ipc!.archivo, "indec-publica-ipc-octubre-2026.md");
  assert.equal(agu!.archivo, "como-se-calcula-el-aguinaldo.md");
  assert.equal(ipc!.autor, "Redacción Calculalo");
  assert.equal(agu!.tipo, "guia");
  assert.equal(ipc!.volanta, volantaPorDefecto("actualidad", "impuestos"));
});

test("getNotasPublicadas no incluye borradores", () => {
  resetNoticiasCache();
  assert.deepEqual(getNotasPublicadas(), []);
  assert.equal(getNotaPorSlug("indec-publica-ipc-octubre-2026"), undefined);
  assert.equal(getNotaPorSlug("como-se-calcula-el-aguinaldo"), undefined);
});

test("slug debe coincidir con el archivo", () => {
  assert.throws(
    () => validarNota({ ...baseOk, slug: "otro-slug" }, { archivoSlug: "nota-de-prueba" }),
    /no coincide con el archivo/,
  );
});

test("falta imagen o alt tira", () => {
  const { imagen: _i, ...sinImagen } = baseOk;
  assert.throws(() => validarNota(sinImagen, { archivoSlug: "nota-de-prueba" }), /imagen|obligatorio|invalid/i);

  assert.throws(
    () => validarNota({ ...baseOk, imagen: { ...baseOk.imagen, alt: "" } }, { archivoSlug: "nota-de-prueba" }),
    /alt/i,
  );

  assert.throws(
    () => validarNota({ ...baseOk, imagen: { ...baseOk.imagen, src: "" } }, { archivoSlug: "nota-de-prueba" }),
    /src|imagen|too_small|String must contain/i,
  );

  assert.throws(
    () =>
      validarNota(
        { ...baseOk, imagen: { ...baseOk.imagen, src: "/noticias/imagenes/no-existe.webp" } },
        { archivoSlug: "nota-de-prueba" },
      ),
    /no existe/,
  );
});

test("autor distinto de Redacción Calculalo tira", () => {
  assert.throws(
    () => validarNota({ ...baseOk, autor: "Juan Pérez" }, { archivoSlug: "nota-de-prueba" }),
    /autor|Redacción|literal|Invalid/i,
  );
});

test("assertNoticiasValidas pasa con los fixtures actuales", () => {
  assert.doesNotThrow(() => assertNoticiasValidas());
});

test("sitemap de noticias incluye portada y excluye borradores", async () => {
  const { entradasSitemapNoticias, abs, schemaNota } = await import("../lib/seo");
  const urls = entradasSitemapNoticias().map((e) => e.url);
  assert.ok(urls.includes(abs("/noticias/")));
  assert.equal(urls.some((u) => u.includes("indec-publica-ipc-octubre-2026")), false);
  assert.equal(urls.some((u) => u.includes("como-se-calcula-el-aguinaldo")), false);

  const { getNotaFixture } = await import("../lib/noticias");
  const actualidad = getNotaFixture("indec-publica-ipc-octubre-2026")!;
  const guia = getNotaFixture("como-se-calcula-el-aguinaldo")!;
  assert.equal(schemaNota(actualidad)["@type"], "NewsArticle");
  assert.equal(schemaNota(guia)["@type"], "Article");
  assert.ok(String(schemaNota(actualidad).image).endsWith("-og.webp"));
});

test("partirPortada y filtros con cero publicadas", async () => {
  const { filtrarNotas, partirPortada, paginasListado, urlPortada } = await import("../lib/noticias");
  const { AGENDA } = await import("../lib/agenda");
  assert.equal(getNotasPublicadas().length, 0);
  const { tapa, destacadas, listado } = partirPortada([]);
  assert.equal(tapa, undefined);
  assert.equal(destacadas.length, 0);
  assert.equal(listado.length, 0);
  assert.equal(paginasListado(0), 0);
  assert.equal(filtrarNotas([], { categoria: "laboral" }).length, 0);
  assert.equal(urlPortada(1), "/noticias/");
  assert.equal(urlPortada(2, { tipo: "guia" }), "/noticias/pagina-2/?tipo=guia");
  assert.equal(AGENDA.length, 3);
  assert.equal(AGENDA.some((a) => /monotributo/i.test(a.texto)), false);
});

test("getNotaPorSlug no sirve borradores; params estáticos vacíos", async () => {
  assert.equal(getNotaPorSlug("indec-publica-ipc-octubre-2026"), undefined);
  assert.equal(getNotaPorSlug("como-se-calcula-el-aguinaldo"), undefined);
  assert.deepEqual(getNotasPublicadas().map((n) => n.slug), []);
  const { generateStaticParams: paramsNota } = await import("../app/noticias/[slug]/page");
  const { generateStaticParams: paramsPagina } = await import("../app/noticias/pagina-[n]/page");
  assert.deepEqual(await Promise.resolve(paramsNota()), []);
  assert.deepEqual(await Promise.resolve(paramsPagina()), []);
});
