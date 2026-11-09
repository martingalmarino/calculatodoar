"use client";
import { maskPesos } from "@/lib/format";

interface Props { id: string; label: string; ayuda?: string; value: string; onChange: (v: string) => void }

export function MoneyInput({ id, label, ayuda, value, onChange }: Props) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {ayuda && <span className="ayuda" id={`${id}-ayuda`}>{ayuda}</span>}
      <div className="peso">
        <span aria-hidden="true">$</span>
        <input id={id} inputMode="decimal" autoComplete="off" value={value} aria-describedby={ayuda ? `${id}-ayuda` : undefined}
          onChange={(e) => onChange(maskPesos(e.target.value))} />
      </div>
    </div>
  );
}
