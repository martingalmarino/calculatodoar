# 06 · Calculadora de aguinaldo (SAC)

**Qué hace:** calcula mejor remuneración ÷ 2 × días trabajados ÷ días reales del semestre (181 o 182 en el primero, 184 en el segundo).

**Por qué:** la ley no fija un divisor. Usamos los días reales, el criterio del software de liquidación, y lo decimos en el texto porque otras calculadoras usan 180.

## Prompt para Cursor
```
Implementá lib/calc/aguinaldo.ts tomando diasDelSemestre de data/aguinaldo.json (y calculándolos si falta el año).
Inputs: mejor sueldo, semestre, fecha de ingreso y egreso opcionales. Mostrá días trabajados de N, bruto, aportes 17% y neto.
Test: ingreso 3/10/2026 en el 2º semestre → 90 de 184 días.
```
