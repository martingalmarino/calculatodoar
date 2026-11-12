# Cómo cargar una nota

Guía corta para redactores. El modelo está en `content/noticias/` + `lib/noticias.ts`. La portada es `/noticias/`, cada nota publicada vive en `/noticias/<slug>/`, y el build valida frontmatter e imágenes.

## Pasos

1. **Copiá un fixture** de `content/noticias/` (por ejemplo `como-se-calcula-el-aguinaldo.md` o `dni-nuevas-tarifas-renaper.md`).
2. **Renombrá el archivo** al slug nuevo, en minúsculas y guiones (`mi-nota-nueva.md`). El campo `slug` del frontmatter tiene que ser **igual** al nombre sin `.md`.
3. **Completá el frontmatter**: título, bajada, tipo (`actualidad` o `guia`), categoría editorial (`laboral`, `impuestos`, `finanzas`, `hogar`), fechas ISO, `calculadoraRelacionada`, las 3 viñetas de `enPocasPalabras`, `fuentes` (al menos una URL oficial) y `faq`.
4. **Autor**: siempre `Redacción Calculalo`. No inventes nombres propios.
5. **Imágenes** en `public/noticias/imagenes/`:
   - Destacada **16:9** (`imagen.src`) y pieza **og 1200 × 630** (`imagen.og`), misma arte.
   - Opcional para más adelante: miniaturas 4:3 y 1:1.
   - Peso orientativo: 16:9 y og ≤ 200 KB; miniaturas ≤ 80 KB. Formato WebP o AVIF.
6. Escribí **`alt`**, **epígrafe** y **crédito**. Sin destacada, sin archivo en `public/` o sin `alt`, **el build falla**.
7. Dejá `borrador: true` hasta que la nota esté lista. Pasá a `borrador: false` solo cuando corresponda publicarla. Mientras sea borrador **no** entra al sitemap, al RSS (`/noticias/rss.xml`) ni a las rutas estáticas.
8. Escribí el **cuerpo** debajo del frontmatter (párrafos, subtítulos, listas, links). No rearmes a mano los bloques fijos: salen del frontmatter.

Al publicar (`borrador: false`), el build arma JSON-LD (`NewsArticle` o `Article`), `og:image` 1200 × 630, entrada en `sitemap.xml` y ítem en el RSS.

## Qué no hacer

- Inventar datos, IPC u otras cifras no verificadas.
- Usar fotos de stock, personas identificables, marcas, escudos o celeste institucional.
- Dejar el `alt` vacío o omitir crédito / epígrafe.

Dirección de arte: `calculalo-rediseno-v3/referencia/design-system.md` (ilustración editorial o gráfico con datos verificados).
