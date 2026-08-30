import Link from "next/link";
import { ANO, meta, stats } from "@/lib/creche";

// Tela de evidência — para a SME e para a apresentação, não para a família.
// Tudo aqui é contagem sobre os processos reais de 2021-2025, reproduzível com
// `node scripts/ingest.mjs`. Nada é estimativa ou projeção.

export const metadata = {
  title: "Diagnóstico da rede · Inscrição Creche Rio",
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
        destaque ? "border-espera bg-espera-clara" : "border-linha bg-papel"
      }`}
    >
      <p
        className={`num font-display text-4xl font-bold leading-none ${
          destaque ? "text-espera" : "text-tinta"
        }`}
      >
        {n(valor)}
      </p>
      {de && (
        <p className="num mt-1 text-sm text-tinta-fraca">
          de {n(de)} · {pct(valor, de)}
        </p>
      )}
      <p className="mt-3 text-[15px] leading-relaxed text-tinta">{children}</p>
    </div>
  );
}

export default function Diagnostico() {
  const s = stats;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-tinta-fraca">
          Evidência
        </p>
        <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-tinta sm:text-4xl">
          A fila não é só escassez.
          <br />É descompasso.
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-tinta">
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
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-tinta-fraca">
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
        <p className="mt-4 border-l-4 border-tinta pl-4 font-display text-lg font-semibold leading-snug text-tinta">
          Não falta vaga para essas famílias. Falta a informação de onde ela está — e é a própria
          prefeitura que já a tem.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-tinta-fraca">
          Como o número é medido
        </h2>
        <div className="overflow-x-auto rounded-xl border border-linha bg-papel">
          <table className="w-full text-sm">
            <thead className="border-b border-linha text-left text-tinta-fraca">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Critério de proximidade</th>
                <th className="px-4 py-2.5 text-right font-semibold">Crianças</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linha">
              <tr>
                <td className="px-4 py-2.5">
                  <strong>Distância até {s.raio_km} km</strong> — adotado, e é o que a tela usa
                </td>
                <td className="num px-4 py-2.5 text-right font-bold">
                  {n(s.sensibilidade.por_distancia_3km)}
                </td>
              </tr>
              <tr className="text-tinta-fraca">
                <td className="px-4 py-2.5">Mesmo bairro, pela planilha de localização</td>
                <td className="num px-4 py-2.5 text-right">
                  {n(s.sensibilidade.por_bairro_planilha)}
                </td>
              </tr>
              <tr className="text-tinta-fraca">
                <td className="px-4 py-2.5">Mesmo bairro, pela Query D</td>
                <td className="num px-4 py-2.5 text-right">
                  {n(s.sensibilidade.por_bairro_query_d)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-tinta-fraca">
          Cruzar por <em>nome de bairro</em> é frágil: as duas fontes de endereço da rede discordam
          sobre onde ficam algumas unidades, e &quot;mesmo bairro&quot; chega a emparelhar creches a
          mais de {s.raio_km} km uma da outra. Por isso o número adotado usa distância real entre
          coordenadas, que é também o que o produto faz na tela.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-tinta-fraca">
          Premissas declaradas
        </h2>
        <ul className="space-y-2.5 rounded-xl border border-linha bg-papel p-4 text-sm leading-relaxed text-tinta">
          {meta.premissas.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span aria-hidden className="text-tinta-fraca">
                —
              </span>
              <span>{p}</span>
            </li>
          ))}
          <li className="flex gap-2.5">
            <span aria-hidden className="text-tinta-fraca">
              —
            </span>
            <span>
              {s.unidades_sem_coordenada} unidades não têm coordenada própria e herdam o centro do
              bairro.
            </span>
          </li>
        </ul>
      </section>

      <footer className="border-t border-linha pt-6">
        <Link
          href="/"
          className="font-semibold text-tinta underline underline-offset-4 hover:text-tinta-fraca"
        >
          ← Ver a tela do responsável
        </Link>
      </footer>
    </main>
  );
}
