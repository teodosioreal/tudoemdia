# Guia Automotivo

Site de conteúdo em português do Brasil sobre documentação de veículos, IPVA e licenciamento, seguro, manutenção, multas e CNH. É um site estático feito com [Astro](https://astro.build) e TypeScript.

## Requisitos

- Node.js 22 (veja `.nvmrc`)
- npm

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:4321 (rascunhos aparecem no dev)
npm run build      # valida tipos/conteúdo (astro check) e gera dist/
npm run preview    # serve o dist/ gerado
```

Para incluir rascunhos (`draft: true`) num build de teste, use `SHOW_DRAFTS=1 npm run build`.

## Antes de publicar

Edite `src/config.ts`:

- `SITE.name`, `SITE.url` (domínio definitivo, sem barra final) e `SITE.email`

Edite `src/content/autores/autor.json` com o nome e a bio reais do autor. Os campos `[VERIFICAR: ...]` da Política de Privacidade e dos Termos precisam ser preenchidos.

## Publicar um artigo novo

1. Crie `src/content/artigos/<slug>.mdx`. O nome do arquivo é a URL: `/<categoria>/<slug>/`.
2. Coloque a capa em `src/assets/capas/<slug>.webp` (1200×630).
3. Preencha o frontmatter (o build falha se algum campo obrigatório faltar ou estiver inválido):

```yaml
---
title: "Título com até 70 caracteres"
description: "Resumo de 70 a 160 caracteres, usado no Google e nas redes."
pubDate: 2026-10-10
updatedDate: 2026-10-10
category: documentacao   # documentacao | ipva-licenciamento | seguro-auto | manutencao | multas-cnh
tags: [transferência, detran]
author: autor            # id do arquivo em src/content/autores/
image: ../../assets/capas/<slug>.webp
imageAlt: "Descrição útil do que a imagem mostra"
keyword: palavra-chave principal
faq:                      # 3 a 5 perguntas; vira seção visível e JSON-LD FAQPage
  - q: "Pergunta?"
    a: "Resposta."
sources:                  # fontes oficiais, listadas no fim do artigo
  - title: "Lei nº 9.503/1997 (CTB)"
    url: "https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm"
---
```

4. No corpo, coloque `<Faq items={frontmatter.faq} />` onde a seção de perguntas frequentes deve aparecer (antes da conclusão). Use um H2 começando com "Conclusão" para o fechamento.
5. Rode `npm run build` e confira o resultado.

Ao revisar um artigo, atualize `updatedDate`. Essa data aparece no artigo, no Schema.org e no `<lastmod>` do sitemap.

## Anúncios (AdSense)

Os anúncios estão **desligados** por padrão (`ADS.enabled = false` em `src/config.ts`). Com a flag desligada, o site não carrega nenhum script do Google e não reserva espaço.

Para ativar depois da aprovação:

1. Preencha `ADS.client` (`ca-pub-...`) e, se quiser, os IDs de bloco em `ADS.slots`.
2. Troque o conteúdo de `public/ads.txt` pela linha fornecida pelo AdSense.
3. Configure a CMP de consentimento. Pode ser a "Privacidade e mensagens" do AdSense ou outra certificada pelo Google; o espaço reservado é `#cmp-root` em `src/layouts/BaseLayout.astro`.
4. Mude `ADS.enabled` para `true` e atualize a seção de cookies da Política de Privacidade.

Posições dos anúncios:

- **No corpo do artigo** (plugin `src/lib/rehype-ad-slots.ts`): após o 1º parágrafo, a cada 2 H2 e antes da conclusão. O plugin nunca coloca um anúncio colado a listas, tabelas, botões ou formulários e respeita o máximo definido em `ADS.inArticle.max`.
- **Sidebar sticky:** só no desktop (≥ 1024px).

## Estrutura

```
src/
  config.ts              # nome, domínio, categorias, flag de anúncios
  content.config.ts      # schema validado dos artigos e autores
  content/artigos/       # artigos em MDX
  content/autores/       # autores (JSON)
  assets/capas/          # capas dos artigos
  components/            # BaseHead (SEO), AdSlot, Faq, AuthorBox...
  layouts/               # Base, Article, Page
  lib/                   # helpers de conteúdo, Schema.org e anúncios
  pages/                 # rotas
public/                  # favicon, ads.txt, og-default.png
scripts/                 # utilitários (ícones; imagens e deploy nas próximas fases)
```

Para gerar de novo os ícones e a imagem OG padrão: `node scripts/build-icons.mjs`.

## Deploy

Instruções completas na Fase 6 (Nginx, Certbot e GitHub Actions/rsync).
