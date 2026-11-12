# Prompt 33 — Plantilla de calculadora

Aplicá el visual v3 a la plantilla de las calculadoras (formulario y resultado al lado, desglose, cómo se calcula, fuentes, FAQ). **No toques la lógica de `lib/calc` ni los datos.** Los números tienen que salir iguales.

## Contexto

- Mockup de referencia: `referencia/laboral/sueldo-neto/index.html` y `referencia/styles.css` (`.migas`, `.calc`, `form.campos`, `.campo`, `.peso`, `.resultado`, `.desglose`, `.formula`, `.aviso`, `details`, `#fuentes`). Capturas: `referencia/capturas/sueldo-neto-desktop.png`, `sueldo-neto-desktop-fold.png`, `sueldo-neto-mobile.png`. Ejemplo verificado (no lo cambies): bruto $1.500.000 → neto $1.245.000.
- Página plantilla: `app/[categoria]/[calculadora]/page.tsx`. Estructura actual: JsonLd (`webApp`, `faqPage`, `breadcrumb`) → Header → main (Migas, H1 `c.h1`, `.meta` con fecha y ancla a fuentes, intro `c.intro`, el componente cliente `<Calc />`, `SITE.descargo`, bloque `.dos` con “Cómo se calcula” + fórmula + aviso + ejemplo + FAQ + `<Fuentes />`, y aside “Seguí con”).
- La isla cliente está en `components/calcs/*` (SueldoNeto, Aguinaldo, Indemnizacion, Ganancias, Monotributo, y las de la tanda 2 si ya están). Todas usan `components/Campos.tsx`, `components/MoneyInput.tsx`, `components/Resultado.tsx` y arman un `<div className="calc">` con `<form className="campos">` y `<Resultado />`.
- `Resultado` renderiza `<output className="grande" aria-live="polite" data-testid="resultado">`. **Ese `data-testid` no se toca**: el e2e (`tests/e2e/calculadoras.mjs`) lo usa, igual que los ids de campos `#bruto`, `#rem`, `#fact`.
- El panel de resultado hoy es verde a todo el ancho, con barra ámbar/blanca (`barra` opcional). En el mockup v3 el resultado es una tarjeta blanca, borde 2px `--marca`, cifra grande en petróleo, desglose en tabla, fila total con fondo `--marca-tint`. No hay barra ámbar. Preferí igualar el mockup: podés dejar de pasar `barra` o no renderizar `.barra` (es solo UI). No cambies las líneas del desglose ni los importes.
- A ≥900px, formulario y resultado van en dos columnas (`align-items: start`); el resultado puede ser `position: sticky; top: 1rem`. En 390px, el formulario va primero y el resultado debajo, a todo el ancho.
- Fórmula: bloque con fondo `--marca-tint` y borde izquierdo 4px `--marca` (se va el borde ámbar y el `--papel-2`). FAQ: `<details>/<summary>` nativos, uno por pregunta, bordes de `referencia/styles.css`. Fuentes: `components/Fuentes.tsx`, id `fuentes`.

## Archivos a tocar

- `app/globals.css` (plantilla de calculadora: `.calc`, formulario, campos, resultado, fórmula, aviso, details, relacionadas, meta, descargo)
- `components/Resultado.tsx` (marcado/clases visuales; no el `data-testid` ni `aria-live`)
- `components/Campos.tsx`, `components/MoneyInput.tsx` solo si hace falta algún className; no cambies comportamiento ni máscara
- `app/[categoria]/[calculadora]/page.tsx` solo clases/orden visual; no metadata ni JSON-LD
- `components/calcs/*` solo si hay que dejar de pasar `barra` o ajustar una clase; **no** toques `useState` iniciales, llamadas a `calcular*`, parseo ni textos de líneas
- `components/Fuentes.tsx` / `Migas.tsx` solo estilos, si hace falta
- `docs/design-system.md` para documentar la plantilla v3

## Pasos

1. Reescribí los estilos de la plantilla según el mockup y `referencia/design-system.md`. Formulario blanco, borde `--linea`, labels 700, ayuda en `--tinta-suave`, `.peso` con prefijo `$`, inputs 1.15rem 600 tabular-nums, alto de control ≥ 44px, foco con outline `--marca` (sin glow).
2. Resultado destacado como en el mockup: cifra `clamp(2.25rem, 8vw, 3.25rem)` peso 700, color `--marca`, `font-variant-numeric: tabular-nums`. Desglose completo. Sacá la barra ámbar (o no la muestres). Links dentro del resultado, si los hay, en `--marca`.
3. Conservá el orden de la página: migas, H1, meta (fecha + ancla Fuentes), intro, form+resultado, descargo (`SITE.descargo`), Cómo se calcula, ejemplo, FAQ, Fuentes, Seguí con. No agregues ni saques secciones de contenido.
4. No toques `lib/calc/**`, `lib/params.ts`, `data/`, `lib/data/`, `lib/ejemplos.ts` (textos de aviso/ejemplo), ni los objetos de `CALCULADORAS` (h1, intro, formula, faq).
5. No agregues AdSense, aviso de independencia, ni etiquetas internas.

## Criterios de aceptación

- `npm test` y `npm run build` pasan.
- Con los valores por defecto de sueldo neto, el resultado sigue siendo $1.245.000 (o el equivalente formateado que ya mostraba).
- `data-testid="resultado"` y los ids de campos del e2e siguen iguales.
- En 1440, form y resultado lado a lado, como `referencia/capturas/sueldo-neto-desktop.png` (y la fold). En 390, apilados, como `sueldo-neto-mobile.png`.
- FAQ, fuentes, fórmula y relacionadas se ven y funcionan. Un H1, labels asociados, foco visible, contraste AA, `aria-live` en la cifra.
- Las 5 calculadoras vivas (y las de la tanda 2 si están) renderizan la nueva plantilla sin cambiar resultados.

## Qué no tocar

- `lib/calc/**`, `data/`, `lib/data/`, `lib/params.ts`, lógica de cálculo en los componentes cliente (valores, fórmulas, condiciones).
- `SITE.url`, `metadataBase`, `generateMetadata`, canonical, JSON-LD (`webApp`, `faqPage`, `breadcrumb`).
- Slugs, URLs, `data-testid="resultado"`, ids `#bruto`, `#rem`, `#fact` (y los demás que use el e2e).
- Deploy. No AdSense.

## Cómo verificar

`npm test` && `npm run build`. Abrí `/laboral/sueldo-neto/` en 1440 y 390 y compará con las capturas. Bruto 1.500.000 → neto 1.245.000. Cambiá un campo y mirá que el `output` se actualice. Recorré aguinaldo, indemnización, Ganancias y monotributo: mismos números de siempre, nuevo traje. Si la tanda 2 está, abrí una de cada categoría nueva y confirmá que no se rompió el cálculo.

---

## Prompt para Cursor

```
Rediseño visual v3 de calculalo, prompt 33 de 34: plantilla de calculadora (formulario y resultado, desglose, cómo se calcula, fuentes, FAQ). NO toques la lógica de lib/calc ni los datos. Los números tienen que salir iguales.

Contexto: el mockup aprobado está en calculalo-rediseno-v3/referencia/laboral/sueldo-neto/index.html, referencia/styles.css y capturas sueldo-neto-desktop.png, sueldo-neto-desktop-fold.png, sueldo-neto-mobile.png. Ejemplo verificado (no lo cambies): bruto $1.500.000 → neto $1.245.000.

La plantilla vive en app/[categoria]/[calculadora]/page.tsx: JsonLd (webApp, faqPage, breadcrumb), Header, Migas, H1 = c.h1, p.meta (fecha + ancla #fuentes), intro, el componente cliente <Calc />, SITE.descargo, un .dos con “Cómo se calcula” (c.formula, ej.aviso, ej.ejemplo), FAQ en <details>, <Fuentes />, y aside “Seguí con”. Las islas están en components/calcs/* y usan Campos, MoneyInput y Resultado. Resultado ya tiene <output className="grande" aria-live="polite" data-testid="resultado">: NO saques ni renombres data-testid. El e2e (tests/e2e/calculadoras.mjs) también depende de los ids #bruto, #rem, #fact. Hoy .resultado es un panel verde con una barra ámbar opcional; en el mockup v3 es una tarjeta blanca, borde 2px --marca, cifra grande petróleo, tabla de desglose, fila total con fondo --marca-tint, sin barra ámbar.

Qué hacer:
1. Reescribí en app/globals.css los estilos de la plantilla según el mockup y referencia/design-system.md. A ≥900px, .calc es dos columnas (form | resultado), align-items start; el resultado puede ser position:sticky; top:1rem. En 390px, form primero y resultado debajo, a todo el ancho. Formulario blanco, borde --linea, labels 700, ayuda --tinta-suave, .peso con prefijo $, inputs 1.15rem 600 tabular-nums, controles ≥ 44px, foco outline --marca sin glow.
2. En components/Resultado.tsx actualizá el visual (clases/marcado) sin tocar data-testid ni aria-live. Cifra clamp(2.25rem, 8vw, 3.25rem) peso 700, color --marca, tabular-nums. Desglose completo. Preferí igualar el mockup: no muestres la barra ámbar (dejá de pasar barra o no renderices .barra; es solo UI). No cambies las líneas del desglose ni los importes. Links dentro del resultado, si hay, en --marca.
3. Fórmula: fondo --marca-tint y borde izquierdo 4px --marca (se va el ámbar y el papel-2). FAQ: details/summary nativos con el estilo del mockup. Ajustá Migas/Fuentes solo a nivel estilo si hace falta. Conservá el orden de las secciones de la página; no agregues ni saques contenido.
4. En components/calcs/* y en Campos/MoneyInput solo toques clases o dejes de pasar barra. NO cambies useState iniciales, llamadas a calcular*, parseo, ids de campos, ni textos de las líneas del desglose.
5. No toques lib/calc/**, lib/params.ts, data/, lib/data/, lib/ejemplos.ts, ni los objetos de CALCULADORAS (h1, intro, formula, faq). No toques generateMetadata ni los JSON-LD. No agregues AdSense, aviso de independencia ni etiquetas internas.

Criterios: npm test y npm run build pasan. Sueldo neto por defecto sigue dando $1.245.000. data-testid="resultado" e ids del e2e intactos. En 1440 form y resultado lado a lado, como las capturas; en 390 apilados. FAQ, fuentes, fórmula y relacionadas funcionan. Un H1, labels, foco visible, contraste AA, aria-live en la cifra. Las 5 calculadoras vivas (y las de la tanda 2 si están) usan la plantilla nueva y dan los mismos resultados.

No toques: lógica de cálculo, data/, SITE.url, metadataBase, canonical, JSON-LD, slugs, URLs. No hagas deploy.
```
