import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import marca from "@/public/logo-sme-rio.png";
import marcaBranca from "@/public/logo-sme-rio-branco.png";

// Archivo: grotesca robusta, com ar de sinalizacao publica. Carrega o display.
// IBM Plex Sans: humanista, desenhada para leitura densa e formulario.
const display = Archivo({
  variable: "--fonte-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const corpo = IBM_Plex_Sans({
  variable: "--fonte-corpo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const MARCA_ALT = "Prefeitura do Rio, Secretaria Municipal de Educação";

export const metadata: Metadata = {
  title: "Escolha da creche · Inscrição Creche Rio",
  description:
    "Veja quantas famílias estão na fila de cada creche e quantas crianças a creche chamou no ano passado, para escolher com chance real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Cabecalho institucional: a marca oficial da SME assina a ferramenta. */}
        <header className="bg-papel">
          <div className="h-1.5 bg-tinta" />
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 border-b border-linha px-4 py-3 sm:px-6">
            <Link href="/" aria-label="Início">
              <Image src={marca} alt={MARCA_ALT} priority className="h-8 w-auto sm:h-10" />
            </Link>
            <p className="hidden text-right text-xs font-semibold uppercase leading-tight tracking-wider text-tinta-fraca sm:block">
              Inscrição
              <br />
              Creche Rio
            </p>
          </div>
        </header>

        {children}

        {/* Rodape institucional. */}
        <footer className="mt-auto bg-tinta">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Image src={marcaBranca} alt={MARCA_ALT} className="h-8 w-auto" />
            <p className="text-xs leading-relaxed text-papel/80">
              Secretaria Municipal de Educação
              <br />
              Prefeitura da Cidade do Rio de Janeiro
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
