# 09 · Calculadora de monotributo

**Qué hace:** encuentra la menor categoría que cubre facturación, superficie, energía y alquileres, y suma impuesto integrado, SIPA y obra social. Avisa si se supera el precio unitario máximo o la categoría K.

**Por qué:** la recategorización mira todos los parámetros, no solo la facturación.

## Prompt para Cursor
```
Implementá lib/calc/monotributo.ts con data/monotributo.json. Inputs: facturación 12 meses, actividad, m², kW, alquileres,
precio unitario máximo (solo venta) y "ya aporto por relación de dependencia" (sin SIPA ni obra social).
Test: servicios con $20.000.000 → categoría C, cuota 66.020,12.
```
