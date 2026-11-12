# Prompt 29 — Tokens, Source Sans 3 y globals.css

Reemplaza la paleta y las tipografías de “planilla de contador” por el sistema v3 (institucional argentino moderno). No rediseña todavía la estructura de header, home, hubs ni calculadoras: eso va en 30–33. Después de este prompt el sitio tiene que seguir compilando y funcionando, ya con petróleo, cobre y Source Sans 3.

## Contexto

- Visual aprobado en `referencia/` (este pack). Tokens, contrastes y reglas en `referencia/design-system.md`. CSS de referencia en `referencia/styles.css`.
- El proyecto Next usa CSS propio (`app/globals.css`), **sin Tailwind ni daisyUI**. Las fuentes actuales se cargan con `next/font/local` en `app/layout.tsx`:
  - `app/fonts/BricolageGrotesque-latin.woff2` → `--font-bricolage` / `--f-tit`
  - `app/fonts/PublicSans-latin.woff2` → `--font-public` / `--f-txt`
- Paleta actual de planilla en `:root` de `app/globals.css`: `--papel #F7F4EC`, `--tinta #1A1D1A`, `--verde #0B5D3B`, `--ambar #F2B705`, etc.
- `export const viewport` en `app/layout.tsx` tiene `themeColor: "#1A1D1A"`: actualizarlo al petróleo.
- `docs/design-system.md` describe el sistema v1 (planilla) y menciona reservas de espacio para AdSense: hay que actualizarlo al v3 y **no** migrar ni agregar nada de AdSense.

## Archivos a tocar

- `app/layout.tsx`
- `app/globals.css`
- `app/fonts/` (agregar Source Sans 3; sacar Bricolage y Public Sans)
- `docs/design-system.md` (tokens, tipografía y reglas; no inventar componentes nuevos acá)
- Si `public/icon.svg` u otro favicon usa verde o ámbar de planilla, actualizá los colores al petróleo / tinta, sin redibujar un logo nuevo.

No hace falta tocar componentes JSX en este prompt, salvo `layout.tsx`.

## Pasos

1. Copiá a `app/fonts/` los woff2 y la licencia de `referencia/fonts/`:
   - `SourceSans3-latin-400.woff2`, `SourceSans3-latin-600.woff2`, `SourceSans3-latin-700.woff2`
   - `SourceSans3-latin-ext-400.woff2`, `SourceSans3-latin-ext-600.woff2`, `SourceSans3-latin-ext-700.woff2`
   - `OFL-SourceSans3.txt`
   Source Sans 3 es OFL. Preferí `next/font/local` (ya está en el proyecto) antes que agregar `@fontsource`. Si usás `@fontsource/source-sans-3`, autoalojala igual y no cargues Google Fonts por CDN.

2. En `app/layout.tsx`, reemplazá las dos `localFont` por una sola familia Source Sans 3 (pesos 400, 600 y 700). Incluí latin y latin-ext. Ejemplo de forma (ajustá los paths a los archivos reales):

```tsx
import localFont from "next/font/local";

const sourceSans = localFont({
  src: [
    { path: "./fonts/SourceSans3-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SourceSans3-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SourceSans3-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/SourceSans3-latin-ext-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SourceSans3-latin-ext-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SourceSans3-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-source-sans",
  display: "swap",
});
```

Aplicá `sourceSans.variable` en `<html lang="es-AR">`. Sacá `bricolage` y `publicSans`. Cambiá `themeColor` a `#0B4F5B`. No toques `metadataBase`, el `title` default ni la `description` (el title y la description de la home se actualizan en el prompt 31).

3. Reemplazá `:root` en `app/globals.css` por los tokens de `referencia/design-system.md` (hex exactos):

| Token | Hex | Uso |
|---|---|---|
| `--fondo` | `#F4F5F2` | Fondo de página |
| `--superficie` | `#FFFFFF` | Tarjetas, formulario, header |
| `--tinta` | `#142026` | Texto principal, logo |
| `--tinta-suave` | `#3D4A51` | Bajadas, ayudas, footer |
| `--linea` | `#7A817E` | Bordes (3:1 AA contra blanco y fondo) |
| `--marca` | `#0B4F5B` | Links, foco, cifras, header border, botones |
| `--marca-hover` | `#083E48` | Hover de links y botones |
| `--marca-tint` | `#E6F0F1` | Fórmulas, avisos, fila total del desglose |
| `--acento` | `#C45C1A` | Solo subrayado del logo y el ítem de nav activo |
| `--acento-texto` | `#8A3E10` | Si el cobre lleva texto (7,1:1 sobre blanco) |
| `--peligro` | `#A3261B` | Errores |
| `--radio` | `8px` | Radio único |
| `--max` | `1120px` | Ancho máximo |
| `--fuente` | `var(--font-source-sans), "Source Sans 3", ui-sans-serif, system-ui, sans-serif` | Única familia |

Mantené la escala `--s1`…`--s8` (4, 8, 12, 16, 24, 32, 48, 64).

4. En todo `globals.css`, reemplazá los usos de tokens viejos. No dejes aliases a la paleta de planilla.

   - `--papel` / `--papel-2` → `--fondo` (el papel-2 de fórmulas pasa a `--marca-tint`)
   - `--tinta-2` → `--tinta-suave`
   - `--verde` / `--verde-claro` → `--marca` / `--marca-tint`
   - `--ambar` deja de usarse para logo, tags, subrayado, barra de resultado o borde de fórmula. El único acento decorativo es `--acento` (logo y nav activo). Texto sobre cobre, si hace falta, usa `--acento-texto`.
   - `--blanco` → `--superficie`
   - `--rojo` → `--peligro`
   - `--f-tit` y `--f-txt` → `--fuente` (títulos y cuerpo son la misma familia; títulos en 700, no en 800)
   - `--r` → `--radio`

   Tipografía base, como en el mockup: body 1rem/1.55, color `--tinta`, fondo `--fondo`. H1 `clamp(2rem, 5vw, 2.75rem)` peso 700, letter-spacing `-0.02em`. H2 `clamp(1.35rem, 3vw, 1.75rem)` peso 700. Cifras con `font-variant-numeric: tabular-nums`. Links `--marca`, hover `--marca-hover`. Foco visible: `outline: 3px solid var(--marca); outline-offset: 2px`. Sin `box-shadow` de brillo en el foco (el anillo verde claro de planilla se va).

5. No cambies todavía la estructura CSS de `.top`, `.nav`, `.hero`, `.ranking`, `.valores`, `.calc`, `.resultado`, etc. (eso es 30–33). Sí actualizá colores, tipografía, radios y focos para que no queden variables rotas. El sitio puede verse “a medio camino” y está bien.

6. Actualizá `docs/design-system.md` al sistema v3 (podés tomar `referencia/design-system.md` como base). Incorporá tokens, tipografía, contrastes y las prohibiciones (sin escudo, sin celeste institucional, sin Encode Sans, sin la palabra “Gobierno”, sin degradés, glow, emojis ni íconos de stock). **Borré** cualquier mención a reservas de espacio o slots para AdSense: no se migran y no se agregan. No documentes aviso de “sitio independiente” ni el bloque “Valores vigentes” como componente de la home: Martín los sacó del visual aprobado.

7. Cuando el build pase y no queden referencias a las fuentes viejas, eliminá `app/fonts/BricolageGrotesque-latin.woff2` y `app/fonts/PublicSans-latin.woff2`.

## Criterios de aceptación

- `npm test` y `npm run build` pasan.
- En el HTML compilado / el CSS no aparecen Bricolage Grotesque, Public Sans, `--font-bricolage`, `--font-public`, `--f-tit`, `--f-txt`, `--papel`, `--verde`, `--ambar`.
- El body y los títulos usan Source Sans 3 autoalojada (`next/font` o equivalente), no un `<link>` a fonts.google.com.
- `themeColor` es `#0B4F5B`.
- `lang="es-AR"` y el link “Saltar al contenido” siguen.
- Contraste de los pares nuevos: texto 4,5:1 o más; `--linea` 3:1 o más contra `--superficie` y `--fondo` (valores en `referencia/design-system.md`).
- No se agregó Tailwind, daisyUI, ni espacios o slots para AdSense.
- `metadataBase`, canonical, JSON-LD y las rutas no se tocaron.

## Qué no tocar

- `SITE.url`, `metadataBase`, title/description default (31), JSON-LD, `robots.ts`, `sitemap.ts`.
- Componentes de página, header, footer, calculadoras (salvo colores que hereden de CSS).
- `lib/calc/**`, `data/`, slugs, URLs.
- Deploy. No agregues AdSense.

## Cómo verificar

`npm test` && `npm run build`. Abrí el sitio: tiene que seguir andando. La tipografía ya no es Bricolage; el fondo ya no es crema; el verde y el ámbar de planilla no deberían aparecer como tokens. Compará los hex de `:root` con `referencia/design-system.md`.

---

## Prompt para Cursor

```
Rediseño visual v3 de calculalo, prompt 29 de 34: solo tokens, tipografía y globals.css. No toques todavía la estructura de header, home, hubs ni calculadoras (van en 30–33).

Contexto: el visual aprobado está en el pack calculalo-rediseno-v3/referencia/ (design-system.md, styles.css, fonts/). El proyecto es Next.js con CSS propio, sin Tailwind ni daisyUI. Hoy app/layout.tsx carga con next/font/local app/fonts/BricolageGrotesque-latin.woff2 (--font-bricolage, --f-tit) y app/fonts/PublicSans-latin.woff2 (--font-public, --f-txt). app/globals.css tiene la paleta de planilla: --papel #F7F4EC, --tinta #1A1D1A, --verde #0B5D3B, --ambar #F2B705, etc. viewport.themeColor es #1A1D1A.

Qué hacer:
1. Copiá a app/fonts/ los woff2 y OFL-SourceSans3.txt de referencia/fonts/ (latin y latin-ext, pesos 400, 600 y 700). Source Sans 3 es OFL. Preferí next/font/local, que ya está; no cargues Google Fonts por CDN.
2. En app/layout.tsx reemplazá las dos localFont por una sola familia Source Sans 3 (variable --font-source-sans, display: swap, pesos 400/600/700, latin + latin-ext). Aplicá la variable en <html lang="es-AR">. Sacá bricolage y publicSans. Cambiá themeColor a #0B4F5B. No toques metadataBase, el title default ni la description (eso de la home va en el 31).
3. Reemplazá :root en app/globals.css por estos tokens exactos: --fondo #F4F5F2, --superficie #FFFFFF, --tinta #142026, --tinta-suave #3D4A51, --linea #7A817E, --marca #0B4F5B, --marca-hover #083E48, --marca-tint #E6F0F1, --acento #C45C1A, --acento-texto #8A3E10, --peligro #A3261B, --radio 8px, --max 1120px, --fuente var(--font-source-sans), "Source Sans 3", ui-sans-serif, system-ui, sans-serif. Mantené --s1…--s8 (4–64).
4. En todo globals.css, reemplazá tokens viejos y no dejes aliases a la paleta de planilla: --papel/--papel-2 → --fondo (fórmulas y avisos usan --marca-tint), --tinta-2 → --tinta-suave, --verde/--verde-claro → --marca/--marca-tint, --blanco → --superficie, --rojo → --peligro, --f-tit y --f-txt → --fuente, --r → --radio. --ambar deja de usarse para logo, tags, subrayado, barra de resultado o borde de fórmula. El único acento decorativo es --acento (logo y nav activo); si el cobre lleva texto, usá --acento-texto. Tipografía: body 1rem/1.55; H1 clamp(2rem, 5vw, 2.75rem) peso 700 letter-spacing -0.02em; H2 clamp(1.35rem, 3vw, 1.75rem) peso 700; cifras con font-variant-numeric: tabular-nums. Links --marca, hover --marca-hover. Foco: outline 3px solid var(--marca); outline-offset 2px. Sin box-shadow de brillo en el foco.
5. No reestructures todavía las clases .top, .nav, .hero, .ranking, .valores, .calc, .resultado, etc. Sí actualizá colores, tipo, radios y focos para que no queden variables rotas. Que el sitio se vea a medio camino está bien.
6. Actualizá docs/design-system.md al sistema v3, tomando referencia/design-system.md. Incluí tokens, tipografía, contrastes y prohibiciones (sin escudo, celeste institucional, Encode Sans, palabra Gobierno, degradés, glow, emojis ni íconos de stock). BORRÁ cualquier mención a reservas de espacio o slots para AdSense: no las migres y no agregues espacios ni slots para anuncios. No documentes aviso de “sitio independiente” ni el bloque “Valores vigentes” como componente de la home.
7. Cuando el build pase y no queden referencias a las fuentes viejas, eliminá app/fonts/BricolageGrotesque-latin.woff2 y PublicSans-latin.woff2. Si public/icon.svg usa verde o ámbar de planilla, actualizá esos colores a petróleo/tinta, sin inventar un logo nuevo.

Criterios: npm test y npm run build pasan. No quedan Bricolage, Public Sans, --font-bricolage, --font-public, --f-tit, --f-txt, --papel, --verde ni --ambar. Source Sans 3 está autoalojada. themeColor #0B4F5B. lang="es-AR" y “Saltar al contenido” siguen. Contrastes AA (texto ≥ 4,5:1; --linea ≥ 3:1 contra superficie y fondo). Sin Tailwind, daisyUI ni AdSense.

No toques: SITE.url, metadataBase, title/description default, JSON-LD, robots.ts, la lógica de sitemap.ts, componentes de página (salvo layout.tsx), lib/calc, data/, slugs, URLs. No hagas deploy.
```
