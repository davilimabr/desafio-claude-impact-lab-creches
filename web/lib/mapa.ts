/**
 * Mapa estático do Google, montado no servidor.
 *
 * O mapa é apoio: a lista é a fonte de verdade (design system, seção 8). Por isso a
 * chave vive em `GOOGLE_MAPS_KEY` no `.env.local` e, quando ela não existe, a tela
 * mostra o painel de lista no lugar do mapa em vez de quebrar.
 */

/** Cores dos pins (seção 5.10). Sinal de vaga, não decoração. */
const CORES = {
  padrao: "0x8FBBEC",
  selecionado: "0x062E5F",
  disponivel: "0x147D4B",
  congestionado: "0x893800",
  casa: "0x0B4EA2",
} as const;

export type Pino = {
  lat: number;
  lng: number;
  /** Um caractere: é tudo que o marcador do Static Maps aceita como rótulo. */
  rotulo?: string;
  tom: keyof typeof CORES;
};

/**
 * O `onError` do <img> so vale depois da hidratacao: se a imagem falha durante o parse
 * do HTML, o React nunca fica sabendo e a tela guarda um retangulo quebrado. Por isso o
 * servidor pergunta antes, com uma imagem de 1x1, e a resposta fica em cache por hora.
 */
export async function mapaDisponivel(): Promise<boolean> {
  const chave = process.env.GOOGLE_MAPS_KEY;
  if (!chave) return false;
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=1&size=1x1&key=${chave}`,
      { next: { revalidate: 3600 } },
    );
    return r.ok;
  } catch {
    return false;
  }
}

export function urlMapaEstatico(
  pinos: Pino[],
  opts: { largura?: number; altura?: number; zoom?: number; centro?: { lat: number; lng: number } } = {},
): string | null {
  const chave = process.env.GOOGLE_MAPS_KEY;
  if (!chave || !pinos.length) return null;

  const { largura = 640, altura = 640, zoom, centro } = opts;
  const p = new URLSearchParams({
    size: `${largura}x${altura}`,
    scale: "2",
    maptype: "roadmap",
    language: "pt-BR",
    region: "BR",
  });
  if (centro) p.set("center", `${centro.lat},${centro.lng}`);
  if (zoom) p.set("zoom", String(zoom));

  // Sem center/zoom explícitos o Static Maps enquadra sozinho todos os marcadores.
  for (const pino of pinos) {
    const rotulo = pino.rotulo ? `label:${pino.rotulo}|` : "";
    p.append("markers", `color:${CORES[pino.tom]}|${rotulo}${pino.lat},${pino.lng}`);
  }
  p.set("key", chave);

  return `https://maps.googleapis.com/maps/api/staticmap?${p}`;
}
