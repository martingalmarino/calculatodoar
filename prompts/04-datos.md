# 04 · Datos verificados

**Qué hace:** conecta los JSON de /data (topes ANSES, aportes, SAC, Ganancias, indemnización y monotributo) con tipos y un adaptador.

**Por qué:** los valores normativos cambian. Viven en archivos de datos con vigencia y fuente, no en el código, y la UI muestra de dónde salen.

## Prompt para Cursor
```
Tipá los JSON de /data en lib/data/schema.ts y exportalos en lib/data/index.ts, junto con ansesActual (la vigencia más reciente), tasaAportes
y PROCEDENCIA (nombre, vigencia, fecha de consulta y fuentes de cada set).
En lib/params.ts adaptá esos datos a los parámetros de cada módulo de cálculo.
No inventes valores: si falta un dato, pedilo como input del usuario o dejá la opción fuera.
```

**Cómo actualizar:** reemplazá los JSON (o corré `DATA_SRC=ruta npm run data:sync`), actualizá FECHA_MODIFICACION en lib/seo.ts y corré `npm test`.
