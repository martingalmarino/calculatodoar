# 17 · Plazo fijo tradicional y UVA

**Qué hace:** calcula cuánto cobrás al vencimiento de un plazo fijo tradicional (TNA, días, TEA) y de uno UVA (capital ajustado por UVA más la tasa adicional), y los compara.

**Por qué:** las tasas son libres (no hay tasa mínima regulada) y cambian todo el tiempo, así que la TNA la cargás vos. La precargamos con el promedio de depósitos a 30 días del BCRA solo como referencia. El UVA tiene un mínimo de 90 días y usa el valor de la UVA del día hábil anterior a la constitución (BCRA, Depósitos e inversiones a plazo, punto 1.9.1).

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/plazoFijo.ts:
- calcularPlazoFijo({ capital, tna, dias }): interes = capital × tna × dias / 365; total; TEA = (1 + tna × dias/365)^(365/dias) − 1.
  Validá dias ≥ 30 (plazo-fijo-reglas.json → plazoMinimo.tasaFijaPesos).
- calcularPlazoFijoUVA({ capital, fechaConstitucion, dias, tnaAdicional, inflacionMensualEsperada }, p):
  uvaInicial = UVA del día hábil bancario anterior a fechaConstitucion (buscá hacia atrás el último día con dato; el JSON repite el valor en fines de semana,
  así que tomá el día calendario anterior que sea hábil: lunes → viernes). cantidadUVA = capital / uvaInicial.
  vencimiento = fechaConstitucion + dias (mínimo 90, plazoMinimo.uva). uvaFinal = UVA del vencimiento si está publicada;
  si no, proyectala desde ultimaUVA() con (1 + inflacionMensualEsperada)^(días/30) y marcá esEstimacion = true.
  capitalAjustado = cantidadUVA × uvaFinal; interes = capitalAjustado × tnaAdicional × dias / 365; total.
- Si es precancelable, aclarar: se puede cancelar desde los 30 días, con la tasa de precancelación que fije el banco (input opcional).

Componente components/calcs/PlazoFijo.tsx: Seg "Tradicional | UVA | Comparar". TNA precargada con tasas-referencia.json → depositos30d
(21,18% al 04/11/2026, "promedio del sistema según el BCRA, tu banco puede pagar otra tasa"), editable. Inflación esperada precargada con el REM
(remInflacion12m convertida a mensual: (1 + 21,8%)^(1/12) − 1 = 1,657%, mostrando de dónde sale), editable.
En "Comparar", a igual capital y plazo, mostrá cuál rinde más y la inflación mensual a partir de la cual conviene el UVA.
Nota fija: "Hasta $50.000.000 por persona y por banco están cubiertos por el Seguro de Garantía de los Depósitos (Com. BCRA A 8407)".

Contenido (finanzas/plazo-fijo): h1 "Calculadora de plazo fijo tradicional y UVA 2026", fórmula "Interés = capital × TNA × días ÷ 365".
FAQ: diferencia entre TNA y TEA, plazo mínimo del UVA, qué pasa si baja la inflación, si está garantizado, si se puede precancelar.
Fuentes: PROCEDENCIA plazoFijo, uva, tasas.

Tests:
- Tradicional: 1.000.000, TNA 21,18%, 30 días → interés 17.408,22, total 1.017.408,22, TEA 23,37%.
- UVA: 1.000.000 constituido el 2026-08-04 → UVA del 2026-08-03 = 2.059,24, 485,6161 UVA; 90 días → vence 2026-11-02 (UVA 2.177,53),
  capital 1.057.443,52; TNA adicional 1% → interés 2.607,39; total 1.060.050,92; esEstimacion = false.
- UVA con vencimiento posterior a la última UVA publicada → esEstimacion = true.
- 20 días en tradicional o 60 en UVA → error de plazo mínimo.
```

**Cómo verificar:** cuando el resultado es una estimación, el resultado lo dice en el mismo renglón del total, no en una nota al pie.
