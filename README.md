# calculalo.com.ar

Calculadoras para Argentina con la norma vigente: sueldo neto, aguinaldo, indemnización por despido, Ganancias de 4ta categoría y monotributo.
Next.js 16 (App Router), TypeScript y páginas estáticas (SSG), sin dependencias de UI.

## 1. Setup

Requisitos: Node.js 20.9 o superior.

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # tests de los módulos de cálculo
npm run lint
npm run build
npx playwright install chromium   # solo la primera vez
npm run test:e2e     # prueba en navegador de las 5 calculadoras (requiere build)
```

Estructura:

| Carpeta | Contenido |
|---|---|
| `app/` | Rutas: home, `/[categoria]/`, `/[categoria]/[calculadora]/`, `/buscar/`, sitemap, robots, fuentes |
| `components/` | Header, Footer, Migas, JsonLd, campos, Resultado, Fuentes y `calcs/` (una calculadora por archivo) |
| `lib/calc/` | Funciones de cálculo puras, sin React |
| `lib/data/` | Tipos y carga de los JSON de parámetros |
| `lib/params.ts` | Adapta los datos a cada cálculo |
| `lib/content.ts` | Títulos, descripciones, FAQ y enlaces de cada página |
| `lib/ejemplos.ts` | Avisos y ejemplos calculados con los datos vigentes |
| `data/` | Parámetros verificados (JSON) y `FUENTES.md` |
| `prompts/` | Prompts para Cursor, paso a paso, con su explicación |

## 2. Design system

Los tokens (petróleo, cobre, espaciados `--s1` a `--s8`, radios y tipografía) están en `docs/design-system.md` y se aplican en `app/globals.css`.
Source Sans 3 (400/600/700, latin + latin-ext) se autoaloja con `next/font/local` desde `app/fonts/`. No se hacen pedidos a Google Fonts.

## 3. Plantilla

Cada calculadora usa la misma plantilla (`app/[categoria]/[calculadora]/page.tsx`): migas, H1, fecha de actualización, formulario con resultado en vivo, descargo, cómo se calcula (fórmula, aviso y ejemplo), FAQ, fuentes y vigencia, y relacionadas.
Para sumar una calculadora: agregá su entrada en `lib/content.ts`, su módulo en `lib/calc/`, su componente en `components/calcs/`, sus parámetros en `lib/params.ts` y su ejemplo en `lib/ejemplos.ts`.

**Actualizar datos:** reemplazá los JSON de `data/` (o corré `DATA_SRC=/ruta npm run data:sync`), actualizá `FECHA_MODIFICACION` en `lib/seo.ts` y corré `npm test` y `npm run build`. Los textos de vigencia y fuente salen de los JSON.

## 4. Calculadoras

### Sueldo neto: `/laboral/sueldo-neto/`
Neto = bruto − 17% × mín(bruto, tope ANSES) + no remunerativo − cuota sindical. Aportes: 11% de jubilación (Ley 24.241), 3% de PAMI (Ley 19.032) y 3% de obra social (Ley 23.660).
El tope sale de `data/anses-topes.json` (Res. ANSES 304/2026, devengado de noviembre de 2026). **Solo hay topes desde noviembre de 2026**, así que el selector de mes ofrece solo esos períodos y avisa que no sirve para meses anteriores.

### Aguinaldo (SAC): `/laboral/aguinaldo/`
SAC = mejor remuneración ÷ 2 × días trabajados ÷ días reales del semestre (181 o 182 en el primero, 184 en el segundo). La ley no fija un divisor; el texto de la página lo aclara.

### Indemnización por despido: `/laboral/indemnizacion/`
Antigüedad según el art. 245 sustituido por la Ley 27.802: base = máx(mín(mejor remuneración, 3 × promedio del convenio), 67% × mejor remuneración). El promedio del convenio lo ingresa el usuario.
- Preaviso: 1 mes hasta 5 años y 2 meses después. **En el período de prueba no hay preaviso.**
- También suma la integración del mes (art. 233), los días trabajados, las vacaciones no gozadas (arts. 150, 155 y 156), el SAC proporcional con días reales y el SAC de 1/12 sobre preaviso e integración.

### Ganancias 4ta categoría: `/impuestos/ganancias/`
Impuesto anual con la **escala art. 94 y las deducciones art. 30 de la liquidación anual 2026** (bloque `anual`), no con la tabla de retención de julio a diciembre.
Deducciones: GNI, deducción especial para empleados, cónyuge, hijos, alquiler (40% con tope en la GNI, +10% con RELI) y otras.
Control: bruto 4.000.000 × 13 → $ 792.864,71.

### Monotributo: `/impuestos/monotributo/`
Toma la menor categoría que cubre facturación, superficie, energía y alquileres (categorías vigentes desde el 1/8/2026). La cuota es impuesto integrado + SIPA + obra social; sin SIPA ni obra social si ya aportás por otro régimen. Avisa si se supera el precio unitario máximo o la categoría K.

## 5. SEO

- URLs con barra final y sin año; canonical en cada página.
- JSON-LD: WebApplication (FinanceApplication, gratis, `dateModified`), FAQPage y BreadcrumbList en cada calculadora; CollectionPage y BreadcrumbList en los hubs; WebSite con SearchAction y Organization en la home.
- `sitemap.xml` y `robots.txt` generados en el build. `/buscar/` es `noindex`.
- Cada página muestra el descargo: "Resultado orientativo. No reemplaza el asesoramiento de un contador o abogado laboralista."

## 6. Deploy en Vercel

1. Subí el proyecto a un repositorio de GitHub (el `.gitignore` ya excluye `node_modules` y `.next`).
2. En vercel.com → **Add New → Project**, importá el repositorio. Vercel detecta Next.js: build `next build`, sin variables de entorno.
3. En **Settings → Domains**, agregá `calculalo.com.ar` y `www.calculalo.com.ar` y configurá el DNS que indica Vercel.
4. Cada push a `main` publica a producción y cada pull request genera una preview.
5. Después del primer deploy, cargá `https://www.calculalo.com.ar/sitemap.xml` en Google Search Console. El dominio principal es `www.calculalo.com.ar` (sin www redirige 301 en Vercel).

## Pendientes conocidos (ver `data/FUENTES.md`)
- Topes ANSES de enero a octubre de 2026 (necesarios para cálculos retroactivos).
- La próxima actualización del monotributo está estimada para febrero de 2027.
- La retención de Ganancias de cada mes usa la tabla acumulada del mes de pago; la calculadora estima el impuesto anual.
