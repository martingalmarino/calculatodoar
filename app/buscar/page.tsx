import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Buscador } from "@/components/Buscador";
import { CALCULADORAS, urlCalc } from "@/lib/content";

export const metadata: Metadata = { title: "Buscar calculadora", robots: { index: false, follow: true }, alternates: { canonical: "/buscar/" } };

export default function Buscar() {
  const items = CALCULADORAS.map((c) => ({
    nombre: c.nombre,
    resumen: c.resumen,
    href: urlCalc(c),
    texto: `${c.nombre} ${c.resumen} ${c.title} ${c.description} ${(c.sinonimos ?? []).join(" ")}`,
  }));
  return (<><Header /><main id="contenido"><div className="wrap"><h1>Buscar calculadora</h1><Suspense><Buscador items={items} /></Suspense></div></main><Footer /></>);
}
