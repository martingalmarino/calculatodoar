// Copia los JSON de parámetros verificados (por defecto ../calculalo/data, o DATA_SRC) a ./data.
import { cpSync, existsSync, readdirSync } from "node:fs";
const src = process.env.DATA_SRC ?? "../calculalo/data";
if (!existsSync(src)) { console.error(`No existe ${src}`); process.exit(1); }
for (const f of readdirSync(src).filter((f) => f.endsWith(".json") || f === "FUENTES.md")) {
  cpSync(`${src}/${f}`, `data/${f}`); console.log("copiado", f);
}
