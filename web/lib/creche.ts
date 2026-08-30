import dados from "@/data/creche.json";

// ---------------------------------------------------------------- tipos

export type Unidade = {
  n: string;
  b: string | null;
  bk: string | null;
  cre: string | null;
  lat: number | null;
  lng: number | null;
  geo: "unidade" | "bairro";
};

export type Slot = {
  a: number;
  u: string;
  g: string;
  h: string;
  /** confirmados */ c: number;
  /** fila de espera */ f: number;
  /** nao-confirmacoes */ x: number;
};

export type Bairro = { nome: string; lat: number; lng: number; n: number };

export type Faixa = "alta" | "media" | "baixa";

export const ANO = 2025;
export const ANOS_HISTORICO = 3;

export const unidades = dados.unidades as Record<string, Unidade>;
export const bairros = dados.bairros as Record<string, Bairro>;
export const slots = dados.slots as Slot[];
export const stats = dados.stats;
export const meta = dados.meta;
export const familiasDemo = dados.familias_demo;

// ---------------------------------------------------------------- índices

const porSlot = new Map<string, Slot[]>();
for (const s of slots) {
  const k = `${s.u}|${s.g}|${s.h}`;
  let arr = porSlot.get(k);
  if (!arr) porSlot.set(k, (arr = []));
  arr.push(s);
}
for (const arr of porSlot.values()) arr.sort((a, b) => b.a - a.a);

/** Slots do ano corrente indexados por bairro da unidade + grupamento + turno. */
const porBairroSlot = new Map<string, Slot[]>();
for (const s of slots) {
  if (s.a !== ANO) continue;
  const bk = unidades[s.u]?.bk;
  if (!bk) continue;
  const k = `${bk}|${s.g}|${s.h}`;
  let arr = porBairroSlot.get(k);
  if (!arr) porBairroSlot.set(k, (arr = []));
  arr.push(s);
}

export const grupamentos = [...new Set(slots.filter((s) => s.a === ANO).map((s) => s.g))].sort();
export const turnos = [...new Set(slots.filter((s) => s.a === ANO).map((s) => s.h))].sort();
export const listaBairros = Object.entries(bairros)
  .map(([bk, b]) => ({ bk, ...b }))
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

// ---------------------------------------------------------------- métricas

/**
 * Quantas famílias a unidade convocou naquele slot: as que aceitaram e as que não.
 * Não é "até que posição da classificação ela desceu" — a base não traz isso.
 */
export const profundidadeDeChamada = (s: Slot) => s.c + s.x;

const mediana = (xs: number[]) => {
  if (!xs.length) return 0;
  const o = [...xs].sort((a, b) => a - b);
  const m = o.length >> 1;
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};

export type Agregado = {
  unidade: string;
  grupamento: string;
  horario: string;
  filaAtual: number;
  confirmadosAtual: number;
  profundidadeAtual: number;
  profundidadeMediana: number;
  historico: { ano: number; fila: number; profundidade: number; confirmados: number }[];
  anosComFilaZero: number;
  anosObservados: number;
  estavel: boolean;
};

export function agregado(u: string, g: string, h: string): Agregado | null {
  const arr = porSlot.get(`${u}|${g}|${h}`);
  if (!arr?.length) return null;

  const historico = arr.map((s) => ({
    ano: s.a,
    fila: s.f,
    confirmados: s.c,
    profundidade: profundidadeDeChamada(s),
  }));
  const atual = arr.find((s) => s.a === ANO);
  const recentes = historico.slice(0, ANOS_HISTORICO);

  return {
    unidade: u,
    grupamento: g,
    horario: h,
    filaAtual: atual?.f ?? 0,
    confirmadosAtual: atual?.c ?? 0,
    profundidadeAtual: atual ? profundidadeDeChamada(atual) : 0,
    profundidadeMediana: mediana(recentes.map((r) => r.profundidade)),
    historico,
    anosComFilaZero: historico.filter((r) => r.fila === 0).length,
    anosObservados: historico.length,
    // "vem sem fila" só vale se observamos mais de um ano — um ano zerado pode ser acaso
    estavel: historico.length >= 2 && historico.slice(0, 2).every((r) => r.fila === 0),
  };
}

/**
 * A fila cabe na chamada histórica da unidade?
 * A margem de 1,3 existe porque a fila anda mais fundo que o número de vagas:
 * a mediana de não-confirmação da rede é 24,2%.
 */
export function faixaDeChance(a: Agregado): Faixa {
  if (a.filaAtual === 0) return "alta";
  const p = a.profundidadeMediana;
  if (p <= 0) return "baixa";
  if (a.filaAtual <= 0.7 * p) return "alta";
  if (a.filaAtual <= 1.3 * p) return "media";
  return "baixa";
}

export const rotuloFaixa: Record<Faixa, string> = {
  alta: "Chance alta",
  media: "Chance média",
  baixa: "Chance baixa",
};

// ---------------------------------------------------------------- geografia

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Distância da família até a unidade. A família é o centróide do bairro dela —
 * a base é anonimizada e não traz lat/long do responsável. Precisão de ±1 km.
 */
export function distanciaKm(bairroFamilia: string, unidade: string): number | null {
  const b = bairros[bairroFamilia];
  const u = unidades[unidade];
  if (!b || !u) return null;
  const lat = u.lat ?? bairros[u.bk ?? ""]?.lat;
  const lng = u.lng ?? bairros[u.bk ?? ""]?.lng;
  if (lat == null || lng == null) return null;
  return haversine(b.lat, b.lng, lat, lng);
}

// ---------------------------------------------------------------- recomendação

export const PESOS = { proximidade: 0.4, ociosidade: 0.4, estabilidade: 0.2 };
export const RAIO_PADRAO_KM = 3;

export type Recomendacao = {
  unidade: string;
  nome: string;
  bairro: string | null;
  distanciaKm: number | null;
  agregado: Agregado;
  faixa: Faixa;
  score: number;
  aproximada: boolean;
};

/**
 * Ordena alternativas por proximidade, ociosidade e estabilidade.
 * Os pesos são públicos de propósito: recomendação em serviço público
 * cujo critério ninguém consegue ver é caixa-preta, não recomendação.
 */
export function recomendar(opts: {
  bairroFamilia: string;
  grupamento: string;
  horario: string;
  jaEscolhidas?: string[];
  raioKm?: number;
  limite?: number;
}): Recomendacao[] {
  const { bairroFamilia, grupamento, horario } = opts;
  const raio = opts.raioKm ?? RAIO_PADRAO_KM;
  const excluir = new Set(opts.jaEscolhidas ?? []);

  const candidatos: Recomendacao[] = [];
  for (const s of slots) {
    if (s.a !== ANO || s.g !== grupamento || s.h !== horario) continue;
    if (excluir.has(s.u)) continue;

    const d = distanciaKm(bairroFamilia, s.u);
    if (d === null || d > raio) continue;

    const ag = agregado(s.u, grupamento, horario);
    if (!ag) continue;

    // Sem histórico de chamada não há como afirmar que a vaga existe.
    if (ag.profundidadeMediana <= 0 && ag.confirmadosAtual === 0) continue;

    const proximidade = 1 - d / raio;
    const denom = Math.max(1, ag.profundidadeMediana);
    const ociosidade = Math.max(0, 1 - ag.filaAtual / denom);
    const estabilidade = ag.anosObservados ? ag.anosComFilaZero / ag.anosObservados : 0;

    candidatos.push({
      unidade: s.u,
      nome: unidades[s.u]?.n ?? s.u,
      bairro: unidades[s.u]?.b ?? null,
      distanciaKm: d,
      agregado: ag,
      faixa: faixaDeChance(ag),
      score:
        PESOS.proximidade * proximidade +
        PESOS.ociosidade * ociosidade +
        PESOS.estabilidade * estabilidade,
      aproximada: unidades[s.u]?.geo !== "unidade",
    });
  }

  candidatos.sort((a, b) => b.score - a.score);
  return candidatos.slice(0, opts.limite ?? 6);
}

/** Slots ociosos (fila zero) no bairro da família, para o mapa e o diagnóstico. */
export function ociosasNoBairro(bairroFamilia: string, grupamento: string, horario: string) {
  return (porBairroSlot.get(`${bairroFamilia}|${grupamento}|${horario}`) ?? []).filter(
    (s) => s.f === 0,
  );
}
