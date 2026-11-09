# 11 · Tests y deploy en Vercel

**Qué hace:** corre los tests unitarios de los módulos de cálculo y una prueba de navegador con Playwright que confirma que las 5 calculadoras calculan. Después publica en Vercel.

**Por qué:** cada actualización de datos puede romper un cálculo; los tests lo detectan antes del deploy.

## Prompt para Cursor
```
Corré npm test, npm run lint, npm run build y npm run test:e2e. Si algo falla, explicame la causa antes de cambiar código.
```

## Deploy (lo hacés vos)
1. Subí la carpeta a un repo de GitHub.
2. En vercel.com → Add New → Project, importá el repo. Vercel detecta Next.js; no hace falta configurar nada.
3. En Settings → Domains agregá calculalo.com.ar y seguí las instrucciones de DNS.
4. Cada push a main publica a producción y cada PR genera una preview.
