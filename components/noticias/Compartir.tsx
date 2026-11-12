"use client";

import { useState } from "react";

export function Compartir({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);
  const texto = `${titulo} ${url}`;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
  const x = `https://x.com/intent/tweet?text=${encodeURIComponent(texto)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="compartir">
      <span>Compartir</span>
      <button type="button" onClick={copiar}>{copiado ? "Copiado" : "Copiar enlace"}</button>
      <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a href={x} target="_blank" rel="noopener noreferrer">X</a>
    </div>
  );
}
