import Link from "next/link";
import {
  ANO,
  agregado,
  bairros,
  faixaDeChance,
  grupamentos,
  listaBairros,
  recomendar,
  rotuloFaixa,
  stats,
  turnos,
  unidades,
  type Agregado,
  type Faixa,
} from "@/lib/creche";

// O caso do Itanhangá: 235 na fila numa unidade, fila zero na outra, mesmo bairro,
// mesmo grupamento, mesmo turno. Está tudo em 2025 real.
const PADRAO = {
  bairro: "ITANHANGA",
  grupamento: "Maternal II",
  turno: "Integral",
  opcoes: ["0716812"],
};

type Params = Promise<{
  bairro?: string;
  grupamento?: string;
  turno?: string;
  opcoes?: string;
}>;

const CORES: Record<Faixa, { chip: string; ponto: string }> = {
  alta: { chip: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", ponto: "bg-emerald-500" },
  media: { chip: "bg-amber-50 text-amber-800 ring-amber-600/20", ponto: "bg-amber-500" },
  baixa: { chip: "bg-rose-50 text-rose-800 ring-rose-600/20", ponto: "bg-rose-500" },
};

const km = (d: number | null) => (d === null ? null : d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);

function Chip({ faixa }: { faixa: Faixa }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${CORES[faixa].chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${CORES[faixa].ponto}`} />
      {rotuloFaixa[faixa]}
    </span>
  );
}

/** A leitura que o portal de hoje não faz: a fila cabe na chamada histórica? */
function Leitura({ a }: { a: Agregado }) {
  if (a.filaAtual === 0) {
    return (
      <>
        <strong>Ninguém na fila</strong> — a unidade chamou {a.profundidadeAtual} famílias em {ANO}
        {a.estavel && <> e está sem fila há {a.anosComFilaZero} anos</>}.
      </>
    );
  }
  return (
    <>
      <strong>{a.filaAtual} famílias na fila</strong> — a unidade chamou{" "}
      <strong>{a.profundidadeAtual}</strong> em {ANO}
      {a.profundidadeMediana > 0 && <> (mediana de {a.profundidadeMediana} nos últimos 3 anos)</>}.
    </>
  );
}

export default async function Page({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const bairro = sp.bairro ?? PADRAO.bairro;
  const grupamento = sp.grupamento ?? PADRAO.grupamento;
  const turno = sp.turno ?? PADRAO.turno;
  const opcoes = (sp.opcoes ?? PADRAO.opcoes.join(",")).split(",").filter(Boolean).slice(0, 5);

  const b = bairros[bairro];
  const link = (over: Partial<Record<string, string>>) => {
    const q = new URLSearchParams({ bairro, grupamento, turno, opcoes: opcoes.join(",") });
    for (const [k, v] of Object.entries(over)) q.set(k, v!);
    return `/?${q}`;
  };

  const escolhidas = opcoes
    .map((u) => ({ u, ag: agregado(u, grupamento, turno) }))
    .filter((x): x is { u: string; ag: Agregado } => !!x.ag);

  const sugestoes = recomendar({
    bairroFamilia: bairro,
    grupamento,
    horario: turno,
    jaEscolhidas: opcoes,
    limite: 4,
  });

  const vagas = opcoes.length < 5 ? 5 - opcoes.length : 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Copiloto da Família · Inscrição Creche {ANO}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Minha fila</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Em {ANO}, <strong>{stats.criancas_sem_vaga.toLocaleString("pt-BR")}</strong> crianças
          terminaram o processo sem nenhuma vaga.{" "}
          <strong>{stats.sem_vaga_com_ociosa_no_bairro.toLocaleString("pt-BR")}</strong> delas tinham,
          a menos de {stats.raio_km} km de casa, uma creche do mesmo grupamento e turno que
          procuravam — e sem ninguém na fila.
        </p>
      </header>

      {/* seletor: quem é a família */}
      <form className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Bairro da família</span>
          <select
            name="bairro"
            defaultValue={bairro}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {listaBairros.map((x) => (
              <option key={x.bk} value={x.bk}>
                {x.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Grupamento</span>
          <select
            name="grupamento"
            defaultValue={grupamento}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {grupamentos.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Turno</span>
          <select
            name="turno"
            defaultValue={turno}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {turnos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-3">
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Ver minha situação
          </button>
        </div>
      </form>

      {/* as opções escolhidas */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Minhas opções ({opcoes.length} de 5)
        </h2>
        <ol className="space-y-3">
          {escolhidas.map(({ u, ag }, i) => {
            const faixa = faixaDeChance(ag);
            const rest = opcoes.filter((x) => x !== u).join(",");
            return (
              <li key={u} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{i + 1}ª opção</p>
                    <p className="font-medium text-slate-900">{unidades[u]?.n ?? u}</p>
                    <p className="text-xs text-slate-500">{unidades[u]?.b}</p>
                  </div>
                  <Chip faixa={faixa} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  <Leitura a={ag} />
                </p>
                <Link
                  href={link({ opcoes: rest })}
                  className="mt-3 inline-block text-xs text-slate-500 underline hover:text-slate-800"
                >
                  remover
                </Link>
              </li>
            );
          })}
          {Array.from({ length: vagas }).map((_, i) => (
            <li
              key={`vazia-${i}`}
              className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400"
            >
              {opcoes.length + i + 1}ª opção — em branco
            </li>
          ))}
        </ol>
      </section>

      {/* a recomendação */}
      {vagas > 0 && sugestoes.length > 0 && (
        <section>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Você tem {vagas} {vagas === 1 ? "opção" : "opções"} sobrando
          </h2>
          <p className="mb-3 text-sm text-slate-600">
            Perto de {b?.nome ?? bairro}, com {grupamento} · {turno}:
          </p>
          <ul className="space-y-3">
            {sugestoes.map((r) => (
              <li
                key={r.unidade}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{r.nome}</p>
                    <Chip faixa={r.faixa} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.bairro} · {r.aproximada ? "≈ " : ""}
                    {km(r.distanciaKm)}
                    {r.aproximada && " (bairro)"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    <Leitura a={r.agregado} />
                  </p>
                </div>
                <Link
                  href={link({ opcoes: [...opcoes, r.unidade].join(",") })}
                  className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Usar como {opcoes.length + 1}ª opção
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {vagas > 0 && sugestoes.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Nenhuma unidade com {grupamento} · {turno} num raio de 3 km deste bairro tem histórico de
          chamada suficiente para recomendar.
        </p>
      )}

      <footer className="mt-12 space-y-2 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        <p>
          Todos os números vêm dos processos reais de 2021–2025 da SME-Rio.{" "}
          <strong>Nada aqui é previsão</strong> — é a contagem que a prefeitura já fazia, devolvida a
          quem precisa dela.
        </p>
        <p>
          &quot;Chamou N famílias&quot; = confirmadas + não confirmadas naquele ano. É quantas
          famílias a unidade convocou, não até que posição da classificação ela desceu — a base não
          traz a posição de cada criança.
        </p>
        <p>
          A distância parte do centro do bairro da família (a base é anonimizada, sem endereço do
          responsável): precisão de cerca de 1 km.
        </p>
      </footer>
    </main>
  );
}
