import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertNoticiasValidas,
  getNotaFixture,
  getNotaPorSlug,
  getNotasPublicadas,
  getTodasLasNotas,
  miniaturaNota,
  resetNoticiasCache,
  urlNota,
  validarNota,
  volantaPorDefecto,
} from "../lib/noticias";

/** Imágenes reales de una nota publicada (el test solo exige que existan en public/). */
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
    src: "/noticias/imagenes/como-se-calcula-el-aguinaldo-16x9.webp",
    alt: "Ilustración de prueba sobre el aguinaldo.",
    credito: "Elaboración calculalo.",
    epigrafe: "Imagen de prueba para validar el schema.",
    og: "/noticias/imagenes/como-se-calcula-el-aguinaldo-og.webp",
  },
  calculadoraRelacionada: { categoria: "finanzas" as const, slug: "inflacion" },
  enPocasPalabras: ["Uno.", "Dos.", "Tres."] as [string, string, string],
  fuentes: [{ titulo: "INDEC", url: "https://www.indec.gob.ar/" }],
  faq: [] as { q: string; a: string }[],
};

test("el loader incluye los fixtures conocidos", () => {
  resetNoticiasCache();
  const todas = getTodasLasNotas();
  const agu = getNotaFixture("como-se-calcula-el-aguinaldo");
  const dni = getNotaFixture("dni-nuevas-tarifas-renaper");
  assert.ok(todas.some((n) => n.slug === "como-se-calcula-el-aguinaldo"));
  assert.ok(todas.some((n) => n.slug === "dni-nuevas-tarifas-renaper"));
  assert.ok(agu);
  assert.ok(dni);
  assert.equal(agu!.slug, "como-se-calcula-el-aguinaldo");
  assert.equal(agu!.archivo, "como-se-calcula-el-aguinaldo.md");
  assert.equal(agu!.tipo, "guia");
  assert.equal(agu!.autor, "Redacción Calculalo");
  assert.equal(dni!.slug, "dni-nuevas-tarifas-renaper");
  assert.equal(dni!.archivo, "dni-nuevas-tarifas-renaper.md");
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

  // Fixture en memoria: borrador: true nunca “sale” vía getNotaPorSlug / publicadas / sitemap
  const ficticia = validarNota({ ...baseOk, borrador: true }, { archivoSlug: "nota-de-prueba", cuerpo: "Cuerpo." });
  assert.equal(ficticia.borrador, true);
  assert.equal(ficticia.volanta, volantaPorDefecto("actualidad", "impuestos"));
  assert.equal(getNotasPublicadas().some((n) => n.slug === ficticia.slug), false);
  assert.equal(getNotaPorSlug(ficticia.slug), undefined);

  const { entradasSitemapNoticias, abs } = await import("../lib/seo");
  const urls = entradasSitemapNoticias().map((e) => e.url);
  assert.ok(urls.includes(abs("/noticias/")));
  assert.equal(urls.includes(abs(urlNota(ficticia.slug))), false, "sitemap no debería listar el borrador fixture");
  for (const n of borradores) {
    assert.equal(urls.includes(abs(urlNota(n.slug))), false, `sitemap no debería listar ${n.slug}`);
  }
  for (const n of vivos) {
    assert.ok(urls.includes(abs(urlNota(n.slug))), `sitemap debería listar ${n.slug}`);
  }

  const { generateStaticParams: paramsNota } = await import("../app/noticias/[slug]/page");
  const slugsParams = (await Promise.resolve(paramsNota())).map((p) => p.slug).sort();
  assert.deepEqual(slugsParams, vivos.map((n) => n.slug).sort());
  assert.equal(slugsParams.includes(ficticia.slug), false);
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

test("miniaturaNota cae a 16x9 si falta la variante", () => {
  const nota = validarNota({ ...baseOk, borrador: true }, { archivoSlug: "nota-de-prueba", cuerpo: "Cuerpo." });
  // Ruta inventada de variante: no existe en disco → fallback a imagen.src
  const sin4x3 = {
    ...nota,
    imagen: {
      ...nota.imagen,
      src: "/noticias/imagenes/como-se-calcula-el-aguinaldo-16x9.webp",
    },
  };
  // Forzamos una src cuya variante 4x3 no exista
  const ficticiaSrc = {
    ...nota,
    imagen: {
      ...nota.imagen,
      src: "/noticias/imagenes/nota-sin-miniatura-16x9.webp",
    },
  };
  // La 4x3 del aguinaldo sí existe
  assert.equal(miniaturaNota(sin4x3, "4x3"), "/noticias/imagenes/como-se-calcula-el-aguinaldo-4x3.webp");
  assert.equal(miniaturaNota(ficticiaSrc, "4x3"), "/noticias/imagenes/nota-sin-miniatura-16x9.webp");
});

test("schemaNota: NewsArticle para actualidad y Article para guía", async () => {
  const { schemaNota } = await import("../lib/seo");
  resetNoticiasCache();
  const todas = getTodasLasNotas();
  const actualidad = todas.find((n) => n.tipo === "actualidad") ?? getNotaFixture("dni-nuevas-tarifas-renaper");
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
