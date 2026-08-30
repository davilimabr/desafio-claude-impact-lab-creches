import Link from "next/link";
import { ANO, bairros, type Candidata, type Faixa } from "@/lib/creche";

const ESTILOS: Record<Faixa, { texto: string; fundo: string; borda: string }> = {
  alta: { texto: "text-vaga", fundo: "bg-vaga-clara", borda: "border-l-vaga" },
  media: { texto: "text-meia", fundo: "bg-meia-clara", borda: "border-l-meia" },
  baixa: { texto: "text-espera", fundo: "bg-espera-clara", borda: "border-l-espera" },
};

const ROTULO: Record<Faixa, string> = {
  alta: "Chance alta",
  media: "Chance média",
  baixa: "Chance baixa",
};

const km = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1).replace(".", ",")} km`);

/**
 * A barra de alcance — o elemento que carrega a tese do produto.
 * A trilha é a fila; o preenchido é até onde a chamada do ano passado chegou.
 * Uma trilha quase vazia diz, sem texto, "esta fila não anda até você".
 */
function Alcance({ fila, chamou }: { fila: number; chamou: number }) {
  const total = Math.max(fila, chamou, 1);
  const pct = Math.min(100, Math.round((chamou / total) * 100));
  return (
    <div
      className="mt-3 h-2 w-full overflow-hidden rounded-full bg-linha"
      role="img"
      aria-label={
        fila === 0
          ? `Sem fila. A creche chamou ${chamou} famílias em ${ANO}.`
          : `A creche chamou ${chamou} famílias em ${ANO}, com ${fila} na fila.`
      }
    >
      <div
        className={`h-full rounded-full ${fila === 0 ? "bg-vaga" : pct >= 100 ? "bg-vaga" : pct >= 60 ? "bg-meia" : "bg-espera"}`}
        style={{ width: `${fila === 0 ? 100 : pct}%` }}
      />
    </div>
  );
}

function porQue(c: Candidata) {
  const a = c.agregado;
  const m = a.profundidadeMediana;
  if (a.filaAtual === 0) {
    return `Não há ninguém na fila desta turma. Quem se inscrever entra direto na próxima chamada${
      a.estavel ? `, e a creche está assim há ${a.anosComFilaZero} anos` : ""
    }.`;
  }
  if (c.faixa === "alta") {
    return `A fila tem ${a.filaAtual} famílias e a creche costuma chamar ${m} por ano. Sobra folga: quem entra agora tende a ser chamado.`;
  }
  if (c.faixa === "media") {
    return `A fila tem ${a.filaAtual} famílias e a creche costuma chamar ${m} por ano. Você fica perto do limite — pode ser chamado, mas não é garantido.`;
  }
  return `A fila tem ${a.filaAtual} famílias, e a creche costuma chamar ${m} por ano. Historicamente a chamada não chega tão fundo, então a chance de você ser chamado é pequena.`;
}

export function Ficha({
  c,
  href,
  ordem,
  bairroCasa,
}: {
  c: Candidata;
  href: string | null;
  ordem: number;
  bairroCasa: string;
}) {
  const e = ESTILOS[c.faixa];
  const a = c.agregado;

  return (
    <li className={`border-l-4 bg-papel ${e.borda} shadow-[0_1px_0_rgba(22,50,79,0.06)]`}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[17px] font-semibold leading-snug text-tinta">
              {c.nome}
            </h3>
            <p className="mt-0.5 text-sm text-tinta-fraca">
              {c.bairro} · {c.aproximada ? "cerca de " : ""}
              <span className="num">{km(c.distanciaKm)}</span>
              {c.pontoMaisProximo !== bairroCasa && (
                <> de {bairros[c.pontoMaisProximo]?.nome}</>
              )}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${e.fundo} ${e.texto}`}
          >
            {ROTULO[c.faixa]}
          </span>
        </div>

        <Alcance fila={a.filaAtual} chamou={a.profundidadeAtual} />

        <p className="mt-2 text-sm text-tinta">
          {a.filaAtual === 0 ? (
            <>
              <strong className="num">Ninguém esperando</strong> · chamou{" "}
              <strong className="num">{a.profundidadeAtual}</strong> famílias em {ANO}
            </>
          ) : (
            <>
              chamou <strong className="num">{a.profundidadeAtual}</strong> ·{" "}
              <span className="num">{a.filaAtual}</span> famílias esperando
            </>
          )}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {href ? (
            <Link
              href={href}
              className="rounded-lg bg-tinta px-4 py-2.5 text-sm font-semibold text-papel transition-colors hover:bg-[#0e2138]"
            >
              Escolher como {ordem}ª
            </Link>
          ) : (
            <span className="text-sm text-tinta-fraca">
              Remova uma opção para escolher esta
            </span>
          )}

          <details className="w-full">
            <summary className="inline-flex items-center gap-1.5 text-sm font-medium text-tinta underline decoration-linha underline-offset-4 hover:decoration-tinta">
              <span className="seta inline-block text-tinta-fraca">▸</span>
              Por que a chance é {ROTULO[c.faixa].split(" ")[1]}?
            </summary>

            <div className="mt-3 space-y-3 border-t border-linha pt-3">
              <p className="text-sm leading-relaxed text-tinta">{porQue(c)}</p>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-tinta-fraca">
                  Histórico desta turma
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-tinta-fraca">
                      <th className="py-1 font-medium">Ano</th>
                      <th className="py-1 text-right font-medium">Chamadas</th>
                      <th className="py-1 text-right font-medium">Fila</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linha">
                    {a.historico.map((h) => (
                      <tr key={h.ano}>
                        <td className="num py-1.5">{h.ano}</td>
                        <td className="num py-1.5 text-right font-medium">{h.profundidade}</td>
                        <td className="num py-1.5 text-right text-tinta-fraca">{h.fila}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs leading-relaxed text-tinta-fraca">
                &quot;Chamadas&quot; = famílias convocadas naquele ano, somando as que confirmaram e
                as que não apareceram. Não é a posição da classificação: essa informação não existe
                na base pública, e não a estimamos.
              </p>
            </div>
          </details>
        </div>
      </div>
    </li>
  );
}
