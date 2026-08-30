# Design System — Carioca Cidadão / Educação Municipal

Sistema de design derivado do style board **"Institutional Humanist Desktop"** e das telas
_Unidades Recomendadas (Mapa)_ e _Detalhe da Unidade_.

**Personalidade:** institucional humanista. Credibilidade de governo sem frieza de formulário.
Azul dominante, superfícies brancas sobre fundo neutro frio, cantos suaves, densidade média,
zero decoração supérflua.

**Origem dos valores.** As quatro cores-âncora (`#0B4EA2`, `#062E5F`, `#893800`, `#75777E`) e a
família tipográfica (Public Sans) vêm literalmente do style board. As rampas tonais, a escala
tipográfica, o espaçamento e os raios foram derivados por medição das telas — estão marcados com
_(derivado)_ onde não há valor explícito na referência.

---

## 1. Cor

### 1.1 Cores-âncora

| Papel         | Hex       | Uso                                                                        |
| ------------- | --------- | -------------------------------------------------------------------------- |
| **Primary**   | `#0B4EA2` | Ação principal, links, estado ativo, barras de dado, ícones de destaque    |
| **Secondary** | `#062E5F` | Títulos, botão invertido, badges de ênfase, pin ativo no mapa              |
| **Tertiary**  | `#893800` | Atenção / alerta operacional (prazo, pendência). Uso **escasso e pontual** |
| **Neutral**   | `#75777E` | Texto secundário, ícones inativos, bordas, trilhos de gráfico              |
| **Error**     | `#B3261E` | Destrutivo e falha de validação. Nunca decorativo                          |

Contraste sobre branco (WCAG): Primary **7.9:1**, Secondary **13.5:1**, Tertiary **8.0:1**,
Error **6.5:1**, Neutral **4.5:1** — o Neutral passa AA raspando, então **não use `#75777E` em
texto abaixo de 14px**; troque por `neutral-600` (`#5B5F68`, 6.4:1).

### 1.2 Rampas tonais _(derivado)_

```
primary                          secondary (navy)
 50  #EFF5FD                      50  #EDF1F7
100  #DCEAFA                     100  #D3DCE9
200  #BBD6F4                     200  #A6B8D0
300  #8FBBEC                     300  #7191B5
400  #5A9AE2                     400  #3F6A97
500  #2B7AD4                     500  #17497B
600  #1462BD                     600  #0C3B69
700  #0B4EA2  ← âncora           700  #062E5F  ← âncora
800  #083E80                     800  #041F41
900  #062E5F                     900  #02142A
950  #041B38

tertiary                         neutral
 50  #FDF4EE                      0   #FFFFFF
100  #FBE7D8                      50  #F4F6FA  ← fundo da aplicação
200  #F4CCAC                     100  #E6E8EB
300  #E9A877                     200  #CFD1D5
400  #D9803F                     300  #B1B3B8
500  #C25C18                     400  #93959B
600  #A9490B                     500  #75777E  ← âncora
700  #893800  ← âncora           600  #5B5F68
800  #5C2500                     700  #434750
900  #3D1900                     800  #2E323B
                                 900  #1C1F26
```

### 1.3 Papéis semânticos (é isto que você referencia no código)

| Token                 | Valor             | Onde aparece nas telas                                            |
| --------------------- | ----------------- | ----------------------------------------------------------------- |
| `--bg-app`            | `#F4F6FA`         | Fundo atrás dos cards, coluna da lista                            |
| `--bg-surface`        | `#FFFFFF`         | Cards, sidebar, inputs                                            |
| `--bg-surface-raised` | `#FFFFFF` + borda | Card com borda `#E3E8EF`, sem sombra                              |
| `--bg-accent-subtle`  | `#E8F0FB`         | Card "Entenda sua situação", chip de distância, item de nav ativo |
| `--bg-inverse`        | `#062E5F`         | Badge "Melhor Opção", botão invertido                             |
| `--border-default`    | `#E3E8EF`         | Borda de card, input, chip inativo                                |
| `--border-strong`     | `#CFD1D5`         | Divisores, borda de campo em foco-off                             |
| `--border-accent`     | `#0B4EA2`         | Borda do card recomendado, botão outlined                         |
| `--text-primary`      | `#111827`         | Corpo principal                                                   |
| `--text-heading`      | `#062E5F`         | Títulos de card e de seção                                        |
| `--text-secondary`    | `#5B5F68`         | Endereço, metadados, legenda de eixo                              |
| `--text-muted`        | `#75777E`         | Rodapé, placeholder (≥14px)                                       |
| `--text-on-accent`    | `#FFFFFF`         | Texto sobre azul                                                  |
| `--text-accent`       | `#0B4EA2`         | Link, valor em destaque, texto do chip de distância               |
| `--data-fill`         | `#0B4EA2`         | Preenchimento das barras do gráfico                               |
| `--data-track`        | `#E6E8EB`         | Trilho vazio das barras                                           |

### 1.4 Regra de uso de cor (a mais importante)

Cor aqui **codifica chance de vaga**, não decoração. A disciplina:

- **Azul** = informação neutra e navegação. Nunca significa "bom".
- **Verde** _(extensão — não está no board original)_: `#147D4B` sobre `#E7F4EC`. Reservado
  exclusivamente para **disponibilidade real** (fila zero, vaga aberta, documento aceito).
- **Tertiary `#893800`** sobre `#FBE7D8`: fila longa, dado desatualizado, prazo correndo.
- **Error `#B3261E`**: só recusa e falha.

Nunca use cor como único sinal — todo chip colorido leva ícone e rótulo textual.

---

## 2. Tipografia

**Família:** `Public Sans` (Google Fonts). Fallback:
`'Public Sans', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.

Pesos usados: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold.
O board expõe três papéis — **Headline**, **Body**, **Label** — e a escala abaixo os expande.

| Token         | Tamanho / Linha | Peso | Tracking          | Uso na tela                                     |
| ------------- | --------------- | ---- | ----------------- | ----------------------------------------------- |
| `display-lg`  | 48 / 56         | 700  | -0.02em           | Número grande de posição na fila                |
| `headline-lg` | 32 / 40         | 700  | -0.01em           | Título de página                                |
| `headline-md` | 24 / 32         | 700  | -0.01em           | "Unidades Recomendadas"                         |
| `headline-sm` | 20 / 28         | 600  | -0.005em          | Nome da unidade no detalhe                      |
| `title-lg`    | 18 / 26         | 600  | 0                 | Título de card ("Até onde essa unidade chamou") |
| `title-md`    | 16 / 24         | 600  | 0                 | Nome da unidade no card de lista                |
| `title-sm`    | 14 / 20         | 600  | 0                 | Item de navegação, rótulo de botão              |
| `body-lg`     | 16 / 26         | 400  | 0                 | Texto explicativo longo                         |
| `body-md`     | 14 / 22         | 400  | 0                 | Corpo padrão, endereço                          |
| `body-sm`     | 13 / 20         | 400  | 0                 | Metadados, descrição de card                    |
| `label-lg`    | 13 / 16         | 500  | 0.01em            | Chip, botão pequeno                             |
| `label-md`    | 12 / 16         | 500  | 0.02em            | Chip de distância, badge                        |
| `label-sm`    | 11 / 16         | 600  | 0.04em, UPPERCASE | Rótulo de seção, eixo do gráfico                |

**Regras.** Títulos em `--text-heading` (navy), nunca em preto puro. Números que a família precisa
ler rápido (posição, distância, prazo) sobem no mínimo dois degraus da escala em relação ao texto
que os cerca. Nada abaixo de 11px. Largura máxima de bloco de texto: 68 caracteres.

---

## 3. Espaçamento, raio, elevação

### Escala de espaçamento — base 4px

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

Padrões observados: padding interno de card **16px**; gap entre cards da lista **12px**;
padding da coluna **20px**; gap entre grupos de seção **24px**.

### Raio

| Token         | Valor  | Aplicação                                              |
| ------------- | ------ | ------------------------------------------------------ |
| `radius-sm`   | 6px    | Chip de distância, badge quadrado                      |
| `radius-md`   | 8px    | Botão, input, campo de busca                           |
| `radius-lg`   | 12px   | Card, painel, thumbnail de mapa                        |
| `radius-xl`   | 16px   | Container de mapa, modal                               |
| `radius-full` | 9999px | Filtro-chip, pin de mapa, botão-ícone circular, avatar |

### Elevação

O sistema é **de borda, não de sombra**. Cards se separam do fundo por `1px solid #E3E8EF` sobre
`#F4F6FA`. Sombra só em camadas flutuantes:

| Token         | Valor                           | Uso                                     |
| ------------- | ------------------------------- | --------------------------------------- |
| `shadow-none` | —                               | Card padrão (usa borda)                 |
| `shadow-sm`   | `0 1px 2px rgba(6,46,95,.06)`   | Card em hover                           |
| `shadow-md`   | `0 4px 12px rgba(6,46,95,.10)`  | Dropdown, popover do mapa, bottom sheet |
| `shadow-lg`   | `0 12px 32px rgba(6,46,95,.16)` | Modal                                   |

---

## 4. Layout

Aplicação **desktop de três colunas**, sidebar fixa:

```
┌──────────┬────────────────────┬───────────────────────────┐
│ Sidebar  │  Coluna de lista   │  Painel de contexto        │
│  240px   │  340–380px         │  flex: 1 (mapa / detalhe)  │
└──────────┴────────────────────┴───────────────────────────┘
```

- Sidebar: `240px`, fundo `#FFFFFF`, sem borda direita — separada pelo fundo `#F4F6FA` do canvas.
- Gutter entre colunas: `16px`. Padding externo do canvas: `20px`.
- Grid interno de conteúdo: 12 colunas, gutter `24px`, largura máxima `1440px`.
- No detalhe (imagem 3): conteúdo em **2 colunas ~60/40** — mídia e identificação à esquerda,
  dado e ação à direita.

**Breakpoints** _(derivado)_: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
Abaixo de `lg` a sidebar colapsa para bottom navigation de 4 itens e as colunas empilham
(lista primeiro, mapa em sheet).

---

## 5. Componentes

### 5.1 Sidebar de navegação

**Anatomia:** marca → botão de ação primária → lista de navegação.

- Marca: ícone 24px + `Carioca Cidadão` em `title-lg` navy + `Educação Municipal` em
  `body-sm` `--text-secondary`.
- Botão `+ Novo Cadastro`: primário, largura total, `radius-md`, `title-sm`.
- Item de nav: altura `40px`, padding `10px 12px`, ícone 20px + rótulo `title-sm`, gap `12px`.

| Estado    | Fundo        | Texto / Ícone        | Indicador                                               |
| --------- | ------------ | -------------------- | ------------------------------------------------------- |
| Default   | transparente | `#5B5F68`            | —                                                       |
| Hover     | `#F4F6FA`    | `#111827`            | —                                                       |
| **Ativo** | `#E8F0FB`    | `#0B4EA2` (peso 600) | barra esquerda `3px × 20px` em `#0B4EA2`, `radius-full` |
| Foco      | —            | —                    | outline `2px #0B4EA2`, offset `2px`                     |

### 5.2 Botões

Altura padrão `40px` · padding `10px 16px` · `radius-md` · `title-sm` · gap ícone-texto `8px`.
Denso `32px`, grande `48px`.

| Variante          | Default                                                  | Hover        | Active       | Disabled                         |
| ----------------- | -------------------------------------------------------- | ------------ | ------------ | -------------------------------- |
| **Primary**       | bg `#0B4EA2`, texto branco                               | bg `#083E80` | bg `#062E5F` | bg `#CFD1D5`, texto `#93959B`    |
| **Secondary**     | bg `#E6E8EB`, texto `#2E323B`                            | bg `#CFD1D5` | bg `#B1B3B8` | bg `#F4F6FA`, texto `#B1B3B8`    |
| **Inverted**      | bg `#062E5F`, texto branco                               | bg `#041F41` | bg `#02142A` | idem primary                     |
| **Outlined**      | bg branco, borda `1px #0B4EA2`, texto `#0B4EA2`          | bg `#EFF5FD` | bg `#DCEAFA` | borda `#CFD1D5`, texto `#B1B3B8` |
| **Text**          | só texto `#0B4EA2`                                       | sublinhado   | `#062E5F`    | `#B1B3B8`                        |
| **Tertiary icon** | quadrado `36px`, bg `#893800`, ícone branco, `radius-sm` | `#5C2500`    | `#3D1900`    | —                                |
| **Destructive**   | bg `#B3261E`, texto branco                               | `#8C1D18`    | `#601410`    | —                                |

**Botão-ícone circular:** `36px`, `radius-full`. Filled (`#0B4EA2`, ícone branco) ou ghost
(transparente, ícone `#5B5F68`, hover bg `#E6E8EB`).

Foco em qualquer botão: `outline: 2px solid #0B4EA2; outline-offset: 2px`.
Alvo de toque mínimo **44×44px** mesmo quando o visual é menor.

### 5.3 Campo de busca

Altura `40px`, bg `#FFFFFF`, borda `1px #E3E8EF`, `radius-md`, padding `0 12px`.
Ícone de lupa 18px `#75777E` à esquerda, gap `8px`. Placeholder `body-md` `#75777E`.
Foco: borda `#0B4EA2` + `box-shadow: 0 0 0 3px rgba(11,78,162,.12)`.

### 5.4 Filter chip

Altura `32px`, padding `6px 12px`, `radius-full`, `label-lg`, ícone opcional 16px à esquerda.

- **Inativo:** bg `#FFFFFF`, borda `1px #E3E8EF`, texto `#434750`. Hover: bg `#F4F6FA`.
- **Ativo:** bg `#0B4EA2`, sem borda, texto branco, ícone branco.

A linha de filtros rola horizontalmente sem quebrar; o último chip pode ficar cortado como
affordance de scroll (visível na imagem 2).

### 5.5 Chip informativo / metadado

Altura `22px`, padding `2px 8px`, `radius-sm`, `label-md`, ícone 12px.

| Tipo                                          | Fundo                          | Texto             |
| --------------------------------------------- | ------------------------------ | ----------------- |
| Distância (`0.8 km`)                          | `#E8F0FB`                      | `#0B4EA2`         |
| Categoria (`Creche, Pré-Escola`)              | transparente                   | `#5B5F68` + ícone |
| Atributo (`Turno Integral`, `Acessibilidade`) | `#F4F6FA`, borda `1px #E6E8EB` | `#434750`         |
| Rede (`Rede Municipal`)                       | `#E8F0FB`                      | `#0B4EA2`         |
| Disponibilidade positiva                      | `#E7F4EC`                      | `#147D4B`         |
| Atenção                                       | `#FBE7D8`                      | `#893800`         |

### 5.6 Badge de destaque — "Melhor Opção"

Pill `radius-full`, bg `#062E5F`, texto branco `label-md`, ícone estrela 12px, padding `4px 10px`.
Posicionado **sobrepondo a borda superior** do card (`top: -11px; left: 12px`).
Um por lista, no máximo.

### 5.7 Card de unidade (lista)

```
┌─ [badge opcional sobreposto] ─────────────────┐
│  Nome da unidade        title-md   [0.8 km]   │
│  📍 Endereço · Bairro   body-sm  #5B5F68      │
│  🏫 Chips de categoria  label-md               │
│  ┌───────────────────────────────────────┐    │
│  │  + Adicionar à Fila                   │    │
│  └───────────────────────────────────────┘    │
└───────────────────────────────────────────────┘
```

- Padrão: bg `#FFFFFF`, borda `1px #E3E8EF`, `radius-lg`, padding `14px`, gap interno `8px`.
  Botão **outlined**, largura total.
- **Recomendado:** bg `#E8F0FB`, borda `1.5px #0B4EA2`, botão **primary** preenchido,
  badge "Melhor Opção". É o único card com peso visual elevado.
- Hover: borda `#8FBBEC` + `shadow-sm`. Card inteiro clicável; o botão é ação secundária dentro dele.

### 5.8 Card de dado — "Até onde essa unidade chamou"

Título `title-lg` navy, subtítulo `body-sm` `--text-secondary`, depois as barras:

- Linha: rótulo do ano `label-sm` `#75777E` à esquerda (largura fixa 36px), trilho flexível,
  valor `label-md` `#5B5F68` à direita.
- Trilho: altura `8px`, `radius-full`, bg `#E6E8EB`.
- Preenchimento: `#0B4EA2`, `radius-full`, largura proporcional ao valor.
- Gap entre linhas `12px`.
- Marcador da posição da família: linha vertical `2px` em `#893800` com rótulo — deixa explícito
  quando a posição cai **fora** do alcance histórico.

Regra: eixos começam em zero, sem 3D, sem gradiente, sem legenda flutuante.

### 5.9 Card explicativo — "Entenda sua situação"

bg `#E8F0FB`, sem borda, `radius-lg`, padding `16px`, ícone `info` 18px `#0B4EA2` no topo-esquerda,
título `title-sm` `#062E5F`, corpo `body-md` `#0C3B69`, parágrafos separados por `12px`.

É o container do texto gerado pelo assistente. **Toda frase aqui deriva de número já calculado
pelo sistema** — o componente nunca hospeda estimativa produzida em linguagem.

### 5.10 Mapa

Container `radius-xl`, `overflow: hidden`. Controles nativos no canto inferior direito
(`+`, `−`, recentralizar) como botões-ícone circulares brancos `36px` com `shadow-md`.

**Pins:** círculo `28px` `radius-full`, borda branca `2px`, `shadow-sm`.
Padrão `#8FBBEC` com ícone branco · selecionado `#062E5F` com estrela ·
disponível `#147D4B` · congestionado `#893800`.
Raio de busca: círculo `fill rgba(11,78,162,.08)` + `stroke #0B4EA2` tracejado.

### 5.11 Breadcrumb

`body-sm`. Ancestrais `#5B5F68` clicáveis, separador `›` `#B1B3B8`, item atual `#062E5F` peso 500,
não clicável.

### 5.12 Tabs (topo do painel)

`title-sm`, padding `8px 12px`, gap `8px`.
Inativo `#5B5F68`; ativo `#0B4EA2` peso 600 com underline `2px #0B4EA2` colado à base.

### 5.13 Rodapé

Fundo `#F4F6FA`, borda superior `1px #E6E8EB`, padding `16px 24px`, `body-sm`.
Marca "Prefeitura do Rio de Janeiro" em `#0B4EA2` peso 700 à esquerda; copyright ao centro em
`#75777E`; links (`Privacidade`, `Termos de Uso`, `Portal da Transparência`, `Ouvidoria`) à direita
em `#5B5F68`, sublinhado no hover.

### 5.14 Estados de sistema

- **Vazio:** ícone outline 40px `#B1B3B8`, título `title-md` `#434750`, uma linha `body-md`
  `#5B5F68`, um botão de saída. Centralizado, padding vertical `48px`.
- **Carregando:** skeleton `#E6E8EB` com shimmer, mesmo raio do componente final. Nunca spinner
  em tela cheia.
- **Erro:** bg `#FDECEA`, borda `1px #F5C6C2`, ícone e título `#B3261E`, corpo `#2E323B`,
  sempre com próximo passo acionável.

---

## 6. Iconografia

**Material Symbols Outlined**, peso 400, grade 24, `fill 0`.
Tamanhos: `16px` inline em chip · `18px` em input e card · `20px` em nav e botão · `24px` em marca.
Cor herda do texto adjacente. Nunca ícone sem rótulo em navegação primária.

Vocabulário fixo: `place` endereço · `near_me` proximidade · `school` unidade · `schedule` turno e
prazo · `description` documento · `person` responsável · `add_circle` adicionar à fila ·
`star` recomendado · `info` explicação · `check_circle` confirmado · `warning` pendência.

---

## 7. Movimento

| Token         | Duração | Curva                    | Uso                         |
| ------------- | ------- | ------------------------ | --------------------------- |
| `motion-fast` | 120ms   | `cubic-bezier(.4,0,1,1)` | Hover, foco, mudança de cor |
| `motion-base` | 200ms   | `cubic-bezier(.2,0,0,1)` | Expandir card, trocar tab   |
| `motion-slow` | 320ms   | `cubic-bezier(.2,0,0,1)` | Sheet, modal, pan do mapa   |

Barras do gráfico animam a largura uma vez na entrada (`motion-slow`), nunca em loop.
Respeitar `prefers-reduced-motion: reduce` desligando toda transição não essencial.

---

## 8. Acessibilidade

- Contraste mínimo **AA**: 4.5:1 texto normal, 3:1 texto grande e elementos gráficos.
  `#75777E` proibido abaixo de 14px.
- Cor nunca é sinal único: todo chip de status carrega ícone + palavra.
- Foco visível em tudo que recebe teclado — `outline 2px #0B4EA2`, offset `2px`. Nunca `outline: none`.
- Alvo de toque **44×44px** mínimo.
- Rótulo acima do campo, nunca só placeholder. Erro em texto abaixo do campo, associado por
  `aria-describedby`.
- Mapa tem equivalente em lista, sempre. A lista é a fonte de verdade; o mapa é apoio.
- Linguagem: frases curtas, sem sigla não expandida, sem jargão administrativo.

---

## 9. Tokens em CSS

```css
:root {
  /* cor — âncoras */
  --color-primary: #0b4ea2;
  --color-secondary: #062e5f;
  --color-tertiary: #893800;
  --color-neutral: #75777e;
  --color-error: #b3261e;
  --color-success: #147d4b; /* extensão */

  /* cor — semântica */
  --bg-app: #f4f6fa;
  --bg-surface: #ffffff;
  --bg-accent-subtle: #e8f0fb;
  --bg-inverse: #062e5f;
  --bg-success-subtle: #e7f4ec;
  --bg-warning-subtle: #fbe7d8;
  --bg-error-subtle: #fdecea;

  --border-default: #e3e8ef;
  --border-strong: #cfd1d5;
  --border-accent: #0b4ea2;

  --text-primary: #111827;
  --text-heading: #062e5f;
  --text-secondary: #5b5f68;
  --text-muted: #75777e;
  --text-accent: #0b4ea2;
  --text-on-accent: #ffffff;

  --data-fill: #0b4ea2;
  --data-track: #e6e8eb;

  /* tipografia */
  --font-sans:
    "Public Sans", -apple-system, "Segoe UI", Roboto, Arial, sans-serif;

  /* espaçamento */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* raio */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* elevação */
  --shadow-sm: 0 1px 2px rgba(6, 46, 95, 0.06);
  --shadow-md: 0 4px 12px rgba(6, 46, 95, 0.1);
  --shadow-lg: 0 12px 32px rgba(6, 46, 95, 0.16);

  /* movimento */
  --motion-fast: 120ms cubic-bezier(0.4, 0, 1, 1);
  --motion-base: 200ms cubic-bezier(0.2, 0, 0, 1);
  --motion-slow: 320ms cubic-bezier(0.2, 0, 0, 1);

  /* layout */
  --sidebar-width: 240px;
  --list-column-width: 360px;
  --content-max-width: 1440px;
}
```

## 10. Tailwind

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF5FD",
          100: "#DCEAFA",
          200: "#BBD6F4",
          300: "#8FBBEC",
          400: "#5A9AE2",
          500: "#2B7AD4",
          600: "#1462BD",
          700: "#0B4EA2",
          800: "#083E80",
          900: "#062E5F",
          950: "#041B38",
          DEFAULT: "#0B4EA2",
        },
        secondary: {
          50: "#EDF1F7",
          100: "#D3DCE9",
          200: "#A6B8D0",
          300: "#7191B5",
          400: "#3F6A97",
          500: "#17497B",
          600: "#0C3B69",
          700: "#062E5F",
          800: "#041F41",
          900: "#02142A",
          DEFAULT: "#062E5F",
        },
        tertiary: {
          50: "#FDF4EE",
          100: "#FBE7D8",
          200: "#F4CCAC",
          300: "#E9A877",
          400: "#D9803F",
          500: "#C25C18",
          600: "#A9490B",
          700: "#893800",
          800: "#5C2500",
          900: "#3D1900",
          DEFAULT: "#893800",
        },
        neutral: {
          50: "#F4F6FA",
          100: "#E6E8EB",
          200: "#CFD1D5",
          300: "#B1B3B8",
          400: "#93959B",
          500: "#75777E",
          600: "#5B5F68",
          700: "#434750",
          800: "#2E323B",
          900: "#1C1F26",
        },
        success: { DEFAULT: "#147D4B", subtle: "#E7F4EC" },
        danger: { DEFAULT: "#B3261E", subtle: "#FDECEA" },
      },
      fontFamily: {
        sans: ["Public Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { sm: "6px", md: "8px", lg: "12px", xl: "16px" },
      boxShadow: {
        sm: "0 1px 2px rgba(6,46,95,.06)",
        md: "0 4px 12px rgba(6,46,95,.10)",
        lg: "0 12px 32px rgba(6,46,95,.16)",
      },
    },
  },
};
```

---

## 11. Modo escuro _(extensão — não presente na referência)_

Inversão por remapeamento de papéis, mantendo as âncoras:

| Token                | Claro     | Escuro    |
| -------------------- | --------- | --------- |
| `--bg-app`           | `#F4F6FA` | `#0F1420` |
| `--bg-surface`       | `#FFFFFF` | `#18202F` |
| `--bg-accent-subtle` | `#E8F0FB` | `#123056` |
| `--border-default`   | `#E3E8EF` | `#2A3446` |
| `--text-primary`     | `#111827` | `#E8EBF0` |
| `--text-heading`     | `#062E5F` | `#BBD6F4` |
| `--text-secondary`   | `#5B5F68` | `#9BA3B2` |
| `--text-accent`      | `#0B4EA2` | `#8FBBEC` |
| `--data-fill`        | `#0B4EA2` | `#5A9AE2` |

Primary sobre superfície escura sobe para `primary-300/400` — `#0B4EA2` não atinge contraste
suficiente como texto em fundo escuro.

---

## 12. Nomenclatura — resolvida

As telas geradas usam a marca **"Carioca Cidadão — Educação Municipal"**, enquanto o documento de
caminhos chama a iniciativa de **"Copiloto da Família"**. Escolher um dos dois antes de produzir
mais telas: "Carioca Cidadão" soa a portal guarda-chuva municipal, "Copiloto da Família" nomeia o
serviço específico. Se ambos permanecerem, tratar o primeiro como plataforma e o segundo como
produto dentro dela — e refletir isso na sidebar (marca da plataforma no topo, nome do serviço no
título da página).

**Decisão tomada na implementação.** Ficou a marca institucional real, não a fictícia: a sidebar
assina com o logo oficial da SME e o nome do serviço — **Inscrição Creche · Educação Municipal** —
no lugar de "Carioca Cidadão". A anatomia da referência (marca → ação primária → navegação)
continua igual; só o conteúdo da marca mudou, porque uma ferramenta de serviço público não deve
carregar uma marca que a prefeitura não usa.

---

## 13. Onde isto vive no código

Os tokens estão em `web/app/globals.css`, dentro do bloco `@theme` do Tailwind v4 — que gera as
utilidades direto do token, sem `tailwind.config.js`. Os nomes ficaram em português, como o resto
do código:

| Token do documento              | Utilidade no código                                |
| ------------------------------- | -------------------------------------------------- |
| `--bg-app` / `--bg-surface`     | `bg-fundo` / `bg-papel`                            |
| `--bg-accent-subtle`            | `bg-primaria-clara`                                |
| `--bg-inverse`                  | `bg-marinho`                                       |
| `--border-default` / `-strong`  | `border-linha` / `border-linha-forte`              |
| `--text-primary` / `-heading`   | `text-tinta` / `text-titulo`                       |
| `--text-secondary` / `-muted`   | `text-apoio` / `text-discreto`                     |
| `--data-fill` / `--data-track`  | `bg-primaria` / `bg-trilho`                        |
| escala tipográfica              | `text-headline-lg`, `text-title-md`, `text-body-sm`… |

Os componentes da seção 5 têm uma implementação só, em `web/app/componentes.tsx`
(chip, filtro-chip, badge "Melhor opção", card de unidade, card de barras, card explicativo,
estado vazio), e o vocabulário de ícones da seção 6 está em `web/app/icones.tsx` como SVG inline.

**Fora do documento, decidido na implementação:**

- O marcador vertical laranja do gráfico (5.8) marca o **tamanho da fila de hoje**, não a posição
  da família: essa posição não existe na base pública, e o produto não inventa número.
- O mapa (5.10) é imagem do Static Maps montada no servidor, com a chave em `web/.env.local`
  (`GOOGLE_MAPS_KEY`). Sem chave, ou se o Google recusar, o painel cai numa lista ordenada por
  distância — o mapa é apoio, a lista é a fonte de verdade.
- A navegação tem três itens, não quatro: só as telas que existem de verdade.
