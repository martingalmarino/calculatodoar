# 28 · Rediseño de la home: catálogo de categorías y calculadoras

**Qué hace:** reemplaza la home actual (hero largo + ranking de 5 + panel de valores al costado + “Por tema” al final) por una home corta: un H1 general, una bajada de dos frases, el buscador y, debajo, la grilla de categorías con todas las calculadoras a la vista. El listado sale de `lib/content.ts` (o del helper `categoriasConContenido()` si ya está el prompt 12): si una categoría no tiene calculadoras, no se muestra.

**Por qué:** con más calculadoras, el ranking de cinco ya no alcanza y el catálogo queda escondido. La referencia es la idea de [calculator-online.net](https://calculator-online.net/) — buscador arriba, poco texto, cada rubro con sus enlaces visibles — pero resuelta con el sistema de diseño de calculalo (planilla de contador, sin tarjetas idénticas, sin íconos, sin gradientes). El hero viejo hablaba solo de sueldo, aguinaldo, despido, Ganancias y monotributo; ahora tiene que servir cuando crezcan las categorías.

El mockup de referencia está en este mismo pack: `index.html`, `styles.css` y las capturas de `capturas/`. No copies el HTML al proyecto: implementalo en Next con los componentes y los datos existentes. En la UI no hay ninguna marca interna: ni “Tanda 2”, ni “Nueva”, ni badges de tandas, ni leyendas para el equipo.

## Prompt para Cursor
```
Rediseñá la home de calculalo para que muestre directo las categorías y las calculadoras disponibles. Respetá el sistema de diseño (docs/design-system.md, app/globals.css): papel #F7F4EC, tinta #1A1D1A, verde #0B5D3B, ámbar #F2B705, Bricolage Grotesque + Public Sans ya autoalojadas, radio 6px, filetes, WCAG AA, mobile-first. Sin gradientes, sin glass, sin blobs, sin emojis, sin sombras de tarjeta, sin íconos decorativos.

Tomá como referencia visual el mockup estático de calculalo-home-v2 (index.html, styles.css, capturas/home-desktop.png y home-mobile.png). No lo copies literal al repo: traducilo a la plantilla Next que ya existe.

NO toques SITE.url, metadataBase, la lógica de canonical ni robots.txt. El dominio sigue siendo calculalo.com.ar y se resuelve después. No rompas las calculadoras existentes, sus rutas, ni sus páginas. No hagas deploy.

## 1. Textos del hero (reemplazan a los actuales)

El H1 y la bajada actuales (“Hacé la cuenta. / Con la norma de este mes.” y la enumeración de sueldo, aguinaldo, despido, Ganancias y monotributo) no van más.

Usá este par, que es el del mockup (opción A, la principal):

- H1: “Calculadoras online para tus cuentas de todos los días.”
- Bajada (dos frases, tal cual): “Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.”

Si al implementarlo el H1 queda largo o flojo en el layout, estas son las alternativas. La bajada no cambia: es siempre la de arriba. No mezcles textos.

- (B) H1: “Calculadoras online hechas para Argentina.”
- (C) H1: “Calculadoras online gratis, con los números de hoy.”

“Gratis” en la opción C está confirmado: no hay muro de pago ni planes pagos; el JSON-LD de cada calculadora ya declara offers.price 0 ARS, y el sitio en vivo (calculatodoar.vercel.app) entrega las cuentas sin registrarse. No lo presentemos como una promo temporal. La opción A (la del mockup) no dice “gratis”; úsala por defecto.

Un solo H1 por página. Podés dejar que el título parta de forma natural; no fuerces un <br> como en el hero viejo.

También actualizá el title y la description por defecto de app/layout.tsx, que hoy enumeran solo las cinco calculadoras de la tanda 1. Incluí “calculadoras online” de forma natural, coherente con el H1, sin armar un listado cerrado de herramientas. Propuesta (alineada a la opción A):

- title default: “calculalo: calculadoras online para tus cuentas de todos los días”
- description: “Calculadoras online para tus cuentas de todos los días. Sacá la cuenta en segundos, con los números de hoy.”

No cambies el template “%s | calculalo”. No toques metadataBase ni SITE.url.

## 2. Archivos a tocar

- app/page.tsx: rearmar la home (hero compacto + catálogo + valores vigentes abajo).
- app/globals.css: estilos del catálogo y del hero compacto; arreglo del nav en mobile (ver §5). Reutilizá tokens existentes. Podés dejar las clases .ranking y .cats por si algún hub las usa, pero la home ya no las usa.
- app/layout.tsx: solo title y description por defecto (punto 1).
- components/Header.tsx y components/Footer.tsx: el nav y el pie tienen que listar categoriasConContenido() (si el helper todavía no existe porque no corriste el prompt 12, crealo ahora en lib/content.ts: devuelve solo las categorías con al menos una calculadora en CALCULADORAS). No hardcodees las categorías.
- tests: actualizá o agregá lo indicado en §8.

No hace falta un componente nuevo si page.tsx queda claro; si preferís extraer, un CatalogoHome.tsx de servidor que reciba las categorías con sus calculadoras está bien. El buscador de la home sigue siendo el <form role="search" action="/buscar/"> que ya está (funciona sin JS).

## 3. Estructura de la página

En este orden, dentro de <main id="contenido">:

1) Hero compacto (menos padding que el actual: --s6 arriba, --s5 abajo): H1, bajada, formulario de búsqueda (input #q, name="q", action="/buscar/", método GET, label visible solo para lectores de pantalla, botón “Buscar”, placeholder “¿Qué querés calcular?” (el “Ej.: aguinaldo” del diseño original se corta en 390 px junto al botón)). Debajo, una línea de atajos con tres enlaces reales: sueldo en mano → /laboral/sueldo-neto/; aumento de alquiler → /finanzas/actualizacion-alquiler/; dólar tarjeta → /finanzas/dolar-tarjeta/. Si alguna de esas rutas todavía no existe en CALCULADORAS (porque no corriste la tanda 2), omitila y no dejes un enlace roto; podés completar con otras que sí existan, sin inventar destinos. Los atajos no reemplazan al catálogo ni enumeran el producto en el H1.

2) Catálogo “por tema”, sin un H2 general del tipo “Por tema” o “Calculadoras” (las categorías ya son H2). Sección con aria-label="Calculadoras por tema". Grilla de bloques, uno por categoría con contenido:

   - Encabezado del bloque: H2 con enlace al hub /{slug}/ (nombre de CATEGORIAS) y, a la derecha, la cantidad (“7 calculadoras” / “1 calculadora”, singular si es 1). El enlace del H2 lleva una flecha “ →” en verde, como el diseño actual.
   - Lista <ul> de calculadoras de esa categoría, en el orden de CALCULADORAS. Cada ítem es un <a href={urlCalc(c)}> rastreable, con el nombre (c.nombre) y el resumen (c.resumen) debajo. Altura mínima de fila 44px, filete entre filas, sin viñetas.
   - No hay ninguna marca interna en la UI: ni “Tanda 2”, ni “Nueva”, ni badges de tandas, ni leyendas para el equipo debajo del catálogo. Todas las calculadoras se ven igual: nombre, resumen y enlace. El mockup de este pack ya está así.

Orden visual de los bloques: si existen laboral y finanzas, poné laboral y finanzas en la primera fila (son las más densas) e impuestos y hogar debajo. Si alguna no tiene contenido, no dejes el hueco: la grilla se reacomoda con las que sí están. El nav del header y del footer mantiene el orden de categoriasConContenido() (laboral, impuestos, finanzas, hogar).

Layout: 2 columnas desde 800px, 1 columna en mobile. Filete superior de 2px tinta en el tablero, filete vertical entre columnas, filete inferior por bloque. align-items: start, para que un bloque corto (Impuestos, Hogar) no estire el de al lado. Mirá el mockup.

Se elimina de la home la lista numerada “Calculadoras” / “Más usadas”. El catálogo es el contenido principal.

3) “Valores vigentes”, debajo del catálogo, a ancho completo (ya no al costado del ranking). Seguí usando el panel oscuro .valores, que es la señal de confianza del sitio, pero en franja: en desktop, los pares dt/dd en 4 columnas (grid-auto-flow: column; dos filas: etiqueta arriba, cifra abajo); en mobile, cada par en una fila etiqueta | cifra. Un <dl> válido, sin wrappers entre dt y dd.

   Armá las filas solo con datos que existan en los módulos de lib/data (o equivalente), nunca hardcodeados y nunca inventados:
   - Tope ANSES y período, si está ansesActual (en el mockup: $ 4.861.685,38, 11/2026, Res. 304/2026).
   - ICL y UVA del día de consulta, si ya están las series de la tanda 2.
   - Último IPC mensual publicado (variación mensual y mes), si está la serie de IPC.
   Si la tanda 2 todavía no está cargada, el panel muestra solo lo de ANSES (y lo que ya hubiera: base mínima, aportes, vencimiento del SAC) y no inventa ICL/UVA/IPC.
   Cerrá con la línea de fuentes y fechas reales de esos datos, como ahora. En el mockup, con la tanda 2 a la vista: “Fuentes: Res. ANSES 304/2026 (tope de noviembre), BCRA (ICL y UVA al 9/11/2026) e INDEC (IPC de septiembre). El IPC de octubre se publica el 12/11.” Usá las fechas y las normas que estén en los JSON, no copies esa frase si los datos se actualizaron.

## 4. Datos

Toda la home sale de lib/content.ts y de los helpers ya existentes (CATEGORIAS, CALCULADORAS, calcsDe, urlCalc, categoriasConContenido). No armes un listado paralelo en page.tsx. Cuando agregues una calculadora a CALCULADORAS, tiene que aparecer sola en su bloque; cuando una categoría quede vacía, desaparece del catálogo, del nav, del footer y de los atajos que apunten a ella. Validá en build o en un test que todos los href del catálogo existan.

## 5. Accesibilidad

- lang="es-AR" (ya está en el layout), link “Saltar al contenido”, landmarks header/nav/main/aside/footer.
- Un H1. Las categorías son H2. “Valores vigentes” es H2.
- Labels explícitos en el buscador. Foco visible de 3px verde. Objetivos táctiles ≥ 44px (filas del catálogo, botón Buscar, ítems del nav).
- Contrastes del sistema de diseño (no uses ámbar como texto sobre papel, ni texto blanco sobre ámbar).
- El nav del header, en mobile, no puede ocultar los ítems a partir del 3º. Hoy globals.css tiene `@media (max-width:640px){.nav li:nth-child(n+3){display:none}}`: borrala. Con cuatro categorías escondería Finanzas y Hogar. En su lugar, el nav envuelve (flex-wrap) y, si hace falta, baja un poco el tamaño a 0.9rem. El header también puede envolver, con gap y un poco de padding vertical.
- Respetá prefers-reduced-motion (no agregues animaciones nuevas).

## 6. SEO

- Mantener los JSON-LD de WebSite (con SearchAction a /buscar/?q={search_term_string}) y Organization que ya renderiza la home. No los saques.
- Canonical de la home sigue siendo “/” (alternates.canonical ya está en page.tsx). No toques metadataBase ni SITE.url.
- Todos los enlaces del catálogo, de los atajos, del H2 de cada categoría, del header y del footer son <a href> reales, con barra final, rastreaables. Nada de onClick para navegar.
- Actualizá title y description por defecto (punto 1). Las páginas de calculadora y de hub no cambian su metadata.
- No hace falta un ItemList en la home. Si ya hay tests que miran el H1 viejo o el ranking, actualizalos.

## 7. Criterios de aceptación

- La home, con la tanda 2 aplicada, muestra las 4 categorías y las 17 calculadoras (5 vivas + 12 nuevas), cada una con nombre, resumen y enlace correcto. Sin la tanda 2, muestra solo laboral (3) e impuestos (2), y no aparecen Finanzas ni Hogar.
- No quedó el H1 ni la bajada viejos, ni la lista numerada. El hero usa el H1 de la opción A del punto 1 (o B/C, con la misma bajada). En la UI no hay ninguna marca interna (“Tanda 2”, “Nueva” u otra etiqueta de equipo).
- El buscador sigue andando: enviar “aguinaldo” lleva a /buscar/?q=aguinaldo.
- No hay enlaces a rutas que no existan en CALCULADORAS.
- El header en un viewport de 390px muestra todas las categorías con contenido, no solo las dos primeras.
- Contraste AA, un H1, foco visible, filas de 44px, HTML del <dl> válido.
- npm test y npm run build pasan. Las 5 calculadoras originales siguen en sus URLs.

## 8. Tests / e2e a actualizar

- Si algún test o e2e busca el string “Hacé la cuenta”, “Más usadas”, “Por tema” o cuenta 5 ítems en .ranking, actualizalo a la nueva home.
- Agregá (en tests unitarios o en tests/e2e/calculadoras.mjs, al inicio, contra BASE) una prueba de la home:
  - existe el H1 nuevo;
  - el formulario [role=search] apunta a /buscar/;
  - hay un enlace por cada ítem de CALCULADORAS, con href igual a urlCalc(c);
  - no se renderiza una categoría de CATEGORIAS que no esté en categoriasConContenido();
  - siguen presentes los script JSON-LD de WebSite y Organization (o los componentes JsonLd equivalentes).
- No hace falta cambiar los casos de las calculadoras que ya están en el e2e, salvo que un selector se haya roto (no debería: no toques esas páginas).

## 9. Qué no tocar

- SITE.url, metadataBase, canonical, robots, sitemap (salvo que el sitemap ya dependa de categoriasConContenido, que es lo correcto y no lo deshagas).
- Rutas, slugs, fórmulas, JSON de datos y componentes de las calculadoras.
- Fuentes autoalojadas y el resto del design system.
- Deploy: no publiques nada. Lo hace Martín.
```

**Cómo verificar:** `npm test` y `npm run build`. Abrí `/` en 1440 y en 390 y compará con `capturas/home-desktop.png` y `capturas/home-mobile.png` de este pack: hero corto con el H1 “Calculadoras online para tus cuentas de todos los días.”, catálogo en 2×2 (apilado en mobile), valores vigentes abajo, sin ranking y sin etiquetas internas. Buscá “aguinaldo” desde la home. En mobile, las cuatro categorías del nav se ven. Mirá el HTML y comprobá que cada calculadora de `lib/content.ts` tiene un `<a href>` en la home.
