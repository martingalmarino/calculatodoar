"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GrillaCalcs } from "@/components/TarjetaCalc";

interface Item { nombre: string; resumen: string; href: string; texto: string }
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function Buscador({ items }: { items: Item[] }) {
  const inicial = useSearchParams().get("q") ?? "";
  const [q, setQ] = useState(inicial);
  const t = norm(q).split(/\s+/).filter(Boolean);
  const res = t.length ? items.filter((i) => t.every((w) => norm(i.texto).includes(w))) : items;
  return (
    <>
      <form className="buscar" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="q" className="saltar">Buscar calculadora</label>
        <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: aguinaldo" autoComplete="off" />
      </form>
      {res.length ? (
        <GrillaCalcs items={res.map((i) => ({ nombre: i.nombre, resumen: i.resumen, href: i.href }))} />
      ) : <p>No encontramos calculadoras para “{q}”.</p>}
    </>
  );
}
