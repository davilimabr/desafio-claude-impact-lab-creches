/**
 * Vocabulario de icones do design system (secao 6). Material Symbols Outlined
 * redesenhado como SVG inline: grade de 24, traco de 1.8, `currentColor`, sem peso de
 * fonte de icone para baixar. A cor herda sempre do texto ao lado.
 *
 * Icone nunca aparece sozinho em navegacao primaria nem em chip de status: sempre
 * acompanha rotulo em texto.
 */
type Props = { size?: number; className?: string };

function Svg({ size = 20, className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** place — endereco */
export const IconeLocal = (p: Props) => (
  <Svg {...p}>
    <path d="M12 21c4.2-4.2 6.5-7.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 13.6 7.8 16.8 12 21Z" />
    <circle cx="12" cy="10.3" r="2.4" />
  </Svg>
);

/** near_me — proximidade */
export const IconePerto = (p: Props) => (
  <Svg {...p}>
    <path d="M20.2 3.8 4.6 10.1a.6.6 0 0 0 .05 1.1l6 2.15 2.15 6a.6.6 0 0 0 1.1.05L20.2 3.8Z" />
  </Svg>
);

/** school — unidade */
export const IconeEscola = (p: Props) => (
  <Svg {...p}>
    <path d="m12 3.8 9 4.6-9 4.6-9-4.6 9-4.6Z" />
    <path d="M6.5 10.7v4.6c0 1.7 2.5 3.1 5.5 3.1s5.5-1.4 5.5-3.1v-4.6" />
  </Svg>
);

/** schedule — turno e prazo */
export const IconeTurno = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.2V12l3.3 2" />
  </Svg>
);

/** description — documento e evidencia */
export const IconeDocumento = (p: Props) => (
  <Svg {...p}>
    <path d="M14 3.4H7.4A1.6 1.6 0 0 0 5.8 5v14a1.6 1.6 0 0 0 1.6 1.6h9.2A1.6 1.6 0 0 0 18.2 19V7.6L14 3.4Z" />
    <path d="M13.8 3.6v4.2h4.2M9 13h6M9 16.5h4" />
  </Svg>
);

/** person — responsavel */
export const IconePessoa = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="8.2" r="3.4" />
    <path d="M5.2 19.8c0-3.1 3-5.1 6.8-5.1s6.8 2 6.8 5.1" />
  </Svg>
);

/** add_circle — adicionar a lista */
export const IconeAdicionar = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 8.4v7.2M8.4 12h7.2" />
  </Svg>
);

/** do_not_disturb_on — remover da lista */
export const IconeRemover = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M8.4 12h7.2" />
  </Svg>
);

/** star — recomendado */
export const IconeEstrela = (p: Props) => (
  <Svg {...p}>
    <path d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85L12 3.6Z" />
  </Svg>
);

/** info — explicacao */
export const IconeInfo = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 11.2v5" />
    <path d="M12 7.9h.01" />
  </Svg>
);

/** check_circle — confirmado */
export const IconeConfirmado = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="m8.2 12.3 2.7 2.7 4.9-5.4" />
  </Svg>
);

/** warning — pendencia */
export const IconeAtencao = (p: Props) => (
  <Svg {...p}>
    <path d="M12 4.2 3.1 19.4h17.8L12 4.2Z" />
    <path d="M12 10v3.6" />
    <path d="M12 16.6h.01" />
  </Svg>
);

/** search — busca */
export const IconeBusca = (p: Props) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="m15.8 15.8 4 4" />
  </Svg>
);

/** chevron_right — separador de breadcrumb, avancar */
export const IconeAvancar = (p: Props) => (
  <Svg {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Svg>
);

/** chevron_left — voltar */
export const IconeVoltar = (p: Props) => (
  <Svg {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Svg>
);

/** format_list_numbered — minhas escolhas */
export const IconeLista = (p: Props) => (
  <Svg {...p}>
    <path d="M9.5 7H20M9.5 12H20M9.5 17H20" />
    <path d="M4.6 5.6h1v3.2M4 15.4h2.2L4 18.4h2.2" />
  </Svg>
);

/** bar_chart — diagnostico da rede */
export const IconeGrafico = (p: Props) => (
  <Svg {...p}>
    <path d="M4 20h16" />
    <path d="M8 20v-5.5M12 20V8.5M16 20v-8.5" />
  </Svg>
);

/** map — mapa */
export const IconeMapa = (p: Props) => (
  <Svg {...p}>
    <path d="m9.2 4.2-5.4 2.3v13.3l5.4-2.3 5.6 2.3 5.4-2.3V4.2l-5.4 2.3L9.2 4.2Z" />
    <path d="M9.2 4.2v13.3M14.8 6.5v13.3" />
  </Svg>
);

/** home_pin — o ponto de referencia da familia */
export const IconeCasa = (p: Props) => (
  <Svg {...p}>
    <path d="M4 11.2 12 4.5l8 6.7" />
    <path d="M6.3 9.6V19a.9.9 0 0 0 .9.9h9.6a.9.9 0 0 0 .9-.9V9.6" />
    <path d="M10.2 20v-5h3.6v5" />
  </Svg>
);
