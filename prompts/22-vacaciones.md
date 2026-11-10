# 22 · Vacaciones

**Qué hace:** calcula cuántos días de vacaciones te corresponden según tu antigüedad al 31 de diciembre, cuánto cobrás (sueldo ÷ 25 por día) y la diferencia contra un mes normal. Si no llegaste a trabajar la mitad de los días hábiles del año, calcula la parte proporcional.

**Por qué:** los arts. 150, 151, 153 y 155 de la LCT no cambiaron con la Ley 27.802: siguen siendo 14, 21, 28 o 35 días, y el día de vacaciones se paga sueldo ÷ 25. Lo que sí cambió es el art. 154: aviso con 30 días de anticipación, la posibilidad de fraccionar en tramos de al menos 7 días y el goce en verano al menos una vez cada 3 años.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales. Reutilizá la escala de días de
data/vacaciones-horas-extras.json (es la misma que usa indemnizacion-despido.json: si podés, que ambas lean una sola fuente sin cambiar resultados).

lib/calc/vacaciones.ts, calcularVacaciones({ fechaIngreso, anio, sueldoMensual, diasTrabajadosEnElAnio?, tipo: "mensual" | "jornal", jornalDiario? }, p):
- Escala del art. 150 con la fecha de referencia 31/12/{anio}: 14 días si la antigüedad "no excede" 5 años; 21 si no excede 10; 28 si no excede 20; 35 si supera 20.
  Compará fechas, no años redondeados: excede N años si 31/12/{anio} > fechaIngreso + N años. Así, 5 años justos = 14 días y 5 años y 1 día = 21.
  (lib/calc/indemnizacion.ts usa años completos con `<`, que da lo mismo salvo el caso exacto del aniversario: no lo cambies en este prompt.)
- Si se informa diasTrabajadosEnElAnio y no llega a la mitad de los días hábiles del año (art. 151), dias = floor(diasTrabajados / 20) (art. 153).
  Para "días hábiles", pedí el dato o usá los días hábiles del año calendario [explicar en la UI que es una aproximación si no se carga].
- valorDia = sueldoMensual / 25 (art. 155); jornalizados: jornalDiario. totalVacaciones = dias × valorDia.
- plus = totalVacaciones − dias × sueldoMensual / 30 (la diferencia contra cobrar esos días como un mes normal).
- Aportes 17% sobre el total (reusar tasaAportes y el tope ANSES de los módulos existentes) para mostrar el neto.

Componente components/calcs/Vacaciones.tsx: fecha de ingreso, año de las vacaciones, sueldo bruto, opcional "trabajé menos de medio año" con días trabajados.
Resultado: días, valor por día, total bruto y neto, plus vacacional. Bloque informativo con las reglas de goce del art. 154 (texto de vacaciones.goceArt154).

Contenido (laboral/vacaciones): h1 "Calculadora de vacaciones 2026: días y cuánto cobrás", fórmula "Vacaciones = días × sueldo ÷ 25".
FAQ: cuántos días me tocan, por qué se divide por 25, cuándo me las tienen que avisar (30 días antes), si se pueden fraccionar (tramos de 7 días como mínimo),
si me las pueden pagar en vez de tomarlas (no, salvo al terminar la relación: art. 162 y 156). Fuentes: PROCEDENCIA vacaciones.

Tests:
- Ingreso 2019-06-01, año 2026 → antigüedad 7 → 21 días; sueldo 1.500.000 → valor día 60.000; total 1.260.000; plus 210.000.
- Ingreso 2026-08-01 con 100 días trabajados en el año (menos de la mitad de los hábiles) → 5 días.
- Ingreso 2021-12-31, año 2026 (5 años justos) → 14 días; ingreso 2021-12-30 → 21 días; ingreso 2006-12-31 (20 justos) → 28; ingreso 2005-06-01 → 35.
```

**Cómo verificar:** los tests de indemnización siguen dando lo mismo después de unificar la escala.
