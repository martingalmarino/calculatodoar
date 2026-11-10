# 15 · Cuotas sin interés vs. pagar de contado

**Qué hace:** compara pagar de contado (con o sin descuento) contra pagar en cuotas fijas, trayendo cada cuota a valor de hoy con la inflación mensual que esperás o con lo que rendiría tu plata.

**Por qué:** con inflación, pagar en cuotas "sin interés" suele convenir, salvo que el descuento por pagar de contado sea grande. No hay una tasa oficial que sirva para todos. La precargamos con el último IPC mensual del INDEC, solo como referencia editable, y la calculadora te muestra también la tasa a partir de la cual da lo mismo.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/cuotas.ts, calcularCuotas({ precioContado, cantidadCuotas, valorCuota, tasaMensual, primeraCuotaHoy }):
- VP = Σ valorCuota / (1 + tasaMensual)^k, con k = 1..n (o k = 0..n−1 si primeraCuotaHoy).
- conviene = VP < precioContado ? "cuotas" : "contado"; diferencia = |precioContado − VP|.
- tasaEquilibrio: la tasa mensual que hace VP = precioContado (bisección entre 0 y 20% mensual, 100 iteraciones).
- Validaciones: cuotas entre 1 y 60, valores > 0.

Componente components/calcs/CuotasOContado.tsx:
- Campos: precio de contado, cantidad de cuotas y valor de cada cuota (o total en cuotas: calcular uno a partir del otro), tasa mensual para comparar
  con dos botones de precarga: "Inflación del último mes" (valor y mes leídos de tasas-referencia.json; hoy: 1,9%, septiembre de 2026, INDEC) y "Rendimiento que conseguís (TNA ÷ 12)". Mostrar fecha y fuente de la precarga desde tasas-referencia.json.
- Check "La primera cuota se paga hoy".
- Resultado: valor de hoy de las cuotas, contado, cuál conviene y por cuánto, y tasa de equilibrio con la frase "Si esperás más de X% de inflación mensual, convienen las cuotas".
- Aviso: si las cuotas tienen interés o recargo, cargá el total real de las cuotas.

Contenido (finanzas/cuotas-o-contado): h1 "¿Cuotas sin interés o contado? Calculadora con inflación", fórmula "Valor de hoy = Σ cuota ÷ (1 + inflación mensual)^mes".
FAQ: qué es el valor presente, qué inflación usar, si conviene con descuento por pago en efectivo, qué pasa con el resumen de la tarjeta.
Fuentes: PROCEDENCIA tasas, ipc.

Tests:
- 6 cuotas de 200.000 vs contado 1.080.000, tasa 1,9% mensual, primera cuota al mes siguiente → VP 1.124.076,70, conviene "contado", diferencia 44.076,70.
- Mismo caso con primera cuota hoy → VP 1.145.434,16.
- Tasa de equilibrio → 3,096% mensual (±0,001).
```

**Cómo verificar:** con tasa 0% el VP es igual al total de las cuotas; los tests pasan.
