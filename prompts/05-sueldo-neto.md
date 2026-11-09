# 05 · Calculadora de sueldo neto

**Qué hace:** pasa de bruto a neto con 11% de jubilación, 3% de PAMI y 3% de obra social, todo sobre mín(bruto, tope ANSES), más no remunerativos y cuota sindical.

**Por qué:** es la calculadora más buscada. El tope ANSES cambia cada mes, por eso el selector de mes solo ofrece los períodos cargados en data/anses-topes.json (hoy, desde noviembre de 2026) y avisa que no sirve para meses anteriores.

## Prompt para Cursor
```
Implementá lib/calc/sueldoNeto.ts como función pura calcularSueldoNeto(input, {baseImponibleMaxima, aportes}).
Componente components/calcs/SueldoNeto.tsx: bruto, no remunerativo, mes devengado (solo anses.vigencias) y cuota sindical en %.
Mostrá el desglose y una nota si el sueldo supera el tope. Agregá tests: 1.500.000 → 1.245.000 y 6.000.000 → 5.173.513,49.
```
