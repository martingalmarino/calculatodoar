export const SITE = {
  nombre: "calculalo",
  url: "https://www.calculalo.com.ar",
  descargo: "Resultado orientativo. No reemplaza el asesoramiento de un contador o abogado laboralista.",
};

export type CategoriaSlug = "laboral" | "impuestos" | "finanzas" | "hogar";
export type CalcSlug =
  | "sueldo-neto" | "aguinaldo" | "indemnizacion" | "vacaciones" | "horas-extras" | "liquidacion-final" | "costo-laboral"
  | "ganancias" | "monotributo"
  | "actualizacion-alquiler" | "cuotas-o-contado" | "dolar-tarjeta" | "plazo-fijo" | "inflacion" | "rendimiento-billeteras" | "prestamos"
  | "combustible";

/** Las 5 del lanzamiento: van primero en el ranking de la home. */
export const DESTACADAS: CalcSlug[] = ["sueldo-neto", "aguinaldo", "indemnizacion", "ganancias", "monotributo"];

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
  /** Si falta, la plantilla usa el descargo de la categoría o el del sitio */
  descargo?: string;
  /** Palabras extra para el buscador (sin acentos, minúsculas en el filtro). */
  sinonimos?: string[];
}

export interface Categoria {
  slug: CategoriaSlug;
  nombre: string;
  title: string;
  description: string;
  intro: string;
  /** Si falta, la plantilla usa SITE.descargo */
  descargo?: string;
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
  {
    slug: "finanzas",
    nombre: "Finanzas personales",
    title: "Calculadoras de finanzas personales 2026: alquiler, dólar, plazo fijo e inflación",
    description: "Actualizá tu alquiler por ICL o IPC, calculá el dólar tarjeta, compará plazo fijo y billeteras, y medí cuánto perdió tu plata con la inflación.",
    intro: "Las cuentas de todos los meses: cuánto aumenta el alquiler, si conviene pagar en cuotas, cuánto sale el dólar con tarjeta y cuánto rinde tu plata. Usamos los índices oficiales del BCRA y del INDEC, y te mostramos la fecha de cada dato.",
    descargo: "Resultado orientativo. No es una recomendación de inversión ni reemplaza el asesoramiento de un profesional.",
  },
  {
    slug: "hogar",
    nombre: "Hogar y auto",
    title: "Calculadoras para el hogar y el auto: combustible, nafta y GNC",
    description: "Calculá cuánto sale un viaje en auto y si te conviene la nafta o el GNC, con los precios que pagás vos.",
    intro: "Herramientas para gastos de la casa y del auto. Los precios los cargás vos, porque cambian según la ciudad y la estación de servicio.",
    descargo: "Resultado orientativo, calculado con los precios y consumos que cargaste.",
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
    relacionadas: [{ categoria: "impuestos", slug: "ganancias" }, { categoria: "laboral", slug: "aguinaldo" }, { categoria: "laboral", slug: "costo-laboral" }],
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
      { q: "¿Cuándo se paga el aguinaldo de diciembre 2026?", a: "La ley fija el pago hasta el 18 de diciembre (art. 122 de la LCT). Algunos interpretan que rige la tolerancia de 4 días hábiles del art. 128, pero la norma del aguinaldo no la menciona." },
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
    relacionadas: [{ categoria: "laboral", slug: "aguinaldo" }, { categoria: "laboral", slug: "sueldo-neto" }, { categoria: "laboral", slug: "liquidacion-final" }],
  },
  {
    slug: "liquidacion-final", categoria: "laboral", nombre: "Liquidación final",
    resumen: "Qué te pagan al egresar: renuncia, despido, mutuo acuerdo o período de prueba.",
    title: "Calculadora de liquidación final 2026: renuncia y despido",
    description: "Calculá tu liquidación final según el motivo de egreso: días del mes, vacaciones, SAC e indemnización si corresponde.",
    h1: "Calculadora de liquidación final 2026: renuncia, despido y mutuo acuerdo",
    intro: "Al terminar el trabajo siempre corresponden los días del mes, las vacaciones no gozadas y el SAC proporcional. En el despido sin causa se suman indemnización, preaviso e integración.",
    sinonimos: ["renuncia", "finiquito", "mutuo acuerdo"],
    formula: "Liquidación = días trabajados + vacaciones no gozadas + SAC proporcional (+ indemnización, preaviso e integración si es despido sin causa)",
    faq: [
      { q: "¿Qué me pagan si renuncio?", a: "Días trabajados del mes, vacaciones no gozadas y SAC proporcional. No hay indemnización ni preaviso a cargo del empleador. Vos debés preavisar 15 días (art. 231 inc. a)." },
      { q: "¿Cuál es el plazo de pago?", a: "Dentro de los 4 días hábiles desde la extinción (art. 128 LCT). Verificá la vigencia tras la Ley 27.802 con tu liquidación o asesor." },
      { q: "¿Qué es la integración del mes?", a: "Si te despiden sin causa y sin preaviso en un día que no es el último del mes, te pagan los días restantes hasta fin de mes (art. 233)." },
      { q: "¿Cómo se hace la renuncia?", a: "Por telegrama o ante la autoridad laboral (art. 240, según. Ley 27.802 art. 49)." },
      { q: "¿Qué cambia con el mutuo acuerdo?", a: "Se formaliza por escritura pública o ante la autoridad (art. 241). Además de los rubros comunes, se suma la gratificación que pacten." },
    ],
    relacionadas: [{ categoria: "laboral", slug: "indemnizacion" }, { categoria: "laboral", slug: "vacaciones" }, { categoria: "laboral", slug: "aguinaldo" }],
  },
  {
    slug: "costo-laboral", categoria: "laboral", nombre: "Costo laboral",
    resumen: "Cuánto le cuesta al empleador un sueldo: contribuciones, obra social, ART y SCVO.",
    title: "Calculadora de costo laboral 2026: cuánto cuesta un empleado",
    description: "Calculá el costo mensual y anual de un empleado: contribuciones, obra social, ART, seguro de vida, RIFL y FAL.",
    h1: "Calculadora de costo laboral 2026: cuánto cuesta un empleado",
    intro: "Las contribuciones patronales no tienen tope. Con la Ley 27.802, el RIFL baja la alícuota al 5% en altas nuevas que cumplan requisitos, y el FAL redistribuye parte del aporte sin cambiar el costo total.",
    sinonimos: ["cargas sociales", "contribuciones patronales", "rifl"],
    formula: "Costo = bruto + 18% o 20,4% × (bruto − detracción) + 6% obra social + ART + seguro de vida",
    faq: [
      { q: "¿Qué son las cargas sociales?", a: "Son los aportes del trabajador y las contribuciones del empleador a la seguridad social, obra social y otros conceptos. Acá calculamos el lado del empleador." },
      { q: "¿Cuál es la diferencia entre aportes y contribuciones?", a: "Los aportes los paga el trabajador (17% con tope ANSES). Las contribuciones las paga el empleador y no tienen tope: se calculan sobre el bruto menos la detracción." },
      { q: "¿Qué es el RIFL y quién entra?", a: "El Régimen de Incentivo a la Formalización Laboral (Ley 27.802) baja las contribuciones al 5% por 48 meses para altas entre el 1/5/2026 y el 30/4/2027 que cumplan el art. 157." },
      { q: "¿Qué es el FAL y si aumenta el costo?", a: "El Fondo de Asistencia Laboral desvía el 1% (grandes) o el 2,5% (MiPyME) desde dic-2026, con una reducción equivalente de las contribuciones: el costo total no cambia." },
      { q: "¿Cuánto cuesta la ART?", a: "Depende del contrato con tu aseguradora: una alícuota % más una suma fija por trabajador. No hay un valor único; la cargás vos." },
    ],
    descargo: "Resultado orientativo. No incluye convenios con contribuciones propias, regímenes especiales ni beneficios por zona. Consultá a tu contador.",
    relacionadas: [{ categoria: "laboral", slug: "sueldo-neto" }, { categoria: "laboral", slug: "horas-extras" }, { categoria: "laboral", slug: "liquidacion-final" }],
  },
  {
    slug: "vacaciones", categoria: "laboral", nombre: "Vacaciones",
    resumen: "Días según antigüedad al 31/12 y cuánto cobrás (sueldo ÷ 25).",
    title: "Calculadora de vacaciones 2026: días y cuánto cobrás",
    description: "Calculá cuántos días de vacaciones te corresponden según la LCT y cuánto cobrás: sueldo ÷ 25 por día, plus vacacional y neto.",
    h1: "Calculadora de vacaciones 2026: días y cuánto cobrás",
    intro: "Los arts. 150 a 155 de la LCT fijan 14, 21, 28 o 35 días y el pago a sueldo ÷ 25. Al egresar, las no gozadas entran en la [liquidación final](/laboral/liquidacion-final/).",
    sinonimos: ["plus vacacional", "dias de vacaciones"],
    formula: "Vacaciones = días × sueldo ÷ 25",
    faq: [
      { q: "¿Cuántos días me tocan?", a: "Según la antigüedad al 31 de diciembre: hasta 5 años, 14 días; hasta 10, 21; hasta 20, 28; más de 20, 35. Si no trabajaste la mitad de los días hábiles del año, es 1 día cada 20 trabajados." },
      { q: "¿Por qué se divide por 25?", a: "Lo fija el art. 155 LCT para trabajadores mensualizados: cada día de vacaciones vale sueldo mensual ÷ 25. Por eso el plus vacacional es mayor que cobrar esos días a sueldo ÷ 30." },
      { q: "¿Cuándo me las tienen que avisar?", a: "Con 30 días de anticipación (art. 154 según Ley 27.802)." },
      { q: "¿Se pueden fraccionar?", a: "Sí, en tramos de al menos 7 días. Además, tenés que gozar vacaciones en verano al menos una vez cada 3 años." },
      { q: "¿Me las pueden pagar en vez de tomarlas?", a: "No durante la relación laboral. Solo se compensan en dinero al terminar el vínculo (arts. 156 y 162)." },
    ],
    relacionadas: [{ categoria: "laboral", slug: "aguinaldo" }, { categoria: "laboral", slug: "liquidacion-final" }, { categoria: "laboral", slug: "sueldo-neto" }],
  },
  {
    slug: "horas-extras", categoria: "laboral", nombre: "Horas extras",
    resumen: "Valor de la hora y extras al 50% y al 100%, con límites del Decreto 484/2000.",
    title: "Calculadora de horas extras 2026: al 50% y al 100%",
    description: "Calculá el valor de tu hora y las extras al 50% o al 100%, con aportes y aviso si superás 30 h mensuales o 200 anuales.",
    h1: "Calculadora de horas extras 2026: al 50% y al 100%",
    intro: "Los recargos del art. 201 LCT y los límites del Decreto 484/2000 no cambiaron. La Ley 27.802 sumó el banco de horas; el divisor del sueldo lo marca tu convenio (200 h por defecto).",
    sinonimos: ["horas extra", "50%", "100%"],
    formula: "Hora extra = sueldo ÷ horas mensuales × 1,5 (o × 2)",
    faq: [
      { q: "¿Cuándo se pagan al 100%?", a: "Los sábados después de las 13, los domingos y los feriados (art. 201 LCT). El resto de las extras en días hábiles van al 50%." },
      { q: "¿Cuántas horas extras puedo hacer?", a: "El Decreto 484/2000 fija un tope de 30 horas por mes y 200 por año. La calculadora te avisa si lo superás." },
      { q: "¿Qué es el banco de horas de la reforma laboral?", a: "El art. 197 bis (Ley 27.802) permite acordar por escrito compensar extras con descanso en lugar de pagarlas. Tiene que ser voluntario." },
      { q: "¿Son obligatorias?", a: "No, salvo las excepciones que fija la ley. En principio el empleador no puede imponértelas." },
      { q: "¿Tienen descuentos?", a: "Sí: los mismos aportes del 17% que el sueldo, sobre el monto de las extras (con tope ANSES si corresponde)." },
    ],
    relacionadas: [{ categoria: "laboral", slug: "sueldo-neto" }, { categoria: "laboral", slug: "vacaciones" }, { categoria: "laboral", slug: "costo-laboral" }],
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
  {
    slug: "actualizacion-alquiler", categoria: "finanzas", nombre: "Actualización de alquiler",
    resumen: "Ajustá el alquiler por ICL, IPC, un % acordado u otro índice.",
    title: "Calculadora de actualización de alquiler: ICL o IPC",
    description: "Calculá el nuevo alquiler con ICL del BCRA, IPC del INDEC, un porcentaje pactado u otro índice. Con la fecha de cada dato.",
    h1: "Calculadora de actualización de alquiler por ICL o IPC",
    intro: "Ingresá tu alquiler y cómo se ajusta el contrato. Si firmaste entre julio de 2020 y octubre de 2023 suele aplicar el ICL; desde el DNU 70/2023 el índice lo pactan las partes.",
    sinonimos: ["icl", "ipc alquiler", "aumento alquiler", "ley de alquileres"],
    formula: "Nuevo alquiler = alquiler × índice final ÷ índice inicial",
    faq: [
      { q: "¿Qué índice me corresponde?", a: "Depende de la fecha de firma: Ley 27.551 (jul-2020 a oct-2023) ajusta por ICL anual; Ley 27.737 (18/10–28/12/2023) usaba el coeficiente Casa Propia; desde el DNU 70/2023 (29/12/2023) las partes pactan el índice y la periodicidad." },
      { q: "¿Cada cuánto se ajusta?", a: "Lo dice tu contrato. Con la Ley 27.551 era anual; con el DNU 70/2023 puede ser trimestral, cuatrimestral, semestral u otra frecuencia que hayan acordado." },
      { q: "¿Qué pasa si el contrato no dice nada?", a: "Desde el art. 1199 del Código Civil (DNU 70/2023) las partes deberían pactar índice y periodicidad. Si el índice deja de publicarse, se usa un índice oficial similar del INDEC." },
      { q: "¿Qué es el ICL?", a: "El Índice para Contratos de Locación del BCRA. Combina inflación y salarios. Se usa como coeficiente: alquiler × ICL(fecha de ajuste) / ICL(fecha de inicio)." },
      { q: "¿El ICL se sigue publicando?", a: "Sí. Aunque el DNU 70/2023 derogó la Ley 27.551, el BCRA lo sigue publicando (Com. B 13249/2026) y aplica a contratos que lo pacten o que se firmaron bajo la Ley 27.551." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "rendimiento-billeteras" }],
  },
  {
    slug: "cuotas-o-contado", categoria: "finanzas", nombre: "Cuotas o contado",
    resumen: "Compará cuotas fijas contra pagar de contado, con inflación o rendimiento.",
    title: "Calculadora cuotas sin interés vs. contado",
    description: "Compará cuotas y contado: traemos cada cuota a valor de hoy con la inflación o el rendimiento que esperás.",
    h1: "¿Cuotas sin interés o contado? Calculadora con inflación",
    intro: "Cargá el precio de contado, las cuotas y una tasa mensual. Te decimos qué conviene y desde qué inflación (o rendimiento) mensuales ganan las cuotas.",
    sinonimos: ["cuotas sin interes", "valor presente"],
    formula: "Valor de hoy = Σ cuota ÷ (1 + inflación mensual)^mes",
    faq: [
      { q: "¿Qué es el valor presente?", a: "Es cuánto valen hoy las cuotas que vas a pagar más adelante. Si la inflación (o lo que te rinde la plata) es alta, una cuota futura pesa menos en plata de hoy." },
      { q: "¿Qué inflación usar?", a: "La del último mes del INDEC sirve de referencia, pero podés poner la que esperás o el rendimiento mensual de tu plazo fijo o billetera (TNA ÷ 12)." },
      { q: "¿Y si hay descuento por pagar en efectivo?", a: "Cargá el precio de contado ya con el descuento. Si el descuento es grande, puede convenir el contado aunque haya inflación." },
      { q: "¿Qué pasa con el resumen de la tarjeta?", a: "Si las cuotas son sin interés del comercio, igual tu tarjeta puede cobrar un costo financiero. En ese caso cargá el total real que figura en el resumen." },
      { q: "¿Qué es la tasa de equilibrio?", a: "La inflación (o rendimiento) mensual a partir de la cual el valor de hoy de las cuotas iguala al contado. Si esperás más que eso, convienen las cuotas." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "rendimiento-billeteras" }, { categoria: "finanzas", slug: "prestamos" }],
  },
  {
    slug: "dolar-tarjeta", categoria: "finanzas", nombre: "Dólar tarjeta, oficial y MEP",
    resumen: "Pasá dólares a pesos: tarjeta (+30%), servicios digitales, oficial y MEP.",
    title: "Calculadora de dólar tarjeta, oficial y MEP 2026",
    description: "Calculá cuánto pagás en pesos por un gasto en dólares: tarjeta con percepción del 30%, digitales, oficial o MEP.",
    h1: "Calculadora de dólar tarjeta, oficial y MEP 2026",
    intro: "Elegí cómo pagás y cargá el monto en dólares. La percepción del 30% (RG 5617) sigue vigente; el Impuesto PAIS ya no. El MEP lo cargás vos.",
    sinonimos: ["dolar turista", "percepcion 30", "mep", "impuesto pais"],
    formula: "Dólar tarjeta = oficial × 1,30 (percepción RG 5617)",
    faq: [
      { q: "¿Sigue el Impuesto PAIS?", a: "No. Dejó de aplicarse desde el 23/12/2024 (después del 22/12/2024). Hoy solo queda la percepción del 30% de la RG ARCA 5617/2024 sobre ciertos consumos en pesos." },
      { q: "¿Cómo evito la percepción?", a: "Pagando el resumen con dólares propios (solo se percibe sobre lo que pagás en pesos), o en los casos del art. 2: compra de billetes por personas humanas, salud, medicamentos, libros, educación, etc." },
      { q: "¿Netflix o Spotify pagan IVA?", a: "Los servicios digitales de prestadores del exterior suelen llevar IVA 21% (RG 4240/2018) además de la percepción del 30% sobre el importe sin IVA. Algunas plataformas del Anexo de la RG 5617 están exceptuadas de la percepción." },
      { q: "¿Se devuelve el 30%?", a: "Es un pago a cuenta de Ganancias o Bienes Personales. Si no tributás ninguno, podés pedir la devolución desde el 1 de enero del año siguiente." },
      { q: "¿Qué cotización usa la tarjeta?", a: "La percepción se calcula con el tipo de cambio vendedor del Banco Nación del cierre del día hábil anterior a la emisión del resumen. La referencia BCRA es orientativa; tu banco puede usar otra." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "cuotas-o-contado" }],
  },
  {
    slug: "plazo-fijo", categoria: "finanzas", nombre: "Plazo fijo tradicional y UVA",
    resumen: "Calculá el interés de un plazo fijo tradicional o UVA y compará ambos.",
    title: "Calculadora de plazo fijo tradicional y UVA 2026",
    description: "Calculá cuánto cobrás al vencimiento de un plazo fijo tradicional (TNA y TEA) o UVA, y compará cuál rinde más.",
    h1: "Calculadora de plazo fijo tradicional y UVA 2026",
    intro: "Las tasas son libres: precargamos el promedio BCRA solo como referencia. El UVA usa el valor del día hábil anterior y tiene un mínimo de 90 días.",
    sinonimos: ["uva", "tna", "tea"],
    formula: "Interés = capital × TNA × días ÷ 365",
    faq: [
      { q: "¿Cuál es la diferencia entre TNA y TEA?", a: "La TNA es la tasa nominal anual que te cotiza el banco. La TEA es la tasa efectiva anual: capitaliza el interés del plazo como si lo renovaras todo el año. Con 30 días, la TEA sale un poco más alta que la TNA." },
      { q: "¿Cuál es el plazo mínimo del UVA?", a: "90 días. El tradicional exige al menos 30. El UVA precancelable para personas humanas también se constituye a 90 días, pero se puede cancelar desde los 30 con la tasa de precancelación que fije el banco." },
      { q: "¿Qué pasa si baja la inflación?", a: "En el tradicional no cambia nada: cobrás la TNA pactada. En el UVA el capital se ajusta con la UVA; si la inflación (y la UVA) suben menos de lo esperado, el total puede quedar por debajo de un tradicional a la misma tasa." },
      { q: "¿Está garantizado el depósito?", a: "Hasta $50.000.000 por persona y por banco están cubiertos por el Seguro de Garantía de los Depósitos (Com. BCRA A 8407). No cubre saldos en billeteras ni fondos money market." },
      { q: "¿Se puede precancelar?", a: "El tradicional no, salvo acuerdo con el banco. El UVA precancelable para personas humanas se puede cancelar desde los 30 días, con la tasa de precancelación que fije la entidad." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "rendimiento-billeteras" }, { categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "prestamos" }],
  },
  {
    slug: "inflacion", categoria: "finanzas", nombre: "Inflación (IPC)",
    resumen: "Actualizá un monto del pasado con el IPC del INDEC y mirá el poder de compra.",
    title: "Calculadora de inflación: cuánto vale hoy tu plata",
    description: "Actualizá un monto del pasado con el IPC del INDEC: inflación acumulada, promedio mensual y poder de compra.",
    h1: "Calculadora de inflación: cuánto vale hoy tu plata (IPC INDEC)",
    intro: "Cargá un monto y el mes de origen: lo actualizamos con el IPC del INDEC. Comparalo con un [plazo fijo](/finanzas/plazo-fijo/) o con la [actualización de alquiler](/finanzas/actualizacion-alquiler/).",
    sinonimos: ["ipc", "poder adquisitivo"],
    formula: "Monto hoy = monto × IPC final ÷ IPC inicial",
    faq: [
      { q: "¿Qué índice usamos?", a: "El IPC nacional nivel general del INDEC, base diciembre 2016 = 100. Es la serie oficial que publica el organismo cada mes." },
      { q: "¿Por qué no hay datos antes de 2017?", a: "La serie nacional con base diciembre 2016 empieza en ese mes. No hay un IPC nacional oficial comparable hacia atrás, así que no ofrecemos meses anteriores." },
      { q: "¿Por qué no incluye el mes en curso?", a: "El IPC se publica con demora (alrededor del día 12 del mes siguiente). Hasta que el INDEC lo publique, el último mes disponible es el anterior." },
      { q: "¿Cuál es la diferencia con la inflación interanual?", a: "La interanual compara un mes con el mismo mes del año anterior. Acá medimos la inflación acumulada entre los dos meses que elijas, que puede abarcar varios años." },
      { q: "¿Cada cuánto se actualiza?", a: "Cuando el INDEC publica un mes nuevo, actualizamos la serie. El próximo dato previsto aparece debajo del resultado." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "actualizacion-alquiler" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "cuotas-o-contado" }],
  },
  {
    slug: "rendimiento-billeteras", categoria: "finanzas", nombre: "Rendimiento de billeteras",
    resumen: "Calculá cuánto rinde tu saldo en una billetera o cuenta remunerada.",
    title: "Calculadora de rendimiento de billeteras y cuentas",
    description: "Calculá el interés de tu billetera o cuenta remunerada con capitalización diaria, TEA y comparación con plazo fijo.",
    h1: "Calculadora de rendimiento de billeteras virtuales y cuentas remuneradas",
    intro: "Cargá el saldo y la TNA que te muestra la app. Calculamos con capitalización diaria y te mostramos la TEA. Las tasas cambian seguido: no precargamos ninguna marca.",
    sinonimos: ["mercado pago", "cuenta remunerada", "ualá"],
    formula: "Saldo final = saldo × (1 + TNA ÷ 365)^días",
    faq: [
      { q: "¿Por qué la TEA es mayor que la TNA?", a: "Porque el interés se capitaliza todos los días. La TEA es lo que obtendrías en un año si la tasa se mantiene y el interés se reinvierte a diario." },
      { q: "¿La plata en la billetera está garantizada?", a: "El Seguro de Garantía de los Depósitos cubre cuentas bancarias hasta $50.000.000 por persona y entidad. No cubre saldos en billeteras/cuentas de pago ni fondos money market." },
      { q: "¿Billetera o plazo fijo?", a: "La billetera capitaliza a diario y podés sacar la plata cuando quieras. El plazo fijo suele pagar interés simple y te ata el capital hasta el vencimiento. Compará ambos con la misma TNA y plazo en esta calculadora." },
      { q: "¿Se paga Ganancias o Bienes Personales?", a: "Depende de tu situación patrimonial y de cómo esté armada la cuenta o el fondo. Consultá a un contador: no damos asesoramiento impositivo personalizado." },
      { q: "¿Por qué no precargan la tasa de Mercado Pago o Ualá?", a: "Porque cada entidad publica la suya en la app y la cambia seguido. No hay una tabla oficial única. Poné la que ves vos hoy." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "cuotas-o-contado" }],
  },
  {
    slug: "prestamos", categoria: "finanzas", nombre: "Préstamos personal y UVA",
    resumen: "Cuadro de cuotas con sistema francés: personal en pesos (con IVA) o hipotecario UVA.",
    title: "Calculadora de préstamos personales e UVA 2026",
    description: "Armá el cuadro de amortización de un préstamo personal (con IVA) o un crédito hipotecario UVA.",
    h1: "Calculadora de préstamos personales e hipotecarios UVA",
    intro: "La TNA, el CFT y los seguros los fija cada banco. Acá resolvemos el sistema francés, el IVA sobre intereses personales y la cuota UVA en pesos.",
    sinonimos: ["credito hipotecario", "uva", "sistema frances"],
    formula: "Cuota = capital × i ÷ (1 − (1 + i)^−n), con i = TNA ÷ 12",
    faq: [
      { q: "¿Qué es el sistema francés?", a: "Es el de cuota fija en la moneda del préstamo: al principio pagás más intereses y menos capital; hacia el final se invierte. En pesos la cuota en pesos es fija; en UVA la cuota en UVA es fija y en pesos varía con la UVA." },
      { q: "¿Qué es el CFT?", a: "El Costo Financiero Total incluye la TNA más seguros, gastos e impuestos. Si el banco te lo informa, podés cargarlo acá como referencia; no lo estimamos porque faltan esos ítems." },
      { q: "¿Por qué se paga IVA?", a: "Sobre los intereses de préstamos personales a consumidores finales suele aplicarse IVA 21%. Los intereses de préstamos para vivienda única casa-habitación están exentos (Ley de IVA)." },
      { q: "¿Cómo se actualiza un crédito UVA?", a: "El capital se expresa en UVA al desembolso. La cuota en UVA es fija (sistema francés); cada mes la multiplicás por el valor UVA del día de pago. Si la UVA sube, la cuota en pesos sube." },
      { q: "¿Se puede precancelar?", a: "Depende del contrato y del banco. Suele haber costos o condiciones de cancelación anticipada; consultá la liquidación que te den." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "cuotas-o-contado" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "inflacion" }],
  },
  {
    slug: "combustible", categoria: "hogar", nombre: "Combustible: viaje y GNC",
    resumen: "Cuánto sale un viaje y si conviene nafta o GNC, con los precios de tu estación.",
    title: "Calculadora de combustible: viaje y nafta vs. GNC",
    description: "Calculá el costo de un viaje según km, consumo y precio del surtidor, y compará nafta o gasoil contra GNC.",
    h1: "Calculadora de combustible: cuánto sale el viaje y nafta vs. GNC",
    intro: "Los precios cambian seguido y varían por ciudad y bandera: no los precargamos. Cargá lo que ves en el surtidor o consultá el dataset de la Secretaría de Energía.",
    sinonimos: ["nafta", "gnc", "viaje"],
    formula: "Costo = km × consumo ÷ 100 × precio",
    faq: [
      { q: "¿Cuánto consume un auto promedio?", a: "Depende del auto, del motor y de cómo manejás. Mirá el manual o medilo vos: llená el tanque, anotá km y litros hasta el próximo llenado." },
      { q: "¿Cómo mido mi consumo real?", a: "Llená el tanque a tope, anotá el odómetro, volvé a llenar después de varios kilómetros y dividí litros cargados × 100 ÷ km recorridos (o km ÷ litros para km/l)." },
      { q: "¿Cuándo conviene el GNC?", a: "Cuando el ahorro por kilómetro alcanza para recuperar el costo del equipo en una distancia razonable para tu uso. Si con tus precios el GNC no ahorra, no se recupera." },
      { q: "¿El GNC rinde menos en ruta?", a: "En ruta a velocidad constante el consumo suele mejorar, pero el GNC ocupa baúl y la autonomía por carga es menor. Cargá el consumo que midas vos en las condiciones que te importan." },
      { q: "¿De dónde saco el precio oficial?", a: "La Secretaría de Energía publica precios en surtidor por estación (Res. 314/2016) en datos.gob.ar. El link está en esta página." },
    ],
    relacionadas: [{ categoria: "finanzas", slug: "cuotas-o-contado" }, { categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "dolar-tarjeta" }],
  },
];

/** Relacionadas previstas para calculadoras que aún no están en CALCULADORAS (prompts 14–25). */
export const RELACIONADAS_PLAN: Partial<Record<CalcSlug, { categoria: CategoriaSlug; slug: CalcSlug }[]>> = {
  "actualizacion-alquiler": [{ categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "rendimiento-billeteras" }],
  "cuotas-o-contado": [{ categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "rendimiento-billeteras" }, { categoria: "finanzas", slug: "prestamos" }],
  "dolar-tarjeta": [{ categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "cuotas-o-contado" }],
  "plazo-fijo": [{ categoria: "finanzas", slug: "rendimiento-billeteras" }, { categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "prestamos" }],
  inflacion: [{ categoria: "finanzas", slug: "actualizacion-alquiler" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "cuotas-o-contado" }],
  "rendimiento-billeteras": [{ categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "cuotas-o-contado" }],
  prestamos: [{ categoria: "finanzas", slug: "cuotas-o-contado" }, { categoria: "finanzas", slug: "plazo-fijo" }, { categoria: "finanzas", slug: "inflacion" }],
  combustible: [{ categoria: "finanzas", slug: "cuotas-o-contado" }, { categoria: "finanzas", slug: "inflacion" }, { categoria: "finanzas", slug: "dolar-tarjeta" }],
  vacaciones: [{ categoria: "laboral", slug: "aguinaldo" }, { categoria: "laboral", slug: "liquidacion-final" }, { categoria: "laboral", slug: "sueldo-neto" }],
  "horas-extras": [{ categoria: "laboral", slug: "sueldo-neto" }, { categoria: "laboral", slug: "vacaciones" }, { categoria: "laboral", slug: "costo-laboral" }],
  "liquidacion-final": [{ categoria: "laboral", slug: "indemnizacion" }, { categoria: "laboral", slug: "vacaciones" }, { categoria: "laboral", slug: "aguinaldo" }],
  "costo-laboral": [{ categoria: "laboral", slug: "sueldo-neto" }, { categoria: "laboral", slug: "horas-extras" }, { categoria: "laboral", slug: "liquidacion-final" }],
};

export const getCategoria = (s: string) => CATEGORIAS.find((c) => c.slug === s);
export const getCalc = (cat: string, s: string) => CALCULADORAS.find((c) => c.categoria === cat && c.slug === s);
export const getCalcBySlug = (s: CalcSlug) => CALCULADORAS.find((c) => c.slug === s);
export const calcsDe = (cat: CategoriaSlug) => CALCULADORAS.filter((c) => c.categoria === cat);
export const urlCalc = (c: { categoria: string; slug: string }) => `/${c.categoria}/${c.slug}/`;

/** Solo categorías con al menos una calculadora publicada. */
export const categoriasConContenido = () => CATEGORIAS.filter((c) => calcsDe(c.slug).length > 0);

/** Relacionadas que ya existen (máx. 3), omitiendo las pendientes sin romper. */
export const relacionadasDe = (c: Calculadora) =>
  c.relacionadas
    .map((r) => getCalc(r.categoria, r.slug))
    .filter((x): x is Calculadora => !!x)
    .slice(0, 3);

export const destacadas = () =>
  DESTACADAS.map((slug) => getCalcBySlug(slug)).filter((x): x is Calculadora => !!x);
