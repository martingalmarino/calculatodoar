# Prompt 30 — Header, nav y footer

Aplica el header, la navegación y el pie del visual v3. En mobile el nav tiene que mostrar **todas** las categorías con contenido, no ocultar a partir de la tercera. El footer deja solo la aclaración de que el resultado es orientativo; no hay leyenda de “sitio independiente”.

## Contexto

- Mockup: `referencia/index.html` (header y footer) y estilos `.top`, `.logo`, `.nav`, `footer` en `referencia/styles.css`. Capturas: `referencia/capturas/home-desktop.png` y `home-mobile.png`.
- Componentes actuales:
  - `components/Header.tsx`: logo `calcu<span>lalo</span>` (el “lalo” va sobre ámbar), nav con `CATEGORIAS.map`, `aria-current` según la prop `actual`.
  - `components/Footer.tsx`: links a categorías y el texto `calculalo.com.ar: las cuentas de la vida en Argentina, hechas con la norma vigente. {SITE.descargo}`.
  - `SITE.descargo` en `lib/content.ts` ya es: “Resultado orientativo. No reemplaza el asesoramiento de un contador o abogado laboralista.”
- En `app/globals.css` hay esta regla que hay que **eliminar**: `@media (max-width:640px){.nav li:nth-child(n+3){display:none}}`. Por eso en 390px solo se ven las dos primeras categorías.
- El layout raíz (`app/layout.tsx`) no monta Header/Footer: cada página los incluye. No hace falta moverlos al layout en este prompt.
- Si el prompt 12 (tanda 2) o el 28 ya agregaron `categoriasConContenido()` en `lib/content.ts`, usala. Si no existe, creala acá (función chica, sin cambiar textos ni slugs):

```ts
export const categoriasConContenido = () => CATEGORIAS.filter((c) => calcsDe(c.slug).length > 0);
```

El header y el footer tienen que listar solo esas, para no enlazar a hubs vacíos.

## Archivos a tocar

- `components/Header.tsx`
- `components/Footer.tsx`
- `app/globals.css` (reglas de header, logo, nav y footer)
- `lib/content.ts` solo si hay que agregar `categoriasConContenido()` (no cambies `SITE`, textos, slugs ni calculadoras)
- `docs/design-system.md` si hace falta alinear la descripción de header/footer

## Pasos

1. Header como en el mockup: fondo `--superficie`, borde inferior 3px `--marca`, logo `calcu<em>lalo</em>` (o un span) con el subrayado cobre de 3px bajo “lalo”, color `--tinta`, sin fondo ámbar. El `aria-label` sigue siendo “calculalo, inicio” y apunta a `/`. Altura cómoda (~64px), `.wrap` con flex y gap.

2. Nav con las categorías de `categoriasConContenido()` (o el equivalente que ya exista), links a `/${c.slug}/`, `aria-current="page"` cuando `actual === c.slug`. El ítem actual se marca con un subrayado cobre de 3px (`--acento`), no con ámbar. Tipografía 600 / ~0.95rem, color `--tinta`, hover `--marca`.

3. **Mobile (390px):** el nav no oculta categorías. Que wrapee debajo del logo si no entra en una línea (como en `referencia/styles.css`: a 720px el header puede ser columna, nav con `flex-wrap`). Todas las categorías con contenido se ven y son tocables (≥ 44px). Sacá la regla `.nav li:nth-child(n+3){display:none}`.

4. Footer: borde superior 1px `--linea`, texto `--tinta-suave`, ~0.875rem. Links a las mismas categorías con contenido. El texto del pie incluye `SITE.descargo` (resultado orientativo). Podés dejar una frase corta de marca (“calculalo.com.ar”) junto al descargo, como ahora, o el texto del mockup. **No agregues** “sitio independiente”, “no pertenece al Estado” ni ningún aviso de independencia, ni en el header, ni en una barra bajo el header, ni en el footer. Martín lo sacó de todas las páginas.

5. No agregues menú hamburguesa si el mockup no lo tiene: en mobile se ven los links. No agregues espacio, slot ni reserva para AdSense.

## Criterios de aceptación

- `npm test` y `npm run build` pasan.
- En un viewport de 390px el header muestra todas las categorías con contenido (si está la tanda 2, las cuatro; si no, laboral e impuestos). Ninguna queda en `display: none` por orden.
- El logo ya no tiene el “lalo” sobre ámbar; el acento es el subrayado cobre.
- El footer tiene la aclaración de resultado orientativo (`SITE.descargo`) y no tiene leyenda de sitio independiente.
- `aria-current`, skip link y landmarks se mantienen.
- No se tocaron `SITE.url`, canonical, JSON-LD ni las rutas.

## Qué no tocar

- `SITE.url`, `SITE.descargo` (se usa, no se reescribe), `metadataBase`, canonical, JSON-LD.
- Lógica de `lib/calc`, `data/`, slugs, URLs, páginas de calculadora (salvo que hereden el header/footer nuevo).
- Deploy. No AdSense. No leyenda de independencia.

## Cómo verificar

`npm test` && `npm run build`. Abrí `/` y `/laboral/sueldo-neto/` en 1440 y en 390. Compará header y footer con `referencia/capturas/home-desktop.png` y `home-mobile.png`. En 390, contá los links del nav: tienen que ser todos los de `categoriasConContenido()`. Buscá en el HTML las frases “sitio independiente” y “no pertenece al Estado”: no tienen que aparecer.

---

## Prompt para Cursor

```
Rediseño visual v3 de calculalo, prompt 30 de 34: header, nav y footer. Los tokens y Source Sans 3 ya están por el prompt 29. No reescribas la home ni la plantilla de calculadora (31 y 33).

Contexto: el mockup está en calculalo-rediseno-v3/referencia/ (index.html, styles.css, capturas home-desktop.png y home-mobile.png, design-system.md). components/Header.tsx hoy tiene el logo calcu<span>lalo</span> con el “lalo” sobre ámbar y un nav que mapea CATEGORIAS, con aria-current según la prop actual. components/Footer.tsx lista categorías y el texto “calculalo.com.ar: las cuentas de la vida en Argentina, hechas con la norma vigente. {SITE.descargo}”. SITE.descargo ya dice “Resultado orientativo. No reemplaza el asesoramiento de un contador o abogado laboralista.” En app/globals.css está la regla @media (max-width:640px){.nav li:nth-child(n+3){display:none}}: ELIMINALA. En mobile tienen que verse todas las categorías con contenido.

Qué hacer:
1. Si no existe categoriasConContenido() en lib/content.ts, agregala: CATEGORIAS.filter((c) => calcsDe(c.slug).length > 0). No cambies SITE, textos, slugs ni el array de calculadoras. Header y footer listan solo esas categorías, para no enlazar hubs vacíos. Si la función ya está (tanda 2 o un intento del 28), usala y no la deshagas.
2. Header como el mockup: fondo --superficie, borde inferior 3px --marca, logo calcu<em>lalo</em> (o un span) con subrayado cobre de 3px (--acento) bajo “lalo”, color --tinta, sin fondo ámbar. aria-label “calculalo, inicio”, href /. Altura ~64px, .wrap con flex.
3. Nav: links a /${slug}/, aria-current="page" cuando actual === slug. El ítem activo se marca con subrayado cobre de 3px, no ámbar. Peso 600, hover --marca.
4. En 390px el nav no oculta categorías. Que wrapee debajo del logo si no entra (como en referencia/styles.css, a 720px el header puede ser columna, nav con flex-wrap). Áreas táctiles ≥ 44px. Sin menú hamburguesa si el mockup no lo tiene.
5. Footer: borde superior 1px --linea, texto --tinta-suave ~0.875rem, links a las mismas categorías. Incluí SITE.descargo (resultado orientativo). Podés dejar una frase corta de marca junto al descargo. NO agregues “sitio independiente”, “no pertenece al Estado” ni ningún aviso de independencia, ni en el header, ni en una barra bajo el header, ni en el footer. Martín lo sacó de todas las páginas.
6. No agregues espacios, slots ni reservas de altura para AdSense.

Criterios: npm test y npm run build pasan. En 390px se ven todas las categorías con contenido. El logo ya no tiene ámbar. El footer tiene el descargo orientativo y no tiene leyenda de independencia. aria-current, skip link y landmarks se mantienen.

No toques: SITE.url, el texto de SITE.descargo (se usa, no se reescribe), metadataBase, canonical, JSON-LD, lib/calc, data/, slugs, URLs, la estructura de la home o de las calculadoras. No hagas deploy.
```
