# calculalo · Home v2 (catálogo)

Mockup estático, capturas y prompt para rediseñar la home: categorías y calculadoras a la vista, poco texto, buscador arriba. Referencia de estructura: [calculator-online.net](https://calculator-online.net/). Visual: sistema de diseño “planilla de contador”.

## Contenido

```
calculalo-home-v2/
├── README.md
├── 28-home-rediseno.md   prompt para Cursor
├── index.html            mockup estático (desktop y mobile)
├── styles.css
├── fonts/                Bricolage Grotesque + Public Sans (woff2)
├── capturas/
│   ├── home-desktop.png  1440 px de ancho
│   └── home-mobile.png   390 px de ancho
└── shots.py              genera las capturas
```

## Textos del hero (propuesta principal)

- **H1:** Calculadoras online para tus cuentas de todos los días.
- **Bajada:** Sacá la cuenta en segundos. Sueldo, alquiler, dólar o cuotas: lo que necesites, con los números de hoy.

Las alternativas de H1 (misma bajada) están en el prompt 28. El hero viejo (“Hacé la cuenta / Con la norma de este mes”) no se usa más.

Se confirmó que el sitio es gratis (no hay muro de pago; el JSON-LD ya declara `offers.price` 0 ARS), así que la alternativa de H1 con “gratis” es correcta.

## Qué se tomó de calculator-online.net (y qué no)

Se tomó: buscador arriba, poco texto, cada categoría con sus calculadoras visibles como enlaces, sin pasar por un ranking previo.

No se tomó: popups y avisos comerciales, bloques largos de “About”, título centrado subrayado, grilla de names-only a cuatro columnas (con 17 ítems conviene mostrar el resumen), hover con brillo, paleta azul sobre blanco.

## Cómo usarlo

1. Mirà el mockup (`index.html`) y las capturas.
2. Corré en Cursor el prompt `28-home-rediseno.md`, sobre el proyecto Next, **después** o **con** la tanda 2: la home lista lo que haya en `lib/content.ts` y oculta categorías vacías.
3. No copies el HTML al repo. En la UI no va ninguna marca interna (ni “Tanda 2”, ni “Nueva”, ni leyendas para el equipo).
4. No toques dominio, canonical ni `metadataBase`. No hagas deploy.
