import Link from "next/link";
export interface Miga { nombre: string; href: string }
export function Migas({ items }: { items: Miga[] }) {
  return (
    <nav className="migas" aria-label="Migas de pan">
      <ol>
        {items.map((m, i) => (
          <li key={m.href}>{i === items.length - 1 ? <span aria-current="page">{m.nombre}</span> : <Link href={m.href}>{m.nombre}</Link>}</li>
        ))}
      </ol>
    </nav>
  );
}
