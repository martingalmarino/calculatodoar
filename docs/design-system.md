# calculalo.com.ar — Sistema de diseño v1 (propuesta)

Posicionamiento visual: "planilla de contador bien hecha". Papel cálido, tinta casi negra, un verde de resultado y un ámbar de resaltador. Sin gradientes, sin glass, sin blobs, sin emojis.

## Tipografía (open source, autoalojable con `next/font/local`)
| Uso | Fuente | Pesos | Licencia |
|---|---|---|---|
| Títulos, cifra de resultado, logo | **Bricolage Grotesque** | 600, 800 (variable, eje opsz) | OFL |
| Texto, inputs, tablas | **Public Sans** | 400, 600, 700 | OFL |
| Fórmulas | `ui-monospace` del sistema | — | — |

- Cifras siempre con `font-variant-numeric: tabular-nums` (columnas alineadas).
- Escala: H1 `clamp(2rem,6vw,3.5rem)`, H2 `clamp(1.4rem,3.5vw,2rem)`, H3 1.15rem, cuerpo 1rem/1.6, ayuda 0.875rem. Resultado `clamp(2.4rem,9vw,3.6rem)`.
- Producción: subset latin + latin-ext, woff2, `display: swap`, precargar solo Public Sans 400 y Bricolage 800; `size-adjust` del fallback para CLS ≈ 0.

## Paleta (contrastes WCAG verificados)
| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--papel` | #F7F4EC | Fondo | — |
| `--papel-2` | #EFEADC | Fórmulas | tinta-2 sobre papel-2 6,65:1 |
| `--tinta` | #1A1D1A | Texto, bordes, header | 15,48:1 sobre papel (AAA) |
| `--tinta-2` | #4D524C | Texto secundario | 7,27:1 sobre papel / 7,99:1 sobre blanco (AAA) |
| `--verde` | #0B5D3B | Links, foco, panel de resultado | 7,23:1 sobre papel; blanco sobre verde 7,95:1 (AAA) |
| `--verde-claro` | #DDEBDF | Avisos | verde sobre él 6,44:1 |
| `--ambar` | #F2B705 | Resaltador: logo, tags, subrayado activo | tinta sobre ámbar 9,36:1; ámbar sobre tinta 9,36:1 |
| `--rojo` | #A3261B | Errores | 6,70:1 sobre papel |
El ámbar nunca lleva texto blanco ni se usa como texto sobre papel (1,7:1).

## Espaciado (base 4px)
`--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32 · `--s7` 48 · `--s8` 64. Ancho máximo 1120px, prosa 68ch. Radio único 6px.

## Componentes
- **Header**: logo tipográfico "calcu**lalo**" (lalo sobre ámbar), nav por categoría con subrayado ámbar en `aria-current`. Línea inferior de 2px tinta.
- **Buscador**: input + botón sólido tinta, `role="search"`.
- **Ranking "Más usadas"**: lista numerada (`<ol>`) con número grande en verde y tag estacional ("Se viene"). Reemplaza la grilla de tarjetas.
- **Bloque de categorías**: columnas asimétricas (2fr/1fr/1fr) con listas de links, divididas por filetes.
- **Panel "Valores vigentes"**: `<dl>` sobre tinta, con fuente y fecha de revisión. Es la señal de confianza del sitio.
- **Campo de moneda** (`.peso`): prefijo `$` visual (aria-hidden), `inputmode="numeric"`, máscara es-AR al tipear (puntos de miles, coma decimal), label + ayuda vinculada con `aria-describedby`, foco con anillo verde.
- **Segmentado** (radios reales en `<fieldset>`/`<legend>`).
- **Resultado**: panel verde, `<output aria-live="polite">` con la cifra grande redondeada, barra neto/aportes, tabla de desglose con 2 decimales y nota contextual (ej. "superás el tope").
- **Fórmula**: bloque mono con borde ámbar. **Aviso**: borde verde. **FAQ**: `<details>/<summary>` nativo. **Migas**: `<nav><ol>`.
- **Lista de calculadoras (hub)**: filas nombre / descripción / vigencia, agrupadas por subtema.

## Arquitectura de URLs (según el plan)
| Nivel | Ejemplo |
|---|---|
| Home | `/` |
| Hub | `/laboral/`, `/impuestos/`, `/finanzas/` |
| Calculadora | `/laboral/sueldo-neto/`, `/laboral/aguinaldo/`, `/laboral/indemnizacion-por-despido/`, `/impuestos/ganancias/`, `/impuestos/monotributo/` |
| Guía | `/laboral/guias/como-se-calcula-el-aguinaldo/` |
| Tabla | `/impuestos/tablas/escala-ganancias-2026/` |
| Fase 2+ | `/hogar/`, `/construccion/`, `/salud/` |
Sin año en la URL de calculadoras (va en title/H1); las tablas sí llevan año. Barra final, minúsculas, guiones.
En Next.js: `app/[categoria]/page.tsx`, `app/[categoria]/[calculadora]/page.tsx` con `generateStaticParams` desde un registro de calculadoras; parámetros en `data/ar/.../AAAA-MM.json`.

## Schema sugerido (JSON-LD)
- Home: `WebSite` + `SearchAction`, `Organization`.
- Hub: `BreadcrumbList` (+ `ItemList` de calculadoras opcional).
- Calculadora: `WebApplication` (applicationCategory `FinanceApplication`, `offers.price` 0 ARS, `inLanguage` es-AR, `dateModified` real), `BreadcrumbList`, `FAQPage` con las 5 preguntas visibles.
- Guía: `HowTo` o `Article`. Generado por los componentes `<Calculadora>`, `<FAQ>`, `<Migas>`. Ver ejemplos en el HTML del mockup.

## Accesibilidad (WCAG 2.2 AA)
`lang="es-AR"`, link "Saltar al contenido", landmarks (`header/nav/main/aside/footer`), un H1 por página, labels explícitos, foco visible de 3px, objetivos táctiles ≥ 44px, resultado anunciado con `aria-live`, sin información solo por color (la barra tiene nota textual), respeta `prefers-reduced-motion`.

## Core Web Vitals (metas p75 móvil: LCP < 2,0 s, INP < 100 ms, CLS < 0,05)
- SSG para todo; la calculadora es una isla cliente chica (sin librerías de forms ni de números: `Intl.NumberFormat`). JS de la página < 30 KB gz.
- El LCP es el H1 o la cifra del resultado: texto, no imagen. Resultado pre-renderizado con el ejemplo por defecto (ya hay valor sin JS).
- Fuentes autoalojadas, 2 archivos precargados, fallback con métricas ajustadas.
- Espacio reservado para anuncios AdSense (alto fijo por slot, nunca arriba del formulario en mobile) para no romper CLS; cargar ads con `lazyOnload`.
- Cálculo síncrono en `input` (< 1 ms), sin debounce que demore la respuesta; nada de layout thrash.
- Sin imágenes decorativas; íconos (si hacen falta) SVG inline de un set propio.
