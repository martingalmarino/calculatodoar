import type { ReactNode } from "react";
import Link from "next/link";
import { CATEGORIA_LABEL, TIPO_LABEL, urlPortada, type FiltroNoticias, type NotaFrontmatter } from "@/lib/noticias";

const TEMAS = Object.keys(CATEGORIA_LABEL) as NotaFrontmatter["categoria"][];
const TIPOS = Object.keys(TIPO_LABEL) as NotaFrontmatter["tipo"][];

function Pill({ href, activo, children }: { href: string; activo: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={activo ? "activo" : undefined} aria-pressed={activo}>
      {children}
    </Link>
  );
}

export function Filtros({ filtro }: { filtro: FiltroNoticias }) {
  const cat = filtro.categoria || "";
  const tipo = filtro.tipo || "";
  return (
    <div className="filtros" role="navigation" aria-label="Filtrar noticias">
      <div className="grupo">
        <span>Tema</span>
        <Pill href={urlPortada(1, { tipo })} activo={!cat}>Todas</Pill>
        {TEMAS.map((c) => (
          <Pill key={c} href={urlPortada(1, { categoria: c, tipo })} activo={cat === c}>
            {CATEGORIA_LABEL[c]}
          </Pill>
        ))}
      </div>
      <div className="grupo">
        <span>Tipo</span>
        <Pill href={urlPortada(1, { categoria: cat })} activo={!tipo}>Todas</Pill>
        {TIPOS.map((t) => (
          <Pill key={t} href={urlPortada(1, { categoria: cat, tipo: t })} activo={tipo === t}>
            {t === "guia" ? "Guías" : TIPO_LABEL[t]}
          </Pill>
        ))}
      </div>
    </div>
  );
}
