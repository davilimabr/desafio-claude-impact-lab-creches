import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ANO,
  FAMILIA_DEMO,
  MAX_OPCOES,
  agregado,
  bairros,
  coordenadaDaUnidade,
  distanciaKm,
  faixaDeChance,
  nomeExibicao,
  ofertaDaUnidade,
  tipoDaUnidade,
  unidades,
} from "@/lib/creche";
import { mapaDisponivel, urlMapaEstatico, type Pino } from "@/lib/mapa";
import {
  BOTAO,
  BarrasDeChamada,
  Chip,
  ChipChance,
  EntendaSuaSituacao,
  explicacaoDaChance,
  km,
  n,
} from "../../componentes";
import {
  IconeAtencao,
  IconeAvancar,
  IconeConfirmado,
  IconeEscola,
  IconeLocal,
  IconePerto,
  IconeRemover,
  IconeTurno,
} from "../../icones";
import { ImagemDoMapa } from "../../mapa";

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

export async function generateMetadata({ params }: PageProps<"/escolas/[id]">) {
  const { id } = await params;
  const unidade = unidades[id];
  return {
    title: unidade ? `${unidade.n} · Inscrição Creche Rio` : "Unidade · Inscrição Creche Rio",
    description: unidade
      ? `Fila, chamadas dos últimos anos e chance de vaga em ${unidade.n}.`
      : undefined,
  };
}

export default async function DetalheDaUnidade({
  params,
  searchParams,
}: PageProps<"/escolas/[id]">) {
  const { id } = await params;
  const sp = await searchParams;

  const unidade = unidades[id];
  if (!unidade) notFound();

  const bairro = um(sp.bairro) || FAMILIA_DEMO.bairro;
  const ref2v = um(sp.ref2);
  const ref2 = ref2v && bairros[ref2v] && ref2v !== bairro ? ref2v : "";
  const grupamento = um(sp.grupamento) || FAMILIA_DEMO.grupamento;
  const turno = um(sp.turno) || FAMILIA_DEMO.turno;
  const opcoes = um(sp.opcoes).split(",").filter(Boolean).slice(0, MAX_OPCOES);

  const link = (over: Record<string, string>, rota = "/escolas") => {
    const q = new URLSearchParams({ bairro, grupamento, turno });
    if (ref2) q.set("ref2", ref2);
    if (opcoes.length) q.set("opcoes", opcoes.join(","));
    for (const [k, v] of Object.entries(over)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    return `${rota}?${q}`;
  };

  const tipo = tipoDaUnidade(unidade.n);
  const oferta = ofertaDaUnidade(id);
  const ag = agregado(id, grupamento, turno);
  const faixa = ag ? faixaDeChance(ag) : null;
  const distancia = distanciaKm(bairro, id);
  const casa = bairros[bairro];
  const coord = coordenadaDaUnidade(id);

  const naLista = opcoes.includes(id);
  const restantes = MAX_OPCOES - opcoes.length;

  const pinos: Pino[] = [];
  if (coord) pinos.push({ ...coord, tom: "selecionado" });
  if (casa) pinos.push({ lat: casa.lat, lng: casa.lng, rotulo: "C", tom: "casa" });
  const mapa = (await mapaDisponivel())
    ? urlMapaEstatico(pinos, { largura: 640, altura: 300 })
    : null;

  return (
    <div className="mx-auto w-full max-w-360">
      {/* Breadcrumb (5.11): o ancestral e clicavel, o item atual nao. */}
      <nav aria-label="Você está em" className="flex items-center gap-1.5 text-body-sm">
        <Link href={link({})} className="text-apoio underline-offset-4 hover:underline">
          Escolas
        </Link>
        <IconeAvancar size={14} className="text-desabilitado" />
        <span className="truncate font-medium text-marinho">{nomeExibicao(unidade.n)}</span>
      </nav>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* ------------------------------------------------ identificação (60%) */}
        <div className="space-y-4 lg:col-span-3">
          <article className="overflow-hidden rounded-lg border border-linha bg-papel">
            {/* Sem foto da unidade na base pública: a faixa identifica o tipo, não finge uma fachada. */}
            <div className="flex items-center gap-3 bg-primaria-clara px-5 py-6">
              <IconeEscola size={32} className="text-primaria" />
              <p className="text-title-sm text-marinho">{tipo.rotulo}</p>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-headline-sm text-titulo">{nomeExibicao(unidade.n)}</h1>
                <Chip tom="rede">{tipo.rede}</Chip>
              </div>

              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-md text-apoio">
                <IconeLocal size={18} className="shrink-0" />
                {unidade.b ? nomeExibicao(unidade.b) : "Bairro não informado"}
                {unidade.cre && <span className="text-discreto">· CRE {unidade.cre}</span>}
                {distancia !== null && (
                  <span className="num rounded-sm bg-primaria-clara px-2 py-0.5 text-label-md text-primaria">
                    {unidade.geo === "unidade" ? "" : "cerca de "}
                    {km(distancia)} de {casa?.nome ?? bairro}
                  </span>
                )}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {oferta.map((o) => (
                  <Chip
                    key={o.grupamento}
                    tom={o.grupamento === grupamento ? "distancia" : "atributo"}
                    Icone={IconeTurno}
                  >
                    {o.grupamento} · {o.turnos.join(" e ")}
                  </Chip>
                ))}
                {unidade.geo !== "unidade" && (
                  <Chip tom="atributo" Icone={IconeAtencao}>
                    Endereço aproximado
                  </Chip>
                )}
              </div>

              <p className="mt-4 border-t border-linha pt-3 text-body-sm text-apoio">
                A base pública da inscrição traz o bairro e a coordenada da unidade, não o endereço
                completo. Confirme o logradouro na secretaria antes de ir até lá.
              </p>
            </div>
          </article>

          <section className="rounded-lg border border-linha bg-papel p-5">
            <h2 className="text-title-lg text-titulo">Localização</h2>
            <p className="mt-1 text-body-sm text-apoio">
              A unidade em azul-marinho e o centro do seu bairro marcado com <strong>C</strong>.
            </p>
            <div className="mt-3 h-56 overflow-hidden rounded-xl border border-linha bg-fundo">
              <ImagemDoMapa
                src={mapa}
                alt={`Mapa com a localização de ${nomeExibicao(unidade.n)} e o centro do bairro ${casa?.nome ?? bairro}.`}
                alternativa={
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
                    <IconeLocal size={28} className="text-desabilitado" />
                    <p className="text-body-md text-apoio">
                      {unidade.b ? nomeExibicao(unidade.b) : "Bairro não informado"}
                      {coord && (
                        <>
                          {" · "}
                          <span className="num">
                            {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="text-body-sm text-discreto">O mapa não está disponível agora.</p>
                  </div>
                }
              />
            </div>
          </section>
        </div>

        {/* ------------------------------------------------ dado e ação (40%) */}
        <div className="space-y-4 lg:col-span-2">
          {ag && faixa ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <ChipChance faixa={faixa} />
                <Chip tom="categoria">
                  {grupamento} · turno {turno.toLowerCase()}
                </Chip>
              </div>

              <BarrasDeChamada a={ag} />

              <EntendaSuaSituacao>
                <p>{explicacaoDaChance(ag, faixa)}</p>
                <p>
                  Em {ANO} esta unidade chamou{" "}
                  <strong className="num">{n(ag.profundidadeAtual)}</strong>{" "}
                  {ag.profundidadeAtual === 1 ? "criança" : "crianças"} para esta turma, contando
                  quem aceitou a vaga e quem não apareceu para confirmar.
                </p>
                <p>
                  Sua posição na fila não aparece aqui porque ela não existe na base pública da
                  prefeitura. Nós não inventamos esse número.
                </p>
              </EntendaSuaSituacao>
            </>
          ) : (
            <section className="rounded-lg border border-linha bg-alerta-clara p-4">
              <h2 className="flex items-center gap-2 text-title-sm text-alerta">
                <IconeAtencao size={18} />
                Esta unidade não ofereceu {grupamento} no turno {turno.toLowerCase()} em {ANO}
              </h2>
              <p className="mt-2 text-body-md text-tinta">
                {oferta.length > 0
                  ? "Ela ofereceu estas turmas. Toque em uma para ver o histórico dela:"
                  : "Ela não teve nenhuma turma de educação infantil neste processo."}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {oferta.map((o) =>
                  o.turnos.map((t) => (
                    <li key={`${o.grupamento}-${t}`}>
                      <Link
                        href={link({ grupamento: o.grupamento, turno: t }, `/escolas/${id}`)}
                        className="inline-flex h-8 items-center rounded-full border border-linha bg-papel px-3 text-label-lg text-chip hover:bg-fundo"
                      >
                        {o.grupamento} · {t}
                      </Link>
                    </li>
                  )),
                )}
              </ul>
            </section>
          )}

          {/* Ações da tela, na ordem em que a família decide. */}
          <div className="space-y-2">
            {naLista ? (
              <>
                <p className="flex items-center gap-2 rounded-lg bg-vaga-clara px-3 py-2.5 text-body-md text-vaga">
                  <IconeConfirmado size={18} />
                  Esta creche já está na sua lista.
                </p>
                <Link
                  href={link({ opcoes: opcoes.filter((o) => o !== id).join(",") })}
                  className={`${BOTAO.secundario} w-full`}
                >
                  <IconeRemover size={18} />
                  Tirar da minha lista
                </Link>
              </>
            ) : restantes > 0 && ag ? (
              <Link
                href={link({ opcoes: [...opcoes, id].join(",") })}
                className={`${BOTAO.primario} w-full`}
              >
                <IconePerto size={18} />
                Escolher como {opcoes.length + 1}ª opção
              </Link>
            ) : (
              <p className="rounded-lg border border-linha bg-papel px-3 py-2.5 text-body-md text-apoio">
                {restantes === 0
                  ? `Você já usou as ${MAX_OPCOES} escolhas. Tire uma da lista para incluir esta.`
                  : "Só dá para escolher uma turma que esta unidade oferece."}
              </p>
            )}

            <Link href={link({})} className={`${BOTAO.contorno} w-full`}>
              Ver alternativas próximas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
