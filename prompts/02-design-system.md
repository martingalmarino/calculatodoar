# 02 · Design system

**Qué hace:** pasa los tokens de docs/design-system.md (colores papel/tinta, espaciados --s1…--s6, radios, tipografías) a app/globals.css.

**Por qué:** un solo CSS chico, sin framework, mantiene el sitio liviano y coherente entre páginas.

## Prompt para Cursor
```
Leé docs/design-system.md y escribí app/globals.css con esos tokens como variables CSS en :root.
Incluí estilos para: header (.top, .logo, .nav), migas (.migas), hero, buscador (.buscar), ranking, tarjetas de categoría (.cats/.cat),
la grilla de calculadora (.calc con formulario a la izquierda y .resultado a la derecha en desktop, apilado en mobile),
campos (.campo, .peso con prefijo $, .seg para opciones, .check), tabla de resultado, .formula, .aviso, .descargo, FAQ con <details> y footer.
Contraste AA, foco visible y enlace "Saltar al contenido".
```

**Cómo verificar:** abrí la home en 375 px y 1280 px; el foco se ve al navegar con Tab.
