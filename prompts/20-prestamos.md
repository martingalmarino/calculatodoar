# 20 · Préstamo personal e hipotecario UVA

**Qué hace:** arma el cuadro de cuotas con sistema francés de un préstamo personal en pesos a tasa fija (con IVA sobre los intereses) y de un préstamo UVA (capital y cuota en UVA, convertidos a pesos con la UVA del día).

**Por qué:** la TNA, el CFT, los seguros y la relación cuota/ingreso los fija cada banco, así que son inputs. Lo que sí es general es la mecánica: sistema francés, IVA del 21% sobre los intereses de los préstamos personales (los de vivienda están exentos) y cuota UVA × valor de la UVA. La UVA sale del BCRA.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/prestamo.ts:
- cuadroFrances({ capital, tna, cuotas }): i = tna/12; cuota = capital × i / (1 − (1+i)^−n); para cada mes: interés = saldo × i, amortización = cuota − interés, saldo.
- calcularPrestamoPersonal({ capital, tna, cuotas, sumarIVA }, p): cuadro + IVA = interés × 0,21 (prestamos-reglas.json) por cuota cuando sumarIVA (por defecto sí).
  Totales: intereses, IVA, total a pagar. Si el usuario carga el CFT del banco, mostralo al lado; no lo calcules si faltan seguros y gastos.
- calcularPrestamoUVA({ capital, fechaDesembolso, tna, cuotas, inflacionMensualEsperada, ingresoMensual }, p):
  capitalUVA = capital / UVA(fechaDesembolso) (si la fecha no tiene dato, error); cuadro en UVA; cuota en pesos hoy = cuotaUVA × ultimaUVA().
  Proyección opcional de la cuota en pesos a 12, 24 y 60 meses con la inflación esperada (marcada como estimación).
  Si hay ingresoMensual, mostrá la relación cuota/ingreso (sin juzgarla: el máximo lo fija cada banco). Sin IVA para vivienda (nota [VERIFICAR] de prestamos-reglas.json).

Componente components/calcs/Prestamos.tsx: Seg "Personal en pesos | Hipotecario UVA". Para UVA: fecha de desembolso (por defecto hoy, limitada a rangoUVA),
UVA del día mostrada con fecha y fuente. Cuadro de amortización plegable (<details>) con las primeras 12 cuotas y la última. Inflación esperada precargada con el REM (editable).
Aviso: "La cuota UVA sube con la inflación. Si los salarios suben menos que los precios, la cuota pesa más en tu ingreso".

Contenido (finanzas/prestamos): h1 "Calculadora de préstamos personales e hipotecarios UVA", fórmula "Cuota = capital × i ÷ (1 − (1 + i)^−n), con i = TNA ÷ 12".
FAQ: qué es el sistema francés, qué es el CFT, por qué se paga IVA, cómo se actualiza un crédito UVA, si se puede precancelar.
Fuentes: PROCEDENCIA prestamos, uva, tasas (préstamos personales promedio como referencia, no como tasa ofrecida).

Tests (TNA de prueba):
- Personal: 1.000.000, TNA 60%, 12 cuotas → cuota pura 112.825,41; interés de la cuota 1 = 50.000; IVA 10.500; cuota 1 con IVA 123.325,41;
  intereses totales 353.904,92; IVA total 74.320,03; saldo final 0 (±0,01).
- UVA: 50.000.000 el 2026-11-09 (UVA 2.185,48) → 22.878,2693 UVA; TNA 4,5%, 240 cuotas → cuota 144,7392 UVA = $316.324,69;
  con la UVA del 2026-11-15 (2.196,12) → $317.864,71.
```

**Cómo verificar:** la suma de las amortizaciones del cuadro es igual al capital y los tests pasan.
