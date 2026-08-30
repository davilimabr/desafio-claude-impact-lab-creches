import Image from "next/image";
import Link from "next/link";
import marca from "@/public/logo-sme-rio.png";
import { BotaoPrimarioLateral, NavegacaoInferior, NavegacaoLateral } from "../navegacao";
import { ANO, INICIO } from "@/lib/creche";

const MARCA_ALT = "Prefeitura do Rio, Secretaria Municipal de Educação";

/** Marca da plataforma: logo oficial da SME + o nome do servico embaixo (secao 12). */
function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link
      href={INICIO}
      aria-label="Minhas escolhas"
      className={compacta ? "flex items-center gap-3" : "block"}
    >
      <Image src={marca} alt={MARCA_ALT} priority className="h-8 w-auto" />
      <span className={compacta ? "border-l border-linha pl-3" : "mt-3 block"}>
        <span className="block text-title-sm text-titulo">Inscrição Creche</span>
        <span className="block text-body-sm text-apoio">Educação Municipal</span>
      </span>
    </Link>
  );
}

/** O chrome da aplicacao: tudo que existe depois da tela de entrada. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primaria focus:px-4 focus:py-2 focus:text-title-sm focus:text-white"
      >
        Ir para o conteúdo
      </a>

      <div className="lg:flex">
        {/* Sidebar de 240px, sem borda: quem a separa do conteudo e o fundo do canvas. */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-papel px-5 py-6 lg:flex">
          <Marca />
          <div className="mt-6">
            <BotaoPrimarioLateral />
          </div>
          <NavegacaoLateral />
          <p className="mt-auto text-body-sm text-discreto">
            Dados do processo de Inscrição Creche {ANO} da Secretaria Municipal de Educação.
          </p>
        </aside>

        <div className="flex min-h-screen w-full flex-col">
          {/* Abaixo de lg a marca vira barra de topo e a navegacao desce para o rodape. */}
          <header className="sticky top-0 z-20 border-b border-linha bg-papel px-4 py-3 lg:hidden">
            <Marca compacta />
          </header>

          <main id="conteudo" className="flex-1 p-4 sm:p-5">
            {children}
          </main>

          {/* Rodape institucional (secao 5.13). */}
          <footer className="border-t border-trilho bg-fundo px-4 py-4 sm:px-6">
            <div className="mx-auto flex w-full max-w-360 flex-col gap-2 text-body-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold text-primaria">Prefeitura do Rio de Janeiro</p>
              <p className="text-discreto">
                Secretaria Municipal de Educação · Dados públicos de {ANO}
              </p>
              <Link href="/diagnostico" className="text-apoio underline-offset-4 hover:underline">
                Como estes números são medidos
              </Link>
            </div>
          </footer>

          <NavegacaoInferior />
        </div>
      </div>
    </>
  );
}
