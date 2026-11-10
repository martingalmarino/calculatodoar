import Link from "next/link";
import type { ReactNode } from "react";

/** Renderiza texto con enlaces internos en formato [texto](/ruta/). */
export function Prosa({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(children))) {
    if (m.index > last) parts.push(children.slice(last, m.index));
    parts.push(<Link key={i++} href={m[2]}>{m[1]}</Link>);
    last = m.index + m[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <p className="prosa">{parts}</p>;
}
