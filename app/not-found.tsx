import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export default function NotFound() {
  return (<><Header /><main id="contenido"><div className="wrap"><h1>No encontramos esta página</h1><p><Link href="/">Volver al inicio</Link></p></div></main><Footer /></>);
}
