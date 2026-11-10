# 21 · Combustible: costo de un viaje, nafta vs. GNC

**Qué hace:** calcula cuánto sale un viaje en auto según los kilómetros, el consumo y el precio que pagás, compara nafta (o gasoil) con GNC y estima en cuántos kilómetros recuperás el equipo de GNC.

**Por qué:** los precios cambian seguido y varían según la provincia, la ciudad y la bandera, por eso no se precargan. El usuario carga lo que ve en el surtidor. Para consultar, enlazamos el dataset oficial de precios en surtidor de la Secretaría de Energía.

## Prompt para Cursor
```
Respetá el sistema de diseño y la plantilla existentes. No rompas las 5 calculadoras actuales. Categoría "hogar" (el hub aparece recién ahora, por el prompt 12).

lib/calc/combustible.ts:
- costoViaje({ km, consumoL100km | kmPorLitro, precioLitro, idaYVuelta, personas, peajes }): litros = km × consumo / 100; costo = litros × precio;
  ×2 si idaYVuelta; + peajes (input opcional); costo por persona.
- compararGNC({ km, consumoNafta, precioNafta, consumoGNCm3100km, precioM3, costoEquipo }): costo de cada uno, ahorro por km,
  kmRecupero = costoEquipo / (consumoNafta/100 × precioNafta − consumoGNC/100 × precioM3). Si el ahorro por km es ≤ 0, avisar que no se recupera.
- Conversión km/l ↔ l/100 km.

Componente components/calcs/Combustible.tsx: Seg "Costo del viaje | Nafta vs. GNC". Todos los precios vacíos y obligatorios, con la leyenda
"Cargá el precio de tu estación. Podés consultar los precios oficiales por estación en datos.gob.ar (Secretaría de Energía)" y el link de combustible.json.
Sin precios de ejemplo en la UI (en los textos de ayuda tampoco).

Contenido (hogar/combustible): h1 "Calculadora de combustible: cuánto sale el viaje y nafta vs. GNC", fórmula "Costo = km × consumo ÷ 100 × precio".
FAQ: cuánto consume un auto promedio [respuesta: depende del auto, mirá el manual o calculalo con el tanque lleno], cómo medir tu consumo real,
cuándo conviene el GNC, si el GNC rinde menos en ruta. Fuentes: PROCEDENCIA combustible.
En lib/seo.ts, webApp con applicationCategory "UtilitiesApplication" para la categoría hogar.

Tests (precios y consumos de prueba, no son precios reales):
- 700 km, 8 l/100 km, $1.500/l → 56 l, $84.000.
- GNC 7 m³/100 km, $800/m³ → 49 m³, $39.200; ahorro $44.800.
- Equipo $1.500.000 → se recupera en 23.437,5 km.
- 12,5 km/l ↔ 8 l/100 km.
```

**Cómo verificar:** con algún precio vacío no se muestra resultado; en el código no hay ningún precio de combustible.
