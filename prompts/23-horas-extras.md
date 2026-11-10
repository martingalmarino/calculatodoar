# 23 · Horas extras (50% y 100%)

**Qué hace:** calcula el valor de tu hora normal y de las horas extras al 50% (días hábiles) y al 100% (sábados después de las 13, domingos y feriados), y avisa si pasás el límite de 30 horas por mes o 200 por año.

**Por qué:** el art. 201 de la LCT (los recargos) y el Decreto 484/2000 (los límites) no cambiaron. La Ley 27.802 sumó el art. 197 bis, que permite un banco de horas voluntario y por escrito: si lo firmaste, las extras se compensan con descanso en lugar de pagarse. La ley no fija con qué número se divide el sueldo para sacar el valor de la hora, así que usamos las horas mensuales que indique tu convenio, con 200 por defecto.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/horasExtras.ts, calcularHorasExtras({ sueldoMensual, horasMensualesNormales = 200, horas50, horas100, adicionalesHabituales? }, p):
- valorHora = (sueldoMensual + adicionalesHabituales) / horasMensualesNormales.
- extra50 = horas50 × valorHora × 1,5; extra100 = horas100 × valorHora × 2 (recargos de data/vacaciones-horas-extras.json, no en el código).
- alertas: horas50 + horas100 > 30 → "Superás el límite mensual del Decreto 484/2000"; opción de cargar las horas del año para el límite de 200.
- Aportes 17% sobre las extras para mostrar el neto (reusar tasaAportes, sin pasar el tope ANSES junto con el sueldo).
- Modo jornal: valorHora = jornal / horas de la jornada.

Componente components/calcs/HorasExtras.tsx: sueldo bruto, horas mensuales normales (200 por defecto, con la ayuda "48 h semanales ≈ 200 h al mes; tu convenio puede usar otro número"),
horas al 50% y al 100%. Nota del banco de horas (art. 197 bis) y de la jornada máxima de 8 h diarias o 48 semanales (Ley 11.544).

Contenido (laboral/horas-extras): h1 "Calculadora de horas extras 2026: al 50% y al 100%", fórmula "Hora extra = sueldo ÷ horas mensuales × 1,5 (o × 2)".
FAQ: cuándo se pagan al 100%, cuántas horas extras puedo hacer, qué es el banco de horas de la reforma laboral, si son obligatorias (no, salvo las excepciones de la ley),
si tienen descuentos. Fuentes: PROCEDENCIA horasExtras.

Tests:
- Sueldo 1.500.000, 200 h → hora 7.500; 10 h al 50% → 112.500; 4 h al 100% → 60.000; total 172.500.
- 25 + 10 horas → alerta de límite mensual.
- Con 180 h mensuales y el mismo sueldo → hora 8.333,33.
```

**Cómo verificar:** cambiar las horas mensuales recalcula todo en vivo y los tests pasan.
