"use client";

import { useState } from "react";

/**
 * A imagem do mapa, com plano B embutido.
 *
 * Se a chave não existe, ou se o Google recusa a requisição, a tela cai no conteúdo
 * alternativo em vez de mostrar um retângulo quebrado. O mapa é apoio; a lista, que já
 * está ao lado, continua sendo a fonte de verdade.
 */
export function ImagemDoMapa({
  src,
  alt,
  alternativa,
}: {
  src: string | null;
  alt: string;
  alternativa: React.ReactNode;
}) {
  const [falhou, setFalhou] = useState(false);

  if (!src || falhou) return <>{alternativa}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL externa e dinâmica do Static Maps; otimizar no servidor só adicionaria um salto.
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setFalhou(true)}
    />
  );
}
