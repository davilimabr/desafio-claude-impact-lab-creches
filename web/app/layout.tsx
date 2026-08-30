import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Archivo: grotesca robusta, com ar de sinalização pública — carrega o display.
// IBM Plex Sans: humanista, desenhada para leitura densa e formulário.
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

export const metadata: Metadata = {
  title: "Escolha da creche · Inscrição Creche Rio",
  description:
    "Veja quantas famílias esperam em cada creche e até onde a chamada chegou no ano passado, para escolher com chance real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
