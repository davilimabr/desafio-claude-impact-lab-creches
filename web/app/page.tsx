import Image from "next/image";
import Link from "next/link";
import marca from "@/public/logo-sme-rio.png";
import { ANO, INICIO, MAX_OPCOES } from "@/lib/creche";
import { BOTAO } from "./componentes";
import { IconeAvancar } from "./icones";

export const metadata = {
  title: "Entrar · Inscrição Creche Rio",
  description: "Acesso do responsável à consulta de creches da rede municipal do Rio.",
};

const MARCA_ALT = "Prefeitura do Rio, Secretaria Municipal de Educação";

const CAMPO =
  "h-10 w-full rounded-md border border-linha bg-papel px-3 text-body-md text-tinta placeholder:text-discreto focus:border-primaria";

/**
 * Tela de entrada. Protótipo: o formulário é um GET para a primeira tela e os campos
 * não têm `name`, então nada trafega e nada é validado — o botão só abre a aplicação.
 * Enter no teclado funciona porque é um form de verdade, sem uma linha de JavaScript.
 */
export default function Entrada() {
  return (
    <div className="relative flex min-h-screen flex-col bg-fundo">
      {/* A unica licenca decorativa da tela: um clarao de azul institucional no topo,
          para o card branco ter de onde emergir. Nada de ilustracao inventada. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-primaria-50 to-fundo"
      />

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-linha bg-papel p-6 shadow-sm sm:p-8">
            <Image src={marca} alt={MARCA_ALT} priority className="h-9 w-auto" />
            <p className="mt-3 text-body-sm text-apoio">
              Inscrição Creche · Educação Municipal
            </p>

            <h1 className="mt-6 text-headline-md text-titulo">Entrar na sua inscrição</h1>
            <p className="mt-2 text-body-md text-tinta">
              Veja quantas famílias estão na fila de cada creche e quantas crianças ela chamou no
              ano passado, antes de gastar as suas {MAX_OPCOES} escolhas.
            </p>

            <form action={INICIO} className="mt-6 space-y-4">
              <div>
                <label htmlFor="cpf" className="mb-1.5 block text-title-sm text-tinta">
                  CPF do responsável
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className={CAMPO}
                />
              </div>

              <div>
                <label htmlFor="nascimento" className="mb-1.5 block text-title-sm text-tinta">
                  Data de nascimento da criança
                </label>
                <input id="nascimento" type="date" autoComplete="off" className={CAMPO} />
              </div>

              <button type="submit" className={`${BOTAO.primario} w-full`}>
                Ver minhas escolhas
                <IconeAvancar size={18} />
              </button>
            </form>

            {/* Em vez de um link "esqueci meu acesso" que nao leva a lugar nenhum, a
                resposta abre aqui mesmo. */}
            <details className="mt-5 border-t border-linha pt-4">
              <summary className="text-title-sm text-primaria underline-offset-4 hover:underline">
                Dificuldades para acessar?
              </summary>
              <div className="mt-2 space-y-2 text-body-sm text-apoio">
                <p>
                  Nesta demonstração qualquer CPF e qualquer data entram: o botão abre a consulta
                  direto, sem conferir nada.
                </p>
                <p>
                  No processo real, quem entra é o responsável que assinou a inscrição, com o CPF
                  que está no comprovante entregue na unidade.
                </p>
              </div>
            </details>
          </div>

          <p className="mt-4 text-center text-body-sm text-discreto">
            Protótipo de demonstração · nenhum dado é enviado
          </p>
        </div>
      </main>

      <footer className="relative border-t border-trilho px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-md flex-col gap-1 text-body-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-discreto">
            © {ANO} Secretaria Municipal de Educação · Prefeitura do Rio de Janeiro
          </p>
          <Link href="/diagnostico" className="text-apoio underline-offset-4 hover:underline">
            Como estes números são medidos
          </Link>
        </div>
      </footer>
    </div>
  );
}
