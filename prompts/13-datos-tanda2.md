# 13 · Datos de la tanda 2 (ICL, UVA, IPC, dólar, tasas, cargas sociales, LCT)

**Qué hace:** copia los JSON nuevos a `data/`, los tipa en `lib/data/schema.ts`, los exporta en `lib/data/index.ts` con funciones de búsqueda por fecha y los adapta en `lib/params.ts`, como en el prompt 04. También agrega un script para actualizar las series del BCRA y el INDEC.

**Por qué:** el ICL y la UVA cambian todos los días y el IPC todos los meses. Por eso viven en archivos con fecha de consulta y fuente, y se actualizan con un script, no a mano. Los valores que no publica ningún organismo oficial (MEP, tasas de cada banco, nafta, ART) no se precargan: los pide la calculadora.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes, y no rompas las 5 calculadoras actuales ni sus tests.

1) Copié a data/ estos archivos nuevos: icl.json, uva.json, ipc.json, dolar-reglas.json, tasas-referencia.json, plazo-fijo-reglas.json,
   alquileres-reglas.json, prestamos-reglas.json, combustible.json, vacaciones-horas-extras.json, liquidacion-final.json, contribuciones-patronales.json.
   No modifiques los JSON existentes. Agregá al final de data/FUENTES.md el contenido del FUENTES.md del pack (no lo reemplaces: sumalo debajo).

2) En lib/data/schema.ts tipá cada JSON nuevo (las series vienen como [fecha, valor] o [periodo, indice, varMensual, varInteranual]).
   Los campos con null significan "no hay dato oficial": tipalos como number | null.

3) En lib/data/index.ts exportá los JSON y estos helpers puros:
   - iclEn(fechaISO): valor exacto del día o null. uvaEn(fechaISO): igual. ipcEn("AAAA-MM"): índice o null.
   - ultimoICL(), ultimaUVA(), ultimoIPC(): { fecha|periodo, valor }.
   - rangoICL, rangoUVA, rangoIPC: primera y última fecha disponible.
   NO interpoles ni extrapoles. Si falta el dato, la UI dice "Todavía no hay dato publicado para esa fecha" y no calcula
   (la única excepción es la proyección explícita de UVA de los prompts 17 y 20, marcada como estimación).
   Sumá a PROCEDENCIA: icl, uva, ipc, dolar, tasas, plazoFijo, alquileres, prestamos, combustible, vacaciones, horasExtras, liquidacion, contribuciones,
   con nombre, vigencia (texto armado con las fechas del JSON), fecha de consulta y fuentes.

4) En lib/params.ts agregá pAlquiler, pCuotas, pDolar, pPlazoFijo, pInflacion, pBilletera, pPrestamo, pCombustible, pVacaciones, pHorasExtras, pLiquidacion, pCosto,
   leyendo solo de los JSON. pLiquidacion reutiliza pIndem y pAguinaldo, no los duplica.

5) Creá scripts/update-series.mjs (npm run data:series) que:
   - baje ICL (variable 40) y UVA (variable 31) de https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/{id}?desde=...&hasta=...&limit=3000 (paginá con offset),
   - baje el IPC nacional nivel general de https://www.indec.gob.ar/ftp/cuadros/economia/serie_ipc_divisiones.csv (separador ";", decimales con coma, Codigo "0", Region "Nacional", latin1),
   - reescriba solo el array "serie", "ultimaFecha"/"ultimoPeriodo" y "fechaConsulta" de icl.json, uva.json e ipc.json, sin tocar el resto,
   - falle sin escribir nada si la respuesta viene vacía o si algún valor histórico cambió más de 0,01 (para que lo revise).
   Se corre a mano antes de un deploy, NO en el build de Vercel.

6) Agregá un test que avise si la UVA o el ICL tienen más de 10 días de atraso respecto de hoy, o si ya pasó la fecha de proximaPublicacion de ipc.json
   y el último período cargado sigue siendo el anterior. Que sea una advertencia (console.warn), no un fallo.
```

**Cómo verificar:** `npm test` pasa; `iclEn("2023-12-01")` devuelve 6,69, `uvaEn("2026-11-09")` devuelve 2.185,48 e `ipcEn("2026-09")` devuelve 12.514,1508. `npm run data:series` actualiza las tres series sin tocar los otros JSON.
