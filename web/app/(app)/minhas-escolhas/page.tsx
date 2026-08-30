import Link from "next/link";
import {
  ANO,
  FAMILIA_DEMO,
  INICIO,
  MAX_OPCOES,
  RAIO_PADRAO_KM,
  agregado,
  bairros,
  candidatas,
  faixaDeChance,
  grupamentos,
  listaBairros,
  nomeExibicao,
  turnos,
  unidades,
} from "@/lib/creche";
import {
  BOTAO,
  CardEscola,
  Chip,
  ChipChance,
  EntendaSuaSituacao,
  EstadoVazio,
  km,
  n,
} from "../../componentes";
import { IconeAvancar, IconeCasa, IconeRemover } from "../../icones";

const SUGESTOES = 3;

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

export default async function Page({ searchParams }: PageProps<"/minhas-escolhas">) {
  const sp = await searchParams;

  const bairro = um(sp.bairro) || FAMILIA_DEMO.bairro;
  const ref2v = um(sp.ref2);
  const ref2 = ref2v && bairros[ref2v] && ref2v !== bairro ? ref2v : "";
  const grupamento = um(sp.grupamento) || FAMILIA_DEMO.grupamento;
  const turno = um(sp.turno) || FAMILIA_DEMO.turno;

  // Sem semente: a inscrição começa vazia, como começa na vida real.
  const opcoes = um(sp.opcoes).split(",").filter(Boolean).slice(0, MAX_OPCOES);

  const casa = bairros[bairro];

  const link = (over: Record<string, string>, rota: string = INICIO) => {
    const q = new URLSearchParams({ bairro, grupamento, turno });
    if (ref2) q.set("ref2", ref2);
    if (opcoes.length) q.set("opcoes", opcoes.join(","));
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

  const escolhidas = opcoes
    .map((u) => ({
      u,
      ag: agregado(u, grupamento, turno),
      c: todas.find((x) => x.unidade === u),
    }))
    .filter((x) => x.ag !== null);

  const restantes = MAX_OPCOES - opcoes.length;
  const disponiveis = todas.filter((c) => !opcoes.includes(c.unidade));
  const sugestoes = disponiveis.slice(0, SUGESTOES);
  const comChanceAlta = disponiveis.filter((c) => c.faixa === "alta").length;

  return (
    <div className="mx-auto w-full max-w-360">
      <header>
        <h1 className="text-headline-lg text-titulo">Minhas escolhas</h1>
        <p className="mt-2 max-w-[68ch] text-body-lg text-tinta">
          A inscrição aceita até {MAX_OPCOES} creches. Em cada uma você vê{" "}
          <strong>quantas famílias estão na fila</strong> e{" "}
          <strong>quantas crianças a creche chamou no ano passado</strong>, para não gastar as suas
          escolhas em uma fila que quase não anda.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {/* ------------------------------------------------ a inscrição sendo montada */}
        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-lg border border-linha bg-papel p-4 sm:p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-label-sm uppercase text-discreto">Escolhas usadas</p>
                <p className="num text-display-lg text-titulo">
                  {opcoes.length}
                  <span className="text-headline-sm text-apoio"> de {MAX_OPCOES}</span>
                </p>
              </div>
              {restantes > 0 && (
                <Link href={link({}, "/escolas")} className={BOTAO.primario}>
                  Buscar creches
                  <IconeAvancar size={18} />
                </Link>
              )}
            </div>

            {escolhidas.length > 0 ? (
              <ol className="mt-4 divide-y divide-linha border-t border-linha">
                {escolhidas.map(({ u, ag, c }, i) => {
                  if (!ag) return null;
                  const faixa = faixaDeChance(ag);
                  return (
                    <li key={u} className="flex items-start gap-3 py-3">
                      <span className="num mt-0.5 shrink-0 text-title-lg text-apoio">{i + 1}ª</span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-title-md text-titulo">
                          <Link
                            href={link({}, `/escolas/${u}`)}
                            className="underline-offset-4 hover:underline"
                          >
                            {unidades[u] ? nomeExibicao(unidades[u].n) : u}
                          </Link>
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <ChipChance faixa={faixa} />
                          <Chip tom="categoria">
                            {ag.filaAtual === 0 ? (
                              <>sem fila</>
                            ) : (
                              <>
                                <span className="num">{n(ag.filaAtual)}</span> na fila
                              </>
                            )}
                          </Chip>
                          <Chip tom="categoria">
                            chamou <span className="num">{n(ag.profundidadeAtual)}</span> em {ANO}
                          </Chip>
                          {/* Com dois pontos de referência, cada distância vem com o nome
                              do ponto: "1,2 km" sozinho não diz de onde. */}
                          {c &&
                            (c.distancias.length > 1 ? (
                              c.distancias.map((d) => (
                                <Chip key={d.ponto} tom="categoria">
                                  <span className="num">{km(d.km)}</span> de{" "}
                                  {nomeExibicao(d.bairro)}
                                </Chip>
                              ))
                            ) : (
                              <Chip tom="categoria">{km(c.distanciaKm)}</Chip>
                            ))}
                        </div>
                      </div>
                      <Link
                        href={link({ opcoes: opcoes.filter((x) => x !== u).join(",") })}
                        className="inline-flex shrink-0 items-center gap-1 text-body-sm text-apoio underline-offset-4 hover:text-erro hover:underline"
                      >
                        <IconeRemover size={16} />
                        Tirar
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-4 border-t border-linha pt-4">
                <EstadoVazio
                  titulo="Sua lista está vazia"
                  acao={
                    <Link href={link({}, "/escolas")} className={BOTAO.contorno}>
                      Ver creches perto de você
                    </Link>
                  }
                >
                  Escolha a primeira creche e ela aparece aqui, com a fila e a chamada do ano
                  passado à vista.
                </EstadoVazio>
              </div>
            )}

            {escolhidas.length > 0 && restantes > 0 && (
              <p className="mt-3 border-t border-linha pt-3 text-body-md text-apoio">
                Você ainda pode escolher mais {restantes}. Usar todas as escolhas aumenta a sua
                chance de conseguir uma vaga, e as outras não atrapalham a sua primeira.
              </p>
            )}
          </section>

          {sugestoes.length > 0 && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-headline-md text-titulo">Sugestões perto de você</h2>
                <Link
                  href={link({}, "/escolas")}
                  className="text-title-sm text-primaria underline-offset-4 hover:underline"
                >
                  Ver as {n(disponiveis.length)} creches
                </Link>
              </div>
              <ul className="mt-3 space-y-3">
                {sugestoes.map((c, i) => (
                  <CardEscola
                    key={c.unidade}
                    c={c}
                    href={link({}, `/escolas/${c.unidade}`)}
                    hrefAdicionar={
                      restantes > 0 ? link({ opcoes: [...opcoes, c.unidade].join(",") }) : null
                    }
                    ordem={opcoes.length + 1}
                    recomendado={i === 0 && opcoes.length === 0}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ------------------------------------------------ o que a inscrição já sabe */}
        <div className="space-y-4 lg:col-span-2">
          <form className="rounded-lg border border-linha bg-papel p-4 sm:p-5">
            <h2 className="text-title-lg text-titulo">Sua inscrição</h2>

            {opcoes.length > 0 && <input type="hidden" name="opcoes" value={opcoes.join(",")} />}
            <input type="hidden" name="bairro" value={bairro} />

            <div className="mt-4 space-y-4">
              <div>
                <span className="mb-1.5 flex items-center gap-2 text-title-sm text-tinta">
                  Bairro onde você mora
                  <Chip tom="rede">já confirmado</Chip>
                </span>
                <p className="flex items-center gap-2 rounded-md border border-linha bg-fundo px-3 py-2.5 text-body-md text-apoio">
                  <IconeCasa size={18} className="shrink-0 text-discreto" />
                  {nomeExibicao(casa?.nome ?? bairro)}
                </p>
                <p className="mt-1.5 text-body-sm text-apoio">
                  Vem do comprovante de residência que você entregou na inscrição.
                </p>
              </div>

              <div>
                <label htmlFor="ref2" className="mb-1.5 flex items-center gap-2 text-title-sm text-tinta">
                  Outro lugar importante
                  <Chip tom="atributo">opcional</Chip>
                </label>
                <select
                  id="ref2"
                  name="ref2"
                  defaultValue={ref2}
                  className="h-10 w-full rounded-md border border-linha bg-papel px-3 text-body-md text-tinta"
                >
                  <option value="">Nenhum</option>
                  {listaBairros
                    .filter((x) => x.bk !== bairro)
                    .map((x) => (
                      <option key={x.bk} value={x.bk}>
                        {nomeExibicao(x.nome)}
                      </option>
                    ))}
                </select>
                <p className="mt-1.5 text-body-sm text-apoio">
                  O seu trabalho ou a casa de um parente. Mostramos também as creches perto dele.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <label htmlFor="grupamento" className="mb-1.5 block text-title-sm text-tinta">
                    Turma
                  </label>
                  <select
                    id="grupamento"
                    name="grupamento"
                    defaultValue={grupamento}
                    className="h-10 w-full rounded-md border border-linha bg-papel px-3 text-body-md text-tinta"
                  >
                    {grupamentos.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="turno" className="mb-1.5 block text-title-sm text-tinta">
                    Turno
                  </label>
                  <select
                    id="turno"
                    name="turno"
                    defaultValue={turno}
                    className="h-10 w-full rounded-md border border-linha bg-papel px-3 text-body-md text-tinta"
                  >
                    {turnos.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button className={`${BOTAO.contorno} mt-4 w-full`}>Atualizar as sugestões</button>
          </form>

          <EntendaSuaSituacao>
            <p>
              Existem <strong className="num">{n(todas.length)}</strong> creches com {grupamento} no
              turno {turno.toLowerCase()} a até {RAIO_PADRAO_KM} km de{" "}
              {nomeExibicao(casa?.nome ?? bairro)}
              {ref2 && <> ou de {nomeExibicao(bairros[ref2].nome)}</>}.
            </p>
            <p>
              Dessas, <strong className="num">{n(comChanceAlta)}</strong> chamaram, no ano passado,
              mais crianças do que hoje esperam na fila. São as que a chamada tem folga para
              alcançar.
            </p>
          </EntendaSuaSituacao>

          <section className="space-y-2 rounded-lg border border-linha bg-papel p-4 text-body-sm text-apoio">
            <p>
              Os números vêm das inscrições reais de 2021 a {ANO} da Secretaria Municipal de
              Educação. <strong className="text-tinta">Nada aqui é adivinhação.</strong> É a
              contagem que a prefeitura já fazia, agora mostrada para quem precisa dela.
            </p>
            <p>
              A distância é medida do centro do seu bairro, não da porta da sua casa. Ela pode
              variar cerca de 1 km para mais ou para menos.
            </p>
            <p>
              <Link
                href="/diagnostico"
                className="text-primaria underline underline-offset-4 hover:text-marinho"
              >
                Ver o diagnóstico da rede
              </Link>
              , os números que deram origem a esta ferramenta.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
