# Caminho C — Torre de Convocação: especificação e POC

> Detalhamento do caminho **[C]** de [caminhos-de-implementacao.md](caminhos-de-implementacao.md).
> Escrito às 13h20. Restam ~3h10 até a entrega — a seção 7 dimensiona a POC para caber nesse prazo.

---

## 1. O diagnóstico, afiado

O número bruto de 2025 é **17.838 não-confirmações** (opções que viraram `Cancelado na confirmacao`). Ele esconde **dois problemas diferentes, com soluções diferentes**. Decompondo por criança:

| Mecanismo | Volume 2025 | O que aconteceu | Solução |
| --- | ---: | --- | --- |
| **Perda real** | **11.981 (67%)** | A criança foi chamada e **não ficou em lugar nenhum** — a família não foi localizada, não respondeu ou não conseguiu comparecer no prazo | Rastreio + prazo visível + canal ativo |
| **Convocação desperdiçada** | **5.857 (33%)** | A criança **confirmou em outra unidade**, mas esta aqui segurou a vaga até o prazo expirar | Cascata em tempo real |

### 1.1 A oferta paralela existe — e é mensurável

O brainstorm registrou a suspeita ("cada unidade pode selecionar o mesmo candidato... as outras não têm essa informação e aguardam o prazo até a expiração"), enquanto a consultora descreveu o processo como **oferta única** ("quando uma oferta é feita, ele precisa aceitar; senão sai de todas").

**Os dados sustentam a versão do time.** Em 2025 há **3.257 inscrições** em que a *mesma* inscrição — mesma criança, mesmo `(prm_id, plm_id, ipl_id)`, portanto sem efeito de multi-polo — registra simultaneamente `Confirmado` **e** `Cancelado na confirmacao`. Ou seja: a criança recebeu oferta em mais de uma das suas 5 opções, deixou expirar em uma e confirmou em outra.

> **3.257 vagas ficaram bloqueadas por até 3 dias úteis esperando uma decisão que já tinha sido tomada em outro lugar.**

Vale levar isso à consultora como pergunta, não como acusação: pode haver oferta paralela deliberada em rodadas, ou divergência entre a regra e a prática de campo. De qualquer forma, o dado é o dado.

### 1.2 O achado meta: hoje o processo é inauditável

A Query A tem **uma única coluna de data — `data_criacao`** (criação da inscrição). Não existe carimbo de tempo de *nenhuma* transição: não se sabe quando a criança foi selecionada, quando a família foi contatada, quantas vezes, por qual canal, nem quando a vaga expirou.

> Ninguém consegue medir hoje se o protocolo de "1 contato por dia durante 3 dias" está sendo cumprido — porque ele não é registrado. A pergunta do brainstorm ("quem garante que esse processo é feito de forma correta?") **não tem resposta possível com os dados atuais.**

Isso reposiciona a Torre de Convocação: ela não é só uma tela de gestão. **Ela cria o dado que hoje não existe.** É o argumento mais forte para o critério Impacto Real — a SME ganha, no primeiro processo em que rodar, a série histórica que hoje lhe falta.

---

## 2. Os três mecanismos

### M1 — Cascata em tempo real

Hoje a baixa das outras opções existe (`Cancelado pelo sistema`, 66.649 registros em 2025), mas os 5.857 casos acima indicam que **ela não é imediata** — parte das opções expira antes de ser cancelada.

**A regra:** a transição para `Confirmado` libera, **na mesma transação**, as demais opções da criança. A vaga volta à fila no mesmo segundo, não em 3 dias.

```
ANTES                              DEPOIS
Dia 0  família confirma na opção 1  Dia 0  família confirma na opção 1
Dia 0  opções 2..5 seguem bloqueadas       ↓ mesma transação
Dia 3  opções 2..5 expiram          Dia 0  opções 2..5 liberadas
Dia 3  próximo da fila é chamado    Dia 0  próximo da fila é chamado
       ── 3 dias perdidos ──               ── 0 dias perdidos ──
```

### M2 — Rastreio com prazo visível

Cada tentativa de contato vira registro: canal, horário, operador, resultado. Cada estado carrega `prazo_fim` calculado em **dias úteis**, visível simultaneamente para família, unidade e CRE.

Resolve as três dores literais do brainstorm: *"quem garante que esse processo é feito corretamente"*, *"fila sem visibilidade de prazo"*, *"não sabem há quanto tempo uma vaga selecionada está aguardando"*.

### M3 — Sobre-chamada calibrada

Este é o mecanismo com o maior ganho, e o mais contraintuitivo. **O ponto não é chamar mais gente — as unidades já chamam mais gente. O ponto é chamar de uma vez em vez de em rodadas.**

Tome a unidade real **CM ARACY GUIMARÃES ROSA** (código 204602, integral), em 2025:

| | Valor |
| --- | ---: |
| Confirmados | 77 |
| Não confirmaram | 92 |
| **Taxa de não-confirmação** | **54,4%** |
| Fila de espera não chamada | 88 |
| Taxa nos 5 anos | 37,3% · 46,8% · 42,9% · 28,2% · 54,4% |

A unidade **já chamou 169 famílias** para efetivar 77 matrículas. Só que chamou **em rodadas sequenciais**, e cada rodada custa no mínimo 3 dias úteis — mais a demora operacional que o brainstorm estima em cerca de uma semana.

Simulando o berçário (49 confirmados, taxa histórica ~42%), com chamada rodada a rodada de exatamente o número de vagas:

```
Rodada 1:  chama 49  →  28 confirmam  →  21 vagas abertas   (3+ dias)
Rodada 2:  chama 21  →  12 confirmam  →   9 vagas abertas   (3+ dias)
Rodada 3:  chama  9  →   5 confirmam  →   4 vagas abertas   (3+ dias)
Rodada 4:  chama  4  →   2 confirmam  →   2 vagas abertas   (3+ dias)
                        ≈ 4 rodadas ≈ 12 dias úteis, no melhor caso
```

Com sobre-chamada calibrada pela taxa histórica da própria unidade:

```
Rodada única: chama 49 / (1 - 0,42) ≈ 85  →  ≈ 49 confirmam  →  3 dias
```

> **De ~4 rodadas para 1.** Duas a três semanas de vaga vazia recuperadas, com a mesma fila e as mesmas vagas. E havia **88 crianças na lista de espera** desta unidade — gente suficiente para a chamada ampliada.

**A salvaguarda obrigatória.** Sobre-chamada sem rede é irresponsável: se confirmarem mais do que as vagas, a unidade não pode simplesmente desconvocar. Três travas:

1. **Teto conservador** — usar o limite inferior do intervalo de confiança da taxa histórica, não a média. Erra para menos.
2. **Fila de contingência** — o excedente **não é recusado**: é encaminhado para unidade próxima com fila zero. Aqui os dois achados se encontram — **359 das 836 unidades (43%) terminaram 2025 sem ninguém na fila**. O excedente da sobre-chamada é exatamente a demanda que falta a elas.
3. **Só onde há lastro** — a sobre-chamada só é oferecida quando a fila de espera comporta a chamada ampliada e a unidade tem ≥ 2 anos de histórico.

---

## 3. Máquina de estados

```
                    ┌──────────┐
                    │ Inscrito │
                    └────┬─────┘
                         │ classificação central (caminho B ou régua atual)
                    ┌────▼─────────┐
                    │ Classificado │ ◄──────────────────────┐
                    └────┬─────────┘                        │
                         │ convocar()                       │ devolve_à_fila()
                         │ efeito: prazo_fim = +3 dias úteis│
                    ┌────▼───────────┐                      │
              ┌─────┤  Selecionado   ├──────┐               │
              │     └────┬───────────┘      │               │
   confirmar()│          │ prorrogar()      │ recusar()     │
              │          │ (+1 dia útil,    │               │
              │          │  com justificativa)               │
              │          │                  │               │
        ┌─────▼─────┐    │            ┌─────▼─────┐         │
        │ Confirmado│    │            │ Recusado  ├─────────┤
        └─────┬─────┘    │            └───────────┘         │
              │          │ prazo esgotado                   │
              │     ┌────▼──────┐                           │
              │     │ Expirado  ├───────────────────────────┘
              │     └───────────┘
              │
              │ EFEITO EM CASCATA (mesma transação):
              └──▶ demais opções da criança → Liberado
                   e cada unidade afetada → devolve_à_fila()
```

**Guardas (invariantes que o código precisa garantir):**

| # | Invariante |
| --- | --- |
| G1 | Uma criança tem **no máximo uma** convocação em estado `Selecionado` por vez |
| G2 | `Confirmado` é terminal e único por criança dentro do processo |
| G3 | `prazo_fim` conta **dias úteis**, excluindo fins de semana e feriados municipais |
| G4 | `prorrogar()` exige justificativa textual e só pode ser aplicada **uma vez** |
| G5 | Toda transição grava `quem`, `quando`, `de_estado`, `para_estado`, `motivo` — sem exceção |
| G6 | `confirmar()` e a cascata ocorrem na **mesma transação** — ou ambas, ou nenhuma |
| G7 | Sobre-chamada nunca ultrapassa o teto configurado por unidade |

G1 é a regra que mata a oferta paralela — é ela que teria evitado os 3.257 casos de 2025.

---

## 4. As telas

### 4.1 Painel do Diretor — a tela que tira o peso das costas dele

```
┌────────────────────────────────────────────────────────────────────┐
│  CM ARACY GUIMARÃES ROSA          Berçário · Integral      CRE 2   │
├────────────────────────────────────────────────────────────────────┤
│  Vagas 49   Confirmadas 28   Aguardando 12   Fila 81               │
│                                                                    │
│  ⚠  21 vagas em aberto. Taxa histórica de não-confirmação: 42%.    │
│     Sugestão: convocar 36 candidatos (não 21).      [ Convocar ]   │
├────────────────────────────────────────────────────────────────────┤
│  AGUARDANDO CONFIRMAÇÃO                                            │
│                                                                    │
│  Candidato        Prazo        Contatos          Situação          │
│  ─────────────────────────────────────────────────────────────     │
│  aluno_0008421    ⏱ 4h         3 ✓ zap ✓ tel     sem resposta      │
│  aluno_0011902    ⏱ 1d 2h      1 ✓ email        entregue          │
│  aluno_0003317    ⏱ 2d 6h      0 ✗              ⚠ não contatado    │
│  aluno_0009155    ✅ confirmou em CM VILA PINHEIRO — vaga liberada │
│                                                                    │
│  [ Registrar contato ]  [ Prorrogar (justificar) ]  [ Relatório ]  │
└────────────────────────────────────────────────────────────────────┘
```

A linha `aluno_0009155` é a cascata acontecendo à vista — hoje o diretor não saberia disso e seguraria a vaga por 3 dias.
A linha `aluno_0003317` é o rastreio funcionando: expõe uma convocação que ninguém tentou contatar.

### 4.2 Tela da Família

```
┌────────────────────────────────────────────────────┐
│  Você foi convocado! 🎉                            │
│                                                    │
│  EDI ALMIR LEITE RIBEIRO · Berçário · Integral     │
│                                                    │
│  ⏱  Faltam 2 dias e 6 horas                        │
│      até quinta, 04/09, às 17h                     │
│                                                    │
│  Leve: RG, CPF, comprovante de residência,         │
│         cartão de vacina, certidão de nascimento   │
│                                                    │
│  [ ✅ Confirmo que vou ]   [ ❌ Não tenho mais      │
│                               interesse ]          │
│                                                    │
│  Não consegue nesse prazo? [ Pedir mais 1 dia ]    │
└────────────────────────────────────────────────────┘
```

O botão "Não tenho mais interesse" é de alto valor e baixo custo: cada recusa explícita devolve a vaga **na hora** em vez de em 3 dias.

### 4.3 Painel da CRE

Visão agregada das unidades do território: vagas em aberto, convocações vencendo em 24h, unidades com contato não registrado, e o mapa de excedente ↔ unidades com fila zero para o remanejamento.

---

## 5. Modelo de dados da POC

```sql
unidade(esc_codigo PK, nome, cre, bairro, lat, lng,
        taxa_nao_confirmacao_hist, vagas_por_grupamento_turno)

candidato(aluno_anon PK, nascimento_anomes, responsavel_anon,
          cep, bairro, pontuacao, contato_zap, contato_email)

opcao(id PK, aluno_anon FK, esc_codigo FK, ordem 1..5,
      grupamento, horario, estado, prazo_fim)

convocacao(id PK, opcao_id FK, criado_em, prazo_fim,
           estado, prorrogada_em, justificativa)

contato(id PK, convocacao_id FK, canal, tentativa_em,
        operador, resultado)                    -- o dado que hoje não existe

transicao(id PK, opcao_id FK, de_estado, para_estado,
          em, por, motivo)                      -- trilha de auditoria (G5)
```

`contato` e `transicao` são as duas tabelas que a SME não tem hoje. Mostrar isso no pitch é meio caminho andado.

---

## 6. Como semear a POC com dados reais

**Não invente dados.** A POC roda sobre 2025 real, e isso é parte do argumento.

**Recorte sugerido:** a CRE do `plm_id` correspondente, ou apenas **3 unidades**:

| Papel na demo | Unidade | Perfil 2025 |
| --- | --- | --- |
| A que perde muito | **CM ARACY GUIMARÃES ROSA** (204602) | 77 conf · 92 não-conf (54%) · fila 88 |
| A que também perde | **CM VILA PINHEIRO** (430602) | 33 conf · 39 não-conf (54%) · **fila 165** |
| A ociosa (destino do excedente) | qualquer uma das **359 com fila zero** próxima | fila 0 |

**Seed:** para cada unidade, importar da Query A os candidatos reais (`aluno_anon`, grupamento, horário, ordem da opção) e reconstruir o estado inicial `Classificado`. A pontuação sai da Query B + régua da Query C, ou — se o tempo apertar — use a ordem de opção como proxy declarado.

**Contatos:** `aluno_anon` é anonimizado e não há telefone nas bases. Gerar contatos fictícios **claramente marcados como tais** na seed. Nunca apresentar contato fabricado como se fosse real.

---

## 7. A POC — escopo e cronograma

**Princípio de corte:** a demo precisa mostrar **3 dias passando em 30 segundos**. Sem isso, não há como demonstrar um processo de prazo em 6 minutos.

### 7.1 O truque que faz a demo funcionar

Um **relógio injetável**. Toda a lógica de prazo lê a hora de um único lugar (`agora()`), nunca de `new Date()` espalhado pelo código. A tela de demo ganha um botão `[ Avançar 1 dia ]` que empurra esse relógio.

Isso não é gambiarra de demo — é a decisão de arquitetura correta (relógio injetável é o que torna a regra de prazo testável) e vale ponto em Engenharia. Diga isso ao júri.

### 7.2 Stack recomendada

| Camada | Escolha | Porquê |
| --- | --- | --- |
| App | **Next.js** (App Router) | 3 telas + rotas de API no mesmo projeto |
| Estado vivo | **SQLite** (`better-sqlite3` ou Prisma) | zero setup, um arquivo, transação real para G6 |
| Seed | script **Python + pandas** lendo a Query A | o time já validou esse caminho |
| Claude | rota `/api/mensagem` | redige a convocação por canal |

Se o time for mais forte em Python: **FastAPI + HTMX/Streamlit** entrega as mesmas telas mais rápido. A escolha certa é a linguagem que a maioria escreve sem pensar — hoje não há tempo para aprender stack.

### 7.3 Cronograma até 15h50

| Bloco | Entrega | Tempo | Corta se atrasar? |
| --- | --- | --- | --- |
| **P0** | Seed: 3 unidades reais → SQLite, com taxa histórica calculada | 30 min | **Não** — é a base de tudo |
| **P1** | Máquina de estados + `agora()` injetável + cascata transacional (G6) | 40 min | **Não** — é o coração |
| **P2** | Painel do diretor (4.1) com contagem regressiva | 40 min | **Não** — é a demo |
| **P3** | Botão `[Avançar 1 dia]` + expiração automática | 15 min | **Não** — sem ele não há demo |
| **P4** | Sobre-chamada calibrada (o card de sugestão) | 20 min | Vira número em slide |
| **P5** | Tela da família (4.2) + registro de contato | 25 min | Vira mockup estático |
| **P6** | Claude redigindo a mensagem de convocação | 20 min | Vira exemplo pré-gerado |
| **P7** | Painel da CRE | — | **Corta primeiro** |

**P0 → P3 é o mínimo inegociável: ~2h05.** Começando 13h30, fecha 15h35, sobrando folga até o congelamento às 15h50.

---

## 8. Roteiro da demo (3 min dos 6)

1. **Abre no painel do diretor.** "Esta é uma creche real do Rio. Em 2025 ela chamou 169 famílias para preencher 77 vagas — e tinha 88 crianças esperando que nunca foram chamadas."
2. **Aponta o card de sugestão.** "O sistema sabe que 42% não confirmam nesta unidade. Para 21 vagas, ele manda convocar 36 — não 21. É a diferença entre uma rodada e quatro."
3. **Clica em Convocar.** As linhas aparecem com o relógio correndo.
4. **Vai para a tela da família e confirma uma.** Volta ao painel: **a vaga da mesma criança em outra unidade some na hora.** "Hoje essa vaga ficaria bloqueada por 3 dias. Aconteceu 3.257 vezes só em 2025."
5. **Aperta `[Avançar 1 dia]` três vezes.** Uma convocação expira e o próximo da fila entra automaticamente. "E repare nesta linha: três dias, zero tentativa de contato registrada. Hoje ninguém conseguiria saber disso — a base da SME não tem nenhum carimbo de tempo do processo de convocação. Este sistema cria esse dado."

---

## 9. O que a POC não faz (dizer no pitch)

Honestidade aqui **ganha** ponto — o critério de Apresentação premia explicitamente "honesto sobre hoje vs. próximos passos".

- **Não envia WhatsApp/SMS de verdade.** O disparo é simulado e registrado; a integração com provedor é trabalho de produção.
- **Vagas por unidade são estimadas** a partir das matrículas confirmadas históricas — a base não traz capacidade explícita.
- **Contatos são fictícios**, porque a base é anonimizada e não contém telefone ou e-mail.
- **Não substitui o `matricula.rio`** — a POC assume integração, não substituição.
- **A sobre-chamada precisa de respaldo normativo** antes de ir a campo: convocar acima do número de vagas exige regra publicada e a fila de contingência da seção 2.
- **Feriados municipais** estão parcialmente implementados no cálculo de dias úteis.

---

## 10. Perguntas para a consultora

1. **A oferta é única ou paralela?** Os dados mostram 3.257 inscrições de 2025 com `Confirmado` e `Cancelado na confirmacao` na mesma inscrição. Isso é rodada deliberada, divergência entre regra e prática, ou artefato de como a situação é gravada?
2. **Existe registro das tentativas de contato** em algum outro sistema que não veio nas bases?
3. **Há timestamp das transições** (seleção, confirmação, expiração) em alguma tabela não extraída? Se houver, o cálculo de tempo perdido fica exato em vez de estimado.
4. **A vaga volta para a fila da mesma unidade** quando expira, ou vai para um pool da CRE?
5. **Convocar acima do número de vagas** é juridicamente viável com regra publicada?
6. **Capacidade por unidade/grupamento/turno** existe em sistema? É o dado que mais aumentaria a precisão de tudo.
