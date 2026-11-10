import Link from "next/link";
import { categoriasConContenido } from "@/lib/content";

export function Header({ actual }: { actual?: string }) {
  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" href="/" aria-label="calculalo, inicio">calcu<span>lalo</span></Link>
        <nav aria-label="Categorías">
          <ul className="nav">
            {categoriasConContenido().map((c) => (
              <li key={c.slug}><Link href={`/${c.slug}/`} aria-current={actual === c.slug ? "page" : undefined}>{c.nombre}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
