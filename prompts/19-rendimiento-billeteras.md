# 19 · Rendimiento de billeteras y cuentas remuneradas

**Qué hace:** calcula cuánto rinde tu saldo en una billetera o cuenta remunerada con la TNA que te muestra la app (capitalización diaria), y lo compara con un plazo fijo y con la inflación.

**Por qué:** Mercado Pago, Ualá, Naranja X y los bancos cambian la tasa seguido y no hay una tabla oficial. La TNA la cargás vos. También es importante aclarar qué está cubierto: el Seguro de Garantía de los Depósitos cubre las cuentas bancarias hasta $50.000.000, pero no el saldo de una billetera ni los fondos comunes de inversión.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales.

lib/calc/billetera.ts, calcularBilletera({ saldo, tna, dias, topeRemunerado }):
- Capitalización diaria: final = saldo × (1 + tna/365)^dias. Si hay topeRemunerado (algunas cuentas solo remuneran hasta cierto saldo; input opcional),
  la parte que excede no rinde.
- interes = final − saldo; TEA = (1 + tna/365)^365 − 1; equivalente mensual.
- Comparación opcional con un plazo fijo (reusar calcularPlazoFijo) y con la inflación mensual esperada (input).

Componente components/calcs/RendimientoBilleteras.tsx: saldo, TNA (vacía, obligatoria, leyenda "La TNA vigente está en tu app y cambia seguido"),
plazo en días (Seg 30 / 90 / 365 / otro), tope remunerado opcional, tipo de cuenta (Seg "Cuenta de banco | Billetera o cuenta de pago | Fondo money market").
Según el tipo, mostrá la nota de plazo-fijo-reglas.json → seguroDepositos: banco = cubierta hasta $50.000.000 por persona y entidad; billetera y FCI = no cubiertos.
No precargues tasas de ninguna marca.

Contenido (finanzas/rendimiento-billeteras): h1 "Calculadora de rendimiento de billeteras virtuales y cuentas remuneradas",
fórmula "Saldo final = saldo × (1 + TNA ÷ 365)^días". FAQ: por qué la TEA es mayor que la TNA, si la plata en la billetera está garantizada,
billetera o plazo fijo, si se paga Ganancias o Bienes Personales [respuesta prudente: depende de tu situación, consultá a un contador].
Fuentes: PROCEDENCIA plazoFijo (seguro de depósitos), tasas.

Tests (TNA de prueba, no es la tasa de ninguna billetera):
- 1.000.000 al 20% TNA, 30 días → final 1.016.569,63, interés 16.569,63, TEA 22,13%.
- Con interés simple, el mismo caso daría 16.438,36: el test confirma que el módulo usa capitalización diaria.
- Tope remunerado 500.000 con saldo 1.000.000, 20% TNA, 30 días → final 1.008.284,82 (solo rinden 500.000).
```

**Cómo verificar:** sin TNA cargada, la calculadora no muestra un resultado.
