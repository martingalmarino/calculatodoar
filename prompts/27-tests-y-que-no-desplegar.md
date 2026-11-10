# 27 · Tests de la tanda 2 y qué no publicar todavía

**Qué hace:** corre los tests unitarios con los valores verificados, extiende el e2e a las 12 calculadoras nuevas y repasa la lista de cosas que todavía no hay que publicar o que tienen que ir con aviso.

**Por qué:** las 5 calculadoras actuales ya están online. Cada cambio de datos o de plantilla puede romperlas, y los tests lo detectan antes del deploy. El deploy lo hacés vos.

## Prompt para Cursor
```
No cambies el diseño ni la plantilla. Si un test falla, explicame la causa antes de tocar código y no ajustes los valores esperados para que pase.

1) Verificá que tests/tanda2.test.ts tenga los casos de los prompts 14 a 25 y que tests/calc.test.ts (las 5 originales) siga sin cambios y pasando.
2) Extendé tests/e2e/calculadoras.mjs: para cada calculadora nueva, cargá los valores del primer test de su prompt (en las de inputs libres,
   los valores de prueba indicados) y verificá que data-testid="resultado" muestre el monto esperado en formato es-AR.
   Verificá también que /finanzas/ y /hogar/ respondan 200 y que no haya enlaces internos rotos (recorré los <a href> de la home y de los hubs).
3) Corré: npm test, npm run lint, npm run build, npm run test:e2e.
4) Mostrame la salida del test de frescura de datos (UVA, ICL e IPC) del prompt 13.
```

## Qué no publicar (o publicar con aviso)
- **Datos vencidos:** no hagas deploy si la advertencia de frescura dice que la UVA o el ICL tienen más de 10 días de atraso, o que salió un IPC nuevo (el de octubre sale el 12/11/2026) y no está cargado. Corré `npm run data:series` y volvé a correr los tests.
- **Costo laboral:** el FAL (desde el devengado de diciembre de 2026) va solo como línea informativa, sin cambiar el total. No publiques un modo que sume el FAL encima para las altas RIFL hasta confirmar el punto [VERIFICAR].
- **Alquiler, régimen Ley 27.737 (Casa Propia):** solo se habilita como "otro índice" con coeficiente cargado por el usuario. No publiques valores de Casa Propia.
- **Dólar MEP, tasas de billeteras y bancos, nafta y GNC, ART:** sin valores precargados. Si en el código aparece un número de esos, sacalo.
- **Proyecciones de UVA:** solo con la etiqueta "estimación" visible junto al total.
- **Dominio:** sigue pendiente. Mientras el sitio esté en calculatodoar.vercel.app y el canonical apunte a calculalo.com.ar, no lo des de alta en Search Console con el dominio nuevo.
- **No toques** las 5 calculadoras originales. Lo único que roza una es el prompt 22, que propone leer la escala de vacaciones de un solo JSON sin cambiar ningún resultado.

**Cómo verificar:** los cuatro comandos terminan sin errores y el e2e lista las 17 calculadoras como OK.
