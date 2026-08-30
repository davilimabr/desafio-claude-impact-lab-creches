<div align="center">

# Inscrição Creche Rio

**A fila da creche no Rio nem sempre é falta de vaga. Muitas vezes é falta de informação.**

Uma ferramenta que mostra à família, antes de ela gastar as 5 escolhas da inscrição,
quantas pessoas estão na fila de cada creche e até onde aquela creche chamou nos anos anteriores.

### ➡️ **[Acessar a versão publicada](https://desafio-claude-impact-lab-creches.onrender.com/)** ⬅️

`Claude Impact Lab Rio · 2ª edição` · `Desafio SME-Rio: Inteligência na Fila da Creche`

</div>

---

## O problema, como ele apareceu no briefing

A rede municipal do Rio tem, ao mesmo tempo, **vagas ociosas e listas de espera expressivas**.
Um único processo reúne **mais de 45 mil inscrições em 872 unidades**, e cada família indica
até cinco creches por ordem de preferência.

Do briefing e da conversa com a equipe da prefeitura, algumas dores ficaram explícitas:

| Fase | O que trava hoje |
| --- | --- |
| **Planejamento da oferta** | A oferta do ano é desenhada em cima da fila do ano anterior. O ano pode começar com turma vazia num lugar e fila longa a poucos quarteirões. |
| **Inscrição** | A família escolhe até 5 unidades **sem nenhum sinal de chance**. Não sabe o tamanho da fila, nem se aquela creche costuma chamar 10 ou 200 crianças. Escolha inviável hoje é cancelamento amanhã. |
| **Classificação** | Uma classificação por opção, executada unidade a unidade, com régua de pontuação que muda a cada processo. |
| **Convocação** | Contato manual, sem rastreio, prazo de 3 dias. Telefone desatualizado derruba a vaga; enquanto uma família decide, as outras quatro unidades ficam bloqueadas. |

O enunciado do desafio pede três respostas: **quantas vagas abrir e onde**, **em que ordem chamar
a fila** e **como garantir que a família chegue à vaga dentro do prazo**.

## O que os dados provaram

Antes de decidir o que construir, o time contou. Todos os números abaixo são **contagens diretas
nas bases oficiais de 2021–2025**, reproduzíveis com `node scripts/ingest.mjs` — não são
estimativas nem projeções.

| Processo de 2025 | Número |
| --- | --- |
| Crianças no processo | **62.899** |
| Crianças que terminaram **sem nenhuma vaga** | **14.219** (22,6%) |
| Creches que fecharam o ano **sem ninguém na fila** | **359 de 836** (43%) |
| Dessas crianças sem vaga, quantas tinham **a menos de 3 km de casa** uma creche do **mesmo grupamento e turno** que fechou o ano sem fila — e não a escolheram | **12.362** |
| Quantas dessas ainda tinham **opções em branco** no formulário | **9.843** |

> **A tese do projeto:** para 12 mil famílias, a vaga existia, estava perto, era do tipo certo —
> e ninguém contou a elas. A informação que resolveria isso já é da prefeitura.

O número é conferível na própria aplicação, em
**[Diagnóstico da rede](https://desafio-claude-impact-lab-creches.onrender.com/diagnostico)**,
que mostra também a **análise de sensibilidade** (o mesmo cruzamento por três critérios de
proximidade diferentes; adotamos o que o produto de fato executa) e as **premissas declaradas**.

## O que esta ferramenta ataca

Das quatro fases, escolhemos deliberadamente a que **gera impacto no mesmo processo, sem depender
de mudança de sistema na retaguarda**: o momento em que a família escolhe as 5 opções.

Corrigir a escolha na origem devolve efeito para todas as fases seguintes — menos opção inviável,
menos cancelamento na confirmação, menos fila represada em um punhado de unidades enquanto
centenas ficam vazias.

**O que a ferramenta faz:** dá à família o mesmo sinal que a rede já tem.
**O que ela não faz:** não classifica, não pontua, não convoca. Isso é ato administrativo e
precisa de regra determinística e auditável.

## As telas

| Tela | O que resolve |
| --- | --- |
| **[Entrar](https://desafio-claude-impact-lab-creches.onrender.com/)** | Acesso do responsável. Na demonstração, qualquer CPF e qualquer data entram. |
| **[Minhas escolhas](https://desafio-claude-impact-lab-creches.onrender.com/minhas-escolhas)** | A inscrição sendo montada: as 5 vagas do formulário, cada uma com fila, histórico de chamada e faixa de chance. Mostra quantas escolhas ainda sobram — o campo em branco que 9.843 famílias deixaram. |
| **[Escolas](https://desafio-claude-impact-lab-creches.onrender.com/escolas)** | Busca territorial: todas as creches dentro do raio dos pontos de referência da família, com filtro por chance, busca por nome ou bairro e mapa de apoio. Inclusive as lotadas — esconder seria decidir pela família. |
| **Detalhe da unidade** | "Até onde essa creche chamou": barras por ano com quantas crianças a unidade convocou, e o marcador da fila de hoje. Quando o marcador passa das barras, a chamada histórica não alcança quem entra agora. |
| **[Diagnóstico da rede](https://desafio-claude-impact-lab-creches.onrender.com/diagnostico)** | A evidência para a SME: o descompasso, como ele foi medido e o que é premissa. |

### Como o sinal de chance é calculado

Nada de caixa-preta: a regra é pública porque recomendação em serviço público cujo critério
ninguém vê não se sustenta.

- **Profundidade de chamada** = confirmados + cancelados na confirmação. É quantas famílias a
  unidade convocou naquele grupamento e turno, não até que posição da classificação ela desceu.
- **Chance alta** — fila zero, ou fila ≤ 70% da chamada mediana dos últimos 3 anos.
- **Chance média** — fila até 1,3× a chamada mediana. A margem existe porque a fila anda mais
  fundo que o número de vagas: a mediana de não-confirmação da rede é de 24,2%.
- **Chance baixa** — acima disso.
- **Ordenação das sugestões** — proximidade (40%), ociosidade (40%), estabilidade da fila zero
  ao longo dos anos (20%).

## Arquitetura

```
dadoscreche/  (154 MB de CSV oficial, 2021–2025)
      │
      │  node scripts/ingest.mjs      ── roda uma vez, só stdlib do Node
      ▼
web/data/creche.json
      (≈780 KB: 872 unidades, 174 bairros, 8.422 combinações ano × unidade × grupamento × turno)
      │
      ▼
Next.js 16 · App Router · React Server Components · Tailwind v4
   /                 login do responsável
   /minhas-escolhas  as 5 opções da inscrição
   /escolas          busca territorial + mapa estático
   /escolas/[id]     histórico de chamada da unidade
   /diagnostico      evidência e premissas
```

**Decisões que valem defesa técnica:**

- **Sem banco e sem API em runtime.** A ingestão colapsa 837 mil linhas num JSON pequeno; as
  telas são Server Components lendo estrutura já indexada. Deploy trivial, resposta imediata.
- **Estado na URL.** Bairro, grupamento, turno e opções escolhidas vivem na query string — a
  inscrição inteira é compartilhável por link e não depende de sessão.
- **Reprodutibilidade.** Um comando reconstrói o dado do zero a partir dos CSVs originais, e as
  estatísticas do pitch são recalculadas ali, não digitadas à mão.
- **Degradação honesta.** Sem chave do Google Static Maps, a tela mostra o painel de lista em vez
  de quebrar. A lista sempre foi a fonte de verdade; o mapa é apoio.
- **Armadilhas dos dados tratadas** e documentadas em [docs/caminhos-de-implementacao.md](docs/caminhos-de-implementacao.md):
  `Cancelado na confirmacao` vem sem cedilha e sem til na origem; a chave de inscrição é
  `(prm_id, plm_id, ipl_id)` e não `ipl_id` sozinho; a Query D não tem cabeçalho e grava ausência
  como a string `"NULL"`; o código da unidade tem zero à esquerda numa base e não na outra.

## Como o Claude foi usado

**Para construir:** perfilamento das bases do desafio, a camada de ingestão em streaming, a
apuração das evidências, o design system e as telas — e a própria estruturação dos documentos de
decisão em [docs/](docs/) a partir das notas de brainstorm do time.

**Dentro da aplicação, hoje:** nenhuma chamada de modelo em runtime — e isso é uma escolha.
Fila, chance e distância são cálculo determinístico e auditável. Onde o Claude entra no roadmap é
onde ele agrega de verdade: normalizar a régua de pontuação entre processos (24 perguntas
distintas em 5 anos), redigir a convocação por canal em linguagem simples e interpretar a
resposta livre da família para sugerir — nunca decidir — a transição de estado ao operador.

**Limite explícito:** o Claude não ordena a fila, não atribui pontuação e não decide convocação.

## Premissas declaradas

1. A coordenada da unidade é dado real (planilha `Unidades_Unificadas`, join por `DESIGNACAO`).
2. A coordenada da família é o **centróide do bairro** dela: a base é anonimizada e não traz
   lat/long do responsável. Precisão da ordem de ±1 km.
3. Profundidade de chamada = confirmados + cancelados na confirmação. É quantas famílias a
   unidade convocou, não até que posição da classificação ela desceu.
4. A base não traz capacidade por unidade nem carimbo de tempo das transições de convocação.
5. 20 das 872 unidades não têm coordenada própria e herdam o centro do bairro.

## Próximos passos

- **Torre de convocação** — máquina de estados da vaga com prazo visível para família, unidade e
  CRE, trilha de contato registrada e **cascata automática**: confirmou numa unidade, as outras
  quatro são liberadas na hora, em vez de esperar o prazo expirar.
- **Sobre-chamada calibrada** — a taxa de não-confirmação é conhecida por unidade. Numa creche que
  historicamente perde 40%, chamar 10 para 10 vagas é garantir 4 vagas ociosas.
- **Painel de oferta para a CRE** — quantas turmas abrir e onde, cruzando nascidos vivos por
  microárea com capacidade instalada.

## Rodando localmente

```bash
cd web
npm install
npm run dev            # http://localhost:3000
```

O `web/data/creche.json` já está versionado — não é preciso ter as bases originais para rodar.
Para regerar a partir dos CSVs do desafio:

```bash
DADOS=/caminho/para/dadoscreche node scripts/ingest.mjs
```

Opcional: `GOOGLE_MAPS_KEY` em `web/.env.local` habilita o mapa estático em `/escolas`.

## Equipe

Davi Lima · Matheus Anacleto · Pedro Cantanhede

---

<div align="center">

**[desafio-claude-impact-lab-creches.onrender.com](https://desafio-claude-impact-lab-creches.onrender.com/)**

Protótipo de demonstração construído no Claude Impact Lab Rio.
Dados públicos da Secretaria Municipal de Educação do Rio de Janeiro.

</div>
