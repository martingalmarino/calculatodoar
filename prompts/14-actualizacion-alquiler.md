# 14 · Actualización de alquiler (ICL, IPC o acuerdo)

**Qué hace:** calcula el alquiler nuevo según cómo se ajusta tu contrato: por ICL del BCRA (contratos de la Ley 27.551), por IPC del INDEC o por un porcentaje acordado (contratos desde el DNU 70/2023).

**Por qué:** desde el DNU 70/2023 el art. 1199 del Código Civil deja libre el índice y la periodicidad. Los contratos firmados entre julio de 2020 y octubre de 2023 siguen ajustando por ICL. Los firmados entre el 18/10 y el 28/12/2023 usan el coeficiente Casa Propia, que no está cargado: si es tu caso, lo cargás vos.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes (MoneyInput, Campos, Resultado, Fuentes). No rompas las 5 calculadoras actuales.

lib/calc/alquiler.ts, función pura calcularAlquiler(input, p):
- modo "icl": alquilerInicial, fechaInicio, fechaAjuste. coef = ICL(fechaAjuste) / ICL(fechaInicio). Nuevo = alquilerInicial × coef.
  Si el contrato es anual y ya tuvo ajustes, el usuario carga el alquiler ORIGINAL y la fecha de inicio del contrato: ICL(t2)/ICL(t0) acumula los ajustes.
  Si falta el ICL de alguna fecha, devolvé un error legible y no calcules (sin interpolar).
- modo "ipc": alquilerActual, mesBase, mesFinal (AAAA-MM). coef = IPC(mesFinal) / IPC(mesBase). Por defecto mesFinal = último IPC publicado.
  Aclarar en la UI: "Qué meses se toman lo dice tu contrato".
- modo "acuerdo": alquilerActual, porcentaje por período, cantidad de períodos. Nuevo = alquiler × (1 + %)^n.
- modo "otro índice": alquilerActual y coeficiente que ingresa el usuario (para Casa Propia u otro índice privado).
Devolvé: nuevo alquiler, aumento en $ y %, coeficiente y los valores de índice usados con su fecha.

components/calcs/ActualizacionAlquiler.tsx: selector de modo (Seg), campos según el modo, una ayuda corta de qué régimen te corresponde según la fecha de firma
(tabla de data/alquileres-reglas.json) y desglose en la tabla de resultado. Fechas limitadas a rangoICL y meses a rangoIPC.

Contenido en lib/content.ts (categoría finanzas, slug actualizacion-alquiler):
h1 "Calculadora de actualización de alquiler por ICL o IPC", fórmula "Nuevo alquiler = alquiler × índice final ÷ índice inicial".
FAQ: qué índice me corresponde, cada cuánto se ajusta, qué pasa si el contrato no dice nada, qué es el ICL, si el ICL se sigue publicando (sí, Com. B 13249/2026).
Fuentes: PROCEDENCIA icl, ipc, alquileres.

Tests (tests/tanda2.test.ts):
- ICL: $200.000 con inicio 2023-12-01 (ICL 6,69) y ajuste 2024-12-01 (20,65) → 617.339,31; ajuste 2025-12-01 (28,77) → 860.089,69.
- IPC: $600.000, base 2025-12 (10.121,3715), final 2026-03 (11.077,0608) → 656.653,74.
- Acuerdo: $600.000, 5% por período, 2 períodos → 661.500.
- ICL de 2020-06-15 (antes del inicio de la serie) → error, sin resultado.
```

**Cómo verificar:** los tests pasan y la página muestra junto al resultado la fecha y el valor de cada índice que usó.
