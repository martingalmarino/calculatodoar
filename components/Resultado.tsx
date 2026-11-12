import type { ReactNode } from "react";

export interface Linea { label: string; valor: string; total?: boolean }

export function Resultado({ titulo, grande, lineas, nota }: { titulo: string; grande: string; lineas: Linea[]; nota?: ReactNode; /** @deprecated UI v3: ya no se muestra */ barra?: number }) {
  return (
    <section className="resultado" aria-labelledby="rt">
      <h2 id="rt" className="rot">{titulo}</h2>
      <output className="grande" aria-live="polite" data-testid="resultado">{grande}</output>
      <table>
        <caption className="saltar">Detalle del cálculo</caption>
        <tbody>
          {lineas.map((l) => (
            <tr key={l.label} className={l.total ? "tot" : undefined}><th scope="row">{l.label}</th><td>{l.valor}</td></tr>
          ))}
        </tbody>
      </table>
      {nota && <p className="nota">{nota}</p>}
    </section>
  );
}
