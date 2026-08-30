# Caminhos de Implementação — Inteligência na Fila da Creche

> Documento de decisão técnica. Traduz o [brainstorming do time](Brainstorming-em-cima-das-ideias-iniciais.md) em sistemas construíveis, com evidência nos dados reais de 2021–2025 e escopo calibrado para o tempo restante.
>
> **Restrição dura:** entrega às 16h30. Este documento assume que sobram ~3h20 de construção. Cada caminho abaixo declara o que cabe nesse prazo e o que fica como "próximo passo" honesto no pitch.

---

## 1. O que os dados já provam

Números apurados diretamente nas bases do desafio (`01_QueryA_InscricoesPorAno.csv.gz`, processo 195 / ano 2025, salvo indicação). Servem para escolher o caminho e, depois, como munição de pitch — não são estimativas, são contagens.

| # | Evidência (2025) | Número | Dor do brainstorm que confirma |
| --- | --- | --- | --- |
| 1 | Unidades com **fila de espera zero** | **359 de 836 (43%)** | "Ano pode começar com vagas ociosas" |
| 2 | Concentração da fila | **81 unidades (9,7%) detêm 11.763 dos 16.345 da fila = 72%** | "Vira uma fila de preferência, não de ausência de vaga" |
| 3 | **Não-confirmação** após seleção (`Cancelado na confirmacao`) | mediana **24,2%** por unidade; p90 **43,3%**; máximo **74,4%** | "Não localizar família retira o candidato"; convocação manual sem rastreio |
| 4 | Unidades que perdem **mais de 30%** das convocações | **284 de 801** (com volume ≥ 20) | Mesma acima — e mostra que o problema é sistêmico, não pontual |
| 5 | Crianças que terminaram o processo **sem nenhuma vaga** | **14.219 de 62.899 (22,6%)** | A fila represada |
| 6 | Crianças com **inscrição duplicada** | **8.009 (12,7%)**, gerando 9.050 inscrições excedentes | "Possível solução para multi-inscrição = CPF do responsável" |
| 7 | Crianças inscritas em **mais de um polo/CRE** | **4.869** | Escolhas sem critério territorial |
| 8 | Média de opções usadas por criança | **2,54 de 5** (24.096 crianças usam só 1; apenas 10.994 usam as 5) | "Opções inviáveis pra eles e cancelamentos futuros" |
| 9 | **Reincidência** — criança que volta em outro ano | **34.486 crianças** em 2+ processos (13,3% de 259.924 distintas, 2021–2025) | "Ele vai voltar a pedir" |
| 10 | Queda da fila de espera | 34,5% das opções (2021) → **10,2%** (2025) | O processo melhorou; o gargalo migrou para a **confirmação** |

**Leitura conjunta — a tese do projeto:**

> A fila não é (só) escassez. Em 2025, **43% das unidades não tinham ninguém esperando** enquanto **72% da fila se concentrava em 81 unidades**, e **1 em cada 4 convocações não virou matrícula**. Existe vaga; ela está no lugar errado, e a ponte entre a vaga e a família quebra na convocação.

Isso muda o alvo: o maior ganho de curto prazo **não** está em prever demanda (caminho lento, resultado anual) — está em **converter convocação em matrícula** e em **redirecionar demanda para capacidade ociosa próxima** (resultado imediato, mensurável no mesmo processo).

---

## 2. Mapa: dores → sistemas candidatos

As dores do brainstorm se agrupam em quatro blocos. Cada bloco admite um sistema distinto:

```
FASE            DOR PRINCIPAL                          SISTEMA CANDIDATO
─────────────────────────────────────────────────────────────────────────────
Planejamento    oferta baseada no ano anterior;        [A] Painel de Oferta
da oferta       vaga ociosa x fila represada               (analítico / CRE)

Inscrição       5 opções sem critério territorial;     [D] Copiloto da Família
                escolha inviável → cancelamento             (front do responsável)
                dado de contato desatualizado

Classificação   1 classificação por opção, não          [B] Motor de Alocação
                por criança; escola classifica              (algoritmo central)
                internamente; régua muda todo ano

Convocação      3 dias, contato manual 1x/dia,         [C] Torre de Convocação
                sem rastreio, sem visibilidade de           (workflow / operação)
                prazo; outras unidades não sabem
```

Um quinto caminho, **[E]**, combina B+C em um só produto — é a aposta integrada.

---

## 3. Camada comum (obrigatória em qualquer caminho)

Antes de escolher, existe um núcleo que **todos** os caminhos consomem. Construir isso primeiro é o que permite trocar de caminho no meio sem perder trabalho.

**`core/` — núcleo de dados**

1. **Ingestão** das 5 fontes: Query A (opções), Query B (respostas socioeconômicas), Query C (régua de pontuação), Query D (endereços) e `Unidades_Unificadas_com_Localizacao.xlsx` (LATITUDE/LONGITUDE, CRE, microárea).
2. **Tabela-fato única por (criança, processo, unidade, opção)** com situação normalizada.
3. **Dimensão de unidade** enriquecida: código, nome, CRE, bairro, lat/long, capacidade observada, fila, taxa histórica de não-confirmação.
4. **Métricas derivadas** — as três que sustentam todo o produto:
   - `fila_efetiva(unidade, grupamento, turno)`
   - `taxa_nao_confirmacao(unidade)` — histórico 2021–2025
   - `distancia(responsavel, unidade)` via CEP/bairro → lat/long

**Recomendação de ferramenta:** DuckDB lendo os `.gz` direto (`SELECT * FROM read_csv_auto('...csv.gz', delim=';')`). Não precisa descompactar, não estoura RAM na Query B (4,36M linhas / 436 MB) e materializa um `.duckdb` de poucos MB que a aplicação carrega instantaneamente. Alternativa sem instalar nada: pandas com `chunksize` na Query B; a Query A (837k linhas) cabe na memória inteira.

> **Artefato de saída:** um `creche.duckdb` (ou `.parquet`) versionado no repo, com 4–6 tabelas prontas. A partir daí, nenhuma tela precisa reprocessar CSV.

---

## 4. Os caminhos

### [A] Painel de Oferta — planejamento para a CRE

**O que é.** Um painel por CRE/território que responde "quantas vagas abrir e onde", substituindo a heurística "repete o ano anterior". Mostra, por unidade × grupamento × turno: fila efetiva, capacidade ociosa, tendência 5 anos, e demanda potencial não atendida no entorno.

**Dor que resolve.** "Planejamento se baseia no ano anterior"; "que dados podem ser utilizados para prever o comportamento futuro da demanda".

**Dados.** Query A (série 2021–2025) + `NascidosvivosRJ.xlsx` (coorte que vai demandar creche nos próximos anos) + microáreas (shapefile do IPP) + lat/long.

**Modelo.** Não precisa de ML sofisticado para ter valor: demanda por microárea = nascidos vivos defasados × taxa histórica de procura da microárea, confrontada com capacidade instalada. Uma regressão simples ou até média móvel ponderada já supera a prática atual.

**Papel do Claude.** Copiloto de consulta: gestor pergunta em linguagem natural ("quais unidades da CRE 4 têm fila zero em berçário integral?") e o Claude gera a consulta sobre o `duckdb`, devolve tabela + leitura em texto.

**Esforço:** alto (o valor está na qualidade do modelo preditivo). **Risco:** o resultado é uma recomendação anual — difícil de demonstrar impacto ao vivo em 6 minutos. **Demo:** mapa de calor + tabela de recomendação de abertura/fechamento de turmas.

---

### [B] Motor de Alocação — classificação única, centrada na criança

**O que é.** Substitui "uma classificação por opção, executada por cada unidade" por **uma alocação central única por criança**, no espírito de *deferred acceptance* (Gale–Shapley): a criança tem uma pontuação e uma ordem de preferência; a unidade tem capacidade; o algoritmo produz uma alocação estável em que ninguém recebe duas ofertas simultâneas e ninguém fica preso esperando prazo alheio.

**Dor que resolve.** Todo o bloco de classificação do brainstorm: "a classificação precisa estar atrelada ao CPF e não a cada creche"; "as escolas não podem ficar com a atividade de classificação interna"; "quando o candidato for selecionado por uma unidade, as outras têm que ser automaticamente canceladas"; e a pergunta em aberto — "como balancear isso com a prioridade por opção" (o algoritmo resolve exatamente isso: a preferência do responsável entra como ordem, não como pontuação).

**Evidência que o justifica.** As 8.009 crianças com inscrição duplicada e as 4.869 em múltiplos polos são casos que um índice único por criança elimina na origem.

**Prova de valor (o diferencial deste caminho).** É possível **replicar o processo de 2025 e comparar**: rodar o motor sobre as inscrições reais e medir quantas das 14.219 crianças que ficaram sem vaga teriam sido alocadas, e quanto cairia a lacuna. Um número do tipo *"o mesmo conjunto de vagas de 2025 teria atendido +X mil crianças"* é a peça mais forte possível para o critério Impacto Real.

**Papel do Claude.** **Não** classifica — a ordenação precisa ser determinística e auditável (é ato administrativo). O Claude entra para **normalizar a régua entre anos**: a Query C tem 24 perguntas distintas em 5 anos, só 3 das 13 de 2023 sobrevivem em 2024, e os pesos foram reescalonados. Casar perguntas semanticamente equivalentes entre processos é tarefa de texto onde o modelo agrega valor real, com o resultado revisável em tabela.

**Esforço:** médio-alto. **Risco:** capacidade real por unidade não está explícita nas bases — precisa ser estimada (ex.: matrículas confirmadas históricas como proxy) e isso deve ser declarado como premissa. **Demo:** simulação lado a lado — "processo real 2025" vs. "com motor de alocação".

---

### [C] Torre de Convocação — do sorteio à matrícula

**O que é.** A camada operacional que hoje não existe: máquina de estados da vaga, com prazo visível para os três lados (família, unidade, CRE), contato multicanal registrado e cascata automática de cancelamento das demais opções.

**Dor que resolve.** O bloco inteiro de convocação: "processo extremamente manual, 1x por dia durante 3 dias"; "quem garante que esse processo é feito corretamente?"; "fila sem visibilidade de prazo"; "as outras creches não têm essa informação e aguardam até a expiração"; "o diretor fica onerado".

**Evidência que o justifica.** É o caminho com o maior número em jogo: **mediana de 24,2% de não-confirmação por unidade**, com 284 unidades acima de 30% e casos de 74,4%. Cada ponto percentual recuperado é matrícula efetivada no mesmo processo.

**Componentes.**
1. **Máquina de estados** explícita — `Inscrito → Classificado → Selecionado → (Confirmado | Expirado | Recusado)` — com carimbo de tempo em cada transição e prorrogação de 1 dia útil justificada.
2. **Painel do diretor**: fila da unidade, quem foi convocado, quanto tempo resta (contagem regressiva em dias úteis), quem já confirmou em outra unidade.
3. **Trilha de contato**: cada tentativa (telefone/e-mail/WhatsApp/SMS) registrada com canal, horário e resultado — resolve "quem garante que o processo é feito corretamente".
4. **Cascata automática**: confirmou em uma unidade → as demais opções são liberadas na hora, devolvendo a vaga à fila sem esperar 3 dias.
5. **Convocação com sobre-chamada calibrada** *(o ângulo original)*: como a taxa de não-confirmação é conhecida **por unidade**, convoca-se N + margem em vez de N, no mesmo princípio de overbooking aeronáutico — com teto conservador e fila de contingência. Numa unidade com 40% de perda histórica, chamar 10 para 10 vagas é garantir 4 vagas ociosas.

**Papel do Claude.** (i) Redige a mensagem de convocação por canal, em linguagem simples, com prazo e documentos explícitos; (ii) interpreta a resposta livre da família ("posso ir só quinta") e sugere a transição de estado ao operador; (iii) resume para o diretor o que exige ação hoje.

**Esforço:** médio — é sobretudo CRUD bem feito + regras de prazo. **Risco:** é o caminho que mais depende de UI; sem tela boa, não convence no critério Produto. **Demo:** excelente ao vivo — relógio correndo, confirmação em uma unidade, as outras quatro liberando na hora.

---

### [D] Copiloto da Família — front do responsável

**O que é.** A tela pública que hoje é só consulta de status vira orientação ativa: posição real na fila, prazo visível, e **recomendação de unidades com chance real** dentro de um raio dos pontos de referência declarados.

**Dor que resolve.** "O candidato vê no site da matrícula mas perde a vaga pela rotina"; "escolhas inviáveis e cancelamentos futuros"; "dados de contato desatualizados"; "como disponibilizar para os responsáveis a questão da fila represada".

**Evidência que o justifica.** As famílias usam em média **2,54 das 5 opções** — e 24.096 usam **apenas uma**. Elas não estão gastando as opções que têm, muitas vezes concentrando-se justamente nas 81 unidades que detêm 72% da fila. Ao mesmo tempo, 359 unidades estão com fila zero. A recomendação territorial ataca os dois lados da mesma moeda.

**Funcionalidades.**
- **Posição na fila com contexto**: "você é o 87º; nos últimos 3 anos esta unidade chamou até o 40º".
- **Sugestão de alternativa viável**: "a 1,8 km existe unidade com fila zero em berçário integral" — computável hoje com lat/long + fila por unidade.
- **Regra de raio** (proposta do brainstorm): residência comprovada + 1 ponto de referência opcional; opções limitadas a X km. Isso reduz na origem as escolhas inviáveis.
- **Atualização de contato** por lembrete periódico (WhatsApp/e-mail) com máquina de status — combate o dado defasado em 6 meses.
- **Envio de documentação online** dos critérios de vulnerabilidade, eliminando o "ir no dia seguinte". *(A consultora da prefeitura sinalizou abertura para isso, com a ressalva de garantir o uso da vaga — endereçável exigindo confirmação ativa da família mesmo com documento digital.)*

**Papel do Claude.** Explica em linguagem natural a situação da família a partir de números já calculados — nunca inventando posição ou prazo. O padrão correto é: o sistema calcula, o Claude redige.

**Esforço:** baixo-médio para a versão de recomendação (é um join + haversine). **Risco:** sozinho, não muda o processo de retaguarda — pode ser lido como "só uma tela". **Demo:** muito boa emocionalmente; é a tela que a família veria.

---

### [E] Plataforma integrada — B + C (recomendado)

**O que é.** Um só produto que fecha o ciclo: **classificação única centrada na criança** (B) alimentando a **torre de convocação com sobre-chamada calibrada** (C), com uma tela do responsável enxuta (o essencial de D) para dar rosto ao impacto.

**Por que este.** Alinha-se ao enunciado do desafio — "em que ordem chamar a fila e como garantir que a família chegue à vaga dentro do prazo" — e é o único recorte que produz **as duas provas ao mesmo tempo**: o ganho contrafactual sobre 2025 (número forte) e a demo operacional ao vivo (produto tangível). O planejamento de oferta [A] entra como o "próximo passo" honesto no pitch, já embasado pelos dados que a camada comum expõe.

---

## 5. Comparativo de decisão

| | Impacto (peso 40) | Produto (20) | Engenharia (20) | Ideia (10) | Cabe em 3h20? |
| --- | --- | --- | --- | --- | --- |
| **[A]** Painel de Oferta | Alto, mas anual | Médio | Alto | Médio | Parcial |
| **[B]** Motor de Alocação | **Muito alto** (contrafactual) | Baixo isolado | **Muito alto** | **Alto** | Sim, sem UI rica |
| **[C]** Torre de Convocação | **Muito alto** (imediato) | **Muito alto** | Médio | Alto (sobre-chamada) | Sim |
| **[D]** Copiloto da Família | Médio-alto | **Muito alto** | Médio | Médio | Sim |
| **[E]** B + C integrado | **Muito alto** | Alto | Alto | **Alto** | Apertado — ver corte |

---

## 6. Escopo em degraus (corte por tempo)

Construir nesta ordem. Cada degrau é entregável sozinho — se o tempo acabar, o que existe já se apresenta.

| Degrau | Entrega | Tempo | Por que primeiro |
| --- | --- | --- | --- |
| **0** | Camada comum: `creche.duckdb` + as 3 métricas derivadas | 40 min | Sem isso nenhum caminho anda |
| **1** | **Diagnóstico**: as 10 evidências da seção 1 como tela navegável (mapa + ranking de descompasso) | 40 min | Já é um produto defensável; é a abertura do pitch |
| **2** | **Motor de alocação** rodando sobre 2025 + número contrafactual | 50 min | O número que ganha o critério Impacto Real |
| **3** | **Torre de convocação**: máquina de estados + painel do diretor + cascata automática | 60 min | A demo ao vivo |
| **4** | **Sobre-chamada calibrada** por taxa histórica da unidade | 20 min | O diferencial de ideia; é um parâmetro sobre o degrau 3 |
| **5** | Tela do responsável com posição + alternativa próxima | 30 min | O rosto humano do pitch |
| **6** | Claude embutido (explicação/redação de convocação) | 20 min | Requisito de README; some se faltar tempo |

**Ponto de não-retorno:** às **15h50**, congelar código. Os 40 minutos finais são para README obrigatório (nome da equipe, membros, resumo, arquitetura, como o Claude atua, links, vídeo de 60s se não houver URL pública), commit e envio para `eventos@taicor.ai` com o número do grupo no assunto e no corpo.

---

## 7. Arquitetura técnica sugerida

Otimizada para tempo de construção e para o critério "caminho claro para produção".

```
┌─────────────────────────────────────────────────────────┐
│  FRONT                                                  │
│  Next.js (App Router) — 3 rotas:                        │
│   /diagnostico  · mapa + descompasso oferta x fila      │
│   /cre          · torre de convocação (diretor/CRE)     │
│   /familia      · posição na fila + alternativas        │
└───────────────────────┬─────────────────────────────────┘
                        │  JSON
┌───────────────────────▼─────────────────────────────────┐
│  API  (Next route handlers ou FastAPI)                  │
│   /api/alocacao      · executa o motor                  │
│   /api/convocacao    · transições da máquina de estados │
│   /api/explicar      · chamada ao Claude (texto)        │
└───────────────────────┬─────────────────────────────────┘
┌───────────────────────▼─────────────────────────────────┐
│  NÚCLEO                                                 │
│   DuckDB (creche.duckdb, gerado no build)               │
│   motor de alocação (Python puro, determinístico)       │
│   SQLite/Postgres para o estado vivo da convocação      │
└─────────────────────────────────────────────────────────┘
```

**Decisões que valem nota em Engenharia:**
- **Separar o determinístico do generativo.** Classificação, alocação e prazo são código auditável. O Claude só explica, redige e normaliza texto. Em serviço público, um ranking que um modelo não consegue justificar de forma reprodutível é insustentável — dizer isso explicitamente no pitch é ponto ganho, não perdido.
- **Reprodutibilidade**: um comando reconstrói o `.duckdb` do zero a partir dos CSVs originais.
- **Estado vivo separado do histórico**: o analítico é read-only sobre 2021–2025; a convocação escreve em banco próprio.
- **Tudo com semente fixa** na simulação, para que o número contrafactual seja o mesmo em qualquer máquina.

---

## 8. Modelo de dados mínimo

```
crianca(id_anon, nascimento_anomes, sexo, responsavel_anon)
responsavel(id_anon, cep, bairro, lat, long)      -- derivado do CEP
unidade(esc_codigo, nome, cre, bairro, lat, long, microarea,
        capacidade_estimada, taxa_nao_confirmacao_hist)
inscricao(prm_id, plm_id, ipl_id, ano, crianca_id, data_criacao)
opcao(inscricao_pk, ordem 1..5, unidade, grupamento, horario, situacao)
pontuacao(inscricao_pk, pontos_normalizados, criterios_desempate[])
-- estado vivo:
convocacao(id, crianca_id, unidade, estado, prazo_fim,
           tentativas_contato[], criado_em, decidido_em)
```

**Máquina de estados da convocação** (o coração do caminho C):

```
Inscrito ──classificação──▶ Classificado ──oferta──▶ Selecionado
                                                        │
                            ┌───────────────────────────┼──────────────┐
                            ▼                           ▼              ▼
                       Confirmado                  Expirado        Recusado
                            │                       (3 dias         │
                            │                       úteis +1        │
                            ▼                       justificado)    ▼
              cascata: demais opções ──────────────────────▶ vaga devolvida
              da mesma criança → Liberado                    à fila (imediato)
```

A regra que resolve a dor mais citada: **a transição para `Confirmado` dispara, na mesma transação, a liberação das outras 4 opções** — hoje elas ficam bloqueadas até expirar o prazo.

---

## 9. Armadilhas dos dados (verificadas)

Erros que custam tempo ou produzem número errado no pitch. Todos conferidos nas bases:

1. **`ipl_id` não é único sozinho.** Em 2025 há 10.780 valores distintos de `ipl_id` para 71.949 inscrições reais — a chave é **`(prm_id, plm_id, ipl_id)`**. Contar por `ipl_id` subestima em ~6,7×. Os 11 `plm_id` correspondem às 11 CREs.
2. **A régua de pontuação não é comparável entre anos.** `perg_id = 2` ("A criança tem alguma deficiência?") valia 100 pontos de 2021 a 2023 e passou a **25** em 2024; das 13 perguntas de 2023, só 3 seguem em 2024. Série temporal sem normalizar sai errada.
3. **Query D não tem cabeçalho.** Ler com `header=None`, senão perde-se a primeira unidade. Ausências vêm como a **string** `"NULL"` — usar `na_values=["NULL"]`. 21 das 2.188 unidades estão sem `esc_codigo`.
4. **Lat/long junta por nome, não por código.** `Unidades_Unificadas_com_Localizacao.xlsx` traz `DESIGNACAO, CRE, microárea, DENOMINACAO, RUA, BAIRRO, LATITUDE, LONGITUDE, Tipo` — mas sem `esc_codigo`. O casamento com a Query A precisa ser por nome normalizado; reservar tempo para conferir a taxa de acerto e tratar os não-casados.
5. **`Cancelado na confirmacao`** — grafado sem cedilha e sem til. Filtro com acento não retorna nada.
6. **Query B não abre no Excel**: 4.357.119 linhas, acima do teto de 1.048.576 — abriria truncada **sem aviso**. Usar DuckDB, ou pandas com `chunksize`.
7. **A Query A já vem filtrada**: `Excluído` e `Bloqueado` foram removidos na origem, mas os **cancelamentos permanecem**. Não filtrar de novo achando que são resíduo.
8. **Encoding**: separador `;` e UTF-8 **com BOM** — ler com `encoding='utf-8-sig'`.
9. **`Cancelado pelo sistema` (44,1% em 2025)** é majoritariamente a baixa automática das demais opções quando uma é confirmada. Tratar como "cancelamento" no numerador infla qualquer taxa de perda.
10. **Capacidade por unidade não é dado explícito.** Precisa ser estimada (matrículas confirmadas históricas, ou as planilhas de `OferecimentosEvagas/`) e declarada como premissa — nunca apresentada como fato.

---

## 10. Como o Claude entra (requisito de README)

Separar as duas perguntas que o README exige:

**Como o Claude foi usado para construir.** Exploração e perfilamento das bases, geração da camada de ingestão, implementação do motor de alocação, e a própria estruturação deste documento a partir das notas de brainstorm do time.

**Como o Claude atua dentro da aplicação.**

| Uso | Onde | Por que o modelo agrega |
| --- | --- | --- |
| Normalizar a régua entre processos | build-time | Casar 24 perguntas distintas em 5 anos é tarefa de semântica textual; resultado sai em tabela revisável |
| Redigir a convocação por canal | Torre (C) | Linguagem simples, prazo e documentos explícitos, adaptado ao canal |
| Interpretar resposta livre da família | Torre (C) | "posso ir só quinta" → sugere transição de estado ao operador, que decide |
| Explicar a situação à família | Front (D) | Traduz posição, prazo e alternativa a partir de números já calculados |
| Copiloto de consulta da CRE | Painel (A) | Pergunta em linguagem natural → consulta sobre o `duckdb` → tabela + leitura |

**Limite explícito:** o Claude **não** ordena a fila, não atribui pontuação e não decide convocação. Essas são decisões administrativas que exigem regra determinística, reprodutível e auditável.

---

## 11. Ganchos para o pitch (6 minutos)

1. **Abertura com o paradoxo, não com a tela.** "Em 2025, 43% das creches do Rio não tinham ninguém na fila. Ao mesmo tempo, 14.219 crianças terminaram o processo sem vaga nenhuma."
2. **O gargalo escondido.** "Uma em cada quatro convocações não vira matrícula. Em 284 unidades, mais de 30% se perdem. Não é falta de vaga — é a ponte quebrando no fim."
3. **Demo ao vivo** (o degrau 3): confirmação em uma unidade liberando as outras quatro na hora — contra os 3 dias de espera de hoje.
4. **O número contrafactual** (o degrau 2): "com as mesmas vagas de 2025, o motor teria alocado +X crianças".
5. **Honestidade final.** O que roda hoje, o que é premissa (capacidade estimada), e o que viria a seguir (o painel de planejamento [A], já embasado nos dados que a camada comum expõe).

---

## 12. Perguntas ainda abertas

Ficam registradas para validar com a consultora da prefeitura ou declarar como premissa no pitch:

- **Capacidade real por unidade/grupamento/turno** existe em sistema? (Determina se [A] e [B] usam dado ou estimativa.)
- **Confirmação presencial é exigência legal ou prática?** A consultora sinalizou abertura para WhatsApp, com a ressalva de garantir o uso da vaga — o precedente do ensino superior (documentação 100% online) foi citado como referência.
- **Sobre-chamada calibrada** tem respaldo administrativo? Convocar acima do número de vagas exige regra publicada e fila de contingência.
- **Regra de raio** (X km do ponto de referência) — qual X, e como tratar quem trabalha longe de casa? O brainstorm já propõe o 2º ponto de referência opcional como resposta.
- **`matricula.rio`** — a solução se integra ao portal existente ou o substitui na jornada da família?
