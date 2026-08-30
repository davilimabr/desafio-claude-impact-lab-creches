import Link from "next/link";
import {
  ANO,
  nomeExibicao,
  rotuloFaixa,
  type Agregado,
  type Candidata,
  type Faixa,
} from "@/lib/creche";
import {
  IconeAtencao,
  IconeConfirmado,
  IconeEscola,
  IconeEstrela,
  IconeInfo,
  IconePerto,
  IconeTurno,
} from "./icones";

// Componentes do design system (secao 5). Uma implementacao so, usada pelas tres telas:
// o que muda entre elas e o conteudo, nunca a gramatica visual.

// ---------------------------------------------------------------- formato

export const km = (d: number) =>
  d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1).replace(".", ",")} km`;

export const n = (x: number) => x.toLocaleString("pt-BR");

// ---------------------------------------------------------------- botoes (5.2)

const BASE_BOTAO =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-title-sm transition-colors duration-120";

export const BOTAO = {
  primario: `${BASE_BOTAO} bg-primaria text-white hover:bg-primaria-forte active:bg-marinho`,
  invertido: `${BASE_BOTAO} bg-marinho text-white hover:bg-marinho-forte`,
  contorno: `${BASE_BOTAO} border border-primaria bg-papel text-primaria hover:bg-primaria-50 active:bg-primaria-100`,
  secundario: `${BASE_BOTAO} bg-trilho text-chip hover:bg-linha-forte`,
  desabilitado: `${BASE_BOTAO} cursor-not-allowed bg-linha-forte text-desabilitado`,
  texto:
    "inline-flex items-center gap-1.5 text-title-sm text-primaria underline-offset-4 hover:underline active:text-marinho",
};

// ---------------------------------------------------------------- chips (5.4 e 5.5)

const TONS = {
  distancia: "bg-primaria-clara text-primaria",
  rede: "bg-primaria-clara text-primaria",
  atributo: "border border-trilho bg-fundo text-chip",
  categoria: "text-apoio",
  vaga: "bg-vaga-clara text-vaga",
  atencao: "bg-alerta-clara text-alerta",
} as const;

type Icone = (p: { size?: number; className?: string }) => React.ReactElement;

export function Chip({
  tom = "atributo",
  Icone,
  children,
}: {
  tom?: keyof typeof TONS;
  Icone?: Icone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex min-h-5.5 items-center gap-1 rounded-sm px-2 py-0.5 text-label-md ${TONS[tom]}`}
    >
      {Icone && <Icone size={13} />}
      {children}
    </span>
  );
}

/** Cor nunca e sinal unico: a faixa de chance sempre sai com icone e palavra. */
const SINAL: Record<Faixa, { tom: keyof typeof TONS; Icone: Icone }> = {
  alta: { tom: "vaga", Icone: IconeConfirmado },
  media: { tom: "atributo", Icone: IconeTurno },
  baixa: { tom: "atencao", Icone: IconeAtencao },
};

export function ChipChance({ faixa }: { faixa: Faixa }) {
  const { tom, Icone } = SINAL[faixa];
  return (
    <Chip tom={tom} Icone={Icone}>
      {rotuloFaixa[faixa]}
    </Chip>
  );
}

/** Filtro-chip da linha de filtros: 32px, pill, ativo em azul cheio. */
export function ChipFiltro({
  href,
  ativo,
  Icone,
  children,
}: {
  href: string;
  ativo: boolean;
  Icone?: Icone;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "true" : undefined}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-label-lg transition-colors duration-120 ${
        ativo
          ? "bg-primaria text-white"
          : "border border-linha bg-papel text-chip hover:bg-fundo"
      }`}
    >
      {Icone && <Icone size={16} />}
      {children}
    </Link>
  );
}

/** Badge de destaque (5.6). Um por lista, no maximo, sobrepondo a borda do card. */
export function BadgeMelhorOpcao() {
  return (
    <span className="absolute -top-2.75 left-3 inline-flex items-center gap-1 rounded-full bg-marinho px-2.5 py-1 text-label-md text-white">
      <IconeEstrela size={12} />
      Melhor opção
    </span>
  );
}

// ---------------------------------------------------------------- texto derivado do numero

/**
 * O texto explicativo desta tela deriva de numero ja calculado. Nenhuma frase aqui
 * estima nada em linguagem: cada uma repete, em portugues, uma contagem da base.
 */
export function explicacaoDaChance(a: Agregado, faixa: Faixa) {
  const m = a.profundidadeMediana;
  if (a.filaAtual === 0) {
    return `Não há ninguém na fila desta turma. Quem se inscrever agora entra direto na próxima chamada${
      a.estavel ? `, e esta unidade está sem fila há ${a.anosComFilaZero} anos` : ""
    }.`;
  }
  if (faixa === "alta") {
    return `A fila tem ${a.filaAtual} famílias e a unidade costuma chamar ${m} crianças por ano. Sobra lugar, então quem entra agora tem boa chance de ser chamado.`;
  }
  if (faixa === "media") {
    return `A fila tem ${a.filaAtual} famílias e a unidade costuma chamar ${m} crianças por ano. Você fica bem perto do limite. Pode ser chamado, mas não é garantido.`;
  }
  return `A fila tem ${a.filaAtual} famílias e a unidade costuma chamar só ${m} crianças por ano. A chamada quase nunca chega tão longe na fila, então a sua chance de ser chamado é pequena.`;
}

/** Card explicativo (5.9): o container do texto, sempre em superficie de acento. */
export function EntendaSuaSituacao({
  titulo = "Entenda sua situação",
  children,
}: {
  titulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-primaria-clara p-4">
      <h2 className="flex items-center gap-2 text-title-sm text-marinho">
        <IconeInfo size={18} className="text-primaria" />
        {titulo}
      </h2>
      <div className="mt-3 space-y-3 text-body-md text-marinho-corpo">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- card de dado (5.8)

/**
 * "Até onde essa unidade chamou": a tese do produto em forma de barra.
 * O trilho e o maior numero da serie; o preenchido e quantas familias a unidade
 * convocou naquele ano. O marcador vertical em laranja e o tamanho da fila de hoje —
 * quando ele cai fora das barras, a chamada historica nao alcanca quem entra agora.
 */
export function BarrasDeChamada({ a }: { a: Agregado }) {
  const anos = a.historico.slice(0, 5);
  const teto = Math.max(1, a.filaAtual, ...anos.map((h) => h.profundidade));
  const marcador = Math.min(100, (a.filaAtual / teto) * 100);

  return (
    <section className="rounded-lg border border-linha bg-papel p-4">
      <h2 className="text-title-lg text-titulo">Até onde essa unidade chamou</h2>
      <p className="mt-1 text-body-sm text-apoio">
        Crianças convocadas para esta turma em cada ano, e o tamanho da fila de hoje.
      </p>

      <div className="relative mt-4 space-y-3">
        {a.filaAtual > 0 && (
          <div
            aria-hidden
            className="absolute bottom-0 top-0 z-10 w-0.5 bg-alerta"
            style={{ left: `calc(56px + (100% - 56px - 64px) * ${marcador / 100})` }}
          />
        )}

        {anos.map((h) => (
          <div key={h.ano} className="flex items-center gap-3">
            <span className="num w-9 shrink-0 text-label-sm text-discreto">{h.ano}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-trilho">
              <span
                className="barra-cresce block h-full rounded-full bg-primaria"
                style={{ width: `${Math.max(2, (h.profundidade / teto) * 100)}%` }}
              />
            </span>
            <span className="num w-16 shrink-0 text-right text-label-md text-apoio">
              {n(h.profundidade)} chamadas
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 border-t border-linha pt-3 text-body-sm text-apoio">
        <span aria-hidden className="mt-1.5 h-3 w-0.5 shrink-0 bg-alerta" />
        {a.filaAtual === 0 ? (
          <>Nenhuma família está na fila desta turma hoje.</>
        ) : (
          <>
            <span className="num">{n(a.filaAtual)}</span> famílias estão na fila desta turma hoje.
            A marca laranja mostra onde essa fila cai em relação às chamadas dos anos anteriores.
          </>
        )}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------- card de unidade (5.7)

/**
 * O card da coluna de lista. O card inteiro leva ao detalhe; o botao de adicionar e a
 * acao secundaria dentro dele, e por isso sobe uma camada de z-index.
 */
export function CardEscola({
  c,
  pino,
  href,
  hrefAdicionar,
  ordem,
  recomendado = false,
}: {
  c: Candidata;
  /** Numero do pin no mapa. So aparece na tela que tem mapa ao lado. */
  pino?: number;
  href: string;
  hrefAdicionar: string | null;
  ordem: number;
  recomendado?: boolean;
}) {
  const a = c.agregado;

  return (
    <li
      className={`relative rounded-lg p-3.5 transition-shadow duration-120 hover:shadow-sm ${
        recomendado
          ? "border-[1.5px] border-primaria bg-primaria-clara"
          : "border border-linha bg-papel hover:border-primaria-300"
      }`}
    >
      {recomendado && <BadgeMelhorOpcao />}

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-title-md text-titulo">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-lg">
            {pino !== undefined && (
              <span
                aria-hidden
                className="num mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-marinho align-[1px] text-label-sm text-white"
              >
                {pino}
              </span>
            )}
            {nomeExibicao(c.nome)}
          </Link>
        </h3>
        <span className="num shrink-0 rounded-sm bg-primaria-clara px-2 py-0.5 text-label-md text-primaria">
          {km(c.distanciaKm)}
        </span>
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-apoio">
        <IconeEscola size={14} className="shrink-0" />
        {c.bairro ? nomeExibicao(c.bairro) : "Bairro não informado"}
        {c.aproximada && <span className="text-discreto">· local aproximado</span>}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <ChipChance faixa={c.faixa} />
        <Chip tom="categoria">
          {a.filaAtual === 0 ? (
            <>Sem fila</>
          ) : (
            <>
              <span className="num">{n(a.filaAtual)}</span> na fila
            </>
          )}
        </Chip>
        <Chip tom="categoria">
          chamou <span className="num">{n(a.profundidadeAtual)}</span> em {ANO}
        </Chip>
      </div>

      <div className="relative z-10 mt-3">
        {hrefAdicionar ? (
          <Link
            href={hrefAdicionar}
            className={`${recomendado ? BOTAO.primario : BOTAO.contorno} w-full`}
          >
            <IconePerto size={18} />
            Escolher como {ordem}ª opção
          </Link>
        ) : (
          <p className="text-body-sm text-apoio">
            Sua lista está cheia. Tire uma escolha para incluir esta.
          </p>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------- estados (5.14)

export function EstadoVazio({
  titulo,
  children,
  acao,
}: {
  titulo: string;
  children: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-linha bg-papel px-6 py-12 text-center">
      <IconeEscola size={40} className="mx-auto text-desabilitado" />
      <p className="mt-3 text-title-md text-chip">{titulo}</p>
      <p className="mx-auto mt-2 max-w-sm text-body-md text-apoio">{children}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
