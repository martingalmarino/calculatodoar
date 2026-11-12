import { CATEGORIA_LABEL, TIPO_LABEL, type Nota } from "@/lib/noticias";

export function VolantaNota({ nota, as: Tag = "p" }: { nota: Nota; as?: "p" | "span" }) {
  return (
    <Tag className="volanta">
      <span className="etiqueta">{TIPO_LABEL[nota.tipo]}</span>
      {CATEGORIA_LABEL[nota.categoria]}
    </Tag>
  );
}
