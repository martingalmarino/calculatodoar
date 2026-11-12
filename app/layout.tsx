import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/content";

const sourceSans = localFont({
  src: [
    { path: "./fonts/SourceSans3-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SourceSans3-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SourceSans3-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/SourceSans3-latin-ext-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SourceSans3-latin-ext-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SourceSans3-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-source-sans",
  display: "swap",
});

const sourceSerif = localFont({
  src: [
    { path: "./fonts/SourceSerif4-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-ext-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-ext-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-ext-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "calculalo: calculadoras online para Argentina", template: "%s | calculalo" },
  description: "Calculadoras online para tus cuentas de todos los días. Sueldo, alquiler, dólar o cuotas, con los números de hoy.",
  verification: {
    google: "7IkZLr0lyGrOaWMNt4lmqbWrdTH2iad28H_5w3dfPsY",
  },
  openGraph: { siteName: "calculalo", locale: "es_AR", type: "website" },
};
export const viewport: Viewport = { themeColor: "#0B4F5B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${sourceSans.variable} ${sourceSerif.variable}`}>
      <body>
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        {children}
      </body>
    </html>
  );
}
