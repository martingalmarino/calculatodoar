import Link from "next/link";
import { CATEGORIAS, SITE } from "@/lib/content";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <nav aria-label="Pie"><ul>{CATEGORIAS.map((c) => <li key={c.slug}><Link href={`/${c.slug}/`}>{c.nombre}</Link></li>)}</ul></nav>
        <p>calculalo.com.ar: las cuentas de la vida en Argentina, hechas con la norma vigente. {SITE.descargo}</p>
      </div>
    </footer>
  );
}
