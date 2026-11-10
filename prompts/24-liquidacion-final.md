# 24 · Liquidación final (renuncia, despido o mutuo acuerdo)

**Qué hace:** calcula lo que te tienen que pagar al terminar el trabajo según el motivo: renuncia, despido sin causa, despido con causa, mutuo acuerdo (art. 241) o fin durante el período de prueba. Siempre suma los días trabajados del mes, las vacaciones no gozadas y el SAC proporcional. En el despido sin causa agrega la indemnización, el preaviso y la integración.

**Por qué:** casi todos los rubros ya están programados en el módulo de indemnización. Esta calculadora lo reutiliza y, según el motivo, deja cada rubro en cero o lo incluye, así que no hay dos fórmulas que puedan dar distinto. Con la Ley 27.802 la renuncia se hace por telegrama o ante la autoridad, y el mutuo acuerdo por escritura pública o ante la autoridad.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales. NO dupliques fórmulas: reutilizá calcularIndemnizacion y pIndem.

lib/calc/liquidacionFinal.ts, calcularLiquidacionFinal({ motivo, ingreso, egreso, mejorRemuneracion, vacacionesGozadas, topeConvenio, huboPreaviso, gratificacion }, p):
- Llamá a calcularIndemnizacion con los mismos datos (superoPrueba: true salvo motivo "periodoPrueba") y quedate con los rubros
  que corresponden según data/liquidacion-final.json → motivos[].rubros:
  renuncia, despidoConCausa y periodoPrueba → diasMes + vacaciones + sacProporcional.
  despidoSinCausa → todos (igual al total de la calculadora de indemnización).
  mutuoAcuerdo → diasMes + vacaciones + sacProporcional + gratificacion (input).
- Para renuncia: mostrá como dato (no lo restes) que el trabajador debe preavisar 15 días (art. 231 inc. a).
- No sumes SAC sobre vacaciones no gozadas y aclaralo (criterio [VERIFICAR] del JSON).

Componente components/calcs/LiquidacionFinal.tsx: Seg con los 5 motivos; mismos campos que Indemnizacion (reutilizá los subcomponentes) y gratificación solo en mutuo acuerdo.
Tabla de rubros con una columna "Por qué" (artículo de la LCT). Para el despido con causa, mostrá un aviso destacado:
"Si la causa no se puede probar, corresponde lo mismo que en un despido sin causa".

Contenido (laboral/liquidacion-final): h1 "Calculadora de liquidación final 2026: renuncia, despido y mutuo acuerdo",
fórmula "Liquidación = días trabajados + vacaciones no gozadas + SAC proporcional (+ indemnización, preaviso e integración si es despido sin causa)".
FAQ: qué me pagan si renuncio, plazo de pago (4 días hábiles, art. 128 [VERIFICAR vigencia tras Ley 27.802]), qué es la integración del mes,
cómo se hace la renuncia, qué cambia con el mutuo acuerdo. Fuentes: PROCEDENCIA liquidacion, indemnizacion, sac.

Tests (ingreso 2022-03-01, egreso 2026-11-15, remuneración 1.500.000, sin vacaciones gozadas, sin tope):
- renuncia → días 750.000 + vacaciones 734.136,99 (12,2356 días) + SAC 562.500 = 2.046.636,99.
- despidoSinCausa con preaviso omitido → 11.984.136,99 (igual a calcularIndemnizacion: antigüedad 7.500.000, preaviso 1.500.000, integración 750.000, SAC s/ preaviso e integración 187.500).
- despidoConCausa → 2.046.636,99. mutuoAcuerdo con gratificación 3.000.000 → 5.046.636,99.
```

**Cómo verificar:** los tests de indemnización existentes siguen pasando sin cambios.
