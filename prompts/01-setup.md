# 01 · Setup del proyecto

**Qué hace:** crea el esqueleto de Next.js con App Router, TypeScript estricto, export estático por página (SSG) y sin dependencias de más.

**Por qué:** las calculadoras se ejecutan en el navegador y el contenido es estático, así que el sitio carga rápido y se indexa bien. Menos dependencias significa menos mantenimiento.

## Prompt para Cursor
```
Creá un proyecto Next.js 16 con App Router y TypeScript estricto en esta carpeta, sin Tailwind ni librerías de UI.
- package.json con scripts: dev, build, start, lint (eslint .), test (node --import tsx --test tests/*.test.ts), test:e2e, data:sync.
- next.config.ts con trailingSlash: true y poweredByHeader: false.
- eslint.config.mjs con flat config usando eslint-config-next/core-web-vitals y eslint-config-next/typescript.
- tsconfig con alias "@/*" → "./*" y resolveJsonModule.
- Fuentes autoalojadas con next/font/local: Bricolage Grotesque (600–800) como --font-bricolage y Public Sans (400–700) como --font-public, en app/fonts.
No agregues nada que no se use.
```

**Cómo verificar:** `npm run build` y `npm run lint` terminan sin errores.
