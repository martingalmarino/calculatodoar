# 18 · Inflación: cuánto vale hoy tu plata de antes

**Qué hace:** actualiza un monto de un mes pasado al último mes publicado con el IPC nacional del INDEC, y muestra la inflación acumulada y la pérdida de poder de compra.

**Por qué:** es una búsqueda que se repite todo el tiempo ("cuánto serían hoy $X de 2020"). El dato oficial es el IPC nacional con base diciembre 2016 = 100. Antes de esa fecha no hay una serie nacional oficial, así que no la ofrecemos.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/inflacion.ts, calcularInflacion({ monto, mesOrigen, mesDestino }, p):
- coef = IPC(mesDestino) / IPC(mesOrigen); montoActualizado = monto × coef; inflacionAcumulada = coef − 1;
  poderDeCompra = 1 / coef (lo que compra hoy el mismo monto nominal); inflacionMensualPromedio = coef^(1/meses) − 1.
- Modo inverso: "¿cuánto valía en {mesOrigen} lo que hoy cuesta $X?" = X / coef.
- Meses solo dentro de rangoIPC (2016-12 al último publicado). mesDestino por defecto = último publicado.

Componente components/calcs/Inflacion.tsx: monto, mes y año de origen, mes de destino, Seg "Llevar a hoy | Traer al pasado".
Resultado: monto actualizado, inflación acumulada %, promedio mensual, poder de compra, y una línea "Último dato: IPC {mes} publicado por INDEC.
Próximo dato: {fecha de proximaPublicacion}". Mini tabla con la variación mensual de los últimos 12 meses (de ipc.json).

Contenido (finanzas/inflacion): h1 "Calculadora de inflación: cuánto vale hoy tu plata (IPC INDEC)", fórmula "Monto hoy = monto × IPC final ÷ IPC inicial".
FAQ: qué índice usamos, por qué no hay datos antes de 2017, por qué no incluye el mes en curso, diferencia con la inflación interanual, cada cuánto se actualiza.
Fuentes: PROCEDENCIA ipc.

Tests:
- 100.000 de 2020-01 (IPC 289,8299) a 2026-09 (12.514,1508) → 4.317.757,00, inflación acumulada 4.217,76%.
- 100.000 de 2025-09 (9.384,0922) a 2026-09 → 133.354,94 (33,35%).
- Mes 2016-11 o un mes posterior al último publicado → error.
```

**Cómo verificar:** cuando se publique el IPC de octubre (el INDEC lo publica el 12/11/2026), corré `npm run data:series`; el mes nuevo tiene que aparecer en el selector sin tocar código.
