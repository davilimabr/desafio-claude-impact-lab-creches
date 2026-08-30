import Link from "next/link";
import { Ficha } from "./ficha";
import {
  RAIO_PADRAO_KM,
  agregado,
  bairros,
  candidatas,
  grupamentos,
  listaBairros,
  turnos,
  unidades,
  type Agregado,
  type Candidata,
  type Faixa,
} from "@/lib/creche";

const MAX_OPCOES = 5;
const POR_PAGINA = 20;

// A residência da família é dado do cadastro, não escolha de formulário: no processo real
// ela é comprovada por documento. Vem na URL só para a demo poder trocar de família.
const FAMILIA_DEMO = { bairro: "ITANHANGA", grupamento: "Maternal II", turno: "Integral" };

type Params = Promise<{
  bairro?: string;
  ref2?: string;
  grupamento?: string;
  turno?: string;
  opcoes?: string;
  chance?: string;
  b?: string;
  p?: string;
}>;

const FAIXAS: { valor: string; rotulo: string }[] = [
  { valor: "", rotulo: "Todas" },
  { valor: "alta", rotulo: "Chance alta" },
  { valor: "media", rotulo: "Chance média" },
  { valor: "baixa", rotulo: "Chance baixa" },
];

const ehFaixa = (s: string): s is Faixa => s === "alta" || s === "media" || s === "baixa";

type Grupo = { chave: string; nome: string; itens: Candidata[] };

/**
 * Junta as creches por bairro para a lista ficar navegável.
 * A entrada já vem ordenada por score, então a ordem de aparição decide a ordem
 * dos grupos: o bairro que tem o melhor resultado abre a lista. A ordenação por
 * relevância continua valendo, só que agora dentro de cada bairro.
 */
function agruparPorBairro(cs: Candidata[]): Grupo[] {
  const grupos: Grupo[] = [];
  const indice = new Map<string, Grupo>();
  for (const c of cs) {
    const bk = unidades[c.unidade]?.bk ?? "";
    const nome = (bk && bairros[bk]?.nome) || c.bairro || "Outros bairros";
    const chave = bk || nome;
    let g = indice.get(chave);
    if (!g) {
      g = { chave, nome, itens: [] };
      indice.set(chave, g);
      grupos.push(g);
    }
    g.itens.push(c);
  }
  return grupos;
}

export default async function Page({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const bairro = sp.bairro ?? FAMILIA_DEMO.bairro;
  const ref2 = sp.ref2 && bairros[sp.ref2] && sp.ref2 !== bairro ? sp.ref2 : "";
  const grupamento = sp.grupamento ?? FAMILIA_DEMO.grupamento;
  const turno = sp.turno ?? FAMILIA_DEMO.turno;
  const chance = sp.chance && ehFaixa(sp.chance) ? sp.chance : "";
  const filtroBairro = sp.b ?? "";

  // Sem semente: a inscrição começa vazia, como começa na vida real.
  const opcoes = (sp.opcoes ?? "").split(",").filter(Boolean).slice(0, MAX_OPCOES);

  const casa = bairros[bairro];

  const link = (over: Record<string, string>) => {
    const q = new URLSearchParams({ bairro, grupamento, turno });
    if (ref2) q.set("ref2", ref2);
    if (opcoes.length) q.set("opcoes", opcoes.join(","));
    if (chance) q.set("chance", chance);
    if (filtroBairro) q.set("b", filtroBairro);
    for (const [k, v] of Object.entries(over)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    return `/?${q}`;
  };

  const todas = candidatas({
    pontos: ref2 ? [bairro, ref2] : [bairro],
    grupamento,
    horario: turno,
  });

  const escolhidas = opcoes
    .map((u) => ({ u, ag: agregado(u, grupamento, turno), c: todas.find((x) => x.unidade === u) }))
    .filter((x): x is { u: string; ag: Agregado; c: (typeof todas)[number] | undefined } => !!x.ag);

  const restantes = MAX_OPCOES - opcoes.length;

  // Filtros aplicados sobre o que sobrou depois de tirar o que já foi escolhido.
  const disponiveis = todas.filter((c) => !opcoes.includes(c.unidade));
  const bairrosDisponiveis = [...new Set(disponiveis.map((c) => unidades[c.unidade]?.bk))]
    .filter((bk): bk is string => !!bk && !!bairros[bk])
    .map((bk) => ({ bk, nome: bairros[bk].nome, n: disponiveis.filter((c) => unidades[c.unidade]?.bk === bk).length }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const filtradas = disponiveis.filter(
    (c) =>
      (!chance || c.faixa === chance) &&
      (!filtroBairro || unidades[c.unidade]?.bk === filtroBairro),
  );

  // Agrupa antes de paginar, para que as creches de um bairro fiquem sempre
  // juntas em vez de reaparecerem soltas duas páginas adiante.
  const ordenadas = agruparPorBairro(filtradas).flatMap((g) => g.itens);

  const paginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(sp.p) || 1), paginas);
  const visiveis = ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const gruposVisiveis = agruparPorBairro(visiveis);

  const contagem = {
    alta: disponiveis.filter((c) => c.faixa === "alta").length,
    media: disponiveis.filter((c) => c.faixa === "media").length,
    baixa: disponiveis.filter((c) => c.faixa === "baixa").length,
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Cabeçalho-documento: o que a inscrição já sabe sobre esta família. */}
      <header className="mb-8">
        <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-tinta sm:text-4xl">
          Escolha até {MAX_OPCOES} creches
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-tinta">
          Em cada creche, você pode ver <strong>quantas famílias estão aguardando atualmente</strong> e{" "}
          <strong>quantas crianças foram chamadas no ano passado</strong>. Assim, você terá possibilidade
          de escolher unidades com fila de espera menos    concorrida.
        </p>
      </header>

      {/* onde a família está e que turma procura */}
      <form className="mb-6 rounded-xl border border-linha bg-papel p-4 sm:p-5">
        <input type="hidden" name="bairro" value={bairro} />
        {opcoes.length > 0 && <input type="hidden" name="opcoes" value={opcoes.join(",")} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-tinta">
              Bairro onde você mora
              <span className="rounded bg-marca-clara px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tinta">
                já confirmado
              </span>
            </span>
            <p className="rounded-lg border border-linha bg-papel-fundo px-3 py-2.5 text-[15px] text-tinta-fraca">
              {casa?.nome ?? bairro}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-tinta-fraca">
              Este bairro vem do comprovante de residência que você entregou na inscrição.
            </p>
          </div>

          <div>
            <label
              htmlFor="ref2"
              className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-tinta"
            >
              Outro bairro de interesse
              <span className="rounded bg-papel-fundo px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tinta-fraca">
                OPCIONAL
              </span>
            </label>
            <select
              id="ref2"
              name="ref2"
              defaultValue={ref2}
              className="w-full rounded-lg border border-linha bg-papel px-3 py-2.5 text-[15px] text-tinta"
            >
              <option value="">Nenhum</option>
              {listaBairros
                .filter((x) => x.bk !== bairro)
                .map((x) => (
                  <option key={x.bk} value={x.bk}>
                    {x.nome}
                  </option>
                ))}
            </select>
            <p className="mt-1.5 text-xs leading-relaxed text-tinta-fraca">
              Pode ser o seu trabalho ou a casa de um parente. Vamos mostrar também as creches perto
              desse lugar.
            </p>
          </div>

          <div>
            <label
              htmlFor="grupamento"
              className="mb-1.5 block text-sm font-semibold text-tinta"
            >
              Turma
            </label>
            <select
              id="grupamento"
              name="grupamento"
              defaultValue={grupamento}
              className="w-full rounded-lg border border-linha bg-papel px-3 py-2.5 text-[15px] text-tinta"
            >
              {grupamentos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="turno" className="mb-1.5 block text-sm font-semibold text-tinta">
              Turno
            </label>
            <select
              id="turno"
              name="turno"
              defaultValue={turno}
              className="w-full rounded-lg border border-linha bg-papel px-3 py-2.5 text-[15px] text-tinta"
            >
              {turnos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="mt-4 w-full rounded-lg bg-tinta px-4 py-2.5 text-sm font-semibold text-papel transition-colors hover:bg-tinta-forte sm:w-auto">
          Ver as creches
        </button>
      </form>

      {/* a inscrição sendo montada */}
      {escolhidas.length > 0 && (
        <section className="mb-8 rounded-xl border-2 border-tinta bg-papel p-4 sm:p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">
            Suas escolhas: <span className="num">{opcoes.length}</span> de {MAX_OPCOES}
          </h2>
          <ol className="mt-3 divide-y divide-linha">
            {escolhidas.map(({ u, ag, c }, i) => (
              <li key={u} className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="num font-display text-lg font-bold text-tinta-fraca">{i + 1}ª</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-tinta">{unidades[u]?.n ?? u}</p>
                  <p className="mt-0.5 text-xs text-tinta-fraca">
                    {ag.filaAtual === 0 ? (
                      <>Sem fila. Chamou {ag.profundidadeAtual} crianças em 2025.</>
                    ) : (
                      <>
                        {ag.filaAtual} famílias na fila. Chamou {ag.profundidadeAtual} crianças em
                        2025.
                      </>
                    )}
                    {c && <> Fica a {c.distanciaKm.toFixed(1).replace(".", ",")} km.</>}
                  </p>
                </div>
                <Link
                  href={link({ opcoes: opcoes.filter((x) => x !== u).join(","), p: "" })}
                  className="shrink-0 text-xs font-medium text-tinta-fraca underline underline-offset-4 hover:text-espera"
                >
                  Remover
                </Link>
              </li>
            ))}
          </ol>
          {restantes > 0 && (
            <p className="mt-3 border-t border-linha pt-3 text-sm leading-relaxed text-tinta-fraca">
              Você ainda pode escolher mais {restantes}. Usar todas as escolhas aumenta a sua chance
              de conseguir uma vaga. As outras escolhas não atrapalham a sua primeira.
            </p>
          )}
        </section>
      )}

      {/* resultados */}
      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-tinta">
            <span className="num">{filtradas.length}</span>{" "}
            {filtradas.length === 1 ? "creche" : "creches"} perto de você
          </h2>
          <p className="text-sm text-tinta-fraca">
            {grupamento}. {turno}. Até {RAIO_PADRAO_KM} km.
          </p>
        </div>

        {/* filtros */}
        {disponiveis.length > 0 && (
          <div className="mb-5 space-y-3 rounded-xl border border-linha bg-papel p-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-tinta-fraca">
                Chance de conseguir vaga
              </p>
              <div className="flex flex-wrap gap-2">
                {FAIXAS.map((f) => {
                  const ativo = chance === f.valor;
                  const n =
                    f.valor === ""
                      ? disponiveis.length
                      : contagem[f.valor as keyof typeof contagem];
                  return (
                    <Link
                      key={f.valor || "todas"}
                      href={link({ chance: f.valor, p: "" })}
                      aria-current={ativo ? "true" : undefined}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        ativo
                          ? "border-tinta bg-tinta text-papel"
                          : "border-linha bg-papel text-tinta hover:border-tinta"
                      }`}
                    >
                      {f.rotulo} <span className="num opacity-60">{n}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="filtro-bairro"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-tinta-fraca"
              >
                Bairro da creche
              </label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={link({ b: "", p: "" })}
                  aria-current={!filtroBairro ? "true" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    !filtroBairro
                      ? "border-tinta bg-tinta text-papel"
                      : "border-linha bg-papel text-tinta hover:border-tinta"
                  }`}
                >
                  Todos
                </Link>
                {bairrosDisponiveis.map((b) => {
                  const ativo = filtroBairro === b.bk;
                  return (
                    <Link
                      key={b.bk}
                      href={link({ b: b.bk, p: "" })}
                      aria-current={ativo ? "true" : undefined}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        ativo
                          ? "border-tinta bg-tinta text-papel"
                          : "border-linha bg-papel text-tinta hover:border-tinta"
                      }`}
                    >
                      {b.nome} <span className="num opacity-60">{b.n}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {restantes === 0 && (
          <p className="mb-4 rounded-lg bg-tinta px-4 py-3 text-sm font-medium text-papel">
            Você já escolheu as {MAX_OPCOES} creches. Para trocar, tire uma da lista acima.
          </p>
        )}

        {visiveis.length > 0 ? (
          <div className="space-y-7">
            {gruposVisiveis.map((g) => (
              <section key={g.chave} aria-label={`Creches em ${g.nome}`}>
                <h3 className="mb-2.5 flex flex-wrap items-baseline gap-x-2 border-b-2 border-marca pb-1.5 font-display text-sm font-bold uppercase tracking-widest text-tinta">
                  {g.nome}
                  <span className="text-xs font-medium normal-case tracking-normal text-tinta-fraca">
                    <span className="num">{g.itens.length}</span>{" "}
                    {g.itens.length === 1 ? "creche" : "creches"}
                  </span>
                </h3>
                <ul className="space-y-3">
                  {g.itens.map((c) => (
                    <Ficha
                      key={c.unidade}
                      c={c}
                      ordem={opcoes.length + 1}
                      bairroCasa={bairro}
                      href={
                        restantes > 0
                          ? link({ opcoes: [...opcoes, c.unidade].join(","), p: "" })
                          : null
                      }
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-linha bg-papel p-6 text-center">
            <p className="font-display text-lg font-semibold text-tinta">
              {todas.length === 0
                ? "Não encontramos creches perto de você"
                : "Nenhuma creche com esses filtros"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta-fraca">
              {todas.length === 0 ? (
                <>
                  Não existe creche com a turma {grupamento} no turno {turno} a até{" "}
                  {RAIO_PADRAO_KM} km daqui que tenha histórico para mostrar. Tente outro turno, ou
                  informe outro lugar importante para você.
                </>
              ) : (
                <>Tire um filtro para ver as outras {disponiveis.length} creches.</>
              )}
            </p>
            {(chance || filtroBairro) && (
              <Link
                href={link({ chance: "", b: "", p: "" })}
                className="mt-4 inline-block rounded-lg border border-tinta px-4 py-2 text-sm font-semibold text-tinta hover:bg-tinta hover:text-papel"
              >
                Limpar filtros
              </Link>
            )}
          </div>
        )}

        {/* paginação */}
        {paginas > 1 && (
          <nav
            aria-label="Paginação dos resultados"
            className="mt-6 flex items-center justify-between gap-4 border-t border-linha pt-4"
          >
            {pagina > 1 ? (
              <Link
                href={link({ p: String(pagina - 1) })}
                className="rounded-lg border border-linha bg-papel px-4 py-2 text-sm font-semibold text-tinta hover:border-tinta"
              >
                ← Anteriores
              </Link>
            ) : (
              <span />
            )}
            <p className="num text-sm text-tinta-fraca">
              {(pagina - 1) * POR_PAGINA + 1} a {Math.min(pagina * POR_PAGINA, filtradas.length)} de{" "}
              {filtradas.length}
            </p>
            {pagina < paginas ? (
              <Link
                href={link({ p: String(pagina + 1) })}
                className="rounded-lg border border-linha bg-papel px-4 py-2 text-sm font-semibold text-tinta hover:border-tinta"
              >
                Próximas →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>

      <footer className="mt-12 space-y-2 border-t border-linha pt-6 text-xs leading-relaxed text-tinta-fraca">
        <p>
          Os números vêm das inscrições reais de 2021 a 2025 da Secretaria Municipal de Educação.{" "}
          <strong className="font-semibold">Nada aqui é adivinhação.</strong> É a contagem que a
          prefeitura já fazia, agora mostrada para quem precisa dela.
        </p>
        <p>
          A distância é medida do centro do seu bairro, e não da porta da sua casa. Ela pode variar
          cerca de 1 km para mais ou para menos.
        </p>
        <p>
          <Link href="/diagnostico" className="underline underline-offset-4 hover:text-tinta">
            Ver o diagnóstico da rede
          </Link>
          . São os números que deram origem a esta ferramenta.
        </p>
      </footer>
    </main>
  );
}
