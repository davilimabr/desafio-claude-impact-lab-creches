# Caminho D — Copiloto da Família: especificação e POC

> Detalhamento do caminho **[D]** de [caminhos-de-implementacao.md](caminhos-de-implementacao.md), como **produto principal** — não como tela acessória do caminho [C].
> Escrito às 13h50. Restam ~2h40 até a entrega (16h30) e ~2h até o congelamento às 15h50. A seção 8 dimensiona a POC para caber nesse prazo.

---

## 1. O diagnóstico, afiado

O caminho D nasceu com uma fraqueza declarada no documento de decisão: *"sozinho, não muda o processo de retaguarda — pode ser lido como 'só uma tela'"*. Esta seção existe para destruir essa objeção com número.

Apurei nas bases o cruzamento que o caminho D — e só ele — sabe fazer: **cruzar o endereço do responsável com a ociosidade da rede.** A Query A traz `CEP` e `bairro` **do responsável** (nulos em apenas 2,83% das 837.179 linhas). A Query D traz o bairro de cada unidade e casa **872/872** com a Query A por `esc_codigo`. Ou seja: dá para responder, criança a criança, *"havia vaga perto de casa que essa família não pediu?"*

### 1.1 O número

Das **14.219 crianças que terminaram o processo de 2025 sem nenhuma vaga**:

| Recorte | Crianças | % do total sem vaga |
| --- | ---: | ---: |
| Tinham, **no próprio bairro**, unidade que fechou 2025 com **fila zero** e que não escolheram | **10.340** | **72,7%** |
| Idem, exigindo ainda o **mesmo grupamento e o mesmo turno** que a família buscava | **8.822** | **62,0%** |
| Destas, as que ainda tinham **opção sobrando** (usaram menos de 5) | **7.262** | 51,1% |

> **8.822 crianças ficaram sem creche em 2025 tendo, no próprio bairro, uma vaga do exato grupamento e turno que procuravam — numa unidade que terminou o ano sem ninguém na fila.** Sete mil delas ainda tinham opções não usadas no formulário.

O recorte estrito (mesmo bairro + mesmo grupamento + mesmo turno) é deliberadamente conservador: não conta bairro vizinho, não conta unidade a 800 m do outro lado da divisa, não conta turno alternativo. O número real é maior. **8.822 é o piso.**

Em média, cada uma dessas crianças tinha **8,03 unidades ociosas** no próprio bairro que não escolheu.

### 1.2 Por que isso acontece — as opções não gastas

A rede oferece 5 opções por criança. Em 2025:

| Opções usadas | Crianças |
| ---: | ---: |
| 1 | 24.096 |
| 2 | 11.566 |
| 3 | 9.903 |
| 4 | 5.446 |
| 5 | 11.888 |

**24.096 crianças (38%) apostaram tudo em uma única unidade.** E entre as 14.219 que ficaram sem nada, **11.260 (79%) usaram menos de 5 opções**. Não é que a rede não deu escolha — é que a família não tinha como saber o que escolher.

Hoje o portal responde *"você está na fila"*. Não responde *"essa fila anda?"* nem *"onde há fila que anda?"*. A informação que resolveria isso **já existe na base da SME** — só nunca foi devolvida a quem precisa dela.

### 1.3 O caso que é a demo inteira

Bairro **ITANHANGÁ**, Maternal II Integral, processo de 2025 — duas unidades, o mesmo bairro:

| | EDI ESCRITORA CLARICE LISPECTOR (0716812) | CM EDSON LUIZ (0724604) |
| --- | ---: | ---: |
| Confirmados | 25 | 15 |
| **Lista de espera** | **235** | **0** |
| Não-confirmações | 19 | 7 |
| Convocações feitas (conf + não-conf) | **44** | 22 |
| Fila em 2021 · 2022 · 2023 · 2024 | — | 82 · 40 · 56 · **0** |

A família que era a **100ª** na fila da Clarice Lispector nunca teve chance: a unidade chamou 44 pessoas no ano inteiro. No mesmo bairro, no mesmo grupamento e no mesmo turno, o CM Edson Luiz **não tinha ninguém esperando** — e vinha esvaziando desde 2021.

> ⚠️ **Números apurados vs. ilustrativos.** Tudo nesta seção (filas, confirmados, convocações, os 8.822) foi contado direto nas bases e é citável no pitch. **As distâncias em quilômetros nos mockups da seção 6 e no roteiro da seção 9 ainda são ilustrativas** — o lat/long existe e casa (seção 4), mas o haversine só roda no P0. Trocar pelos valores reais assim que o P0 fechar; até lá, falar "no mesmo bairro", que é fato verificado.

Ninguém contou isso a essa família. É exatamente o que o Copiloto conta.

### 1.4 O achado meta: a informação existe e não é devolvida

Vale o mesmo espírito do achado do caminho C (*"hoje o processo é inauditável"*), aplicado ao outro lado do balcão:

> A SME sabe, por unidade, grupamento e turno, quantas famílias chamou em cada um dos últimos 5 anos e quantas ficaram esperando. **A família recebe zero desse conhecimento no momento em que ele importa — na hora de preencher as 5 opções.** A assimetria de informação não é falta de dado; é falta de devolução.

Isso reposiciona o caminho D. Não é "uma tela bonita para a família". É **redistribuição de informação pública que já foi coletada com dinheiro público** — e é o único caminho que ataca a fila *antes* dela se formar, na inscrição, e não depois, na convocação.

---

## 2. Os três mecanismos

### M1 — Profundidade de chamada: transformar posição em probabilidade

**A dor.** *"O candidato consegue ver no site da matrícula"* — vê a posição, um número sem escala. Ser o 100º pode ser ótimo ou impossível; a família não tem como saber.

**A regra.** Para cada slot `(unidade, grupamento, turno)` e cada ano, a base permite calcular:

```
profundidade_de_chamada(slot, ano) = Confirmado + Cancelado na confirmacao
```

É literalmente **quantas famílias aquela unidade convocou** naquele slot naquele ano — as que aceitaram e as que não. Para a Clarice Lispector / Maternal II / Integral / 2025: `25 + 19 = 44`.

A tela então diz, com números reais e nenhuma modelagem:

> Você é o **100º** nesta fila.
> Nos últimos 3 anos, esta unidade chamou até aproximadamente o **44º**, **38º** e **51º**.
> **Sua chance aqui é baixa.**

Note o que isso **não** é: não é previsão, não é ML, não é o Claude opinando. É uma contagem histórica devolvida com contexto. É auditável linha a linha — o que importa em serviço público.

**Classificação de chance** (três faixas, deliberadamente grosseiras para não fingir precisão):

| Faixa | Regra | Rótulo na tela |
| --- | --- | --- |
| Alta | `posição ≤ 0,7 × mediana(profundidade, 3 anos)` | 🟢 Chance alta |
| Média | `posição ≤ 1,3 × mediana` | 🟡 Chance média |
| Baixa | acima disso | 🔴 Chance baixa |

O fator 1,3 não é arbitrário: a mediana de não-confirmação da rede é 24,2%, então a fila anda mais fundo do que o número de vagas sugere. Declarar essa margem é honestidade, não chute.

### M2 — Recomendação territorial: o motor de vagas ociosas

**A dor.** *"Podem escolher até 5 unidades em qualquer região sem critério de distância ou território. Isso resulta em opções inviáveis pra eles e cancelamentos futuros."*

**A regra.** Dado o endereço do responsável e o slot buscado `(grupamento, turno)`, ordenar as unidades candidatas por:

```
score(unidade) = w1 · proximidade(família, unidade)
               + w2 · ociosidade(slot)
               + w3 · estabilidade(slot)
```

onde:

- `proximidade` — distância haversine normalizada, com teto no raio configurado (padrão 3 km);
- `ociosidade` = `1 - fila(slot) / max(1, profundidade_de_chamada(slot))` — quanto a unidade cabe além de quem já espera;
- `estabilidade` = fração dos últimos 3 anos em que o slot terminou com fila baixa — evita recomendar uma unidade que zerou por acaso em um ano.

Pesos iniciais `0,4 / 0,4 / 0,2`, **expostos em um arquivo de configuração e citados no pitch**. Um score cujos pesos ninguém consegue ver não é recomendação pública, é caixa-preta.

**A saída na tela é uma frase, não um ranking:**

> No mesmo bairro, a **1,2 km**, o **CM EDSON LUIZ** tem Maternal II Integral com **fila zero** — e vem sem fila há 2 anos.
> **[ Adicionar como minha 3ª opção ]**

O botão é o produto inteiro. Recomendação sem ação de um clique é conteúdo, não solução.

### M3 — Regra de raio e o segundo ponto de referência

Proposta que vem direto do brainstorm: *"o candidato irá definir 1 ponto de referência além do seu ponto fixo (a residência)... só poderá escolher unidades em um raio de X km"*.

A implementação correta **não é bloquear** — é **avisar**. Bloquear escolha em serviço público exige norma; avisar exige só honestidade:

```
┌──────────────────────────────────────────────────────┐
│ ⚠  Esta unidade fica a 14 km da sua residência e a   │
│    11 km do seu ponto de referência.                 │
│    Famílias que escolheram unidades a mais de 10 km  │
│    tiveram taxa de não-confirmação de XX% em 2025.   │
│    [ Escolher mesmo assim ]   [ Ver alternativas ]   │
└──────────────────────────────────────────────────────┘
```

O segundo ponto de referência (trabalho, casa da avó) responde à objeção óbvia — *"e quem trabalha longe de casa?"* — e é opcional. O raio é **configurável por CRE**, não fixo em lei do produto.

**A trava de contato**, do mesmo bloco de dores (*"dados desatualizados caso o tempo seja grande (6 meses)"*): a tela pede reconfirmação de telefone/e-mail a cada acesso, com carimbo de `contato_confirmado_em`. Uma máquina de status de 3 estados (`fresco < 90d`, `envelhecendo`, `vencido > 180d`) alimenta o lembrete por WhatsApp/e-mail. Barato de construir, e ataca a causa direta de "não localizar a família" que o caminho C mede em 11.981 perdas reais.

---

## 3. Onde o Claude entra — e onde não entra

A fronteira é a mesma do caminho C, invertida para o lado da família:

| | Quem faz |
| --- | --- |
| Calcular posição, profundidade de chamada, distância, score | **Código determinístico.** Sempre. |
| Escolher qual alternativa recomendar | **Código determinístico** (o score de M2), com pesos visíveis |
| **Explicar** a situação em linguagem que a família entende | **Claude** |
| **Traduzir** o jargão da rede (grupamento, polo, CRE, situação) | **Claude** |
| Responder pergunta livre da família sobre o próprio caso | **Claude**, restrito aos números já calculados |

O prompt recebe um JSON fechado — posição, profundidade histórica, distância, fila da alternativa — e a instrução explícita de **nunca produzir número que não esteja no JSON**. Se o dado não veio, a resposta é "não tenho essa informação".

> **A frase para o pitch:** o sistema calcula, o Claude traduz. Um modelo que inventa a posição de uma criança na fila de creche não é um bug de produto — é um dano a uma família real.

Isso vale ponto no critério Engenharia exatamente por ser uma restrição autoimposta, e é o mesmo princípio já registrado na seção 10 do documento de decisão.

---

## 4. Geografia — a armadilha nº 4 do documento de decisão está errada

O [documento de decisão](caminhos-de-implementacao.md) registra, na seção 9, que *"lat/long junta por nome, não por código... `Unidades_Unificadas_com_Localizacao.xlsx` traz `DESIGNACAO, CRE, microárea, DENOMINACAO...` — mas sem `esc_codigo`. O casamento com a Query A precisa ser por nome normalizado"*.

**Abri a planilha e testei: `DESIGNACAO` é o código.** Vem sem o zero à esquerda que a Query A usa — `101501` na planilha é `0101501` na Query A. O casamento é `TrimStart('0')`, uma linha de código, e não precisa de normalização de nome nenhuma:

| Métrica | Resultado |
| --- | ---: |
| Unidades de 2025 com lat/long **por código** | **820 / 836 = 98,1%** |
| Cobertura por **volume de opções** de 2025 | **98,2%** |
| Linhas da planilha com coordenada preenchida | 1.941 / 1.941 (**nenhuma nula**) |
| Não casadas | **16** |

As 16 não casadas são todas creches parceiras (`CP ...`) e **todas as 16 constam na segunda aba (`Planilha1`)**, que traz endereço com CEP, bairro, microárea e polo — mas não traz coordenada.

**Consequência para o plano:** distância vira dado real, não aproximação. O haversine roda entre coordenadas de verdade para 98% da rede. Reservar 20 minutos para o casamento por nome — que era o risco declarado — deixa de ser necessário.

### 4.1 O que ainda é aproximado: a ponta da família

Continua não existindo lat/long **da família** — a Query A dá `CEP` e `bairro` do responsável (2,83% nulos), e geocodificar 62 mil CEPs numa API externa está fora (tempo, e a regra do desafio proíbe uso indevido de sistemas da cidade).

A solução, agora aplicada só a esse lado:

- **Centróide de bairro**, calculado a partir das coordenadas reais das unidades daquele bairro. A família herda o centróide do seu bairro; o haversine passa a existir para toda família, sem geocodificador e sem chamada externa.
- Precisão da ordem de **±1 km** — suficiente para a decisão que a família precisa tomar ("no meu bairro" vs. "do outro lado da cidade"), insuficiente para prometer precisão de rua. A tela escreve **"≈ 1,2 km"**, com o til, e a premissa vai no README.
- Para as 16 unidades sem coordenada, o fallback é o centróide do próprio bairro, que a `Planilha1` fornece.

> Em produção nada disso é necessário: o CEP do responsável já está no sistema da SME e a prefeitura tem geocodificador próprio. A aproximação é uma limitação de hackathon, não do desenho.

---

## 5. Como os dados chegam à tela — e por que não precisa de banco para ler

Pergunta que precisa de resposta antes do P0: sem banco definido, como a aplicação serve os dados?

**A resposta é que, para leitura, esta aplicação não precisa de banco.** Medi o payload real.

Todo o conhecimento que as telas consomem cabe em duas estruturas: as unidades (com bairro, CRE e coordenada) e os slots agregados `(unidade × grupamento × turno × ano)` com confirmados, fila e não-confirmações. Gerei esse agregado para **a cidade inteira, os 5 anos**:

| | |
| --- | ---: |
| Unidades | **872** |
| Linhas de slot (unidade × grupamento × turno × ano) | **8.422** |
| JSON compacto | **719 KB** |
| **JSON gzipado — o que trafega na rede** | **82 KB** |

82 KB é menos que uma foto de perfil. A Query A tem 837 mil linhas e 154 MB descomprimidos; o que a aplicação precisa dela são 82 KB. **Toda a redução acontece no build, uma vez.**

### 5.1 A arquitetura que isso permite

```
BUILD (roda uma vez, versionado no repo)
  Query A (.csv.gz, 837k linhas)  ─┐
  Query D (bairro/CEP da unidade) ─┼─▶ script Node ──▶ data/creche.json (719 KB)
  Unidades_Unificadas (lat/long)  ─┘                    └─ commitado no repo

RUNTIME
  Next.js importa data/creche.json  ──▶  cálculo em memória (M1 e M2)
  (sem banco, sem query, sem servidor de dados)

ESTADO VIVO (o pouco que escreve)
  escolhas da família + contato ──▶ SQLite  (ou memória, na POC)
```

**Por que isso é a decisão certa, e não preguiça:**

- **O dado é imutável.** 2021–2025 são processos fechados. Um banco existe para servir dado que muda; este não muda. Consultar um banco para ler uma tabela congelada de 8.422 linhas é infraestrutura sem função.
- **Reprodutibilidade fica trivial** — o critério de Engenharia pede isso explicitamente. Um comando regenera `creche.json` do CSV original, e o diff do arquivo mostra exatamente o que mudou.
- **Deploy sem infra.** O desafio pede URL pública ou vídeo de 60s. Sem banco, o projeto sobe na Vercel como site estático + rotas de API, sem provisionar nada e sem credencial para vazar.
- **A tela fica instantânea.** 8.422 linhas em memória: filtrar por bairro e ordenar por score é sub-milissegundo. Não há latência de rede entre app e banco porque não há banco.

**Onde o banco volta a fazer sentido:** no estado vivo — as opções que a família escolhe e o carimbo `contato_confirmado_em`. É pouco volume e é aí que entra o **SQLite** (`better-sqlite3`), um arquivo, zero setup. Se o P6 for cortado, nem isso é necessário: a POC guarda as escolhas em memória de sessão e a demo funciona igual.

> **Frase para o pitch (vale ponto em Engenharia):** "A base da SME tem 154 MB. O que a família precisa saber são 82 KB. A diferença entre os dois é o produto."

### 5.2 Modelo de dados

```jsonc
// data/creche.json — gerado no build, commitado
{
  "unidades": {
    "0716812": { "n": "EDI ESCRITORA CLARICE LISPECTOR",
                 "b": "Itanhangá", "cre": "7",
                 "lat": -22.98901, "lng": -43.34012 }
  },
  "slots": [
    { "a": 2025, "u": "0716812", "g": "Maternal II", "h": "Integral",
      "c": 25,   // confirmados
      "f": 235,  // fila de espera
      "x": 19 }  // nao-confirmacoes  →  profundidade = c + x = 44
  ]
}
```

Derivadas em memória no boot da aplicação:

```
bairro          -> centroide (media das coords das unidades do bairro)
slot_agregado   -> profundidade_mediana_3a, fila_atual,
                   anos_com_fila_zero, estavel_bool
```

Estado vivo (SQLite, ou memória se cortado):

```sql
familia(id PK, bairro, lat, lng, ponto_ref2_lat, ponto_ref2_lng,
        contato_zap, contato_email, contato_confirmado_em)
candidatura(id PK, familia_id FK, aluno_anon, grupamento, horario)
opcao_escolhida(candidatura_id FK, ordem 1..5, esc_codigo,
                posicao_estimada, faixa_chance)
```

---

## 6. As telas

### 6.1 Minha fila — a tela que responde "isso anda?"

```
┌────────────────────────────────────────────────────────────────┐
│  Inscrição de Ana · Maternal II · Integral                      │
│  Responsável: ITANHANGÁ · contato atualizado há 4 meses ⚠      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1ª opção  EDI ESCRITORA CLARICE LISPECTOR        ≈ 0,9 km     │
│            Você é o 100º de 235 na fila                        │
│            🔴 Chance baixa — em 2025 esta unidade              │
│               chamou até cerca do 44º lugar                    │
│                                                                │
│  2ª opção  EDI PROFESSORA EMILIA MARIA VIEIRA     ≈ 2,4 km     │
│            Você é o 61º de 180 na fila                         │
│            🟡 Chance média — chamou até cerca do 55º           │
│                                                                │
│  3ª opção  — vazia —                                           │
│  4ª opção  — vazia —                                           │
│  5ª opção  — vazia —                                           │
│                                                                │
│  ⚡ Você tem 3 opções sobrando. Veja o que existe perto:        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ CM EDSON LUIZ                    ITANHANGÁ · ≈ 1,2 km    │ │
│  │ Maternal II · Integral                                   │ │
│  │ 🟢 FILA ZERO — sem ninguém esperando há 2 anos           │ │
│  │ Chamou 22 famílias em 2025                               │ │
│  │                              [ Usar como 3ª opção ]      │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ CP CRECHE MUNDO MÁGICO I         ITANHANGÁ · ≈ 1,8 km    │ │
│  │ 🟢 FILA ZERO           [ Usar como 4ª opção ]            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [ 💬 Não entendi minha situação — me explique ]  ← Claude     │
└────────────────────────────────────────────────────────────────┘
```

Três coisas fazem essa tela funcionar, e vale apontá-las na apresentação:

- **A comparação `100º` vs `chamou até o 44º`** é o momento em que a família entende o próprio caso pela primeira vez. Hoje ela só vê o `100º`.
- **O aviso de opções sobrando** transforma um número morto em ação. 79% das crianças sem vaga em 2025 estavam nesse estado.
- **O botão de usar como opção** fecha o ciclo na mesma tela. Sem ele, é informação; com ele, é matrícula.

### 6.2 Mapa do bairro — o argumento visual

Um mapa centrado no endereço da família, com o raio configurado desenhado, unidades coloridas por faixa de chance (🔴 congestionada / 🟡 média / 🟢 ociosa) e as escolhas atuais destacadas.

O mapa não é enfeite: é a única forma de a família ver, de uma vez, que escolheu as duas unidades vermelhas e ignorou as cinco verdes ao lado. **É a seção 1.1 desenhada para uma família só.**

### 6.3 Explicação do Claude

Painel que abre sobre a tela, alimentado exclusivamente pelo JSON já calculado:

> "Ana está em 100º lugar na EDI Clarice Lispector. Nos últimos três anos essa creche conseguiu chamar entre 38 e 51 famílias por ano para o Maternal II integral — então a chance de chegar no 100º lugar é pequena. A boa notícia: o CM Edson Luiz, a cerca de 1,2 km da sua casa, no mesmo bairro, está sem fila de espera há dois anos para essa mesma turma. Você ainda tem três opções livres na sua inscrição."

Sem número novo. Só tradução.

---

## 7. Como semear a POC com dados reais

**Não invente dados.** O mesmo princípio do caminho C: a POC roda sobre 2025 real, e isso é parte do argumento.

**Não há recorte.** Este era o ponto em que o caminho C precisou escolher 3 unidades — aqui não precisa. O agregado da cidade inteira são 82 KB (seção 5), então a POC carrega **as 872 unidades e os 5 anos**, e a demo escolhe o bairro na hora.

Isso vale ponto de Engenharia e de Impacto: nenhum jurado pode perguntar *"mas funciona fora dessas três unidades?"*. Funciona na rede inteira, e o mesmo `creche.json` responde para qualquer endereço do Rio.

**Bairros âncora da demo, com o contraste já verificado:**

| Bairro | Congestionada | Ociosa (mesmo grupamento/turno) |
| --- | --- | --- |
| **ITANHANGÁ** | EDI ESCRITORA CLARICE LISPECTOR (0716812) — Mat. II Int., fila **235**, chamou 44 | **CM EDSON LUIZ** (0724604) — fila **0**, chamou 22 |
| **CURICICA** | CM MARIA DA CONCEIÇÃO SILVEIRA (0716613) — Mat. II Int., fila **72** | **EDI PROF. TEREZINHA SARAIVA** (0716824) — fila **0**, 34 confirmados |

Um terceiro par, útil se o time também apresentar o caminho C: **MARÉ** — CM VILA PINHEIRO (0430602), berçário integral, fila 95 → **CP SOCIEDADE DE ENSINO TEREZA CRISTINA** (04018), fila 0, 47 confirmados. É a mesma unidade que aparece na seção 6 do [caminho C](caminho-c-torre-de-convocacao.md), o que costura os dois documentos.

**Seed:** um passe único sobre a Query A inteira gera `data/creche.json` (seção 5.2). As famílias da demo saem de crianças reais do grupo das 8.822 — `aluno_0120041` (Rio Comprido, Maternal I integral, 3 opções usadas, 5 unidades ociosas no bairro), `aluno_0089689`, `aluno_0083191` e outras já identificadas na apuração — com posição na fila derivada da ordem real.

**Contatos:** `aluno_anon` é anonimizado e não há telefone nas bases. Gerar contatos fictícios **claramente marcados como tais**. Nunca apresentar contato fabricado como se fosse real.

---

## 8. A POC — escopo e cronograma

### 8.1 A restrição de ambiente, resolvida antes de tudo

Esta máquina **não tem Node/npm**, e o Python disponível é o do msys2 (`mingw_x86_64_msvcrt_gnu`), sem pip funcional e sem wheels de pandas/duckdb para essa ABI. A decisão tomada foi **instalar o Node e seguir com Next.js**, conforme a arquitetura do documento de decisão.

Consequências que o cronograma precisa absorver:

- **P0 inclui o setup do Node** (`winget install OpenJS.NodeJS.LTS`, novo terminal para o PATH). Orçar 15 min e verificar `node -v` antes de qualquer outra coisa.
- **A ingestão também é em Node**, não em Python — `zlib.createGunzip()` + leitura por linha resolve os 837 mil registros da Query A sem dependência nenhuma. Isso elimina o Python do projeto inteiro e remove o risco de wheel quebrada.
- **A planilha de lat/long não bloqueia o build.** Um `.xlsx` é um zip de XML: já extraí e li as duas abas sem lib nenhuma para produzir os números da seção 4. O script de ingestão faz o mesmo com `zlib` + parser de XML, ou — mais simples ainda — a planilha é convertida **uma vez** para `data/unidades-geo.json` e é esse JSON que o build consome. A dependência `xlsx` do npm deixa de ser necessária.

### 8.2 Stack

| Camada | Escolha | Porquê |
| --- | --- | --- |
| App | **Next.js** (App Router) | 2 telas + rotas de API no mesmo projeto |
| Build de dados | **Node stdlib** (`zlib` + `readline`) → `data/creche.json` | zero dependência no caminho crítico; roda uma vez |
| Leitura em runtime | **nenhum banco** — JSON de 82 KB em memória | o dado é imutável (seção 5); banco aqui é infra sem função |
| Estado vivo | **SQLite** (`better-sqlite3`), ou memória de sessão se cortado | só as escolhas da família e o carimbo de contato |
| Mapa | **Leaflet** + tiles OpenStreetMap | sem chave de API |
| Claude | rota `/api/explicar` | traduz o JSON calculado |

### 8.3 Cronograma até 15h50

Janela real: ~2h. É mais apertado que o caminho C — o setup do Node cobra o preço.

| Bloco | Entrega | Tempo | Corta se atrasar? |
| --- | --- | --- | --- |
| **P0** | Node instalado + `create-next-app` + script de ingestão gerando `data/creche.json` da **cidade inteira** (lógica já validada — ver seção 5) | 35 min | **Não** — é a base de tudo |
| **P1** | Cálculo de `profundidade_chamada`, faixa de chance e fila por slot (M1) | 20 min | **Não** — é o insight |
| **P2** | Tela "Minha fila" (6.1) com as 5 opções, faixas de chance e opções vazias | 30 min | **Não** — é a demo |
| **P3** | Motor de recomendação (M2) + botão "usar como Nª opção" | 25 min | **Não** — sem o botão vira conteúdo |
| **P4** | Mapa do bairro (6.2) com raio e cores | 20 min | Vira imagem estática |
| **P5** | Claude explicando a situação (6.3) | 20 min | Vira exemplo pré-gerado no README |
| **P6** | Aviso de raio (M3) + máquina de status do contato | 15 min | **Corta primeiro** — vira slide |

**P0 → P3 é o mínimo inegociável: ~1h50.** Começando 13h55, fecha 15h45 — sem folga. Se o P0 estourar 40 min, cortar o P4 antes de tocar em P1–P3.

> **Regra de corte já decidida:** o mapa é o que mais impressiona e o menos essencial. A tela 6.1 sozinha conta a história inteira. Não trocar P3 por P4 sob nenhuma circunstância — a recomendação acionável é o produto; o mapa é a ilustração dele.

---

## 9. Roteiro da demo (3 min dos 6)

1. **Abre com o paradoxo, sem tela.** "Em 2025, 14.219 crianças terminaram o processo de creche do Rio sem nenhuma vaga. **8.822 delas tinham, no próprio bairro, uma creche com o exato grupamento e turno que procuravam — e sem ninguém na fila.**"
2. **Mostra a tela 6.1 com uma família real do Itanhangá.** "Esta família é a 100ª na fila. É o único número que o portal de hoje mostra a ela."
3. **Aponta a linha de baixo.** "E este é o número que a prefeitura tem e nunca devolveu: essa creche chamou 44 famílias no ano inteiro. A 100ª nunca teve chance — e passou o ano achando que tinha."
4. **Rola até o card verde.** "No mesmo bairro, mesmo Maternal II integral: CM Edson Luiz, fila zero, sem fila há dois anos. Esta família tinha três opções em branco no formulário." *(Trocar por "a X km" só depois que o P0 carregar o lat/long — ver aviso na seção 1.3.)*
5. **Clica em `Usar como 3ª opção`.** A opção entra na lista, a faixa de chance vira verde. "Um clique. E isso vale para 7.262 crianças que ficaram sem creche em 2025 com opções não usadas."
6. **Fecha no mapa** (se o P4 existir): "Ela escolheu as duas vermelhas. Estas cinco verdes estavam aqui o tempo todo."

O gancho de honestidade que fecha: *"nada disso é previsão. É a contagem que a SME já fazia, devolvida para quem precisava dela."*

---

## 10. O que a POC não faz (dizer no pitch)

Honestidade aqui **ganha** ponto — o critério de Apresentação premia explicitamente "honesto sobre hoje vs. próximos passos".

- **A unidade tem coordenada real; a família não.** O lat/long das unidades é dado de verdade e cobre 98,1% da rede (seção 4). O ponto da família é o centróide do bairro dela, precisão da ordem de ±1 km, porque a base é anonimizada e não geocodificamos o CEP. Em produção o CEP do responsável já está no sistema da SME e resolve isso exatamente.
- **16 unidades (todas creches parceiras) ficam sem coordenada própria** e herdam o centróide do bairro. São 1,8% do volume de opções de 2025.
- **`profundidade_de_chamada` é um proxy de corte, não o corte real.** A base não traz a posição de classificação de cada criança nem carimbo de convocação — o mesmo achado do [caminho C](caminho-c-torre-de-convocacao.md). Contamos quantas famílias a unidade chamou, não até que posição da lista ela desceu.
- **Fila zero em 2025 não garante vaga em 2026.** Por isso o score usa `estabilidade` (fila baixa em vários anos) e não só o ano corrente.
- **Não escreve no `matricula.rio`.** A POC assume integração; o botão "usar como opção" grava no banco local.
- **A regra de raio avisa, não bloqueia.** Bloquear escolha exige norma publicada — está na lista de perguntas abaixo.
- **Contatos são fictícios**, porque a base é anonimizada e não contém telefone ou e-mail.
- **Não muda a retaguarda.** Este caminho reduz a fila na origem, na inscrição. A perda na convocação — 1 em cada 4 — continua existindo, e é o [caminho C](caminho-c-torre-de-convocacao.md), o próximo passo natural.

---

## 11. Perguntas para a consultora

1. **A profundidade de chamada pode ser divulgada?** Dizer "esta unidade chamou até o 44º ano passado" é informação pública de processo, ou há restrição? É o insumo central de M1.
2. **Existe a posição de classificação real** de cada criança em alguma tabela não extraída? Com ela, o corte histórico deixa de ser proxy e vira o número exato.
3. **A regra de raio pode bloquear** a escolha, ou só pode avisar? E qual X é defensável — 3 km, 5 km, por CRE?
4. **O segundo ponto de referência** (trabalho, casa de familiar) tem respaldo para entrar no formulário?
5. **A recomendação de alternativa induz demanda indevida?** Direcionar famílias para unidades ociosas é política desejável ou pode ser lido como favorecimento? (Nossa resposta: os pesos do score são públicos e auditáveis — mas a pergunta é da SME.)
6. **Capacidade por unidade/grupamento/turno existe em sistema?** Mesma pergunta dos outros caminhos: hoje estimamos por matrículas confirmadas históricas.
7. **A tela substitui ou complementa o `matricula.rio`?** Determina se o produto é um portal novo ou um módulo dentro do existente.

---

## 12. Por que este caminho, e não o [E]

O documento de decisão recomenda **[E] (B+C)**. Vale registrar por que D como produto principal é defensável, para o time responder se for perguntado:

| | [E] B+C | [D] Copiloto |
| --- | --- | --- |
| Onde ataca | Depois da inscrição — ordem e prazo | **Antes** — na formação da fila |
| Número de abertura | 14.219 sem vaga; 24,2% de não-confirmação | **8.822 tinham vaga ociosa no próprio bairro** |
| Quem é o usuário | Diretor e CRE (servidores) | **A família** — o beneficiário final |
| Risco de escopo | Alto: dois subsistemas em ~2h | **Baixo**: um join, uma distância, uma tela |
| Critério Produto (peso 20) | Painel administrativo | **Tela pública polida, sem treino nenhum** |
| Critério Impacto (peso 40) | Contrafactual simulado | **Contagem direta sobre 2025 — não é simulação** |

O ponto mais forte: o número de 8.822 **não é o resultado de um modelo rodando**. É uma contagem no dado real, verificável por qualquer jurado com acesso às bases. O contrafactual do caminho B depende de aceitar as premissas do simulador; este não depende de nada.

E a fraqueza declarada em [caminhos-de-implementacao.md](caminhos-de-implementacao.md) — *"sozinho, não muda o processo de retaguarda"* — se responde sozinha: **uma criança que se inscreve numa unidade com vaga não precisa da retaguarda funcionar.** O melhor lugar para consertar a fila é antes de ela existir.
