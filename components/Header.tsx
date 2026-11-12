import Link from "next/link";
import { categoriasConContenido } from "@/lib/content";

export function Header({ actual }: { actual?: string }) {
  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" href="/" aria-label="calculalo, inicio">calcu<em>lalo</em></Link>
        <nav aria-label="Principal">
          <ul className="nav">
            {categoriasConContenido().map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}/`} aria-current={actual === c.slug ? "page" : undefined}>{c.nombre}</Link>
              </li>
            ))}
            <li>
              <Link href="/noticias/" aria-current={actual === "noticias" ? "page" : undefined}>Noticias</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
