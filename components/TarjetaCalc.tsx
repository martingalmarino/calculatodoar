import Link from "next/link";

export type ItemTarjeta = { nombre: string; resumen: string; href: string };

export function TarjetaCalc({ nombre, resumen, href }: ItemTarjeta) {
  return (
    <Link className="tarjeta" href={href}>
      <h3>{nombre}</h3>
      <p>{resumen}</p>
    </Link>
  );
}

export function GrillaCalcs({ items }: { items: ItemTarjeta[] }) {
  return (
    <div className="grilla">
      {items.map((c) => (
        <TarjetaCalc key={c.href} {...c} />
      ))}
    </div>
  );
}
