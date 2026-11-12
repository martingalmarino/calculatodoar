# Prompt 32 — Hubs de categoría

Rediseñá las páginas de categoría (`/laboral/`, `/impuestos/`, y las que existan si ya está la tanda 2) para que usen las mismas tarjetas y la misma jerarquía que la home v3.

## Contexto

- Página: `app/[categoria]/page.tsx`. Hoy: `Header` con `actual={cat.slug}`, `Migas`, un H1 que es `cat.title` (el title SEO largo, p. ej. “Calculadoras laborales 2026: sueldo, aguinaldo y despido”), intro `cat.intro` en `.prosa`, y `ul.lista-calc` con nombre + `c.resumen`.
- `generateStaticParams` sale de `CATEGORIAS`. `generateMetadata` usa `c.title`, `c.description` y `canonical: /${c.slug}/`. JSON-LD: `collection(cat)` y `breadcrumb(migas)`. **No cambies ninguno de esos metadatos ni el JSON-LD.**
- El H1 visible puede seguir siendo `cat.title` (es el título de la página, no lo reescribas) o, si queda demasiado largo frente al mockup, usá `cat.nombre` como H1 y dejá `cat.title` solo en el `<title>` / metadata. Preferí no cambiar el H1 salvo que rompa la jerarquía visual; si lo cambiás a `cat.nombre`, documentalo y no toques `generateMetadata`.
- Lista: las mismas tarjetas que en la home (`c.nombre`, `c.resumen`, `urlCalc(c)`). Si una categoría no tiene calculadoras, `generateStaticParams` no debería emitirla; no inventes un estado “próximamente” con etiqueta interna.
- Componentes reutilizables: si en el 31 armaste un componente de tarjeta o de grilla, reutilizalo. Si no, podés extraer uno chico (p. ej. `components/TarjetaCalc.tsx`) y usarlo en home, hub y, si sirve, en `/buscar/`.
- Migas: `components/Migas.tsx` y estilos `.migas` en `globals.css`. Ajustá el estilo al mockup (el de la calculadora en `referencia/laboral/sueldo-neto/index.html`): texto chico, `--tinta-suave`, el actual sin link, separador “/”.

## Archivos a tocar

- `app/[categoria]/page.tsx` (marcado y clases; no metadata)
- `app/globals.css` (`.lista-calc` / grilla de tarjetas, `.migas`, `.prosa` del hub)
- Un componente de tarjeta compartido, si lo extraés
- `app/buscar/page.tsx` solo si conviene que los resultados usen las mismas tarjetas (opcional, no bloquea)
- `docs/design-system.md` si hace falta documentar el hub

## Pasos

1. El hub muestra: migas (Inicio / Nombre de categoría), H1, intro, grilla de tarjetas con todas las calculadoras de `calcsDe(cat.slug)`. Desktop: 2 columnas de tarjetas; mobile: 1. Mismo hover, borde y tipografía que en la home.
2. No agregues bloque de Valores vigentes, etiquetas internas, aviso de independencia ni slots de AdSense.
3. No cambies slugs, `dynamicParams`, `generateStaticParams`, `generateMetadata`, JSON-LD ni los textos de `CATEGORIAS` / `CALCULADORAS` en `lib/content.ts`.
4. Verificá `/laboral/` y `/impuestos/` (y `/finanzas-personales/` o `/hogar-y-auto/` si ya existen en el repo). Header con `aria-current` en la categoría actual (ya sale del 30).

## Criterios de aceptación

- `npm test` y `npm run build` pasan.
- Cada calculadora de la categoría tiene un enlace crawlable a su URL real.
- Title, description y canonical de cada hub no cambiaron.
- JSON-LD de Collection/ItemList y BreadcrumbList sigue.
- Visual alineado con las tarjetas de la home y con `referencia/design-system.md`.
- En 390px las tarjetas se apilan y son tocables (≥ 44px).

## Qué no tocar

- `SITE.url`, `metadataBase`, canonical, `generateMetadata`, JSON-LD, `generateStaticParams`, slugs, textos de contenido, `lib/calc`, `data/`.
- Deploy. No AdSense.

## Cómo verificar

`npm test` && `npm run build`. Abrí `/laboral/` y `/impuestos/` en 1440 y 390. Entrada a “Sueldo neto” tiene que ir a `/laboral/sueldo-neto/`. Las migas y el header activo se ven bien. El HTML de metadata no cambió.

---

## Prompt para Cursor

```
Rediseño visual v3 de calculalo, prompt 32 de 34: hubs de categoría. Tokens, header/footer y home ya están por 29–31. Aplicá las mismas tarjetas y la misma jerarquía a las páginas de categoría.

Contexto: app/[categoria]/page.tsx hoy monta Header (actual={cat.slug}), Migas, un H1 que es cat.title (el title SEO largo), p.prosa con cat.intro, y ul.lista-calc con nombre + resumen. generateStaticParams sale de CATEGORIAS. generateMetadata usa c.title, c.description y canonical /${c.slug}/. JSON-LD: collection(cat) y breadcrumb(migas). NO cambies metadatos, canonical, JSON-LD, generateStaticParams ni los textos de lib/content.ts.

Qué hacer:
1. El hub muestra migas (Inicio / Nombre de categoría), H1, intro y una grilla de tarjetas con calcsDe(cat.slug): c.nombre, c.resumen, href={urlCalc(c)}. Desktop 2 columnas, mobile 1. Mismo estilo de tarjeta que la home (borde --linea, radio 8px, hover borde --marca, sin sombra, sin íconos decorativos). Si en el 31 armaste un componente de tarjeta o grilla, reutilizalo; si no, podés extraer uno chico (p. ej. components/TarjetaCalc.tsx) y usarlo en home y hub. Opcional: usarlo también en /buscar/.
2. El H1 visible puede seguir siendo cat.title. Si queda demasiado largo, usá cat.nombre como H1 y dejá cat.title solo en generateMetadata; documentalo y no toques la metadata. Preferí no cambiar el H1 si no hace falta.
3. Estilos de .migas como en el mockup de la calculadora (referencia/laboral/sueldo-neto/index.html): texto chico, --tinta-suave, el actual sin link, separador “/”.
4. No agregues bloque de Valores vigentes, etiquetas internas, aviso de independencia ni espacios/slots para AdSense. No inventes un “próximamente” con badge de equipo si una categoría está vacía (no debería renderizarse).
5. Verificá /laboral/ y /impuestos/, y /finanzas-personales/ o /hogar-y-auto/ si ya existen. El header lleva aria-current en la categoría actual.

Criterios: npm test y npm run build pasan. Cada calculadora de la categoría tiene un <a> crawlable a su URL real. Title, description y canonical de cada hub no cambiaron. JSON-LD sigue. Visual alineado con la home y con referencia/design-system.md. En 390px las tarjetas se apilan y miden ≥ 44px de alto clicable.

No toques: SITE.url, metadataBase, canonical, generateMetadata, JSON-LD, generateStaticParams, slugs, textos de CATEGORIAS/CALCULADORAS, lib/calc, data/. No hagas deploy.
```
