import Link from "next/link";
import {
  FAMILIA_DEMO,
  MAX_OPCOES,
  RAIO_PADRAO_KM,
  bairros,
  candidatas,
  coordenadaDaUnidade,
  nomeExibicao,
  type Candidata,
  type Faixa,
} from "@/lib/creche";
import { mapaDisponivel, urlMapaEstatico, type Pino } from "@/lib/mapa";
import { BOTAO, CardEscola, ChipFiltro, EstadoVazio, km, n } from "../componentes";
import { IconeBusca, IconeCasa, IconeEstrela, IconePerto } from "../icones";
import { ImagemDoMapa } from "../mapa";

export const metadata = {
  title: "Escolas · Inscrição Creche Rio",
  description:
    "As creches perto de você, com a fila e a chamada do ano passado à vista, em lista e no mapa.",
};

// Quantas cabem na página: o marcador do mapa aceita um caractere, então oito pins
// numerados de 1 a 8 mantêm a correspondência entre a lista e o mapa exata.
const POR_PAGINA = 8;

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

const ehFaixa = (s: string): s is Faixa => s === "alta" || s === "media" || s === "baixa";

// A busca ignora acento e caixa: quem digita "sao conrado" tem de achar "São Conrado".
const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const FAIXAS: { valor: string; rotulo: string }[] = [
  { valor: "", rotulo: "Todas" },
  { valor: "alta", rotulo: "Chance alta" },
  { valor: "media", rotulo: "Chance média" },
  { valor: "baixa", rotulo: "Chance baixa" },
];

/** O pin diz o mesmo que o chip do card: verde é vaga folgada, laranja é fila longa. */
const TOM_DO_PIN: Record<Faixa, Pino["tom"]> = {
  alta: "disponivel",
  media: "padrao",
  baixa: "congestionado",
};

export default async function Escolas({ searchParams }: PageProps<"/escolas">) {
  const sp = await searchParams;

  const bairro = um(sp.bairro) || FAMILIA_DEMO.bairro;
  const ref2v = um(sp.ref2);
  const ref2 = ref2v && bairros[ref2v] && ref2v !== bairro ? ref2v : "";
  const grupamento = um(sp.grupamento) || FAMILIA_DEMO.grupamento;
  const turno = um(sp.turno) || FAMILIA_DEMO.turno;
  const chanceV = um(sp.chance);
  const chance = ehFaixa(chanceV) ? chanceV : "";
  const busca = um(sp.q).trim();
  const ordem = um(sp.ord) === "perto" ? "perto" : "recomendadas";
  const opcoes = um(sp.opcoes).split(",").filter(Boolean).slice(0, MAX_OPCOES);

  const casa = bairros[bairro];

  const link = (over: Record<string, string>, rota = "/escolas") => {
    const q = new URLSearchParams({ bairro, grupamento, turno });
    if (ref2) q.set("ref2", ref2);
    if (opcoes.length) q.set("opcoes", opcoes.join(","));
    if (chance) q.set("chance", chance);
    if (busca) q.set("q", busca);
    if (ordem !== "recomendadas") q.set("ord", ordem);
    for (const [k, v] of Object.entries(over)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    return `${rota}?${q}`;
  };

  const todas = candidatas({
    pontos: ref2 ? [bairro, ref2] : [bairro],
    grupamento,
    horario: turno,
  });

  const disponiveis = todas.filter((c) => !opcoes.includes(c.unidade));
  const contagem = {
    alta: disponiveis.filter((c) => c.faixa === "alta").length,
    media: disponiveis.filter((c) => c.faixa === "media").length,
    baixa: disponiveis.filter((c) => c.faixa === "baixa").length,
  };

  const alvo = semAcento(busca);
  const filtradas = disponiveis
    .filter((c) => !chance || c.faixa === chance)
    .filter(
      (c) => !alvo || semAcento(c.nome).includes(alvo) || semAcento(c.bairro ?? "").includes(alvo),
    );
  if (ordem === "perto") filtradas.sort((a, b) => a.distanciaKm - b.distanciaKm);

  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(um(sp.p)) || 1), paginas);
  const visiveis = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // A melhor opção é a primeira da ordenação recomendada, sem filtro nenhum aplicado:
  // com a lista recortada, "melhor" passaria a significar "melhor entre o que sobrou".
  const melhor = !chance && !busca && ordem === "recomendadas" && pagina === 1
    ? visiveis[0]?.unidade
    : undefined;

  const restantes = MAX_OPCOES - opcoes.length;
  const pinos = montaPinos(visiveis, casa);
  const mapa = (await mapaDisponivel())
    ? urlMapaEstatico(pinos, { largura: 640, altura: 620 })
    : null;

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-4 lg:flex-row">
      {/* ---------------------------------------------------- coluna de lista */}
      <section className="w-full lg:w-90 lg:shrink-0">
        <h1 className="text-headline-md text-titulo">Escolas recomendadas</h1>
        <p className="mt-1 text-body-sm text-apoio">
          {grupamento} · turno {turno.toLowerCase()} · até {RAIO_PADRAO_KM} km de{" "}
          {casa?.nome ?? bairro}
          {ref2 && <> e de {bairros[ref2]?.nome}</>}.{" "}
          <Link href="/" className="text-primaria underline-offset-4 hover:underline">
            Trocar turma ou turno
          </Link>
        </p>

        <form action="/escolas" className="mt-4">
          <input type="hidden" name="bairro" value={bairro} />
          {ref2 && <input type="hidden" name="ref2" value={ref2} />}
          <input type="hidden" name="grupamento" value={grupamento} />
          <input type="hidden" name="turno" value={turno} />
          {chance && <input type="hidden" name="chance" value={chance} />}
          {ordem === "perto" && <input type="hidden" name="ord" value="perto" />}
          {opcoes.length > 0 && <input type="hidden" name="opcoes" value={opcoes.join(",")} />}

          <label htmlFor="q" className="sr-only">
            Buscar por bairro ou nome da creche
          </label>
          <div className="campo-busca flex h-10 items-center gap-2 rounded-md border border-linha bg-papel px-3">
            <IconeBusca size={18} className="shrink-0 text-discreto" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={busca}
              placeholder="Buscar por bairro ou nome"
              className="w-full bg-transparent text-body-md text-tinta outline-none placeholder:text-discreto"
            />
          </div>
        </form>

        {/* Linha de filtros: rola na horizontal, sem quebrar (5.4). */}
        <div className="rolagem-filtros mt-3 flex gap-2 overflow-x-auto pb-1">
          <ChipFiltro
            href={link({ ord: "", p: "" })}
            ativo={ordem === "recomendadas"}
            Icone={IconeEstrela}
          >
            Recomendadas
          </ChipFiltro>
          <ChipFiltro
            href={link({ ord: "perto", p: "" })}
            ativo={ordem === "perto"}
            Icone={IconePerto}
          >
            Mais próximas
          </ChipFiltro>
          {FAIXAS.map((f) => (
            <ChipFiltro
              key={f.valor || "todas"}
              href={link({ chance: f.valor, p: "" })}
              ativo={chance === f.valor}
            >
              {f.rotulo}{" "}
              <span className="num opacity-70">
                {f.valor === "" ? disponiveis.length : contagem[f.valor as Faixa]}
              </span>
            </ChipFiltro>
          ))}
        </div>

        <p className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-body-sm text-apoio">
          <span>
            <span className="num font-semibold text-tinta">{n(filtradas.length)}</span>{" "}
            {filtradas.length === 1 ? "creche encontrada" : "creches encontradas"}
          </span>
          <Link href="/" className="text-primaria underline-offset-4 hover:underline">
            <span className="num">{opcoes.length}</span> de {MAX_OPCOES} escolhas usadas
          </Link>
        </p>

        {visiveis.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {visiveis.map((c, i) => (
              <CardEscola
                key={c.unidade}
                c={c}
                pino={i + 1}
                href={link({}, `/escolas/${c.unidade}`)}
                hrefAdicionar={
                  restantes > 0 ? link({ opcoes: [...opcoes, c.unidade].join(","), p: "" }) : null
                }
                ordem={opcoes.length + 1}
                recomendado={c.unidade === melhor}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EstadoVazio
              titulo={
                todas.length === 0
                  ? "Nenhuma creche com esta turma perto de você"
                  : "Nenhuma creche com estes filtros"
              }
              acao={
                (chance || busca) && (
                  <Link href={link({ chance: "", q: "", p: "" })} className={BOTAO.contorno}>
                    Limpar filtros
                  </Link>
                )
              }
            >
              {todas.length === 0 ? (
                <>
                  Não há creche com {grupamento} no turno {turno.toLowerCase()} a até{" "}
                  {RAIO_PADRAO_KM} km daqui com histórico para mostrar. Tente outro turno na tela de
                  escolhas.
                </>
              ) : (
                <>Tire um filtro para ver as outras {n(disponiveis.length)} creches.</>
              )}
            </EstadoVazio>
          </div>
        )}

        {paginas > 1 && (
          <nav
            aria-label="Paginação dos resultados"
            className="mt-4 flex items-center justify-between gap-3 border-t border-linha pt-4"
          >
            {pagina > 1 ? (
              <Link href={link({ p: String(pagina - 1) })} className={BOTAO.secundario}>
                Anteriores
              </Link>
            ) : (
              <span />
            )}
            <p className="num text-body-sm text-apoio">
              {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtradas.length)} de{" "}
              {filtradas.length}
            </p>
            {pagina < paginas ? (
              <Link href={link({ p: String(pagina + 1) })} className={BOTAO.secundario}>
                Próximas
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>

      {/* ---------------------------------------------------- painel de contexto */}
      <section
        aria-label="Mapa das creches desta página"
        className="min-w-0 flex-1 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]"
      >
        <div className="relative h-72 overflow-hidden rounded-xl border border-linha bg-papel sm:h-96 lg:h-full">
          <ImagemDoMapa
            src={mapa}
            alt={`Mapa com ${visiveis.length} creches desta página e o centro do bairro ${casa?.nome ?? bairro}.`}
            alternativa={<PainelSemMapa visiveis={visiveis} bairroCasa={casa?.nome ?? bairro} />}
          />

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg bg-papel/95 p-3 shadow-md">
            <p className="text-label-sm uppercase text-discreto">Legenda</p>
            <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-apoio">
              <li className="flex items-center gap-1.5">
                <Bolinha cor="bg-vaga" /> chance alta
              </li>
              <li className="flex items-center gap-1.5">
                <Bolinha cor="bg-primaria-300" /> chance média
              </li>
              <li className="flex items-center gap-1.5">
                <Bolinha cor="bg-alerta" /> chance baixa
              </li>
              <li className="flex items-center gap-1.5">
                <IconeCasa size={14} className="text-primaria" /> C: centro do seu bairro
              </li>
            </ul>
            <p className="mt-1.5 text-body-sm text-discreto">
              Os números dos pins são os mesmos da lista ao lado. A distância é medida do centro do
              bairro, não da porta de casa.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Bolinha({ cor }: { cor: string }) {
  return <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-full ${cor}`} />;
}

function montaPinos(visiveis: Candidata[], casa: { lat: number; lng: number } | undefined) {
  const pinos: Pino[] = [];
  if (casa) pinos.push({ lat: casa.lat, lng: casa.lng, rotulo: "C", tom: "casa" });
  visiveis.forEach((c, i) => {
    const coord = coordenadaDaUnidade(c.unidade);
    if (coord) pinos.push({ ...coord, rotulo: String(i + 1), tom: TOM_DO_PIN[c.faixa] });
  });
  return pinos;
}

/** Sem mapa, o painel repete a lista em ordem de distância. Nada de retângulo vazio. */
function PainelSemMapa({
  visiveis,
  bairroCasa,
}: {
  visiveis: Candidata[];
  bairroCasa: string;
}) {
  return (
    <div className="h-full overflow-auto p-5 pb-32">
      <p className="text-title-sm text-titulo">Distância a partir de {bairroCasa}</p>
      <p className="mt-1 text-body-sm text-apoio">
        O mapa não está disponível agora. Estas são as creches desta página, da mais perto para a
        mais longe.
      </p>
      <ol className="mt-4 space-y-2">
        {[...visiveis]
          .map((c, i) => ({ c, pino: i + 1 }))
          .sort((a, b) => a.c.distanciaKm - b.c.distanciaKm)
          .map(({ c, pino }) => (
            <li key={c.unidade} className="flex items-center gap-3 border-b border-linha pb-2">
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marinho text-label-md text-white">
                {pino}
              </span>
              <span className="min-w-0 flex-1 truncate text-body-md text-tinta">{nomeExibicao(c.nome)}</span>
              <span className="num shrink-0 text-body-sm text-apoio">{km(c.distanciaKm)}</span>
            </li>
          ))}
      </ol>
    </div>
  );
}
