import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CALCULADORAS,
  CATEGORIAS,
  calcsDe,
  categoriasConContenido,
  urlCalc,
} from "../lib/content";

test("todas las calculadoras tienen href de catálogo válido", () => {
  for (const c of CALCULADORAS) {
    const href = urlCalc(c);
    assert.match(href, /^\/[a-z-]+\/[a-z0-9-]+\/$/);
    assert.equal(href, `/${c.categoria}/${c.slug}/`);
    assert.ok(categoriasConContenido().some((cat) => cat.slug === c.categoria), `${c.slug} en categoría vacía`);
  }
});

test("categorías sin calculadoras no entran al catálogo ni al nav", () => {
  const con = new Set(categoriasConContenido().map((c) => c.slug));
  for (const cat of CATEGORIAS) {
    if (calcsDe(cat.slug).length === 0) assert.equal(con.has(cat.slug), false);
    else assert.equal(con.has(cat.slug), true);
  }
});

test("con tanda 2 el catálogo cubre 4 categorías y 17 calculadoras", () => {
  const cats = categoriasConContenido();
  assert.equal(cats.length, 4);
  assert.equal(CALCULADORAS.length, 17);
  assert.equal(cats.reduce((n, c) => n + calcsDe(c.slug).length, 0), 17);
});
