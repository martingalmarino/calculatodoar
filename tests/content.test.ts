import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CALCULADORAS,
  CATEGORIAS,
  DESTACADAS,
  RELACIONADAS_PLAN,
  categoriasConContenido,
  relacionadasDe,
} from "../lib/content";

test("categorias vacías no aparecen en el nav/sitemap", () => {
  const con = categoriasConContenido().map((c) => c.slug);
  assert.deepEqual(con, ["laboral", "impuestos", "finanzas", "hogar"]);
  assert.ok(CATEGORIAS.some((c) => c.slug === "hogar"));
  assert.ok(con.includes("hogar"));
});

test("relacionadas omiten calculadoras que aún no existen", () => {
  for (const c of CALCULADORAS) {
    const visibles = relacionadasDe(c);
    assert.ok(visibles.length <= 3);
    for (const r of visibles) {
      assert.ok(CALCULADORAS.some((x) => x.slug === r.slug && x.categoria === r.categoria), `${c.slug} → ${r.slug}`);
    }
  }
  const sueldo = CALCULADORAS.find((c) => c.slug === "sueldo-neto")!;
  assert.ok(sueldo.relacionadas.some((r) => r.slug === "costo-laboral"));
  assert.ok(relacionadasDe(sueldo).some((r) => r.slug === "costo-laboral"));
});

test("plan de relacionadas futuras no supera 3 ni se autoenlaza", () => {
  for (const [slug, lista] of Object.entries(RELACIONADAS_PLAN)) {
    assert.ok(lista!.length <= 3, slug);
    assert.ok(!lista!.some((r) => r.slug === slug), slug);
  }
});

test("destacadas son las 5 actuales", () => {
  assert.equal(DESTACADAS.length, 5);
  for (const slug of DESTACADAS) {
    assert.ok(CALCULADORAS.some((c) => c.slug === slug), slug);
  }
});
