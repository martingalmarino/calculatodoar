# calculalo · Tanda 2: finanzas, hogar y laboral

12 calculadoras nuevas para el proyecto que ya está online (`calculatodoar.vercel.app`), con datos oficiales consultados el **9/11/2026** y prompts para Cursor que siguen el formato de `prompts/01` a `11`.

| Categoría | Calculadoras |
|---|---|
| `/finanzas/` (nueva) | actualización de alquiler (ICL, IPC o acuerdo), cuotas o contado, dólar tarjeta, oficial y MEP, plazo fijo tradicional y UVA, inflación, rendimiento de billeteras, préstamos personales y UVA |
| `/hogar/` (nueva) | combustible: costo del viaje y nafta vs. GNC |
| `/laboral/` | vacaciones, horas extras, liquidación final y costo laboral |

## Contenido del pack

```
calculalo-tanda2/
├── README.md        este archivo
├── FUENTES.md       fuentes y estado de cada dato (se suma al data/FUENTES.md del proyecto, no lo reemplaza)
├── data/            12 JSON para copiar a data/ del proyecto
└── prompts/         12 a 27, uno por paso
```

## Cómo usarlo

1. **Copiá los JSON** de `data/` del pack a `data/` del proyecto. No pisan ningún archivo existente: todos los nombres son nuevos. También podés usar `DATA_SRC=../calculalo-tanda2/data npm run data:sync`.
2. **Sumá** el contenido de `FUENTES.md` del pack **al final** de `data/FUENTES.md` del proyecto. No copies este archivo encima del otro.
3. **Corré los prompts en Cursor en este orden**, uno por vez, y después de cada uno `npm test` y `npm run build`:

| # | Prompt | Qué deja hecho |
|---|---|---|
| 12 | `12-hubs-finanzas-hogar.md` | categorías nuevas, nav, home, footer y relacionadas; oculta las categorías vacías |
| 13 | `13-datos-tanda2.md` | tipos, helpers por fecha, PROCEDENCIA, `params` y el script `npm run data:series` |
| 14 | `14-actualizacion-alquiler.md` | ICL, IPC, acuerdo u otro índice |
| 15 | `15-cuotas-o-contado.md` | valor presente de las cuotas y tasa de equilibrio |
| 16 | `16-dolar-tarjeta.md` | tarjeta (+30%), servicios digitales (+IVA), dólares propios, compra de oficial y MEP |
| 17 | `17-plazo-fijo.md` | tradicional, UVA y comparación |
| 18 | `18-inflacion.md` | monto actualizado por IPC |
| 19 | `19-rendimiento-billeteras.md` | capitalización diaria y aviso del seguro de depósitos |
| 20 | `20-prestamos.md` | sistema francés con IVA, y préstamo UVA |
| 21 | `21-combustible.md` | costo del viaje y recupero del equipo de GNC |
| 22 | `22-vacaciones.md` | días por antigüedad, sueldo ÷ 25 y plus vacacional |
| 23 | `23-horas-extras.md` | al 50% y al 100%, con los límites del Decreto 484/2000 |
| 24 | `24-liquidacion-final.md` | reutiliza el módulo de indemnización según el motivo |
| 25 | `25-costo-laboral.md` | contribuciones, detracción, RIFL y FAL |
| 26 | `26-seo-tanda2.md` | metadata, JSON-LD, sitemap, sinónimos del buscador y FECHA_MODIFICACION |
| 27 | `27-tests-y-que-no-desplegar.md` | tests, e2e y la lista de lo que no hay que publicar |

Cada calculadora es independiente: podés publicar por partes. El hub de cada categoría aparece solo cuando tiene al menos una calculadora.

4. **Antes de cada deploy:** corré `npm run data:series` (lo crea el prompt 13) para actualizar el ICL, la UVA y el IPC. Después actualizá `FECHA_MODIFICACION` en `lib/seo.ts` y corré `npm test` y `npm run build`.

## Criterios
- Ningún número se inventa. Lo que publica un organismo (BCRA, INDEC, ARCA, LCT) sale de los JSON con su fecha y su fuente. Lo que no tiene una tabla oficial lo carga el usuario: MEP, tasas de cada banco o billetera, precios de combustible, ART, promedio del convenio y coeficiente Casa Propia.
- Las tasas del BCRA (depósitos a 30 días, préstamos personales, REM) se usan solo para precargar campos editables, con la leyenda "orientativo".
- Los tests usan los valores verificados. Donde el dato lo carga el usuario, el test aclara que es un "valor de prueba".
- No se tocan el canonical, el dominio ni robots: queda para cuando conectes calculalo.com.ar.

## Datos clave confirmados (9/11/2026)
- ICL del 09/11/2026: 37,38 (serie hasta el 16/11/2026). UVA del 09/11/2026: $2.185,48 (serie hasta el 15/11/2026).
- IPC de sep-2026: 12.514,1508 (1,9% mensual, 33,4% interanual). El de octubre sale el **12/11/2026**.
- Dólar: no hay Impuesto PAIS desde el 23/12/2024. Sigue la percepción del 30% (RG 5617) con tarjeta en pesos. La compra de billetes por personas humanas no la paga.
- Plazo fijo: divisor 365, mínimo 30 días (90 el UVA), seguro de depósitos de $50.000.000 desde el 1/4/2026.
- Vacaciones y horas extras: 14/21/28/35 días y sueldo ÷ 25, recargos del 50 y 100%, máximo de 30 h por mes y 200 por año. La Ley 27.802 cambió solo el art. 154 (cómo se toman las vacaciones) y sumó el banco de horas (art. 197 bis).
- Contribuciones: 20,4% o 18% sin tope, detracción de $7.003,68, obra social 6% y SCVO $424,62. RIFL del 5% para altas entre el 1/5/2026 y el 30/4/2027. FAL desde el devengado de diciembre de 2026 (1% o 2,5%, sin cambiar el costo total).

## Pendiente y [VERIFICAR]
- **Alquileres:** coeficiente Casa Propia (no está cargado, va como "otro índice") y fechas exactas de corte entre la Ley 27.551, la Ley 27.737 y el DNU 70/2023.
- **Dólar:** si el 30% de los servicios digitales se calcula con o sin IVA, el IIBB de cada provincia y el listado de plataformas exceptuadas del Anexo de la RG 5617.
- **Costo laboral:** si los $10.000 de detracción adicional son por empleador o por trabajador, la detracción en el SAC, en jornadas parciales y en el RIFL, cómo se trata el FAL en las altas RIFL y el valor mensual del FFEP de la ART.
- **Préstamos:** el apartado exacto de la exención de IVA para préstamos de vivienda.
- **Liquidación final:** el SAC sobre vacaciones no gozadas (no se suma, con aclaración) y el plazo de pago del art. 128.
- **Arrastrado de la tanda 1:** los topes de ANSES de enero a octubre de 2026. ARCA los publica en las notas de versión de "Declaración en línea" (por ejemplo, la v47.6 trae abril de 2026: mínima $128.091,45 y máxima $4.162.912,57), así que se pueden completar.
- **Series que vencen:** el ICL y la UVA se actualizan todos los días y el IPC todos los meses. Sin `npm run data:series`, las calculadoras de alquiler, inflación, plazo fijo y préstamos quedan desactualizadas.
