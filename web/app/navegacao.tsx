"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INICIO } from "@/lib/creche";
import { IconeBusca, IconeEscola, IconeGrafico, IconeLista } from "./icones";

/**
 * Navegacao do design system (secao 5.1). No desktop e a sidebar de 240px;
 * abaixo de `lg` ela colapsa em bottom navigation, como manda a secao 4.
 *
 * Os itens sao as tres telas que existem de verdade. Item de navegacao que leva a
 * lugar nenhum e promessa quebrada: melhor uma barra curta e honesta.
 */
const ITENS = [
  { href: INICIO, rotulo: "Minhas escolhas", Icone: IconeLista, exato: true },
  { href: "/escolas", rotulo: "Escolas", Icone: IconeEscola, exato: false },
  { href: "/diagnostico", rotulo: "Diagnóstico da rede", Icone: IconeGrafico, exato: false },
];

const ativoEm = (caminho: string, href: string, exato: boolean) =>
  exato ? caminho === href : caminho === href || caminho.startsWith(`${href}/`);

export function NavegacaoLateral() {
  const caminho = usePathname();

  return (
    <nav aria-label="Seções" className="mt-6 flex flex-col gap-0.5">
      {ITENS.map(({ href, rotulo, Icone, exato }) => {
        const ativo = ativoEm(caminho, href, exato);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={`relative flex h-10 items-center gap-3 rounded-md px-3 text-title-sm transition-colors duration-120 ${
              ativo
                ? "bg-primaria-clara font-semibold text-primaria"
                : "text-apoio hover:bg-fundo hover:text-tinta"
            }`}
          >
            {ativo && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primaria"
              />
            )}
            <Icone size={20} />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavegacaoInferior() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Seções"
      className="sticky bottom-0 z-20 border-t border-linha bg-papel lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITENS.map(({ href, rotulo, Icone, exato }) => {
          const ativo = ativoEm(caminho, href, exato);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-label-md ${
                  ativo ? "font-semibold text-primaria" : "text-apoio"
                }`}
              >
                <Icone size={22} />
                <span className="text-center leading-tight">{rotulo.split(" ")[0]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Acao primaria da sidebar: o caminho curto para a tela que resolve o problema. */
export function BotaoPrimarioLateral() {
  return (
    <Link
      href="/escolas"
      className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primaria px-4 text-title-sm text-white transition-colors duration-120 hover:bg-primaria-forte active:bg-marinho"
    >
      <IconeBusca size={18} />
      Buscar escolas
    </Link>
  );
}
