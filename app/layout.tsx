import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/content";

const bricolage = localFont({ src: "./fonts/BricolageGrotesque-latin.woff2", weight: "600 800", variable: "--font-bricolage", display: "swap" });
const publicSans = localFont({ src: "./fonts/PublicSans-latin.woff2", weight: "400 700", variable: "--font-public", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "calculalo: calculadoras online para tus cuentas de todos los días", template: "%s | calculalo" },
  description: "Calculadoras online para tus cuentas de todos los días. Sacá la cuenta en segundos, con los números de hoy.",
  openGraph: { siteName: "calculalo", locale: "es_AR", type: "website" },
};
export const viewport: Viewport = { themeColor: "#1A1D1A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${bricolage.variable} ${publicSans.variable}`}>
      <body>
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        {children}
      </body>
    </html>
  );
}
