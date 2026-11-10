# 26 · SEO de la tanda 2: metadata, JSON-LD, sitemap, buscador y fecha

**Qué hace:** completa title, description y FAQ de las 12 calculadoras nuevas, aplica el JSON-LD que ya existe (WebApplication, FAQPage, BreadcrumbList y CollectionPage en los hubs), suma las rutas nuevas al sitemap y al buscador, y actualiza FECHA_MODIFICACION.

**Por qué:** la plantilla ya genera todo eso desde lib/content.ts y lib/seo.ts. Falta que los textos nuevos estén completos y que el buscador encuentre las palabras con las que la gente busca ("dólar tarjeta", "ICL", "aumento de alquiler", "plus vacacional"). El dominio y el canonical no se tocan, porque los resolvés vos después.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales. NO cambies SITE.url ni la lógica de canonical/robots (el dominio se resuelve después).

1) Revisá que cada calculadora nueva en lib/content.ts tenga: title de 60 caracteres o menos con "2026" solo si el resultado depende del año
   (sí en laborales y dólar; no en combustible, cuotas o inflación), description de 155 caracteres o menos con un verbo de acción,
   h1, intro de 2 oraciones, fórmula, 4 o 5 FAQ que respondan en la primera oración, y 3 relacionadas.
2) lib/seo.ts: webApp con applicationCategory según la categoría (FinanceApplication para laboral, impuestos y finanzas; UtilitiesApplication para hogar).
   dateModified: por defecto FECHA_MODIFICACION; para las calculadoras que dependen de series (alquiler, inflación, plazo fijo, préstamos)
   usá la fechaConsulta del JSON correspondiente si es más reciente.
3) Actualizá FECHA_MODIFICACION a la fecha en que cargaste los datos (la de este pack es "2026-11-09"; si corriste npm run data:series después, usá esa fecha).
4) app/sitemap.ts: incluí hubs y calculadoras solo de categoriasConContenido(), con lastModified por página igual a su dateModified.
5) /buscar/: agregá a cada calculadora un array `sinonimos` y que el filtro los use, sin acentos y en minúsculas. Ejemplos:
   actualizacion-alquiler: ["icl","ipc alquiler","aumento alquiler","ley de alquileres"]; dolar-tarjeta: ["dolar turista","percepcion 30","mep","impuesto pais"];
   plazo-fijo: ["uva","tna","tea"]; inflacion: ["ipc","poder adquisitivo"]; rendimiento-billeteras: ["mercado pago","cuenta remunerada","ualá"];
   prestamos: ["credito hipotecario","uva","sistema frances"]; combustible: ["nafta","gnc","viaje"]; vacaciones: ["plus vacacional","dias de vacaciones"];
   horas-extras: ["horas extra","50%","100%"]; liquidacion-final: ["renuncia","finiquito","mutuo acuerdo"]; costo-laboral: ["cargas sociales","contribuciones patronales","rifl"];
   cuotas-o-contado: ["cuotas sin interes","valor presente"].
6) Breadcrumbs: Inicio › Finanzas personales › {calculadora}, igual que en laboral.
7) Interlinking desde el contenido: en la intro de inflación, enlazá plazo-fijo y actualizacion-alquiler; en la de vacaciones, enlazá liquidacion-final.
   Nada de enlaces a páginas que no existen.
```

**Cómo verificar:** `npm run build`; abrí /sitemap.xml y fijate que estén las 12 rutas nuevas y los hubs /finanzas/ y /hogar/; buscá "icl" y "dolar turista" en /buscar/.
