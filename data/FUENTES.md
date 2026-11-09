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
