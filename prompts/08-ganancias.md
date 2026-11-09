# 08 · Calculadora de Ganancias 4ta categoría

**Qué hace:** estima el impuesto anual con la escala del art. 94 y las deducciones del art. 30 de la liquidación anual 2026 (bloque `anual` del JSON), no con la tabla de retención de julio a diciembre.

**Por qué:** la tabla de retención es acumulada por mes de pago y sirve para cada retención. Para el impuesto del año corresponde la tabla anual.

## Prompt para Cursor
```
Implementá lib/calc/ganancias.ts: bruto anual (12 o 13 sueldos), menos aportes 17% con tope ANSES, GNI, deducción especial para empleados,
cónyuge, hijos, alquiler (40% con tope en la GNI, +10% si está en RELI) y otras deducciones. Impuesto = fijo + alícuota × (GNI − desde).
Test obligatorio: bruto 4.000.000 × 13 → impuesto 792.864,71.
```
