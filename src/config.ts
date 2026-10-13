/**
 * Configuração central do site. Tudo que depende de nome, domínio, autor
 * ou anúncios mora aqui — troque os valores marcados com TODO antes do deploy.
 */

export const SITE = {
  name: 'Tudo em Dia',
  // TODO: domínio definitivo (com https:// e sem barra final)
  url: 'https://tudoemdia.blog.br',
  description:
    'Guias práticos para deixar o carro, os documentos e as obrigações em dia: IPVA, CNH, multas, seguro e manutenção, com base na lei e em fontes oficiais.',
  locale: 'pt-BR',
  ogLocale: 'pt_BR',
  // TODO: e-mail de contato real
  email: 'contato@tudoemdia.blog.br',
  // Imagem padrão para Open Graph (1200x630) em /public
  defaultOgImage: '/og-default.png',
  themeColor: '#0f4c5c',
  // Código da meta tag de verificação do Google Search Console (opcional; só o conteúdo do atributo content)
  googleSiteVerification: '',
  // Perfis oficiais do site em redes sociais (sameAs no Schema.org)
  sameAs: [] as string[],
} as const;

/**
 * Dados exibidos nas páginas legais. `owner` é obrigatório pela LGPD
 * (identificação do controlador) — o `npm run verify` falha enquanto estiver vazio.
 */
export const LEGAL = {
  // TODO: nome completo ou razão social do responsável pelo site (e CNPJ, se houver)
  owner: 'Thiago Teodosio',
  // Data da versão em vigor da Política de Privacidade e dos Termos de Uso
  policyDate: '12 de outubro de 2026',
} as const;

export const CATEGORIES = [
  {
    slug: 'documentacao-do-veiculo',
    group: 'Veículos',
    name: 'Documentação',
    h1: 'Documentação do veículo: transferência, ATPV-e e CRLV',
    title: 'Documentação do veículo: transferência, ATPV-e e CRLV digital',
    description:
      'Guias sobre documentação de veículos: transferência de carro usado, ATPV-e, CRLV digital e comunicação de venda, com base no CTB.',
    intro: [
      'Comprar, vender ou simplesmente manter o carro em dia envolve documentos que mudaram muito nos últimos anos. O antigo DUT em papel deu lugar à ATPV-e, o CRLV passou a ser digital e a transferência já pode ser assinada pelo celular.',
      'Nesta seção você encontra o passo a passo de cada etapa, os prazos do Código de Trânsito Brasileiro e os cuidados que evitam multa, retrabalho e golpe na compra e venda de veículos usados.',
    ],
  },
  {
    slug: 'ipva-licenciamento',
    group: 'Veículos',
    name: 'IPVA e Licenciamento',
    h1: 'IPVA e licenciamento: cálculo, atraso e regularização',
    title: 'IPVA e licenciamento: cálculo, atraso e como regularizar',
    description:
      'Como o IPVA é calculado, quem paga na venda do carro, o que acontece com IPVA e licenciamento atrasados e como regularizar o veículo.',
    intro: [
      'O IPVA é um imposto estadual, e o licenciamento é a autorização anual para o veículo circular. Os dois andam juntos: sem o IPVA quitado, o licenciamento não sai, e rodar sem licenciamento é infração gravíssima com remoção do veículo.',
      'Como cada estado tem sua lei, nossos guias explicam as regras que valem em todo o país e mostram onde conferir alíquotas, calendários e valores na Secretaria da Fazenda e no Detran do seu estado.',
    ],
  },
  {
    slug: 'seguro-auto',
    group: 'Veículos',
    name: 'Seguro Auto',
    h1: 'Seguro auto: franquia, perfil, bônus e proteção veicular',
    title: 'Seguro auto: franquia, perfil do condutor e classe de bônus',
    description:
      'Entenda franquia, questionário de perfil, classe de bônus e as diferenças entre seguro auto e proteção veicular, com base na Lei 15.040/2024.',
    intro: [
      'O preço do seguro auto depende de escolhas que muita gente faz sem entender: o tipo de franquia, as respostas do questionário de perfil e o histórico de bônus. Cada uma delas pesa na hora de contratar e, principalmente, na hora do sinistro.',
      'Os guias desta seção explicam essas escolhas com base na nova Lei do Contrato de Seguro (Lei 15.040/2024) e nas normas da SUSEP, além de comparar o seguro com a proteção veicular regulamentada pela LC 213/2025.',
    ],
  },
  {
    slug: 'manutencao-do-carro',
    group: 'Veículos',
    name: 'Manutenção',
    h1: 'Manutenção do carro: revisão, óleo, pneus e garantia',
    title: 'Manutenção do carro: revisão, troca de óleo, pneus e garantia',
    description:
      'Revisão pelo manual, troca de óleo, calibragem dos pneus e o que o Código de Defesa do Consumidor diz sobre garantia e oficinas.',
    intro: [
      'Manutenção preventiva é o que separa um carro confiável de um carro que vive na oficina. O roteiro está no manual do proprietário: o plano de revisões, o óleo certo, a pressão dos pneus e os intervalos para uso normal e severo.',
      'Aqui você aprende a seguir esse roteiro sem pagar por serviços desnecessários, a conferir o que a oficina fez e a proteger a garantia do fabricante, com base no Código de Defesa do Consumidor.',
    ],
  },
  {
    slug: 'multas-cnh',
    group: 'Veículos',
    name: 'Multas e CNH',
    h1: 'Multas e CNH: recursos, pontos e renovação',
    title: 'Multas e CNH: recurso, indicação de condutor, pontos e validade',
    description:
      'Como recorrer de multa, indicar o condutor, entender o limite de pontos e renovar a CNH, com as regras atuais do Código de Trânsito.',
    intro: [
      'Uma notificação de multa abre prazos curtos: para indicar quem dirigia, para se defender e para pagar com desconto. Perder esses prazos significa pontos na CNH que poderiam ter ido para outra pessoa ou multas que poderiam ter sido canceladas.',
      'Os guias desta seção explicam cada etapa do processo, o limite de 20, 30 ou 40 pontos, a validade da CNH por idade e as mudanças trazidas pelas Leis 14.071/2020 e 15.428/2026.',
    ],
  },
  {
    slug: 'mei',
    group: 'Seu negócio',
    name: 'MEI',
    h1: 'MEI: crédito, dívidas, DAS e programas do governo',
    title: 'MEI: crédito, renegociação de dívidas, DAS e programas do governo',
    description:
      'Guias para o microempreendedor individual: programas de crédito e renegociação do governo federal, DAS, limite de faturamento e regularização.',
    intro: [
      'Ser MEI dá CNPJ, nota fiscal e acesso a crédito com juros menores, mas também traz obrigações: o DAS todo mês, a declaração anual e o limite de faturamento. Quem atrasa uma delas pode perder benefícios e ter a dívida inscrita na Dívida Ativa.',
      'Os guias desta seção explicam os programas do governo federal para pequenos negócios, como pedir crédito e renegociar dívidas, sempre com base nas regras publicadas no gov.br e no Portal do Empreendedor.',
    ],
  },
] as const;

/** Grupos de categorias (seções do site). Novos assuntos entram como novos grupos. */
export const GROUPS = [...new Set(CATEGORIES.map((c) => c.group))];

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
/**
 * Google Analytics 4. Com `ga4Id` vazio, o site não carrega nada do Google Analytics.
 * Com o ID preenchido (G-XXXXXXXXXX), o GA4 entra com o Modo de Consentimento: nenhum
 * cookie de estatística é gravado até o visitante aceitar no aviso de cookies.
 */
export const ANALYTICS = {
  ga4Id: 'G-H4LBH5B3BS',
  // Google Tag Manager. Carrega depois do consentimento padrão, então as tags
  // configuradas lá também respeitam a escolha do visitante no aviso de cookies.
  gtmId: 'GTM-T5TSKFDW',
} as const;

export const ADS = {
  enabled: false,
  // Conta AdSense. O script carrega em todas as páginas (verificação do site);
  // os espaços de anúncio só aparecem com enabled = true, depois da aprovação.
  client: 'ca-pub-1167691833070932',
  // IDs de bloco criados no painel do AdSense (opcional; vazio = anúncio automático no slot)
  slots: {
    inArticle: '',
    sidebar: '',
  },
  // Inserção automática dentro do artigo
  inArticle: {
    afterIntro: true,
    everyNthH2: 2,
    beforeConclusion: true,
    // Limite de blocos no corpo do texto (3 mantém a leitura confortável no celular)
    max: 3,
  },
} as const;

/** Guia em destaque no topo da página inicial (slug do arquivo). Se não existir, usa o mais recente com foto. */
export const DESTAQUE = 'prospera-mei';
