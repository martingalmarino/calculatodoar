/** Fechas confirmadas en norma o calendario oficial. Sin plazos no verificados. */
export type ItemAgenda = {
  fecha: string; // ISO YYYY-MM-DD
  cuando: string; // etiqueta corta, p. ej. "12 nov"
  texto: string;
};

export const AGENDA: ItemAgenda[] = [
  {
    fecha: "2026-11-12",
    cuando: "12 nov",
    texto: "El INDEC publica el IPC de octubre, a las 16 h.",
  },
  {
    fecha: "2026-12-01",
    cuando: "1 dic",
    texto: "Entra en vigencia el Fondo de Asistencia Laboral (FAL), para el devengado de diciembre.",
  },
  {
    fecha: "2026-12-18",
    cuando: "18 dic",
    texto: "Vence el aguinaldo del segundo semestre.",
  },
];

export const AGENDA_FUENTE =
  "Fuentes: calendario INDEC del segundo semestre de 2026; Ley 27.802 y decreto 1228/2026 (FAL); Ley 23.041 / art. 122 LCT (aguinaldo). La recategorización del monotributo se hace en enero y julio, pero no cargamos un día exacto porque no tenemos el vencimiento de la próxima ventana verificado.";

export const AGENDA_AYUDA =
  "Fechas confirmadas en normas o calendarios oficiales. No incluimos plazos que no estén verificados.";
