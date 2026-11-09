const f2 = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const f0 = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
export const pesos = (n: number) => `$ ${f2.format(n)}`;
export const pesos0 = (n: number) => `$ ${f0.format(Math.round(n))}`;
export const pct = (n: number) => `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n * 100)} %`;
export const fechaAR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}/${y}`;
};
/** Convierte "1.500.000,50" en 1500000.5 */
export const parsePesos = (s: string) => Number(s.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
/** Máscara es-AR mientras se tipea */
export function maskPesos(s: string) {
  const raw = s.replace(/[^\d,]/g, "");
  const [i, d] = raw.split(",");
  const ent = i ? f0.format(Number(i)) : "";
  return d !== undefined ? `${ent},${d.slice(0, 2)}` : ent;
}
