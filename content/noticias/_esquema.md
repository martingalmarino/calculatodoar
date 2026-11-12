# Esquema de una nota (`content/noticias/*.md`)

Frontmatter YAML obligatorio. El cuerpo Markdown es el texto de la nota. Los bloques fijos (en pocas palabras, fuentes, FAQ, destacada, caja de calculadora) salen del frontmatter.

| Campo | Regla |
|---|---|
| `titulo` | string |
| `volanta` | opcional; si falta → `Actualidad · Impuestos` (tipo + categoría) |
| `bajada` | string |
| `slug` | minúsculas y guiones; igual al nombre del archivo |
| `tipo` | `actualidad` \| `guia` |
| `categoria` | `laboral` \| `impuestos` \| `finanzas` \| `hogar` |
| `fechaPublicacion` / `fechaActualizacion` | `YYYY-MM-DD` |
| `autor` | exactamente `Redacción Calculalo` |
| `borrador` | `true` = no se publica |
| `imagen.src` / `imagen.og` | rutas bajo `/noticias/imagenes/…` (archivos en `public/`) |
| `imagen.alt` / `credito` / `epigrafe` | obligatorios, no vacíos |
| `calculadoraRelacionada` | `{ categoria, slug }` |
| `enPocasPalabras` | exactamente 3 strings |
| `fuentes` | ≥ 1 `{ titulo, url }` |
| `faq` | array de `{ q, a }` (puede ser `[]`) |

La validación vive en `lib/noticias.ts` y corre en `npm test` / `npm run build`.
