# Sistema de diseño — calculalo v3

Dirección visual: **institucional argentino moderno** (claridad y jerarquía al estilo Argentina.gob.ar / Buenos Aires Ciudad), sin parecer un sitio del Estado. Una sola familia tipográfica, paleta petróleo + cobre, sin degradés ni glow.

## Principios

1. **La cuenta se encuentra y se entiende rápido.** El buscador va primero. Cada calculadora se ve de entrada, con título y bajada.
2. **Claridad antes que ornamento.** Colores sólidos, bordes visibles, espacios generosos. Sin sombras, degradés ni brillos.
3. **Se siente de acá, no oficial.** Tono rioplatense y paleta propia (petróleo y cobre), sin escudo ni colores institucionales.
4. **Accesible, AA.** Contraste 4,5:1 en texto, 3:1 en componentes de interfaz. Áreas táctiles de 44 px. Foco visible. Semántica HTML.

## Qué no se copia

- Escudo, logo o isologotipo de ningún organismo.
- Celeste y blanco como colores de marca.
- La palabra “Gobierno”.
- Encode Sans u otra tipografía de Argentina.gob.ar.
- Degradés, glow, emojis, íconos de stock en cada tarjeta.
- Fotos de ciudad a pantalla completa.

## Paleta

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--fondo` | `#F4F5F2` | Fondo de página | — |
| `--superficie` | `#FFFFFF` | Tarjetas, formulario, header | — |
| `--tinta` | `#142026` | Texto principal, logo | ≥ 4,5:1 sobre fondo (AAA) |
| `--tinta-suave` | `#3D4A51` | Bajadas, ayudas, footer | ≥ 4,5:1 |
| `--linea` | `#7A817E` | Bordes | ≥ 3:1 contra blanco y fondo |
| `--marca` | `#0B4F5B` | Links, foco, cifras, botones, borde del header | blanco sobre marca AAA |
| `--marca-hover` | `#083E48` | Hover de links y botones | — |
| `--marca-tint` | `#E6F0F1` | Fórmulas, avisos, fondos suaves | — |
| `--acento` | `#C45C1A` | Solo decoración: subrayado del logo y raya del nav activo | gráfico ≥ 3:1 |
| `--acento-texto` | `#8A3E10` | Si el cobre lleva texto | ≥ 4,5:1 |
| `--peligro` | `#A3261B` | Errores | AA |

`--radio` = `8px`. `--max` = `1120px`. Escala `--s1`…`--s8`: 4, 8, 12, 16, 24, 32, 48, 64.

## Tipografía

Una sola familia: **Source Sans 3** (SIL OFL 1.1), autoalojada con `next/font/local` en `app/fonts/` (latin + latin-ext, pesos 400, 600 y 700). Variable CSS: `--font-source-sans` / `--fuente`.

| Uso | Peso | Tamaño |
|---|---|---|
| Cuerpo | 400 | 1 rem / 1,55 |
| Etiquetas, nav, botones | 600 | 16–18 px |
| Títulos y logo | 700 | H1 `clamp(2rem, 5vw, 2.75rem)`; H2 `clamp(1.35rem, 3vw, 1.75rem)` |
| Número del resultado | 700, tabular-nums | grande, tabular |

`font-variant-numeric: tabular-nums` en montos, tasas e índices. Links `--marca`, hover `--marca-hover`. Foco: `outline: 3px solid var(--marca); outline-offset: 2px` (sin box-shadow de brillo).

## Componentes (referencia)

Los detalles de header, home, hubs y plantilla de calculadora se implementan en los prompts 30–33. Reglas estables:

- **Header:** superficie, borde inferior 3px marca; wordmark `calcu` + `lalo` con subrayado cobre 3px; nav con todas las categorías con contenido (wrap en mobile, sin hamburguesa ni ocultar ítems); raya cobre en `aria-current="page"`.
- **Footer:** borde superior 1px línea, links a las mismas categorías, frase de marca + `SITE.descargo` (resultado orientativo). Sin leyenda de “sitio independiente”.
- **Buscador:** borde 2 px marca, botón sólido marca.
- **Home:** hero con H1 + bajada + buscador (borde línea, foco marca, botón marca ≥ 48px) + atajos tipo chip solo a calculadoras existentes. Catálogo por categoría desde `lib/content.ts`: tarjetas blancas con borde línea, radio 8px, hover borde marca; grilla 2 columnas desde 800px. Sin ranking, sin “Valores vigentes”, sin etiquetas internas ni AdSense.
- **Hubs:** migas (Inicio / categoría), H1 = `cat.title` (SEO; metadata intacta), intro y la misma `GrillaCalcs` / `TarjetaCalc` que la home. Header con `aria-current` en la categoría.
- **Catálogo / tarjetas:** título en marca, bajada en tinta suave; sin íconos decorativos por tarjeta. Componente compartido `components/TarjetaCalc.tsx`.
- **Migas:** texto chico, tinta suave, actual sin link, separador `/`.
- **Plantilla de calculadora:** a ≥900px, `.calc` en 2 columnas (form | resultado sticky); en mobile, form primero y resultado debajo. Formulario blanco, borde `--linea`, labels 700, ayuda `--tinta-suave`, `.peso` con `$`, inputs 1.15rem/600 tabular, controles ≥ 44px, foco outline `--marca` sin glow.
- **Resultado:** tarjeta blanca, borde 2px `--marca`, título en mayúsculas marca, cifra `clamp(2.25rem, 8vw, 3.25rem)` 700 en petróleo, desglose en tabla, fila total con fondo `--marca-tint`. Sin barra ámbar.
- **Fórmula / aviso:** fondo `--marca-tint`, borde izquierdo 4px `--marca`. FAQ en `details/summary` con borde de tarjeta.
- **Footer:** nav de categorías + descargo orientativo. Sin bloque de “Valores vigentes” en la home.

## Íconos

Si hacen falta, Lucide (trazo 2, 18–20 px, `currentColor`), solo donde aportan (lupa del buscador, chevron de migas/FAQ). Prohibido un ícono genérico en cada tarjeta.

## Voz

Rioplatense, de vos, directa. Títulos en oración. Sin emojis ni signos de exclamación de más. Hablar de “normas vigentes” y “resultado orientativo”, no de trámite ni de organismo.

## Accesibilidad (AA)

- Contraste verificado en esta paleta (texto ≥ 4,5:1; `--linea` ≥ 3:1).
- `lang="es-AR"`, jerarquía de headings, `aria-label` en nav y buscador, `aria-live` en el resultado, `aria-current` en migas y nav.
- Campos con `label` explícito y `aria-describedby` para la ayuda.
- Skip link “Saltar al contenido”.
- Respetar `prefers-reduced-motion`.
