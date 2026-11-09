# 10 · SEO técnico

**Qué hace:** agrega title y description por página, canonical con barra final, Open Graph, JSON-LD (WebApplication, FAQPage y BreadcrumbList en cada calculadora; WebSite con SearchAction y Organization en la home), sitemap.xml, robots.txt y la página /buscar/.

**Por qué:** es lo que pide el plan del portal para resultados enriquecidos y rastreo limpio.

## Prompt para Cursor
```
En lib/seo.ts definí FECHA_MODIFICACION y los helpers breadcrumb, faqPage, webApp (FinanceApplication, price 0, dateModified) y collection.
Usá generateMetadata en hubs y calculadoras con alternates.canonical. app/sitemap.ts y app/robots.ts con dynamic = "force-static".
/buscar/ con noindex, filtrando CALCULADORAS en el cliente con useSearchParams dentro de Suspense.
```

**Cómo verificar:** validá una URL en el Rich Results Test de Google después del deploy.
