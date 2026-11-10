# 16 · Dólar oficial, MEP y tarjeta

**Qué hace:** pasa un monto en dólares a pesos según cómo lo pagues: con tarjeta en pesos (oficial + percepción del 30%), servicios digitales del exterior (suma IVA 21%), pagando el resumen con dólares propios, comprando dólar oficial o con dólar MEP.

**Por qué:** el Impuesto PAIS dejó de aplicarse desde el 23/12/2024. Hoy, 9/11/2026, sigue vigente la percepción del 30% de la RG ARCA 5617/2024, que es un pago a cuenta de Ganancias o Bienes Personales. Las personas humanas que compran billetes no la pagan (art. 2 inc. e). El MEP no tiene una publicación oficial central, así que lo carga el usuario.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/dolar.ts, calcularDolar({ montoUSD, modo, cotizacion, iibbPct }, p):
- "tarjeta": pesos = USD × cotizacion; percepcion = pesos × 0,30; total = pesos + percepcion.
- "digital": pesos; iva = pesos × 0,21; percepcion = pesos × 0,30 (sobre el importe SIN IVA; mostrar la nota [VERIFICAR] de dolar-reglas.json como aclaración);
  iibb = pesos × iibbPct (opcional, sin valor por defecto); total = suma.
- "dolaresPropios": total = USD (no hay percepción, porque solo se aplica a lo que pagás en pesos).
- "compraOficial": pesos = USD × cotizacion, sin percepción (personas humanas, RG 5617 art. 2 inc. e).
- "mep": pesos = USD × cotizacionMEP (input obligatorio, sin valor por defecto).
Las alícuotas salen de data/dolar-reglas.json, no las escribas en el código.

Componente components/calcs/DolarTarjeta.tsx:
- Monto en USD, modo (Seg), cotización oficial precargada con la referencia BCRA minorista (dolar-reglas.json → referencias.oficialMinorista: $1.571,84 al 05/11/2026),
  editable, con la leyenda "Referencia BCRA del {fecha}. Tu banco usa su propio tipo de cambio vendedor (la percepción usa el del Banco Nación)".
- Campo MEP vacío con la leyenda "Cargá la cotización que ves en tu banco o broker".
- Tabla comparativa de los 5 modos para el mismo monto cuando hay cotizaciones cargadas.
- Bloque "Qué no paga percepción" con la lista noAlcanza del JSON y "Cómo recuperar la percepción" (pago a cuenta; devolución desde el 1 de enero del año siguiente).

Contenido (finanzas/dolar-tarjeta): h1 "Calculadora de dólar tarjeta, oficial y MEP 2026",
fórmula "Dólar tarjeta = oficial × 1,30 (percepción RG 5617)". FAQ: si sigue el Impuesto PAIS (no, terminó el 22/12/2024), cómo evitar la percepción, si Netflix o Spotify pagan IVA, si se devuelve el 30%, qué cotización usa la tarjeta.
Fuentes: PROCEDENCIA dolar.

Tests (la cotización es input; uso 1.571,84):
- tarjeta USD 100 → pesos 157.184, percepción 47.155,20, total 204.339,20.
- digital USD 10 → 15.718,40 + IVA 3.300,86 + percepción 4.715,52 = 23.734,78.
- dolaresPropios USD 100 → percepción 0. compraOficial → percepción 0.
- mep USD 100 con cotización 1.600 (valor de prueba, no es cotización real) → 160.000.
```

**Cómo verificar:** con el campo MEP vacío, el modo MEP pide el dato y no muestra un resultado en $0.
