import Link from "next/link";
import { SITE, categoriasConContenido } from "@/lib/content";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <nav aria-label="Pie">
          <ul>
            {categoriasConContenido().map((c) => (
              <li key={c.slug}><Link href={`/${c.slug}/`}>{c.nombre}</Link></li>
            ))}
          </ul>
        </nav>
        <p>calculalo.com.ar: las cuentas de la vida en Argentina, hechas con la norma vigente. {SITE.descargo}</p>
      </div>
    </footer>
  );
}
