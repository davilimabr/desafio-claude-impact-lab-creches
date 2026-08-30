import Link from "next/link";
import { ANO, meta, stats } from "@/lib/creche";

// Tela de evidência — para a SME e para a apresentação, não para a família.
// Tudo aqui é contagem sobre os processos reais de 2021-2025, reproduzível com
// `node scripts/ingest.mjs`. Nada é estimativa ou projeção.

export const metadata = {
  title: "Diagnóstico · Copiloto da Família",
  description: "O descompasso entre a fila e a vaga ociosa na rede de creches do Rio",
};

const n = (x: number) => x.toLocaleString("pt-BR");
const pct = (parte: number, todo: number) =>
  `${((100 * parte) / todo).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

function Numero({
  valor,
  de,
  children,
  destaque,
}: {
  valor: number;
  de?: number;
  children: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        destaque ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-3xl font-semibold tabular-nums ${
          destaque ? "text-rose-800" : "text-slate-900"
        }`}
      >
        {n(valor)}
        {de && (
          <span className="ml-2 text-base font-normal text-slate-500">
            de {n(de)} · {pct(valor, de)}
          </span>
        )}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

export default function Diagnostico() {
  const s = stats;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Copiloto da Família · evidência
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          A fila não é só escassez. É descompasso.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Contagens sobre o processo de Inscrição Creche de {ANO} da SME-Rio. Não são estimativas
          nem projeções: são contagens diretas nas bases, reproduzíveis com um comando.
        </p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <Numero valor={s.criancas_sem_vaga} de={s.criancas}>
          crianças terminaram o processo de {ANO} <strong>sem nenhuma vaga</strong>.
        </Numero>
        <Numero valor={s.unidades_fila_zero} de={s.unidades_ativas}>
          creches da rede terminaram o ano <strong>sem ninguém na fila de espera</strong>.
        </Numero>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          O cruzamento que ninguém faz
        </h2>
        <div className="grid gap-3">
          <Numero valor={s.sem_vaga_com_ociosa_no_bairro} de={s.criancas_sem_vaga} destaque>
            dessas crianças tinham, <strong>a menos de {s.raio_km} km de casa</strong>, uma creche do{" "}
            <strong>mesmo grupamento e turno</strong> que procuravam — numa unidade que fechou o ano{" "}
            <strong>sem ninguém na fila</strong>. E não a escolheram.
          </Numero>
          <Numero
            valor={s.sem_vaga_com_ociosa_e_opcao_sobrando}
            de={s.sem_vaga_com_ociosa_no_bairro}
          >
            destas ainda tinham <strong>opções em branco</strong> no formulário. A rede oferece 5
            escolhas; elas não gastaram todas — e a vaga que serviria estava ali.
          </Numero>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Não falta vaga para essas famílias. Falta a informação de onde ela está — e é a própria
          prefeitura que já a tem.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Como o número é medido
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Critério de proximidade</th>
                <th className="px-4 py-2 text-right font-medium">Crianças</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-white">
                <td className="px-4 py-2">
                  <strong>Distância ≤ {s.raio_km} km</strong> — adotado, e é o que a tela usa
                </td>
                <td className="px-4 py-2 text-right font-semibold tabular-nums">
                  {n(s.sensibilidade.por_distancia_3km)}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 text-slate-600">
                  Mesmo bairro, pela planilha de localização
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-600">
                  {n(s.sensibilidade.por_bairro_planilha)}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 text-slate-600">Mesmo bairro, pela Query D</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-600">
                  {n(s.sensibilidade.por_bairro_query_d)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Cruzar por <em>nome de bairro</em> é frágil: as duas fontes de endereço da rede discordam
          sobre onde ficam algumas unidades, e &quot;mesmo bairro&quot; chega a emparelhar creches a
          mais de {s.raio_km} km uma da outra. Por isso o número adotado usa distância real entre
          coordenadas, que é também o que o produto faz na tela.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Premissas declaradas
        </h2>
        <ul className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {meta.premissas.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-slate-400">—</span>
              <span>{p}</span>
            </li>
          ))}
          <li className="flex gap-2">
            <span className="text-slate-400">—</span>
            <span>
              {s.unidades_sem_coordenada} das unidades não têm coordenada própria e herdam o centro
              do bairro.
            </span>
          </li>
        </ul>
      </section>

      <footer className="border-t border-slate-200 pt-6 text-sm">
        <Link href="/" className="font-medium text-slate-900 underline hover:text-slate-600">
          ← Ver a tela do responsável
        </Link>
      </footer>
    </main>
  );
}
