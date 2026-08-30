import { bairros, unidades, type Candidata, type Faixa } from "@/lib/creche";

// Mapa desenhado no servidor, sem biblioteca e sem tiles de rede: num pitch ao vivo,
// um mapa que depende do wi-fi do auditório é um mapa que pode falhar no palco.
// Projeção equiretangular local — em escala de bairro o erro é irrelevante.

const COR: Record<Faixa, string> = {
  alta: "#059669",
  media: "#d97706",
  baixa: "#e11d48",
};

const LADO = 520;
const MARGEM = 26;

export function Mapa({
  pontos,
  candidatas,
  escolhidas,
  raioKm,
}: {
  pontos: { bk: string; rotulo: string }[];
  candidatas: Candidata[];
  escolhidas: string[];
  raioKm: number;
}) {
  const origens = pontos.map((p) => ({ ...p, ...bairros[p.bk] })).filter((o) => o.lat != null);
  if (!origens.length) return null;

  const lat0 = origens.reduce((s, o) => s + o.lat, 0) / origens.length;
  const lng0 = origens.reduce((s, o) => s + o.lng, 0) / origens.length;
  const cos = Math.cos((lat0 * Math.PI) / 180);

  // graus -> km
  const kmX = (lng: number) => (lng - lng0) * 111.32 * cos;
  const kmY = (lat: number) => -(lat - lat0) * 110.57;

  // Enquadra o raio inteiro em torno de cada origem, para o círculo nunca sair da tela.
  let alcance = 0;
  for (const o of origens) {
    alcance = Math.max(alcance, Math.hypot(kmX(o.lng), kmY(o.lat)) + raioKm);
  }
  alcance *= 1.08;

  const escala = (LADO / 2 - MARGEM) / alcance;
  const px = (lng: number) => LADO / 2 + kmX(lng) * escala;
  const py = (lat: number) => LADO / 2 + kmY(lat) * escala;

  const marcadas = new Set(escolhidas);
  const pontosUnidade = candidatas
    .map((c) => {
      const u = unidades[c.unidade];
      const lat = u?.lat ?? bairros[u?.bk ?? ""]?.lat;
      const lng = u?.lng ?? bairros[u?.bk ?? ""]?.lng;
      if (lat == null || lng == null) return null;
      return { c, x: px(lng), y: py(lat) };
    })
    .filter((p): p is NonNullable<typeof p> => !!p);

  const totais = {
    alta: candidatas.filter((c) => c.faixa === "alta").length,
    media: candidatas.filter((c) => c.faixa === "media").length,
    baixa: candidatas.filter((c) => c.faixa === "baixa").length,
  };

  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-4">
      <figcaption className="mb-3 text-sm text-slate-600">
        <strong className="text-slate-900">{candidatas.length} creches</strong> atendem essa turma
        num raio de {raioKm} km de {origens.map((o) => o.nome).join(" e ")}.{" "}
        <span style={{ color: COR.alta }}>●</span> {totais.alta} com chance alta ·{" "}
        <span style={{ color: COR.media }}>●</span> {totais.media} média ·{" "}
        <span style={{ color: COR.baixa }}>●</span> {totais.baixa} baixa
      </figcaption>

      <svg
        viewBox={`0 0 ${LADO} ${LADO}`}
        className="mx-auto block h-auto w-full max-w-lg"
        role="img"
        aria-label={`Mapa com ${candidatas.length} creches num raio de ${raioKm} km`}
      >
        <rect width={LADO} height={LADO} rx="10" fill="#f8fafc" />

        {origens.map((o) => (
          <g key={o.bk}>
            <circle
              cx={px(o.lng)}
              cy={py(o.lat)}
              r={raioKm * escala}
              fill="#0f172a"
              fillOpacity="0.04"
              stroke="#94a3b8"
              strokeDasharray="5 4"
            />
          </g>
        ))}

        {pontosUnidade.map(({ c, x, y }) => (
          <g key={c.unidade}>
            {marcadas.has(c.unidade) && (
              <circle cx={x} cy={y} r="9" fill="none" stroke="#0f172a" strokeWidth="2" />
            )}
            <circle cx={x} cy={y} r={c.faixa === "alta" ? 5.5 : 4} fill={COR[c.faixa]}>
              <title>
                {`${c.nome} — ${c.distanciaKm.toFixed(1)} km · ${
                  c.agregado.filaAtual === 0
                    ? "sem fila"
                    : `${c.agregado.filaAtual} na fila`
                }, chamou ${c.agregado.profundidadeAtual} em 2025`}
              </title>
            </circle>
          </g>
        ))}

        {origens.map((o) => (
          <g key={`o-${o.bk}`}>
            <circle cx={px(o.lng)} cy={py(o.lat)} r="6" fill="#0f172a" />
            <circle cx={px(o.lng)} cy={py(o.lat)} r="11" fill="none" stroke="#0f172a" strokeWidth="1.5" />
            <text
              x={px(o.lng)}
              y={py(o.lat) - 17}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#0f172a"
            >
              {o.rotulo}
            </text>
          </g>
        ))}
      </svg>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        O ponto preto é o centro do bairro de referência, não o endereço exato — a base é
        anonimizada. As creches estão na coordenada real. Círculo marcado = já está nas suas
        opções.
      </p>
    </figure>
  );
}
