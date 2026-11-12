# calculalo · Rediseño v3 (institucional argentino moderno)

Prompts para Cursor y mockup de referencia del visual que Martín aprobó. Reemplaza el estilo “planilla de contador” (papel crema, verde, ámbar, Bricolage Grotesque y Public Sans) por la dirección institucional: azul petróleo, cobre de acento, Source Sans 3, grilla de tarjetas, buscador al frente.

**No corras el prompt 28** (`calculalo-home-v2`, la home en estilo planilla). Este pack lo reemplaza: la home nueva (H1, bajada, buscador, catálogo) se implementa acá, en el prompt 31, con el visual v3. Si el 28 ya se corrió, no lo deshagas entero: en el 31 se conserva que el catálogo salga de `lib/content.ts` y se cambia el aspecto (tarjetas, sin bloque de Valores vigentes).

No agregues espacios, slots ni reservas de altura para AdSense ni para ningún otro anuncio. No hagas deploy: lo publica Martín.

## Contenido

```
calculalo-rediseno-v3/
├── README.md
├── 29-tokens-y-tipografia.md
├── 30-header-nav-footer.md
├── 31-home.md
├── 32-hubs.md
├── 33-plantilla-calculadora.md
├── 34-qa.md
└── referencia/
    ├── index.html
    ├── styles.css
    ├── design-system.md
    ├── fonts/                  Source Sans 3 (OFL), woff2
    ├── laboral/sueldo-neto/
    └── capturas/
        ├── home-desktop.png
        ├── home-desktop-fold.png
        ├── home-mobile.png
        ├── sueldo-neto-desktop.png
        ├── sueldo-neto-desktop-fold.png
        └── sueldo-neto-mobile.png
```

## Orden

Corré los prompts **de a uno**, en este orden, cada uno en una charla o turno de Cursor. Después de cada uno, verificá antes de pasar al siguiente.

| Prompt | Qué hace |
|---|---|
| **29** | Tokens, Source Sans 3 autoalojada y `globals.css`: se van Bricolage, Public Sans y la paleta de planilla. |
| **30** | Header, nav (en mobile no se ocultan categorías) y footer. El pie deja solo la aclaración de que el resultado es orientativo. Sin leyenda de sitio independiente. |
| **31** | Home: H1 y bajada aprobados, buscador, atajos y grilla de tarjetas desde `lib/content.ts` (oculta categorías vacías). Sin Valores vigentes y sin etiquetas internas. Title y description con “calculadoras online”. |
| **32** | Hubs de categoría (`app/[categoria]/page.tsx`), con las mismas tarjetas. |
| **33** | Plantilla de calculadora (formulario y resultado al lado, desglose, cómo se calcula, fuentes, FAQ). No toca `lib/calc` ni los datos. |
| **34** | QA: tests, e2e, build, accesibilidad AA, mismos resultados, restos del diseño viejo. |

## Cómo verificar después de cada prompt

En la raíz del proyecto Next (`calculalo-next` o el repo equivalente):

```bash
npm test
npm run build
```

Los dos tienen que pasar. Además, mirá la pantalla que toca ese prompt y comparala con `referencia/capturas/` y con `referencia/design-system.md`. El detalle está al final de cada `.md`.

Al terminar el 34, corré también:

```bash
npm run test:e2e
```

(eso espera un `npm run build` previo, como indica `tests/e2e/calculadoras.mjs`).

## Qué no se toca en ningún prompt

- `SITE.url`, `metadataBase`, canonical, `robots.ts`, la lógica de `sitemap.ts`.
- JSON-LD (`components/JsonLd.tsx` y las llamadas en las páginas).
- URLs y slugs de calculadoras.
- Lógica de `lib/calc/**` y el contenido de `data/` / `lib/data/`.
- Deploy.
- No se agregan espacios ni slots para AdSense.

## Textos de la home (aprobados)

- **H1:** Calculadoras online para tus cuentas de todos los días.
- **Bajada:** Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.

## Cómo usar un prompt

Abrí el `.md`, copiá **solo** el bloque fenced que empieza después de “Prompt para Cursor” (todo lo que está entre las tres comillas) y pegalo en Cursor, sobre el proyecto Next, con el mockup de `referencia/` a mano.
