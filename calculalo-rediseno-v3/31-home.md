# Prompt 31 — Home

Implementá la home del visual v3. Este prompt **reemplaza al 28** (home v2 en estilo planilla): no lo corras. Si el 28 ya se corrió, conservá que el catálogo sale de `lib/content.ts` y cambiá el aspecto al de las tarjetas v3, sin bloque de Valores vigentes y sin etiquetas internas.

## Contexto

- Textos aprobados:
  - **H1:** Calculadoras online para tus cuentas de todos los días.
  - **Bajada:** Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.
- Mockup: `referencia/index.html`, estilos `.hero`, `.buscar`, `.atajos`, `.cats`, `.tarjeta` en `referencia/styles.css`. Capturas: `referencia/capturas/home-desktop.png`, `home-desktop-fold.png`, `home-mobile.png`.
- Página actual: `app/page.tsx`. En el snapshot original todavía tiene el H1 “Hacé la cuenta. Con la norma de este mes.”, el ranking numerado, el aside “Valores vigentes” (tope ANSES, etc.) y el bloque “Por tema”. Si el 28 ya se aplicó, puede haber un catálogo por categoría en estilo planilla y, si quedó, un bloque de valores: ese bloque se saca.
- El catálogo **no se hardcodea**. Sale de `lib/content.ts`: `categoriasConContenido()` (créala en este prompt si el 30 no la dejó) y `calcsDe(cat.slug)`. Cada tarjeta usa `c.nombre`, `c.resumen` y `urlCalc(c)`. Las categorías vacías no se renderizan. Si la tanda 2 todavía no está, se ven solo laboral (3) e impuestos (2). Si ya está, se ven las cuatro y todas las calculadoras publicadas en `CALCULADORAS`.
- JSON-LD de la home: `WebSite` + `SearchAction` y `Organization`. **Se quedan.** `export const metadata = { alternates: { canonical: "/" } }` se queda; sí hay que ampliar `metadata` / el default de `app/layout.tsx` para title y description con “calculadoras online”.
- Buscador: `<form class="buscar" role="search" action="/buscar/" method="get">` (o el action que ya apunte a `/buscar/`). Enviar “aguinaldo” lleva a `/buscar/?q=aguinaldo`. La página `/buscar/` y `components/Buscador.tsx` no hace falta rediseñarlas acá, salvo heredar estilos del form.
- Atajos del mockup (Sueldo neto, Alquiler, Dólar, Aguinaldo): mostrá un atajo **solo** si esa calculadora existe en `CALCULADORAS`. No enlaces rutas que no existan.

## Archivos a tocar

- `app/page.tsx`
- `app/layout.tsx` solo para el `title.default` y la `description` (no `metadataBase`)
- `app/globals.css` (hero, buscador, atajos, grilla de tarjetas; sacar estilos de `.ranking` y del bloque `.valores` de la home si ya no se usan)
- `lib/content.ts` solo si falta `categoriasConContenido()`
- Tests / e2e si buscan el H1 viejo, “Más usadas”, “Por tema”, “Valores vigentes” o cuentan ítems de `.ranking`

## Pasos

1. Title y description (home / default del sitio), con “calculadoras online”. Propuesta:

   - `title.default`: `calculalo: calculadoras online para Argentina`
   - `description`: `Calculadoras online para tus cuentas de todos los días. Sueldo, alquiler, dólar o cuotas, con los números de hoy.`

   El `template: "%s | calculalo"` puede quedarse. No toques `metadataBase`, canonical `/`, ni Open Graph `siteName` / `locale`.

2. En `app/page.tsx`, reemplazá el contenido de `<main>` por, en este orden:
   - Hero: un solo H1 con el texto aprobado (sin `<br>` forzado si no hace falta), la bajada aprobada, el formulario de búsqueda (label visualmente oculto “Buscar calculadora”, `input[name=q]`, `type="search"`, placeholder “¿Qué querés calcular?”, botón “Buscar”).
   - Atajos: links reales solo a calculadoras que existan en `CALCULADORAS`.
   - Grilla de categorías: un `<section>` por categoría con contenido; `<h2>` con el nombre de la categoría (link al hub `/${slug}/`); lista de tarjetas (`<a href={urlCalc(c)}>`) con el nombre y el resumen. Desktop: dos columnas de categorías, tarjetas en 2 columnas dentro (como el mockup). Mobile (390): todo apilado, una tarjeta por fila. HTML semántico; los enlaces son `<a>` / `<Link>` crawlables, no botones con `onClick`.
   - **Sin** aside ni bloque “Valores vigentes” (ni tope ANSES, ICL, UVA, IPC en la home). **Sin** lista numerada / ranking. **Sin** etiquetas internas (“Tanda 2”, “Nueva”, “Próximamente” como badge de equipo, etc.).

3. Estilos tomados de `referencia/styles.css`: hero con padding generoso, buscador protagonista (borde 2px `--linea`, al foco borde `--marca`, botón sólido `--marca`, alto ≥ 48px), atajos como chips con borde, tarjetas blancas con borde `--linea`, radio 8px, hover con borde `--marca` (sin sombra, sin degradé, sin íconos decorativos en cada tarjeta). No uses el filtrado en vivo del mockup HTML: el form de la home envía a `/buscar/`.

4. Actualizá tests o e2e que dependan del H1 viejo, del ranking o de “Valores vigentes”. Agregá (unitario o al inicio de `tests/e2e/calculadoras.mjs`, contra `BASE`) una prueba de la home:
   - existe el H1 nuevo;
   - el form `[role=search]` apunta a `/buscar/`;
   - hay un enlace por cada ítem de `CALCULADORAS`, con `href` igual a `urlCalc(c)`;
   - no se renderiza una categoría de `CATEGORIAS` que no esté en `categoriasConContenido()`;
   - siguen los JSON-LD de WebSite y Organization.
   No cambies los casos de las 5 calculadoras del e2e.

5. No agregues espacios ni slots para AdSense. No agregues aviso de sitio independiente.

## Criterios de aceptación

- `npm test` y `npm run build` pasan.
- H1 y bajada son exactamente los textos aprobados.
- El title y la description (default o de la home) incluyen “calculadoras online”.
- Todas las calculadoras de `CALCULADORAS` tienen un `<a href>` visible en la home; las categorías vacías no aparecen.
- No está el bloque Valores vigentes, ni el ranking, ni el H1 viejo, ni etiquetas internas.
- Buscar “aguinaldo” lleva a `/buscar/?q=aguinaldo`.
- En 1440 y 390 se parece a las capturas de `referencia/capturas/`.
- JSON-LD y canonical `/` intactos.

## Qué no tocar

- `SITE.url`, `metadataBase`, canonical, JSON-LD (se conservan los de la home).
- `lib/calc/**`, `data/`, slugs, URLs de calculadoras, lógica de `/buscar/`.
- Deploy. No AdSense. No “Valores vigentes” en la home. No leyenda de independencia.

## Cómo verificar

`npm test` && `npm run build`. Abrí `/` en 1440 y 390 y compará con `referencia/capturas/home-desktop.png`, `home-desktop-fold.png` y `home-mobile.png`. Confirmá el H1, la bajada, el buscador, los atajos (solo los que existan) y la grilla. En el HTML no tiene que haber “Valores vigentes”, “Hacé la cuenta”, “Tanda 2” ni “sitio independiente”. Enviá una búsqueda.

---

## Prompt para Cursor

```
Rediseño visual v3 de calculalo, prompt 31 de 34: la home. Este prompt reemplaza al 28 (home v2 en estilo planilla): no lo corras. Si el 28 ya se aplicó, conservá que el catálogo sale de lib/content.ts y cambiá el aspecto al de las tarjetas v3; sacá el bloque Valores vigentes si quedó.

Contexto: el mockup aprobado está en calculalo-rediseno-v3/referencia/ (index.html, styles.css, capturas home-desktop.png, home-desktop-fold.png, home-mobile.png). Textos aprobados, exactos:
- H1: Calculadoras online para tus cuentas de todos los días.
- Bajada: Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.

app/page.tsx en el snapshot original todavía tiene el H1 “Hacé la cuenta. Con la norma de este mes.”, un ol.ranking, un aside.valores (“Valores vigentes” con tope ANSES, etc.) y un bloque “Por tema”. El JSON-LD de WebSite + SearchAction y Organization se queda. export const metadata = { alternates: { canonical: "/" } } se queda. El buscador existente es un form role="search" action="/buscar/".

Qué hacer:
1. Actualizá title.default y description (en app/layout.tsx y/o la metadata de la home) para que incluyan “calculadoras online”. Propuesta: title.default “calculalo: calculadoras online para Argentina”; description “Calculadoras online para tus cuentas de todos los días. Sueldo, alquiler, dólar o cuotas, con los números de hoy.” El template "%s | calculalo" puede quedarse. No toques metadataBase, canonical "/", ni openGraph siteName/locale.
2. Reemplazá el main de app/page.tsx, en este orden: hero (un H1 con el texto aprobado, la bajada aprobada, form buscar con label oculto “Buscar calculadora”, input name=q type=search placeholder “¿Qué querés calcular?”, botón “Buscar”, action="/buscar/" method get); atajos (links reales SOLO si esa calculadora existe en CALCULADORAS: en el mockup son Sueldo neto, Alquiler, Dólar, Aguinaldo; no enlaces rutas que no existan); grilla de categorías desde lib/content.ts. Usá categoriasConContenido() (creala si el 30 no la dejó) y calcsDe(cat.slug). Cada tarjeta: c.nombre, c.resumen, href={urlCalc(c)}. Las categorías vacías no se renderizan. Si la tanda 2 no está, solo laboral (3) e impuestos (2). Si está, las cuatro y todas las de CALCULADORAS. Desktop: 2 columnas de categorías, tarjetas en 2 columnas dentro. Mobile 390: todo apilado, una tarjeta por fila. Enlaces crawlables con Link/a, no botones con onClick.
3. SACÁ el aside/bloque “Valores vigentes” (no va tope ANSES, ICL, UVA ni IPC en la home). Sacá el ranking numerado. Sin etiquetas internas (“Tanda 2”, “Nueva” u otra de equipo). Sin aviso de “sitio independiente”.
4. Estilos de referencia/styles.css: buscador protagonista (borde 2px --linea, foco --marca, botón sólido --marca, alto ≥ 48px), atajos tipo chip, tarjetas blancas con borde --linea, radio 8px, hover con borde --marca. Sin sombras, degradés ni íconos decorativos en cada tarjeta. No implementes el filtrado en vivo del HTML del mockup: el form de la home envía a /buscar/.
5. Actualizá tests/e2e que busquen el H1 viejo, “Más usadas”, “Por tema”, “Valores vigentes” o cuenten .ranking. Agregá una prueba de la home (unitaria o al inicio de tests/e2e/calculadoras.mjs contra BASE): existe el H1 nuevo; el form [role=search] apunta a /buscar/; hay un enlace por cada ítem de CALCULADORAS con href igual a urlCalc(c); no se renderiza una categoría de CATEGORIAS que no esté en categoriasConContenido(); siguen los JSON-LD de WebSite y Organization. No cambies los casos de las 5 calculadoras del e2e.
6. No agregues espacios ni slots para AdSense.

Criterios: npm test y npm run build pasan. H1 y bajada exactos. Title y description con “calculadoras online”. Todas las de CALCULADORAS visibles en la home; categorías vacías no aparecen. No hay Valores vigentes, ranking, H1 viejo ni etiquetas internas. Buscar “aguinaldo” lleva a /buscar/?q=aguinaldo. En 1440 y 390 se parece a las capturas. JSON-LD y canonical intactos.

No toques: SITE.url, metadataBase, canonical, los JSON-LD de la home (se conservan), lib/calc, data/, slugs, URLs, la lógica de /buscar/. No hagas deploy.
```
