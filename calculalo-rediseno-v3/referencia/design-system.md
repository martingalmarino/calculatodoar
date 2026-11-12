# Sistema de diseño — calculalo v3

Propuesta visual en la dirección **institucional argentino moderno** (claridad y jerarquía de Argentina.gob.ar y Buenos Aires Ciudad), sin parecer un sitio del Estado. Este documento es la referencia para implementar el diseño si se aprueba.

## Principios

1. **La cuenta se encuentra y se entiende rápido.** El buscador va primero. Cada calculadora se ve de entrada, con título y bajada.
2. **Claridad antes que ornamento.** Colores sólidos, bordes visibles, espacios generosos. Sin sombras, degradés ni brillos.
3. **Se siente de acá, no oficial.** Tono rioplatense y paleta propia (petróleo y cobre), sin escudo ni colores institucionales.
4. **Accesible, AA.** Contraste 4,5:1 en texto, 3:1 en componentes de interfaz. Áreas táctiles de 44 px. Foco visible. Semántica HTML.

## Qué se toma de las referencias

De **Argentina.gob.ar**: el buscador como puerta de entrada, la jerarquía título + lista de servicios, los bloques de color sólido, el listado de valores o accesos sin íconos decorativos.

De **Buenos Aires Ciudad**: los espacios más holgados, las tarjetas con borde y radio contenido, la tipografía sans bien legible, el formulario claro (etiqueta arriba, ayuda abajo).

De **Poncho**: la idea de un sistema con tokens reutilizables y componentes estables, no la tipografía Encode Sans ni la paleta institucional.

## Qué no se copia

- Escudo, logo o isologotipo de ningún organismo.
- Celeste y blanco como colores de marca.
- La palabra “Gobierno”.
- Encode Sans u otra tipografía de Argentina.gob.ar.
- Fotos de ciudad a pantalla completa, como en la home de BA (nos alejarían de una herramienta).

## Paleta

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--fondo` | `#F4F5F2` | Fondo de página (off-white frío, no el papel crema de la planilla) | — |
| `--superficie` | `#FFFFFF` | Tarjetas, header, footer, campos | — |
| `--tinta` | `#142026` | Texto principal | 15,2:1 sobre fondo (AAA) |
| `--tinta-suave` | `#3A474C` | Bajadas, ayudas, metadatos | 8,8:1 sobre fondo (AAA) |
| `--linea` | `#7A817E` | Bordes de tarjetas y divisores | 3,99:1 sobre blanco (cumple 3:1 de componentes) |
| `--marca` | `#0B4F5B` | Azul petróleo: logo, links, botones, número del resultado | 9,2:1 blanco sobre marca (AAA) |
| `--marca-hover` | `#083E48` | Hover de marca | 11,7:1 |
| `--marca-tint` | `#E7F0F1` | Fórmula y fondos suaves | tinta 14:1+ |
| `--acento` | `#C45C1A` | Cobre, **solo decoración**: subrayado del logo, raya del ítem activo. No usar en texto chico (4,3:1, no llega a AA). | 3,9:1 como gráfico (pasa 3:1) |
| `--acento-texto` | `#8A3B10` | Si el cobre tiene que ser texto | 5,9:1+ |
| `--peligro` | `#9B2F1A` | Errores de validación | AA |

No hay degradés. No hay sombra. El contraste se marca con borde y color plano.

## Tipografía

Una sola familia: **Source Sans 3**, SIL Open Font License 1.1, autoalojada en `fonts/`.

Es una sans de Adobe para interfaz y lectura larga. Tiene cifras tabulares, buena distinción entre caracteres y no es Encode Sans, Bricolage Grotesque ni Public Sans.

| Uso | Peso | Tamaño |
|---|---|---|
| Cuerpo | 400 | 18 px / 1,55 (1,0625 rem en celular) |
| Etiquetas, nav, botones | 600 | 16–18 px |
| Títulos y logo | 700 | H1 `clamp(1,85rem, 4,6vw, 2,75rem)`; H2 hasta 1,65 rem |
| Número del resultado | 700, tabular-nums | `clamp(2rem, 4vw, 2,75rem)` |

`font-variant-numeric: tabular-nums` en montos, tasas e índices.

## Espaciado, radio y ancho

Escala: 4, 8, 12, 16, 24, 32, 48, 64 px. Radio único: **8 px**. Ancho máximo del contenido: **1120 px**. Área táctil mínima: **44 px**.

## Componentes

**Header.** Fondo blanco, borde inferior. Wordmark `calcu` + `lalo` subrayado en cobre. Navegación de categorías a la derecha; el ítem actual lleva una raya de cobre. En celular, el nav pasa debajo del logo, sin hamburguesa (son solo cuatro links).

**Buscador.** Protagonista del hero. Borde 2 px en petróleo, botón sólido del mismo color, ícono Lucide de lupa (único ícono decorativo de la home, y está en el botón, no en cada tarjeta).

**Tarjeta de calculadora.** Título en petróleo y bajada en tinta suave. Borde 1 px, radio 8 px, padding holgado. Sin ícono. Hover y foco: el borde pasa a petróleo, sin elevación.

**Catálogo.** Una sección por categoría (título + cantidad + grilla). En escritorio, dos columnas de tarjetas. Todas las calculadoras visibles; las categorías vacías no se muestran si el buscador filtra. En la home no hay un bloque de “Valores vigentes”.

**Footer.** Nav de categorías y una sola aclaración: el resultado es orientativo y no reemplaza el asesoramiento de un contador o abogado laboralista. Sin leyenda de sitio independiente ni de organismo oficial.

**Formulario. Etiqueta, texto de ayuda y campo. El monto lleva un prefijo `$` unido al input. El select nativo se estiliza sin librerías. El sí/no (sindicato) es un control segmentado de dos opciones, con el estado activo en petróleo.

**Resultado.** Tarjeta con borde petróleo. Cifra grande (“Cobrás en mano”) y desglose en tabla, con el neto separado por un borde superior. En escritorio va al lado del formulario y queda fijo al scrollear.

**Migas, FAQ y fuentes.** Migas con chevron Lucide en máscara CSS. Preguntas en `details/summary`, sin librerías. Las fuentes van al final, con enlace desde la bajada de la calculadora.

**Foco.** `outline: 3px solid var(--marca)` y `offset: 2px`. El skip link “Saltar al contenido” aparece al tabular.

## Íconos

Familia **Lucide**, trazo 2, 18–20 px, `currentColor`. Solo donde aportan (lupa del buscador, chevron de migas y de las preguntas). **Prohibido** un ícono genérico en cada tarjeta.

## Voz

Rioplatense, de vos, directa. Títulos en oración. Sin signos de exclamación de más, sin emojis, sin “¡Hacé la cuenta!”. El sitio habla de “normas vigentes” y “resultado orientativo”, no de trámite ni de organismo. No hay aviso de “sitio independiente” ni de “no pertenece al Estado”: no hace falta, nadie se va a confundir.

## Accesibilidad (AA)

- Contraste verificado en esta paleta (ver tabla).
- `lang="es-AR"`, jerarquía de headings, `aria-label` en nav y buscador, `aria-live` en el resultado, `aria-current` en migas y nav.
- Campos con `label` explícito y `aria-describedby` para la ayuda.
- No transmitir información solo con color (el desglose lleva el porcentaje escrito).

## Estructura del mockup

```
index.html
laboral/sueldo-neto/index.html
styles.css
design-system.md
fonts/          Source Sans 3 (OFL) en woff2, latin y latin-ext, pesos 400, 600 y 700
capturas/       home y sueldo neto, escritorio 1440 y celular 390
```

Los estilos viven en un solo CSS. Las rutas del mockup son relativas, para poder recorrerlo en local.
