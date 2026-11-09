# 07 · Calculadora de indemnización por despido

**Qué hace:** suma la antigüedad del art. 245 (Ley 27.802), el preaviso del art. 231, la integración del mes del art. 233, los días trabajados, las vacaciones no gozadas, el SAC proporcional y el SAC sobre preaviso e integración.

**Por qué:** la Ley 27.802 cambió el art. 245. Ahora el tope es 3 veces el salario promedio del convenio, que ingresa el usuario porque no hay una tabla pública central, con piso del 67% (criterio Vizzoti, ahora en la ley). También eliminó el preaviso en el período de prueba.

## Prompt para Cursor
```
Implementá lib/calc/indemnizacion.ts con parámetros de data/indemnizacion-despido.json:
base = máx(mín(rem, 3 × promedio CCT), 0,67 × rem) si hay promedio; años = completos + 1 si la fracción supera 3 meses (mínimo 1);
sin antigüedad ni preaviso si no superó el período de prueba; preaviso de 1 mes hasta 5 años y 2 meses después; integración si no hubo preaviso;
vacaciones según la escala del art. 150, proporcionales al año, a rem/25 por día; SAC proporcional con los días reales del semestre; SAC de 1/12 sobre preaviso e integración.
Tests: tope con piso del 67% y período de prueba sin preaviso.
```
