# Fuentes de parámetros (consultadas el 2026-11-01)

| Archivo | Dato | Vigencia | Fuente | Estado |
|---|---|---|---|---|
| ganancias-4ta-2026.json | Escala art. 94 y deducciones art. 30 acumuladas por mes (retención) | 01/07–31/12/2026 | ARCA: Tabla-Art-94-LIG-per-jul-a-dic-2026.pdf; Deducciones-personales-art-30-jul-dic-2026.pdf | Confirmado (PDF oficial, se verificaron los 84 valores) |
| ganancias-4ta-2026.json | Escala y deducciones de la liquidación anual/final 2026 | período fiscal 2026 | ARCA: Tabla-Art-94-LIG-liquidacion-anual-y-final-2026.pdf; Deducciones-personales-art-30-liq-anual-2026.pdf | Confirmado |
| ganancias-4ta-2026.json | Alquiler: 40% con tope en el MNI, +10% RELI | 2024 en adelante | arca.gob.ar/572Web/carga-datos/alquileres.asp | 40% y requisitos confirmados; tope = MNI anual (6.019.671,36): ARCA remite a "ver tratamiento" |
| anses-topes.json | Base imponible mín. 149.592,45 / máx. 4.861.685,38 | devengado nov-2026 | Res. ANSES 304/2026, BO 28/10/2026 (InfoLEG 431696) | Confirmado. Meses previos de 2026 NO cargados |
| sueldo-neto.json | Aportes 11% + 3% + 3% | permanente | Ley 24.241 art. 11, Ley 19.032, Ley 23.660 art. 16 | Confirmado por normativa general (sin cambios detectados en Ley 27.802) |
| aguinaldo.json | 50% de la mejor remuneración del semestre; proporcional | permanente | LCT arts. 121-123; Ley 23.041 | Fórmula confirmada. Divisor 181/184 = criterio adoptado (la ley no fija divisor) |
| indemnizacion-despido.json | Art. 245 nuevo (tope CCT ×3, piso 67%, exclusiones de base) | desde 06/03/2026 | Ley 27.802 art. 51 (BO 06/03/2026; InfoLEG 423680; biblioteca ARCA) | Confirmado |
| indemnizacion-despido.json | Preaviso: sin preaviso en prueba, 1 mes ≤5 años, 2 meses >5 | desde 06/03/2026 | Ley 27.802 art. 48 (sust. art. 231 inc. b) | Confirmado |
| indemnizacion-despido.json | Integración del mes (art. 233), vacaciones (arts. 150/155/156) | vigente | LCT; Ley 27.802 no los modifica (lista de artículos modificados revisada) | Confirmado; art. 154 modificado solo en época de goce |
| indemnizacion-despido.json | Exención en Ganancias de la indemnización por antigüedad; preaviso gravado | vigente | LIG t.o. 2019 art. 26 inc. i); Circular AFIP 4/2012 | Confirmado (Ley 27.802 no toca el inc. i) |
| monotributo.json | Categorías A-K, componentes, parámetros | desde 01/08/2026 | arca.gob.ar/monotributo/categorias.asp | Confirmado; totales recalculados y coinciden |

## Pendiente / no confirmado
- Topes ANSES de enero a octubre de 2026, necesarios para cálculos retroactivos.
- Divisor del SAC proporcional: no hay norma; algunos usan 180 días.
- SAC sobre preaviso e integración: criterio usual (1/12), sin norma revisada.
- Tope del art. 245 por CCT: no hay tabla pública central, así que lo ingresa el usuario.
- Fecha exacta de la próxima actualización del monotributo (estimada para febrero de 2027).

## Tanda 2: fuentes de parámetros (consultadas el 2026-11-09)

| Archivo | Dato | Vigencia / último dato | Fuente | Estado |
|---|---|---|---|---|
| icl.json | ICL diario, base 30/6/2020 = 1, 2 decimales (2.330 valores) | 01/07/2020 a 16/11/2026 (el BCRA publica con adelanto) | BCRA diar_icl.xls y API v4.0 variable 40; Com. B 13249/2026 | Confirmado: la API y el XLS coinciden en todos los días |
| uva.json | UVA diaria (3.882 valores) | 31/03/2016 a 15/11/2026 | BCRA API v4.0 variable 31 | Confirmado. 09/11/2026 = 2.185,48 |
| ipc.json | IPC nacional, nivel general, base dic-2016 = 100 | dic-2016 a sep-2026 (sep-2026 = 12.514,1508; 1,9% mensual, 33,4% interanual) | INDEC serie_ipc_divisiones.csv | Confirmado. El de octubre se publica el 12/11/2026 a las 16 h. datos.gob.ar difiere en 2 meses por redondeo: manda el INDEC |
| tasas-referencia.json | Depósitos a 30 días 21,18%, BADLAR privados 21,5%, TAMAR privados 23,5625%, préstamos personales 62,11% (04/11/2026); inflación sep-2026 1,9%; REM a 12 meses 21,8% (oct-2026) | ver fecha de cada serie | BCRA API v4.0 (variables 12, 7, 44, 14, 27, 28, 29) | Confirmado. Son solo orientativos y se usan para precargar campos editables |
| dolar-reglas.json | Percepción del 30% (RG 5617/2024, mod. RG 5672 y 5677/2025); exclusiones del art. 2, incluida la compra de billetes por personas humanas | vigente al 09/11/2026 | biblioteca.arca.gob.ar (texto actualizado) | Confirmado |
| dolar-reglas.json | Impuesto PAIS: no rige desde el 23/12/2024 | — | ARCA, novedad 4469 | Confirmado |
| dolar-reglas.json | IVA 21% sobre servicios digitales del exterior (RG 4240/2018) | vigente | arca.gob.ar/iva/servicios-digitales | Confirmado (por buscador; la página de ARCA no cargó por fetch). Base de la percepción con o sin IVA: [VERIFICAR] |
| dolar-reglas.json | Oficial minorista $1.571,84 y mayorista A3500 $1.545,3974 (05/11/2026) | referencia | BCRA API variables 4 y 5 | Confirmado, orientativo. MEP: no tiene publicación oficial, lo carga el usuario |
| plazo-fijo-reglas.json | Divisor 365; TEA; mínimo 30 días con tasa fija, 90 días el UVA; precancelable UVA cancelable desde los 30 días; UVA con el CER del día hábil anterior; tasas libres | texto ordenado (última com. A 8479) | BCRA t-depinv.pdf | Confirmado |
| plazo-fijo-reglas.json | Seguro de depósitos de $50.000.000 por persona y entidad | desde 01/04/2026 | Com. BCRA A 8407 | Confirmado. No cubre billeteras ni FCI (SEDESA) |
| alquileres-reglas.json | Art. 1199 del CCyC (DNU 70/2023): índice y moneda libres | vigente | CCyC actualizado (RPBA) | Confirmado |
| alquileres-reglas.json | Cortes Ley 27.551 / 27.737 / DNU (17/10/2023, 18/10/2023 y 29/12/2023) y coeficiente Casa Propia | — | fuentes secundarias | [VERIFICAR] en el BO. Casa Propia no está cargado |
| prestamos-reglas.json | Sistema francés; IVA 21% sobre intereses de préstamos personales; exención para vivienda | vigente | Ley de IVA art. 7 inc. h) punto 16 | 21% confirmado; apartado exacto de la exención: [VERIFICAR] |
| combustible.json | Sin precios precargados; dataset de precios en surtidor (Res. 314/2016) | — | datos.gob.ar | Por diseño, sin valores |
| vacaciones-horas-extras.json | Arts. 150, 151, 153, 155 y 156 sin cambios; art. 154 sustituido (Ley 27.802 art. 41) | vigente | LCT (InfoLEG); Ley 27.802 | Confirmado |
| vacaciones-horas-extras.json | Recargos del 50 y 100% (art. 201); jornada de 8 h diarias y 48 semanales (Ley 11.544); límites de 30 h por mes y 200 por año (Dto. 484/2000); banco de horas (art. 197 bis, Ley 27.802 art. 42) | vigente | LCT; Ley 27.802; InfoLEG 63347 | Confirmado. Divisor de la hora (200): criterio habitual, no es norma |
| liquidacion-final.json | Renuncia (art. 240), mutuo acuerdo (art. 241), sin preaviso en el período de prueba (art. 231 b) | desde el 06/03/2026 | Ley 27.802 arts. 48-50 | Confirmado. SAC sobre vacaciones no gozadas y plazo de pago del art. 128: [VERIFICAR] |
| contribuciones-patronales.json | 20,40% / 18% (Ley 27.541 art. 19); detracción de $7.003,68 / $17.509,20 y $10.000 adicionales para nóminas de hasta 25 empleados; sin tope | devengados desde dic-2019 | ARCA, aportes y contribuciones; Guía LSD 31 | Confirmado. Si los $10.000 son por empleador o por trabajador, y la detracción sobre el SAC: [VERIFICAR] |
| contribuciones-patronales.json | Obra social 6% (Ley 23.660 art. 16); cambio de texto desde ene-2027 (Ley 27.802 arts. 165-166) | vigente | Ley 27.802 | 6% confirmado; efecto del cambio de 2027: [VERIFICAR] |
| contribuciones-patronales.json | SCVO $424,62 por trabajador | desde el devengado mar-2026 | ARCA, Declaración en línea v47.6 | Confirmado |
| contribuciones-patronales.json | RIFL: 5% (1,31 SIPA + 0,57 asignaciones familiares + 0,12 FNE + 3 INSSJP) por 48 meses, para altas entre el 01/05/2026 y el 30/04/2027 | vigente | RG 5844/2026; Dto. 315/2026; Guía ARCA | Confirmado. Detracción en el RIFL: [VERIFICAR] |
| contribuciones-patronales.json | FAL: 1% para grandes empresas y 2,5% para MiPyME, con una reducción equivalente de las contribuciones | desde el 01/12/2026 (devengado dic-2026) | Ley 27.802 arts. 60, 76 y 77; Dto. 1228/2026; RG 5915/2026 | Confirmado. Tratamiento del FAL en las altas RIFL: [VERIFICAR] |

### Pendiente o no confirmado (tanda 2)
- Coeficiente Casa Propia (contratos de la Ley 27.737) y fechas exactas de corte entre regímenes de alquiler.
- Base de la percepción del 30% en servicios digitales (con o sin IVA) e IIBB provincial sobre servicios digitales.
- Detracciones: los $10.000 (por empleador o por trabajador), su aplicación en el SAC, en jornadas parciales y en el RIFL.
- FAL en las altas RIFL y subsistema al que se imputa la reducción.
- Exención de IVA para préstamos de vivienda (apartado exacto).
- SAC sobre vacaciones no gozadas (criterio jurisprudencial) y plazo de pago de la liquidación final (art. 128).
- Valor vigente del FFEP de la ART (cambia todos los meses; solo hay como referencia el de mar-2026: $1.637).
