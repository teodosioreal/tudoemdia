# Checklist final de publicação

## Automático (`npm run verify`)

O comando falha se algum destes itens não estiver ok:

- [x] Configuração sem valores provisórios: domínio, e-mail, autor e responsável legal
- [x] 20 artigos dentro do padrão editorial:
  - 1.200 a 2.000 palavras, resposta direta nos dois primeiros parágrafos, H2 lógicos;
  - tabela ou lista, FAQ com 3 a 5 perguntas e conclusão;
  - fontes oficiais, de 3 a 5 links internos e pelo menos 2 links recebidos;
  - nenhuma frase genérica proibida.
- [x] Nenhum `[VERIFICAR]` pendente
- [x] Build com schema validado (`astro check`): alt obrigatório, tamanhos de title e description
- [x] Auditoria do `dist/`:
  - 1 H1 por página;
  - title e description únicos;
  - canonical, `lang="pt-BR"`;
  - alt, width e height em todas as imagens;
  - JSON-LD válido;
  - nenhum link interno quebrado;
  - sitemap apontando só para páginas existentes, `robots.txt` com Sitemap;
  - páginas obrigatórias presentes, `ads.txt`, 404.

## Manual, depois de publicar

- [ ] Lighthouse mobile ≥ 95 nas quatro categorias (home, uma categoria e um artigo). No ambiente de testes o resultado foi 99–100.
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) em um artigo: Article, BreadcrumbList e FAQPage reconhecidos
- [ ] [Schema Markup Validator](https://validator.schema.org/) sem erros
- [ ] `https://www.seudominio.com.br/sitemap-index.xml` abre e lista as páginas
- [ ] HTTP e domínio sem www redirecionam para `https://www.seudominio.com.br`
- [ ] Teste do formulário de busca e do link de e-mail na página de Contato

## Google Search Console

1. Acesse <https://search.google.com/search-console> e clique em **Adicionar propriedade**.
2. Escolha **Domínio**, digite `seudominio.com.br` e copie o registro TXT de verificação.
3. Crie esse registro TXT no DNS do domínio e clique em **Verificar**. Pode levar alguns minutos.
   - Alternativa: escolha **Prefixo do URL**, use o método **Tag HTML**, copie só o valor do atributo `content` para `SITE.googleSiteVerification` em `src/config.ts` e publique de novo.
4. Em **Sitemaps**, envie `sitemap-index.xml`.
5. Em **Inspeção de URL**, inspecione a home e 2 ou 3 artigos e clique em **Solicitar indexação**.
6. Nas semanas seguintes, acompanhe **Páginas** (indexação) e **Desempenho** (consultas e cliques).

## Google Analytics 4

O site **não** carrega nenhum script de terceiros. Para usar o GA4:

1. Em <https://analytics.google.com>, crie uma conta e uma **propriedade** com fuso de Brasília e moeda real.
2. Crie um **fluxo de dados da Web** com a URL do site e anote o **ID de medição** (`G-XXXXXXX`).
3. Antes de instalar o script, é preciso:
   - um banner de consentimento (CMP), exigido pela LGPD e pelo Google para usuários do Brasil e da Europa;
   - atualizar a seção de cookies da Política de Privacidade.
4. Me envie o ID de medição para eu integrar o GA4 com Consent Mode, carregado só depois do consentimento.

## AdSense

1. Com o site no ar, já indexado e com os dados reais do autor, solicite a análise em <https://adsense.google.com>.
2. Depois da aprovação:
   - preencha `ADS.client` em `src/config.ts`;
   - troque o conteúdo de `public/ads.txt` pela linha do AdSense;
   - configure a mensagem de consentimento em **Privacidade e mensagens** no painel do AdSense;
   - mude `ADS.enabled` para `true` e publique.
3. A Política de Privacidade passa a mostrar automaticamente o texto de anúncios ativos quando `ADS.enabled` é `true`.
