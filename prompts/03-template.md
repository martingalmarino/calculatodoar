# 03 · Plantilla de calculadora

**Qué hace:** arma las rutas `/[categoria]/` y `/[categoria]/[calculadora]/` con generateStaticParams, más los componentes compartidos.

**Por qué:** cada calculadora nueva solo agrega textos en lib/content.ts, un módulo de cálculo y un componente de formulario. La plantilla resuelve la metadata, el JSON-LD, las migas, la FAQ, las fuentes y los enlaces relacionados.

## Prompt para Cursor
```
Creá lib/content.ts con CATEGORIAS y CALCULADORAS (slug, categoria, nombre, title, description, h1, intro, formula, faq, relacionadas).
Creá app/[categoria]/page.tsx (hub) y app/[categoria]/[calculadora]/page.tsx con dynamicParams = false y generateStaticParams que devuelva todas las combinaciones.
La página de calculadora renderiza: Migas, H1, fecha de actualización, intro, el componente cliente de la calculadora, el descargo
"Resultado orientativo. No reemplaza el asesoramiento de un contador o abogado laboralista.", "Cómo se calcula" con fórmula, aviso y ejemplo,
FAQ, "Fuentes y vigencia" y "Seguí con".
Componentes: Header, Footer, Migas, JsonLd, MoneyInput (máscara es-AR), Campos (Campo, Check, Seg), Resultado (output con data-testid="resultado") y Fuentes.
Los ejemplos se calculan con los mismos módulos y datos (lib/ejemplos.ts); no escribas montos a mano.
```

**Cómo verificar:** `npm run build` lista las 5 rutas de calculadora como SSG.
