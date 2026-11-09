export const SITE = {
  nombre: "calculalo",
  url: "https://calculalo.com.ar",
  descargo: "Resultado orientativo. No reemplaza el asesoramiento de un contador o abogado laboralista.",
};

export type CategoriaSlug = "laboral" | "impuestos";
export type CalcSlug = "sueldo-neto" | "aguinaldo" | "indemnizacion" | "ganancias" | "monotributo";

export interface Faq { q: string; a: string }
export interface Calculadora {
  slug: CalcSlug;
  categoria: CategoriaSlug;
  nombre: string;
  resumen: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  formula: string;
  faq: Faq[];
  relacionadas: { categoria: CategoriaSlug; slug: CalcSlug }[];
}

export interface Categoria {
  slug: CategoriaSlug;
  nombre: string;
  title: string;
  description: string;
  intro: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    slug: "laboral",
    nombre: "Laboral",
    title: "Calculadoras laborales 2026: sueldo, aguinaldo y despido",
    description: "Calculadoras laborales para Argentina: sueldo neto, aguinaldo e indemnización por despido, con los topes de ANSES y la Ley de Contrato de Trabajo.",
    intro: "Todo lo que pasa entre tu recibo de sueldo y tu cuenta bancaria. Acá calculás cuánto cobrás en mano, cuánto te toca de aguinaldo y qué te corresponde si te despiden. Usamos la Ley de Contrato de Trabajo y los valores que publica ANSES; si tu convenio colectivo tiene adicionales propios, el resultado es un piso.",
  },
  {
    slug: "impuestos",
    nombre: "Impuestos",
    title: "Calculadoras de impuestos 2026: Ganancias y monotributo",
    description: "Calculá la retención de Ganancias de 4ta categoría y tu categoría de monotributo con las escalas y montos vigentes de ARCA.",
    intro: "Ganancias para empleados y monotributo, con las escalas y deducciones que publica ARCA en cada actualización. Cada calculadora indica el período vigente y el documento oficial del que salen los valores.",
  },
];

// Textos del plan de lanzamiento, ajustados a los parámetros verificados de /data.
export const CALCULADORAS: Calculadora[] = [
  {
    slug: "sueldo-neto", categoria: "laboral", nombre: "Sueldo neto",
    resumen: "De bruto a neto: jubilación, PAMI y obra social con tope.",
    title: "Calculadora de sueldo neto 2026: de bruto a neto en Argentina",
    description: "Calculá tu sueldo en mano 2026: descontamos jubilación (11%), PAMI (3%) y obra social (3%) con el tope ANSES vigente. Gratis y actualizada.",
    h1: "Calculadora de sueldo neto 2026",
    intro: "Ingresá tu sueldo bruto y te mostramos cuánto cobrás en mano. Aplicamos los aportes de ley del 17% y la base imponible máxima de ANSES vigente.",
    formula: "Neto = Bruto − 17% × mín(Bruto, Tope ANSES) + No remunerativo − cuota sindical",
    faq: [
      { q: "¿Qué porcentaje se descuenta del sueldo?", a: "17%: 11% jubilación, 3% PAMI (Ley 19.032) y 3% obra social." },
      { q: "¿Qué es el tope de ANSES?", a: "La remuneración máxima sobre la que se calculan aportes; por encima no se descuenta más. Se actualiza cada mes." },
      { q: "¿Los montos no remunerativos tienen descuentos?", a: "No pagan jubilación; según el convenio pueden tener aporte de obra social." },
      { q: "¿El neto incluye Ganancias?", a: "No. La retención depende de tu sueldo anual y tus deducciones; calculala aparte en la calculadora de Ganancias." },
      { q: "¿Por qué mi recibo da distinto?", a: "Por adicionales de convenio, cuota sindical, embargos o retención de Ganancias." },
    ],
    relacionadas: [{ categoria: "impuestos", slug: "ganancias" }, { categoria: "laboral", slug: "aguinaldo" }, { categoria: "laboral", slug: "indemnizacion" }],
  },
  {
    slug: "aguinaldo", categoria: "laboral", nombre: "Aguinaldo (SAC)",
    resumen: "Completo o proporcional a los días trabajados, en bruto y en mano.",
    title: "Calculadora de aguinaldo 2026: SAC completo y proporcional",
    description: "Calculá tu aguinaldo de diciembre 2026: 50% del mejor sueldo del semestre, o proporcional a los días trabajados. Vence el 18/12.",
    h1: "Calculadora de aguinaldo (SAC) 2026",
    intro: "El aguinaldo es la mitad del mejor sueldo bruto del semestre. Si entraste o saliste en el medio, te corresponde la parte proporcional, que calculamos sobre los días reales del semestre (181 o 182 en el primero, 184 en el segundo). Acá lo calculás en bruto y en mano.",
    formula: "SAC = mejor remuneración ÷ 2 × días trabajados ÷ días del semestre",
    faq: [
      { q: "¿Cuándo se paga el aguinaldo de diciembre 2026?", a: "Hasta el 18/12, con tolerancia de 4 días hábiles." },
      { q: "¿Tiene descuentos?", a: "Sí, los mismos aportes del 17% que el sueldo." },
      { q: "¿Paga Ganancias?", a: "Sí, si tus ingresos anuales superan las deducciones personales." },
      { q: "¿Por qué divide por 184 y no por 180?", a: "La ley dice proporcional al tiempo trabajado y no fija un divisor. Usamos los días reales del semestre, como el software de liquidación; algunas calculadoras usan 180 y dan un poco más." },
      { q: "¿Me corresponde si renuncio?", a: "Sí, el proporcional se paga en la liquidación final." },
      { q: "¿Entran las horas extras?", a: "Sí, si son remunerativas y forman parte de ese mes." },
    ],
    relacionadas: [{ categoria: "laboral", slug: "sueldo-neto" }, { categoria: "impuestos", slug: "ganancias" }, { categoria: "laboral", slug: "indemnizacion" }],
  },
  {
    slug: "indemnizacion", categoria: "laboral", nombre: "Indemnización por despido",
    resumen: "Art. 245 según Ley 27.802, preaviso, integración del mes, vacaciones y SAC.",
    title: "Calculadora de indemnización por despido 2026 (art. 245 LCT)",
    description: "Calculá tu indemnización por despido sin causa 2026: antigüedad, preaviso, integración del mes, vacaciones y SAC proporcional, con la Ley 27.802 de modernización laboral.",
    h1: "Calculadora de indemnización por despido 2026",
    intro: "Si te despidieron sin causa, te corresponde un sueldo por cada año trabajado o fracción mayor a tres meses, más preaviso y otros rubros. Cargá tus datos y te mostramos el desglose.",
    formula: "Antigüedad = máx(mín(mejor remuneración, 3 × promedio del convenio), 67% × mejor remuneración) × años computados",
    faq: [
      { q: "¿Cuánto me corresponde por año?", a: "Un mes de la mejor remuneración mensual, normal y habitual del último año." },
      { q: "¿Qué pasa si trabajé menos de un año?", a: "Igual corresponde un mes como mínimo si superaste el período de prueba." },
      { q: "¿La indemnización paga Ganancias?", a: "La indemnización por antigüedad está exenta (art. 26 inc. i de la ley del impuesto). El preaviso, en cambio, está gravado." },
      { q: "¿Cómo funciona el tope del convenio?", a: "Con la Ley 27.802, la base no puede superar 3 veces el salario promedio de tu convenio, pero tampoco quedar por debajo del 67% de tu mejor remuneración (el criterio Vizzoti ahora está en la ley). El promedio del convenio lo ingresás vos." },
      { q: "¿Hay preaviso en el período de prueba?", a: "No. La Ley 27.802 eliminó el preaviso de 15 días en el período de prueba. Después corresponde 1 mes hasta 5 años de antigüedad y 2 meses si es mayor." },
      { q: "¿En cuánto tiempo me tienen que pagar?", a: "Dentro de los 4 días hábiles desde la extinción (arts. 128 y 255 bis LCT)." },
    ],
    relacionadas: [{ categoria: "laboral", slug: "aguinaldo" }, { categoria: "laboral", slug: "sueldo-neto" }],
  },
  {
    slug: "ganancias", categoria: "impuestos", nombre: "Ganancias 4ta categoría",
    resumen: "Impuesto anual con la escala de la liquidación anual 2026 de ARCA.",
    title: "Calculadora de Ganancias 2026 para empleados (4ta categoría)",
    description: "Calculá cuánto te retienen de Ganancias en 2026 con la escala y deducciones de la liquidación anual 2026 de ARCA: mínimo no imponible, deducción especial, cónyuge e hijos.",
    h1: "Calculadora de Ganancias 2026 para empleados",
    intro: "Te decimos si te toca Ganancias y cuánto pagarías en el año, con la escala del art. 94 y las deducciones del art. 30 que ARCA publicó para la liquidación anual y final 2026.",
    formula: "Impuesto = fijo del tramo + % × (ganancia neta imponible − piso del tramo)",
    faq: [
      { q: "¿Desde qué sueldo se paga Ganancias en 2026?", a: "Depende de tu situación familiar y tus deducciones; la calculadora lo estima con tus datos." },
      { q: "¿Cada cuánto cambian los valores?", a: "Dos veces por año (enero y julio), según el IPC." },
      { q: "¿El aguinaldo paga Ganancias?", a: "Sí, se suma a la ganancia bruta del año." },
      { q: "¿Puedo deducir el alquiler?", a: "Sí, el 40% del alquiler, con tope en la ganancia no imponible, si no sos titular de ningún inmueble. Si el contrato está registrado en RELI se suma un 10% adicional." },
      { q: "¿Cómo informo deducciones?", a: "Con el formulario F.572 web en SiRADIG de ARCA." },
    ],
    relacionadas: [{ categoria: "laboral", slug: "sueldo-neto" }, { categoria: "laboral", slug: "aguinaldo" }],
  },
  {
    slug: "monotributo", categoria: "impuestos", nombre: "Monotributo",
    resumen: "Tu categoría y la cuota mensual según lo facturado en 12 meses.",
    title: "Calculadora de monotributo 2026: qué categoría te toca y cuánto pagás",
    description: "Ingresá tu facturación y te decimos tu categoría de monotributo y la cuota mensual con los valores vigentes de ARCA.",
    h1: "Calculadora de monotributo 2026",
    intro: "Con tu facturación de los últimos 12 meses y el tipo de actividad, te decimos en qué categoría estás y cuánto vas a pagar por mes.",
    formula: "Categoría = la menor que cubre facturación, superficie, energía y alquileres; Cuota = impuesto integrado + SIPA + obra social",
    faq: [
      { q: "¿Cuándo me tengo que recategorizar?", a: "En enero y julio, según lo facturado en los 12 meses previos." },
      { q: "¿Qué pasa si supero la categoría K?", a: "Quedás excluido y pasás al régimen general." },
      { q: "¿Si estoy en relación de dependencia pago todo?", a: "No pagás SIPA ni obra social; solo el impuesto integrado." },
      { q: "¿Cuál es el tope para vender cosas muebles?", a: "Hay un precio unitario máximo por venta; la calculadora te avisa si lo superás." },
      { q: "¿Puedo sumar familiares a la obra social?", a: "Sí, pagando el aporte por cada integrante adicional." },
    ],
    relacionadas: [{ categoria: "impuestos", slug: "ganancias" }],
  },
];

export const getCategoria = (s: string) => CATEGORIAS.find((c) => c.slug === s);
export const getCalc = (cat: string, s: string) => CALCULADORAS.find((c) => c.categoria === cat && c.slug === s);
export const calcsDe = (cat: CategoriaSlug) => CALCULADORAS.filter((c) => c.categoria === cat);
export const urlCalc = (c: { categoria: string; slug: string }) => `/${c.categoria}/${c.slug}/`;
