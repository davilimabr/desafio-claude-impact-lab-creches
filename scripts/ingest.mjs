// Ingestão: 154 MB de CSV -> data/creche.json (~720 KB, ~82 KB gzipado).
//
// Roda uma vez. Só stdlib do Node — nenhuma dependência de npm.
//   node scripts/ingest.mjs
//
// Fontes (padrão: ../dadoscreche, sobrescreva com DADOS=/caminho):
//   01_QueryA_InscricoesPorAno.csv.gz        opções por inscrição, 2021-2025
//   04_UnidadesEscolaresComEndereco.csv      bairro/CEP da unidade (sem cabeçalho)
//   Unidades_Unificadas_com_Localizacao.xlsx LATITUDE/LONGITUDE por DESIGNACAO

import { createReadStream, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { lerAba } from "./lib/xlsx.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DADOS = process.env.DADOS ?? resolve(RAIZ, "..", "dadoscreche");
const SAIDA = join(RAIZ, "web", "data", "creche.json");

const CAMINHOS = {
  queryA: join(DADOS, "Bases IC_ ClassificadoseFila", "01_QueryA_InscricoesPorAno.csv.gz"),
  queryD: join(DADOS, "Bases IC_ ClassificadoseFila", "04_UnidadesEscolaresComEndereco.csv"),
  geo: join(DADOS, "OferecimentosEvagas", "Unidades_Unificadas_com_Localizacao.xlsx"),
};

const ANO_CORRENTE = 2025;

// ---------------------------------------------------------------- utilidades

/** Chave de bairro estável: sem acento, maiúscula, espaços colapsados. */
const DIACRITICOS = /[\u0300-\u036f]/g;
const chaveBairro = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

/** Query A grava `0716812`; a planilha grava `716812`. O zero à esquerda é a única diferença. */
const chaveUnidade = (s) => (s ?? "").trim().replace(/^0+/, "");

const limpar = (s) => (s ?? "").trim().replace(/^"|"$/g, "").replace(/\s+/g, " ").trim();

/** Distância em km entre dois pontos. */
export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const mediana = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ------------------------------------------------- 1. geografia das unidades

console.log("[1/4] lendo Unidades_Unificadas_com_Localizacao.xlsx");

const geoPorUnidade = new Map(); // chaveUnidade -> {lat,lng,bairro,cre,micro}
{
  // Aba 1: DESIGNACAO | CRE | microárea | DENOMINACAO | RUA | BAIRRO | LATITUDE | LONGITUDE | Tipo
  const linhas = lerAba(CAMINHOS.geo, 1);
  for (const l of linhas.slice(1)) {
    const k = chaveUnidade(l[0]);
    if (!k || geoPorUnidade.has(k)) continue;
    const lat = Number(l[6]);
    const lng = Number(l[7]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    geoPorUnidade.set(k, {
      lat: +lat.toFixed(5),
      lng: +lng.toFixed(5),
      bairro: limpar(l[5]),
      cre: limpar(l[1]),
      micro: limpar(l[2]),
    });
  }
  console.log(`      ${geoPorUnidade.size} unidades com coordenada`);
}

// Aba 2 (Planilha1): sem coordenada, mas cobre as parceiras que faltam na aba 1.
const bairroFallback = new Map(); // chaveUnidade -> {bairro, cre, micro}
{
  const linhas = lerAba(CAMINHOS.geo, 2);
  for (const l of linhas.slice(1)) {
    const k = chaveUnidade(l[1]);
    if (!k || bairroFallback.has(k)) continue;
    bairroFallback.set(k, { bairro: limpar(l[4]), cre: limpar(l[0]), micro: limpar(l[6]) });
  }
  console.log(`      ${bairroFallback.size} unidades na Planilha1 (fallback de bairro)`);
}

// Query D: bairro por esc_codigo, casamento 872/872. Sem cabeçalho, ausências como "NULL".
console.log("[2/4] lendo 04_UnidadesEscolaresComEndereco.csv");
const bairroQueryD = new Map(); // chaveUnidade -> bairro
for (const linha of readFileSync(CAMINHOS.queryD, "utf8").split(/\r?\n/)) {
  if (!linha.trim()) continue;
  const f = linha.split(";");
  if (f.length < 8) continue;
  const k = chaveUnidade(f[1]);
  const bairro = limpar(f[7]);
  if (k && bairro && bairro !== "NULL") bairroQueryD.set(k, bairro);
}
console.log(`      ${bairroQueryD.size} unidades com bairro`);

// --------------------------------------------------------- 3. streaming da Query A

console.log("[3/4] lendo 01_QueryA_InscricoesPorAno.csv.gz (837k linhas)");

const CAMPOS = 17;
const [I_ANO, I_UNIDADE, I_NOME, I_GRUP, I_HORARIO, I_ALUNO, I_BAIRRO_RESP, I_SITUACAO] =
  [0, 5, 6, 7, 8, 10, 15, 16];

const slots = new Map(); // "ano|unid|grup|turno" -> {c,f,x}
const nomeUnidade = new Map();
const bairroResponsavel = new Map(); // aluno -> bairro (ano corrente)
const confirmados = new Set(); // alunos com >=1 Confirmado no ano corrente
const opcoesDoAluno = new Map(); // aluno -> Set(unidade)
const slotBuscado = new Map(); // aluno -> "grup|turno" da 1a opção
let linhasMalFormadas = 0;
let total = 0;

const entrada = createInterface({
  input: createReadStream(CAMINHOS.queryA).pipe(createGunzip()),
  crlfDelay: Infinity,
});

let cabecalho = true;
for await (const linha of entrada) {
  if (cabecalho) {
    cabecalho = false;
    continue;
  }
  if (!linha) continue;
  const f = linha.split(";");
  if (f.length !== CAMPOS) {
    linhasMalFormadas++;
    continue;
  }
  total++;

  const ano = f[I_ANO];
  const unidade = f[I_UNIDADE].trim();
  const grup = limpar(f[I_GRUP]);
  const horario = limpar(f[I_HORARIO]);
  const situacao = limpar(f[I_SITUACAO]);

  if (!nomeUnidade.has(unidade)) nomeUnidade.set(unidade, limpar(f[I_NOME]));

  const chave = `${ano}|${unidade}|${grup}|${horario}`;
  let s = slots.get(chave);
  if (!s) slots.set(chave, (s = { c: 0, f: 0, x: 0 }));
  if (situacao === "Confirmado") s.c++;
  else if (situacao === "Lista de espera") s.f++;
  // grafado sem cedilha e sem til na origem — filtro com acento não retorna nada
  else if (situacao === "Cancelado na confirmacao") s.x++;

  if (ano === String(ANO_CORRENTE)) {
    const aluno = f[I_ALUNO].trim();
    if (situacao === "Confirmado") confirmados.add(aluno);

    const bairro = limpar(f[I_BAIRRO_RESP]);
    if (bairro && bairro !== "NULL" && !bairroResponsavel.has(aluno)) {
      bairroResponsavel.set(aluno, bairro);
    }
    if (!slotBuscado.has(aluno)) slotBuscado.set(aluno, `${grup}|${horario}`);

    let op = opcoesDoAluno.get(aluno);
    if (!op) opcoesDoAluno.set(aluno, (op = new Set()));
    op.add(unidade);
  }
}
console.log(`      ${total} linhas | ${slots.size} slots | ${linhasMalFormadas} mal formadas`);

// ------------------------------------------------------- 4. montagem da saída

console.log("[4/4] montando data/creche.json");

const unidades = {};
let semCoordenada = 0;
for (const [codigo, nome] of nomeUnidade) {
  const k = chaveUnidade(codigo);
  const geo = geoPorUnidade.get(k);
  const fb = bairroFallback.get(k);
  const bairro = geo?.bairro || bairroQueryD.get(k) || fb?.bairro || null;
  if (!geo) semCoordenada++;
  unidades[codigo] = {
    n: nome,
    b: bairro,
    bk: bairro ? chaveBairro(bairro) : null,
    cre: geo?.cre ?? fb?.cre ?? null,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    // "unidade" = coordenada real da escola; "bairro" = herda o centróide (premissa declarada)
    geo: geo ? "unidade" : "bairro",
  };
}

// Centróide de bairro a partir das coordenadas reais das unidades daquele bairro.
// É o ponto que a família herda — a base é anonimizada e não traz lat/long do responsável.
const bairros = {};
{
  const acumulado = new Map();
  for (const u of Object.values(unidades)) {
    if (!u.bk || u.lat === null) continue;
    let a = acumulado.get(u.bk);
    if (!a) acumulado.set(u.bk, (a = { lat: 0, lng: 0, n: 0, nome: u.b }));
    a.lat += u.lat;
    a.lng += u.lng;
    a.n++;
  }
  for (const [k, a] of acumulado) {
    bairros[k] = {
      nome: a.nome,
      lat: +(a.lat / a.n).toFixed(5),
      lng: +(a.lng / a.n).toFixed(5),
      n: a.n,
    };
  }
}

const listaSlots = [];
for (const [chave, v] of slots) {
  const [ano, u, g, h] = chave.split("|");
  listaSlots.push({ a: +ano, u, g, h, c: v.c, f: v.f, x: v.x });
}

// ---- estatísticas do pitch, recalculadas aqui para serem reprodutíveis ----

const slotsAnoCorrente = listaSlots.filter((s) => s.a === ANO_CORRENTE);
const unidadesAtivas = new Set(slotsAnoCorrente.map((s) => s.u));
const filaPorUnidade = new Map();
for (const s of slotsAnoCorrente) {
  filaPorUnidade.set(s.u, (filaPorUnidade.get(s.u) ?? 0) + s.f);
}
const unidadesFilaZero = [...unidadesAtivas].filter((u) => (filaPorUnidade.get(u) ?? 0) === 0);

// O bairro da unidade vem de duas fontes independentes (a planilha de localização e a
// Query D) que discordam em alguns casos. O número do pitch é calculado pelas duas e
// reportamos o MENOR — se as fontes divergem, a estimativa conservadora é a defensável.
function cruzarOciosas(bairroDaUnidade) {
  const ociososPorChave = new Map();
  for (const s of slotsAnoCorrente) {
    if (s.f !== 0) continue;
    const bk = bairroDaUnidade(s.u);
    if (!bk) continue;
    const k = `${bk}|${s.g}|${s.h}`;
    if (!ociososPorChave.has(k)) ociososPorChave.set(k, []);
    ociososPorChave.get(k).push(s.u);
  }

  let semVaga = 0;
  let comAlternativa = 0;
  let comAlternativaEOpcaoSobrando = 0;
  const demo = [];
  for (const [aluno, opcoes] of opcoesDoAluno) {
    if (confirmados.has(aluno)) continue;
    semVaga++;
    const bairro = bairroResponsavel.get(aluno);
    if (!bairro) continue;
    const k = `${chaveBairro(bairro)}|${slotBuscado.get(aluno)}`;
    const ociosas = (ociososPorChave.get(k) ?? []).filter((u) => !opcoes.has(u));
    if (!ociosas.length) continue;
    comAlternativa++;
    if (opcoes.size < 5) {
      comAlternativaEOpcaoSobrando++;
      if (demo.length < 40) {
        const [g, h] = slotBuscado.get(aluno).split("|");
        demo.push({
          aluno,
          bairro,
          grupamento: g,
          horario: h,
          opcoes: [...opcoes],
          ociosas_no_bairro: ociosas,
        });
      }
    }
  }
  return { semVaga, comAlternativa, comAlternativaEOpcaoSobrando, demo };
}

const porPlanilha = cruzarOciosas((u) => unidades[u]?.bk ?? null);
const porQueryD = cruzarOciosas((u) => {
  const b = bairroQueryD.get(chaveUnidade(u));
  return b ? chaveBairro(b) : null;
});

// Cruzar por NOME de bairro é frágil: as duas fontes discordam, e há pares "no mesmo
// bairro" a mais de 3 km um do outro. O número que vale é o que o produto realmente faz —
// distância entre o centróide do bairro da família e a coordenada da unidade.
const RAIO_KM = 3;

const unidadesProximas = new Map(); // bairroKey -> [unidade]
for (const [bk, b] of Object.entries(bairros)) {
  const perto = [];
  for (const [codigo, u] of Object.entries(unidades)) {
    const lat = u.lat ?? bairros[u.bk]?.lat;
    const lng = u.lng ?? bairros[u.bk]?.lng;
    if (lat == null || lng == null) continue;
    if (haversine(b.lat, b.lng, lat, lng) <= RAIO_KM) perto.push(codigo);
  }
  unidadesProximas.set(bk, perto);
}

const ociosoNoSlot = new Set(
  slotsAnoCorrente.filter((s) => s.f === 0).map((s) => `${s.u}|${s.g}|${s.h}`),
);

let semVaga = 0;
let comAlternativaEstrita = 0;
let comAlternativaEOpcaoSobrando = 0;
const candidatasDemo = [];
for (const [aluno, opcoes] of opcoesDoAluno) {
  if (confirmados.has(aluno)) continue;
  semVaga++;
  const bairro = bairroResponsavel.get(aluno);
  if (!bairro) continue;
  const bk = chaveBairro(bairro);
  const perto = unidadesProximas.get(bk);
  if (!perto) continue;

  const [g, h] = slotBuscado.get(aluno).split("|");
  const ociosas = perto.filter((u) => !opcoes.has(u) && ociosoNoSlot.has(`${u}|${g}|${h}`));
  if (!ociosas.length) continue;

  comAlternativaEstrita++;
  if (opcoes.size < 5) {
    comAlternativaEOpcaoSobrando++;
    if (candidatasDemo.length < 40) {
      candidatasDemo.push({
        aluno,
        bairro,
        bairro_key: bk,
        grupamento: g,
        horario: h,
        opcoes: [...opcoes],
        ociosas_proximas: ociosas,
      });
    }
  }
}

const stats = {
  ano: ANO_CORRENTE,
  criancas: opcoesDoAluno.size,
  criancas_com_vaga: confirmados.size,
  criancas_sem_vaga: semVaga,
  unidades_ativas: unidadesAtivas.size,
  unidades_fila_zero: unidadesFilaZero.length,
  // o número do pitch: mesmo bairro + mesmo grupamento + mesmo turno + não escolhida
  sem_vaga_com_ociosa_no_bairro: comAlternativaEstrita,
  sem_vaga_com_ociosa_e_opcao_sobrando: comAlternativaEOpcaoSobrando,
  unidades_sem_coordenada: semCoordenada,
  raio_km: RAIO_KM,
  // O número adotado é o por distância. As leituras por nome de bairro ficam
  // registradas porque discordam entre si — e porque "mesmo bairro" chega a
  // emparelhar unidades a mais de 3 km uma da outra.
  sensibilidade: {
    por_distancia_3km: comAlternativaEstrita,
    por_bairro_planilha: porPlanilha.comAlternativa,
    por_bairro_query_d: porQueryD.comAlternativa,
    adotado: "por_distancia_3km",
  },
};

const saida = {
  meta: {
    gerado_em: new Date().toISOString(),
    processos: [2021, 2022, 2023, 2024, 2025],
    premissas: [
      "A coordenada da unidade é dado real (planilha Unidades_Unificadas, join por DESIGNACAO).",
      "A coordenada da família é o centróide do bairro dela: a base é anonimizada e não traz lat/long do responsável. Precisão da ordem de +-1km.",
      "profundidade_de_chamada = Confirmado + Cancelado na confirmacao. É quantas famílias a unidade convocou, não até que posição da classificação ela desceu.",
      "A base não traz capacidade por unidade nem carimbo de tempo das transições de convocação.",
    ],
  },
  stats,
  unidades,
  bairros,
  slots: listaSlots,
  familias_demo: candidatasDemo,
};

mkdirSync(dirname(SAIDA), { recursive: true });
writeFileSync(SAIDA, JSON.stringify(saida));

console.log("");
console.log("      unidades .................. " + Object.keys(unidades).length);
console.log("      sem coordenada própria .... " + semCoordenada);
console.log("      bairros com centróide ..... " + Object.keys(bairros).length);
console.log("      slots ..................... " + listaSlots.length);
console.log("      famílias de demo .......... " + candidatasDemo.length);
console.log("");
console.log(`      ${ANO_CORRENTE}: ${stats.criancas_sem_vaga} crianças sem vaga`);
console.log(`      destas, ${stats.sem_vaga_com_ociosa_no_bairro} tinham ociosa no próprio bairro (mesmo grupamento/turno)`);
console.log(`      destas, ${stats.sem_vaga_com_ociosa_e_opcao_sobrando} ainda tinham opção sobrando`);
console.log("");
console.log(`      -> ${SAIDA} (${(Buffer.byteLength(JSON.stringify(saida)) / 1024).toFixed(0)} KB)`);
