const DIA = 86_400_000;
export const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
/** Días entre dos fechas, ambas inclusive */
export const diasInclusive = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / DIA) + 1;
export const diasDelMes = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
export function semestreDe(anio: number, semestre: 1 | 2) {
  return semestre === 1
    ? { inicio: new Date(Date.UTC(anio, 0, 1)), fin: new Date(Date.UTC(anio, 5, 30)) }
    : { inicio: new Date(Date.UTC(anio, 6, 1)), fin: new Date(Date.UTC(anio, 11, 31)) };
}
/** Meses y años completos entre dos fechas */
export function antiguedad(ingreso: Date, egreso: Date) {
  let meses = (egreso.getUTCFullYear() - ingreso.getUTCFullYear()) * 12 + (egreso.getUTCMonth() - ingreso.getUTCMonth());
  if (egreso.getUTCDate() < ingreso.getUTCDate()) meses -= 1;
  meses = Math.max(0, meses);
  return { anios: Math.floor(meses / 12), mesesRestantes: meses % 12, mesesTotales: meses };
}
