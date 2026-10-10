/**
 * Configuração central do site. Tudo que depende de nome, domínio, autor
 * ou anúncios mora aqui — troque os valores marcados com TODO antes do deploy.
 */

export const SITE = {
  // TODO: nome definitivo do site
  name: 'Guia Automotivo',
  // TODO: domínio definitivo (com https:// e sem barra final)
  url: 'https://www.example.com',
  description:
    'Explicações claras sobre documentação, IPVA, seguro, manutenção, multas e CNH, com base na legislação e em fontes oficiais.',
  locale: 'pt-BR',
  ogLocale: 'pt_BR',
  // TODO: e-mail de contato real
  email: 'contato@example.com',
  // Imagem padrão para Open Graph (1200x630) em /public
  defaultOgImage: '/og-default.png',
  themeColor: '#0f3d5e',
} as const;

export const CATEGORIES = [
  {
    slug: 'documentacao',
    name: 'Documentação',
    description:
      'Transferência de veículo, CRLV digital, ATPV-e e comunicação de venda explicados passo a passo.',
  },
  {
    slug: 'ipva-licenciamento',
    name: 'IPVA e Licenciamento',
    description:
      'Como o IPVA é calculado, o que acontece com débitos em atraso e como manter o licenciamento em dia.',
  },
  {
    slug: 'seguro-auto',
    name: 'Seguro Auto',
    description:
      'Franquia, perfil do condutor, classe de bônus e as diferenças entre seguro e proteção veicular.',
  },
  {
    slug: 'manutencao',
    name: 'Manutenção',
    description:
      'Revisões, troca de óleo, calibragem de pneus e o que a lei diz sobre garantia.',
  },
  {
    slug: 'multas-cnh',
    name: 'Multas e CNH',
    description:
      'Recursos de multa, indicação de condutor, pontuação e renovação da carteira de motorista.',
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: string) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) throw new Error(`Categoria desconhecida: ${slug}`);
  return cat;
}

/**
 * Anúncios. Enquanto `enabled` for false, nenhum espaço é reservado,
 * nenhum <ins> é renderizado e nenhum script do Google é carregado.
 */
export const ADS = {
  enabled: false,
  // TODO: ca-pub-XXXXXXXXXXXXXXXX quando a conta AdSense for aprovada
  client: '',
  // IDs de bloco criados no painel do AdSense (opcional; vazio = anúncio automático no slot)
  slots: {
    inArticle: '',
    sidebar: '',
  },
  // Inserção automática dentro do artigo
  inArticle: {
    afterFirstParagraph: true,
    everyNthH2: 2,
    beforeConclusion: true,
    // Limite de blocos no corpo do texto
    max: 4,
  },
} as const;
