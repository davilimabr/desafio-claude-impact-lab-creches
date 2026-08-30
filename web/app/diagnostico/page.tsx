import Link from "next/link";
import { ANO, meta, stats } from "@/lib/creche";
import { BOTAO, n } from "../componentes";
import { IconeVoltar } from "../icones";

// Tela de evidência, para a SME e para a apresentação, não para a família.
// Tudo aqui é contagem sobre os processos reais de 2021 a 2025, reproduzível com
// `node scripts/ingest.mjs`. Nada é estimativa ou projeção.

export const metadata = {
  title: "Diagnóstico da rede · Inscrição Creche Rio",
  description: "O descompasso entre a fila e a vaga ociosa na rede de creches do Rio",
};

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
      className={`rounded-lg border p-5 ${
        destaque ? "border-alerta bg-alerta-clara" : "border-linha bg-papel"
      }`}
    >
      <p className={`num text-display-lg ${destaque ? "text-alerta" : "text-titulo"}`}>
        {n(valor)}
      </p>
      {de && (
        <p className="num mt-1 text-body-sm text-apoio">
          de {n(de)}, ou {pct(valor, de)}
        </p>
      )}
      <p className="mt-3 text-body-lg text-tinta">{children}</p>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-label-sm uppercase text-discreto">{titulo}</h2>
      {children}
    </section>
  );
}

export default function Diagnostico() {
  const s = stats;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header>
        <p className="text-label-sm uppercase text-discreto">Evidência</p>
        <h1 className="mt-2 text-headline-lg text-titulo">
          Nem sempre falta vaga.
          <br />
          Muitas vezes, falta informação.
        </h1>
        <p className="mt-3 max-w-[68ch] text-body-lg text-tinta">
          Contagens sobre o processo de Inscrição Creche de {ANO} da Secretaria Municipal de
          Educação. Não são estimativas nem projeções. São contagens diretas nas bases,
          reproduzíveis com um comando.
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Numero valor={s.criancas_sem_vaga} de={s.criancas}>
          crianças terminaram o processo de {ANO} <strong>sem nenhuma vaga</strong>.
        </Numero>
        <Numero valor={s.unidades_fila_zero} de={s.unidades_ativas}>
          creches da rede terminaram o ano <strong>sem ninguém na fila de espera</strong>.
        </Numero>
      </section>

      <Secao titulo="O cruzamento que ninguém faz">
        <div className="grid gap-3">
          <Numero valor={s.sem_vaga_com_ociosa_no_bairro} de={s.criancas_sem_vaga} destaque>
            dessas crianças tinham, <strong>a menos de {s.raio_km} km de casa</strong>, uma creche
            do <strong>mesmo grupamento e turno</strong> que procuravam, em uma unidade que fechou o
            ano <strong>sem ninguém na fila</strong>. E não a escolheram.
          </Numero>
          <Numero
            valor={s.sem_vaga_com_ociosa_e_opcao_sobrando}
            de={s.sem_vaga_com_ociosa_no_bairro}
          >
            destas ainda tinham <strong>opções em branco</strong> no formulário. A rede oferece 5
            escolhas. Elas não usaram todas, e a vaga que serviria estava ali.
          </Numero>
        </div>
        <p className="mt-4 border-l-[3px] border-primaria pl-4 text-title-lg text-titulo">
          Não falta vaga para essas famílias. Falta a informação de onde ela está, e quem já tem
          essa informação é a própria prefeitura.
        </p>
      </Secao>

      <Secao titulo="Como o número é medido">
        <div className="overflow-x-auto rounded-lg border border-linha bg-papel">
          <table className="w-full text-body-md">
            <thead className="border-b border-linha text-left text-apoio">
              <tr>
                <th className="px-4 py-2.5 text-title-sm">Critério de proximidade</th>
                <th className="px-4 py-2.5 text-right text-title-sm">Crianças</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linha">
              <tr>
                <td className="px-4 py-2.5">
                  <strong>Distância até {s.raio_km} km</strong>, o critério adotado e usado na tela
                </td>
                <td className="num px-4 py-2.5 text-right font-bold text-titulo">
                  {n(s.sensibilidade.por_distancia_3km)}
                </td>
              </tr>
              <tr className="text-apoio">
                <td className="px-4 py-2.5">Mesmo bairro, pela planilha de localização</td>
                <td className="num px-4 py-2.5 text-right">
                  {n(s.sensibilidade.por_bairro_planilha)}
                </td>
              </tr>
              <tr className="text-apoio">
                <td className="px-4 py-2.5">Mesmo bairro, pela Query D</td>
                <td className="num px-4 py-2.5 text-right">{n(s.sensibilidade.por_bairro_query_d)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-[68ch] text-body-md text-apoio">
          Cruzar por <em>nome de bairro</em> é frágil: as duas fontes de endereço da rede discordam
          sobre onde ficam algumas unidades, e &quot;mesmo bairro&quot; chega a emparelhar creches a
          mais de {s.raio_km} km uma da outra. Por isso o número adotado usa distância real entre
          coordenadas, que é também o que o produto faz na tela.
        </p>
      </Secao>

      <Secao titulo="Premissas declaradas">
        <ul className="space-y-2.5 rounded-lg border border-linha bg-papel p-4 text-body-md text-tinta">
          {meta.premissas.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primaria" />
              <span>{p}</span>
            </li>
          ))}
          <li className="flex gap-2.5">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primaria" />
            <span>
              {s.unidades_sem_coordenada} unidades não têm coordenada própria e herdam o centro do
              bairro.
            </span>
          </li>
        </ul>
      </Secao>

      <footer className="mt-8 border-t border-linha pt-6">
        <Link href="/" className={BOTAO.contorno}>
          <IconeVoltar size={18} />
          Voltar para as minhas escolhas
        </Link>
      </footer>
    </div>
  );
}
