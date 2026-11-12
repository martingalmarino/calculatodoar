import { AGENDA, AGENDA_AYUDA, AGENDA_FUENTE } from "@/lib/agenda";

export function Agenda() {
  return (
    <aside className="agenda" aria-labelledby="agenda-titulo">
      <h2 id="agenda-titulo">Agenda</h2>
      <p className="ayuda-agenda">{AGENDA_AYUDA}</p>
      <ol>
        {AGENDA.map((item) => (
          <li key={item.fecha}>
            <time className="cuando" dateTime={item.fecha}>{item.cuando}</time>
            <p>{item.texto}</p>
          </li>
        ))}
      </ol>
      <p className="fuente-agenda">{AGENDA_FUENTE}</p>
    </aside>
  );
}
