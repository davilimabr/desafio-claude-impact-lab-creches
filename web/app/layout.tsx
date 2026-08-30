import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

// Public Sans: a familia do style board. Humanista, desenhada para interface de governo
// (e a face do U.S. Web Design System), le bem em numero tabular e em texto denso.
const publicSans = Public_Sans({
  variable: "--fonte-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Inscrição Creche Rio",
  description:
    "Veja quantas famílias estão na fila de cada creche e quantas crianças a creche chamou no ano passado, para escolher com chance real.",
};

/**
 * Raiz enxuta: fonte, tokens e nada mais. A sidebar, o rodape e a navegacao vivem em
 * `(app)/layout.tsx`, porque a tela de entrada nao tem chrome nenhum — quem ainda nao
 * entrou nao tem para onde navegar.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
