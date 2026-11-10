# 25 · Costo laboral para el empleador

**Qué hace:** calcula cuánto le cuesta a un empleador un sueldo bruto: contribuciones de seguridad social (20,4% o 18%, con la detracción), obra social 6%, ART y seguro de vida obligatorio. Muestra el costo mensual y el anual con aguinaldo, y suma el régimen RIFL para altas nuevas.

**Por qué:** las contribuciones no tienen tope, a diferencia de los aportes del trabajador. La Ley 27.802 trajo dos novedades. El RIFL baja las contribuciones al 5% durante 48 meses para altas entre el 1/5/2026 y el 30/4/2027 que cumplan los requisitos. El FAL arranca con el devengado de diciembre de 2026 y desvía el 1% (grandes empresas) o el 2,5% (MiPyME) a un fondo de cese, con una reducción equivalente de las contribuciones, así que el costo total no cambia. La ART depende de cada contrato, por eso la carga el usuario.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales. Todas las alícuotas y montos salen de data/contribuciones-patronales.json.

lib/calc/costoLaboral.ts, calcularCostoLaboral({ bruto, tipoEmpleador: "A" | "B", mipyme, rifl, detraccion: "general" | "sectorial", empleadosNomina, artPct, artFijo, periodo }, p):
- baseSS = max(0, bruto − detraccion) (7.003,68 general o 17.509,20 sectorial; si empleadosNomina ≤ 25, restar además 10.000 / empleadosNomina [VERIFICAR]).
  Con rifl: alícuota 5% sobre el bruto, sin detracción (criterio conservador [VERIFICAR] del JSON).
- ss = alícuota (0,204 tipo A, 0,18 tipo B, 0,05 RIFL) × base. Sin tope.
- obraSocial = 0,06 × bruto. art = artPct × bruto + artFijo (inputs, sin valor por defecto: si están vacíos, mostrar "sin ART" en el desglose).
- scvo = 424,62 (seguroVidaObligatorio.valor).
- costoMensual = bruto + ss + obraSocial + art + scvo.
- costoAnual = 12 × (bruto + ss + obraSocial + art%) + SAC anual (= bruto) × (1 + alícuota SS + 0,06 + artPct) + 12 × (artFijo + scvo).
  (Sin detracción sobre el SAC [VERIFICAR].)
- Si periodo >= "2026-12" y no es RIFL: mostrar la línea informativa "de esto, FAL {1% o 2,5%} = $X va al Fondo de Asistencia Laboral",
  descontando el mismo monto de ss para que el total quede igual. Con RIFL, mostrar la nota [VERIFICAR] del JSON sin sumar nada.
- Mostrar aparte, como dato, los aportes del trabajador (17% con tope ANSES, reusar calcularSueldoNeto) y el neto que cobra.

Componente components/calcs/CostoLaboral.tsx: bruto, tipo de empleador (Seg con las dos descripciones del JSON), MiPyME (check), período (mes),
"Alta nueva en el RIFL" (check con los requisitos del art. 157 en un <details>), ART % y fijo, cantidad de empleados.
Resultado: tabla con bruto, contribuciones SS, obra social, ART, seguro de vida, costo mensual, % sobre el bruto y costo anual; neto del trabajador abajo.

Contenido (laboral/costo-laboral): h1 "Calculadora de costo laboral 2026: cuánto cuesta un empleado",
fórmula "Costo = bruto + 18% o 20,4% × (bruto − detracción) + 6% obra social + ART + seguro de vida".
FAQ: qué son las cargas sociales, diferencia entre aportes y contribuciones, qué es el RIFL y quién entra, qué es el FAL y si aumenta el costo, cuánto cuesta la ART.
Descargo de la página: "Resultado orientativo. No incluye convenios con contribuciones propias, regímenes especiales ni beneficios por zona. Consultá a tu contador."
Fuentes: PROCEDENCIA contribuciones, aportes, anses.

Tests (bruto 1.500.000, sin ART, 1 empleado, sin los $10.000 adicionales salvo que se indique):
- Tipo B (18%), detracción general → SS 268.739,34; OS 90.000; SCVO 424,62; costo mensual 1.859.163,96 (+23,94%); costo anual 24.169.967,49.
- Tipo A (20,4%) → SS 304.571,25; costo mensual 1.894.995,87.
- RIFL → SS 75.000; costo mensual 1.665.424,62.
- Tipo B MiPyME, período 2026-12 → FAL 37.500, SS mostrada 231.239,34; costo mensual igual a 1.859.163,96.
```

**Cómo verificar:** cambiar el período de 2026-11 a 2026-12 no modifica el costo total, solo agrega la línea del FAL.
