import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertNoticiasValidas,
  getNotaFixture,
  getNotaPorSlug,
  getNotasPublicadas,
  getTodasLasNotas,
  resetNoticiasCache,
  urlNota,
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

test("el loader incluye los fixtures conocidos", () => {
  resetNoticiasCache();
  const todas = getTodasLasNotas();
  const ipc = getNotaFixture("indec-publica-ipc-octubre-2026");
  const agu = getNotaFixture("como-se-calcula-el-aguinaldo");
  assert.ok(todas.some((n) => n.slug === "indec-publica-ipc-octubre-2026"));
  assert.ok(todas.some((n) => n.slug === "como-se-calcula-el-aguinaldo"));
  assert.ok(ipc);
  assert.ok(agu);
  assert.equal(ipc!.borrador, true);
  assert.equal(ipc!.slug, "indec-publica-ipc-octubre-2026");
  assert.equal(ipc!.archivo, "indec-publica-ipc-octubre-2026.md");
  assert.equal(ipc!.autor, "Redacción Calculalo");
  assert.equal(ipc!.volanta, volantaPorDefecto("actualidad", "impuestos"));
  assert.equal(agu!.slug, "como-se-calcula-el-aguinaldo");
  assert.equal(agu!.archivo, "como-se-calcula-el-aguinaldo.md");
  assert.equal(agu!.tipo, "guia");
});

test("borradores no entran a publicadas, sitemap ni params estáticos", async () => {
  resetNoticiasCache();
  const todas = getTodasLasNotas();
  const publicadas = getNotasPublicadas();
  const borradores = todas.filter((n) => n.borrador);
  const vivos = todas.filter((n) => !n.borrador);

  for (const n of borradores) {
    assert.equal(publicadas.some((p) => p.slug === n.slug), false, `${n.slug} no debería publicarse`);
    assert.equal(getNotaPorSlug(n.slug), undefined, `${n.slug} no debería resolverse por slug`);
  }
  for (const n of vivos) {
    assert.ok(publicadas.some((p) => p.slug === n.slug), `${n.slug} debería estar publicada`);
    assert.ok(getNotaPorSlug(n.slug), `${n.slug} debería resolverse por slug`);
  }
  assert.deepEqual(
    publicadas.map((n) => n.slug).sort(),
    vivos.map((n) => n.slug).sort(),
  );

  // Con datos inventados: borrador: true nunca “sale” vía getNotaPorSlug / publicadas
  const ficticia = validarNota({ ...baseOk, borrador: true }, { archivoSlug: "nota-de-prueba", cuerpo: "Cuerpo." });
  assert.equal(ficticia.borrador, true);
  assert.equal(getNotasPublicadas().some((n) => n.slug === ficticia.slug), false);

  const { entradasSitemapNoticias, abs } = await import("../lib/seo");
  const urls = entradasSitemapNoticias().map((e) => e.url);
  assert.ok(urls.includes(abs("/noticias/")));
  for (const n of borradores) {
    assert.equal(urls.includes(abs(urlNota(n.slug))), false, `sitemap no debería listar ${n.slug}`);
  }
  for (const n of vivos) {
    assert.ok(urls.includes(abs(urlNota(n.slug))), `sitemap debería listar ${n.slug}`);
  }

  const { generateStaticParams: paramsNota } = await import("../app/noticias/[slug]/page");
  const slugsParams = (await Promise.resolve(paramsNota())).map((p) => p.slug).sort();
  assert.deepEqual(slugsParams, vivos.map((n) => n.slug).sort());
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

test("assertNoticiasValidas pasa con las notas actuales", () => {
  assert.doesNotThrow(() => assertNoticiasValidas());
});

test("schemaNota: NewsArticle para actualidad y Article para guía", async () => {
  const { schemaNota } = await import("../lib/seo");
  resetNoticiasCache();
  const todas = getTodasLasNotas();
  const actualidad = todas.find((n) => n.tipo === "actualidad") ?? getNotaFixture("indec-publica-ipc-octubre-2026");
  const guia = todas.find((n) => n.tipo === "guia") ?? getNotaFixture("como-se-calcula-el-aguinaldo");
  assert.ok(actualidad);
  assert.ok(guia);
  assert.equal(schemaNota(actualidad!)["@type"], "NewsArticle");
  assert.equal(schemaNota(guia!)["@type"], "Article");
  assert.ok(String(schemaNota(actualidad!).image).endsWith("-og.webp"));
  assert.ok(String(schemaNota(guia!).image).endsWith("-og.webp"));
});

test("partirPortada y filtros con lista vacía", async () => {
  const { filtrarNotas, partirPortada, paginasListado, urlPortada } = await import("../lib/noticias");
  const { AGENDA } = await import("../lib/agenda");
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
