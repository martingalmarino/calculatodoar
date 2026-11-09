"use client";
import type { ReactNode } from "react";

export function Campo({ id, label, ayuda, children }: { id: string; label: string; ayuda?: string; children: ReactNode }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {ayuda && <span className="ayuda" id={`${id}-ayuda`}>{ayuda}</span>}
      {children}
    </div>
  );
}

export function Check({ id, label, checked, onChange, ayuda }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; ayuda?: string }) {
  return (
    <div className="campo check">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
      {ayuda && <span className="ayuda">{ayuda}</span>}
    </div>
  );
}

export function Seg<T extends string>({ name, legend, value, opciones, onChange }: { name: string; legend: string; value: T; opciones: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="campo">
      <legend>{legend}</legend>
      <div className="seg">
        {opciones.map((o) => (
          <span key={o.v} style={{ display: "contents" }}>
            <input type="radio" name={name} id={`${name}-${o.v}`} value={o.v} checked={value === o.v} onChange={() => onChange(o.v)} />
            <label htmlFor={`${name}-${o.v}`}>{o.label}</label>
          </span>
        ))}
      </div>
    </fieldset>
  );
}
