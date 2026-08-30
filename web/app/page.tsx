import Link from "next/link";
import {
  ANO,
  RAIO_PADRAO_KM,
  agregado,
  bairros,
  candidatas,
  grupamentos,
  listaBairros,
  rotuloFaixa,
  turnos,
  unidades,
  type Agregado,
  type Faixa,
} from "@/lib/creche";

const MAX_OPCOES = 5;

// A residência da família é dado do cadastro, não escolha de formulário: no processo real
// ela é comprovada por documento. Aqui vem na URL só para a demo poder trocar de família.
const FAMILIA_DEMO = { bairro: "ITANHANGA", grupamento: "Maternal II", turno: "Integral" };

type Params = Promise<{
  bairro?: string;
  ref2?: string;
  grupamento?: string;
  turno?: string;
  opcoes?: string;
}>;

const CORES: Record<Faixa, { chip: string; ponto: string; borda: string }> = {
  alta: {
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    ponto: "bg-emerald-500",
    borda: "border-emerald-200",
  },
  media: {
    chip: "bg-amber-50 text-amber-800 ring-amber-600/20",
    ponto: "bg-amber-500",
    borda: "border-amber-200",
  },
  baixa: {
    chip: "bg-rose-50 text-rose-800 ring-rose-600/20",
    ponto: "bg-rose-500",
    borda: "border-rose-200",
  },
};

const km = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);

function Chip({ faixa }: { faixa: Faixa }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${CORES[faixa].chip}`}
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
        <strong>Ninguém na fila</strong> — chamou {a.profundidadeAtual} famílias em {ANO}
        {a.estavel && <> e está sem fila há {a.anosComFilaZero} anos</>}.
      </>
    );
  }
  return (
    <>
      <strong>{a.filaAtual} famílias na fila</strong> — chamou{" "}
      <strong>{a.profundidadeAtual}</strong> em {ANO}
      {a.profundidadeMediana > 0 && <> (mediana de {a.profundidadeMediana} em 3 anos)</>}.
    </>
  );
}

export default async function Page({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const bairro = sp.bairro ?? FAMILIA_DEMO.bairro;
  const ref2 = sp.ref2 && bairros[sp.ref2] && sp.ref2 !== bairro ? sp.ref2 : "";
  const grupamento = sp.grupamento ?? FAMILIA_DEMO.grupamento;
  const turno = sp.turno ?? FAMILIA_DEMO.turno;

  // Sem semente: a inscrição começa vazia, como começa na vida real.
  const opcoes = (sp.opcoes ?? "").split(",").filter(Boolean).slice(0, MAX_OPCOES);

  const casa = bairros[bairro];
  const link = (over: Record<string, string>) => {
    const q = new URLSearchParams({ bairro, grupamento, turno });
    if (ref2) q.set("ref2", ref2);
    if (opcoes.length) q.set("opcoes", opcoes.join(","));
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
    .map((u) => ({ u, ag: agregado(u, grupamento, turno), cand: todas.find((c) => c.unidade === u) }))
    .filter((x): x is { u: string; ag: Agregado; cand: (typeof todas)[number] | undefined } => !!x.ag);

  const disponiveis = todas.filter((c) => !opcoes.includes(c.unidade));
  const restantes = MAX_OPCOES - opcoes.length;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Copiloto da Família · Inscrição Creche {ANO}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Escolha até {MAX_OPCOES} creches
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Você pode indicar até {MAX_OPCOES} creches, na ordem da sua preferência. Para cada uma,
          mostramos quantas famílias estão esperando e quantas a creche chamou no ano passado — para
          você saber onde tem chance de verdade.
        </p>
      </header>

      {/* pontos de referência + turma */}
      <form className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <input type="hidden" name="bairro" value={bairro} />
        {opcoes.length > 0 && <input type="hidden" name="opcoes" value={opcoes.join(",")} />}

        <div className="text-sm">
          <span className="mb-1 flex items-center gap-1.5 font-medium text-slate-700">
            Bairro de residência
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              comprovado
            </span>
          </span>
          <div className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500">
            {casa?.nome ?? bairro}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Vem do comprovante de residência da inscrição e não pode ser alterado aqui.
          </p>
        </div>

        <label className="text-sm">
          <span className="mb-1 flex items-center gap-1.5 font-medium text-slate-700">
            2º ponto de referência
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              opcional
            </span>
          </span>
          <select
            name="ref2"
            defaultValue={ref2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="">— nenhum —</option>
            {listaBairros
              .filter((x) => x.bk !== bairro)
              .map((x) => (
                <option key={x.bk} value={x.bk}>
                  {x.nome}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Trabalho, casa de familiar — qualquer lugar onde buscar a criança seja viável.
          </p>
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

        <div className="sm:col-span-2">
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Atualizar busca
          </button>
        </div>
      </form>

      {/* a cesta: só aparece quando existe algo nela */}
      {escolhidas.length > 0 && (
        <section className="mb-6 rounded-xl border border-slate-300 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sua inscrição · {opcoes.length} de {MAX_OPCOES}
          </h2>
          <ol className="space-y-2">
            {escolhidas.map(({ u, ag, cand }, i) => (
              <li key={u} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="w-6 shrink-0 font-semibold text-slate-400">{i + 1}ª</span>
                <span className="font-medium text-slate-900">{unidades[u]?.n ?? u}</span>
                {cand && <span className="text-xs text-slate-500">{km(cand.distanciaKm)}</span>}
                <Chip faixa={cand?.faixa ?? "baixa"} />
                <Link
                  href={link({ opcoes: opcoes.filter((x) => x !== u).join(",") })}
                  className="ml-auto text-xs text-slate-400 underline hover:text-slate-700"
                >
                  remover
                </Link>
                <p className="w-full pl-9 text-xs text-slate-600">
                  <Leitura a={ag} />
                </p>
              </li>
            ))}
          </ol>
          {restantes > 0 && (
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Ainda pode escolher mais {restantes}. Deixar opções em branco só diminui sua chance —
              elas não custam nada e não atrapalham a sua primeira escolha.
            </p>
          )}
        </section>
      )}

      {/* a escolha — o primeiro contato do responsável */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Creches perto de você · {grupamento} · {turno}
        </h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          {todas.length} num raio de {RAIO_PADRAO_KM} km, da maior para a menor chance de você
          conseguir a vaga.
        </p>

        {restantes === 0 && (
          <p className="mb-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
            Você já usou as {MAX_OPCOES} opções. Remova uma para trocar.
          </p>
        )}

        <ul className="space-y-3">
          {disponiveis.map((c) => (
            <li
              key={c.unidade}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-white p-4 ${CORES[c.faixa].borda}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{c.nome}</p>
                  <Chip faixa={c.faixa} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {c.bairro} · {c.aproximada ? "≈ " : ""}
                  {km(c.distanciaKm)}
                  {ref2 && c.pontoMaisProximo !== bairro && (
                    <> de {bairros[c.pontoMaisProximo]?.nome}</>
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  <Leitura a={c.agregado} />
                </p>
              </div>
              {restantes > 0 && (
                <Link
                  href={link({ opcoes: [...opcoes, c.unidade].join(",") })}
                  className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Escolher como {opcoes.length + 1}ª
                </Link>
              )}
            </li>
          ))}
        </ul>

        {todas.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Nenhuma creche com {grupamento} · {turno} num raio de {RAIO_PADRAO_KM} km com histórico
            de chamada suficiente para mostrar. Tente adicionar um 2º ponto de referência.
          </p>
        )}
      </section>

      <footer className="mt-12 space-y-2 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        <p>
          Todos os números vêm dos processos reais de 2021–2025 da SME-Rio.{" "}
          <strong>Nada aqui é previsão</strong> — é a contagem que a prefeitura já fazia, devolvida a
          quem precisa dela.
        </p>
        <p>
          &quot;Chamou N famílias&quot; = confirmadas + não confirmadas naquele ano. É quantas
          famílias a unidade convocou, não até que posição da classificação ela desceu — a base não
          traz a posição de cada criança, e não a inventamos.
        </p>
        <p>
          A distância parte do centro do bairro de referência (a base é anonimizada, sem endereço do
          responsável): precisão de cerca de 1 km.
        </p>
        <p>
          <Link href="/diagnostico" className="underline hover:text-slate-700">
            Ver o diagnóstico da rede
          </Link>{" "}
          — os números que motivaram esta ferramenta.
        </p>
      </footer>
    </main>
  );
}
