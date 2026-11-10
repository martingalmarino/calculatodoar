# 12 · Hubs de Finanzas y Hogar, nav, home e interlinking

**Qué hace:** suma las categorías `/finanzas/` y `/hogar/` a la estructura existente, las agrega al menú, a la home y al footer, y define los enlaces cruzados entre calculadoras. Una categoría sin calculadoras no se muestra ni se enlaza.

**Por qué:** la plantilla ya resuelve hubs y calculadoras desde `lib/content.ts`. Alcanza con ampliar los tipos y los textos, sin tocar el diseño. Si se ocultan las categorías vacías, no quedan páginas finas ni enlaces rotos mientras vas sumando calculadoras.

## Prompt para Cursor
```
Respetá el sistema de diseño (docs/design-system.md, app/globals.css) y la plantilla existente. No cambies estilos ni rompas las 5 calculadoras actuales.
No toques SITE.url, canonical, sitemap base ni robots: el dominio se resuelve después.

En lib/content.ts:
- Ampliá CategoriaSlug a "laboral" | "impuestos" | "finanzas" | "hogar". Ampliá CalcSlug con:
  finanzas: "actualizacion-alquiler", "cuotas-o-contado", "dolar-tarjeta", "plazo-fijo", "inflacion", "rendimiento-billeteras", "prestamos"
  hogar: "combustible"
  laboral: "vacaciones", "horas-extras", "liquidacion-final", "costo-laboral"
- Agregá a CATEGORIAS:
  finanzas → nombre "Finanzas personales", title "Calculadoras de finanzas personales 2026: alquiler, dólar, plazo fijo e inflación",
    description "Actualizá tu alquiler por ICL o IPC, calculá el dólar tarjeta, compará plazo fijo y billeteras, y medí cuánto perdió tu plata con la inflación.",
    intro "Las cuentas de todos los meses: cuánto aumenta el alquiler, si conviene pagar en cuotas, cuánto sale el dólar con tarjeta y cuánto rinde tu plata. Usamos los índices oficiales del BCRA y del INDEC, y te mostramos la fecha de cada dato."
  hogar → nombre "Hogar y auto", title "Calculadoras para el hogar y el auto: combustible, nafta y GNC",
    description "Calculá cuánto sale un viaje en auto y si te conviene la nafta o el GNC, con los precios que pagás vos.",
    intro "Herramientas para gastos de la casa y del auto. Los precios los cargás vos, porque cambian según la ciudad y la estación de servicio."
- Agregá un campo opcional `descargo` por categoría y usalo en la plantilla en lugar de SITE.descargo cuando exista:
  finanzas → "Resultado orientativo. No es una recomendación de inversión ni reemplaza el asesoramiento de un profesional."
  hogar → "Resultado orientativo, calculado con los precios y consumos que cargaste."
- Creá el helper categoriasConContenido() que devuelva solo las categorías que tienen al menos una calculadora en CALCULADORAS. Usalo en Header (nav), home (tarjetas .cats), Footer, generateStaticParams del hub y sitemap. Hasta que existan las calculadoras de los prompts 14–25, finanzas y hogar no deben aparecer.
- Relacionadas (máximo 3 por calculadora, sin repetir la propia):
  actualizacion-alquiler → inflacion, plazo-fijo, rendimiento-billeteras
  cuotas-o-contado → inflacion, rendimiento-billeteras, prestamos
  dolar-tarjeta → inflacion, plazo-fijo, cuotas-o-contado
  plazo-fijo → rendimiento-billeteras, inflacion, prestamos
  inflacion → actualizacion-alquiler, plazo-fijo, cuotas-o-contado
  rendimiento-billeteras → plazo-fijo, inflacion, cuotas-o-contado
  prestamos → cuotas-o-contado, plazo-fijo, inflacion
  combustible → cuotas-o-contado, inflacion, dolar-tarjeta
  vacaciones → aguinaldo, liquidacion-final, sueldo-neto
  horas-extras → sueldo-neto, vacaciones, costo-laboral
  liquidacion-final → indemnizacion, vacaciones, aguinaldo
  costo-laboral → sueldo-neto, horas-extras, liquidacion-final
  Sumá también en indemnizacion la relacionada liquidacion-final, y en sueldo-neto la relacionada costo-laboral, reemplazando la menos relevante para no pasar de 3.
  Validá en build (o en un test) que toda relacionada apunte a una calculadora existente; si no existe todavía, que se omita sin romper.
- En la home, la sección de ranking/destacadas tiene que seguir mostrando las 5 actuales primero. Las nuevas entran por categoría.
```

**Cómo verificar:** `npm run build` sin errores; con solo este prompt aplicado, el sitio se ve igual que antes (sin finanzas ni hogar en el menú). Después del prompt 14 aparece Finanzas en el nav, la home y el sitemap.
