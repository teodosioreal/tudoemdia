# Tudo em Dia

Site de conteúdo em português do Brasil (tudoemdia.blog.br), começando pela seção de veículos: documentação, IPVA e licenciamento, seguro, manutenção, multas e CNH. É um site estático feito com [Astro](https://astro.build) e TypeScript.

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

- Domínio: `node scripts/set-domain.mjs seudominio.com.br`. O comando atualiza `SITE.url` e o e-mail e gera a configuração do Nginx.
- Autor: nome e bio reais em `src/content/autores/thiago-teodosio.json`.
- Responsável pelo site, exigido pela LGPD: `LEGAL.owner` em `src/config.ts`.
- Nome do site: `SITE.name` em `src/config.ts`.

O `npm run verify` acusa qualquer item que ainda esteja provisório.

## Publicar um artigo novo

1. Crie `src/content/artigos/<slug>.mdx`. O nome do arquivo é a URL: `/<categoria>/<slug>/`.
2. Gere a capa: acrescente o slug em `scripts/covers/generate-covers.mjs` e rode `npm run covers`, ou use uma foto livre com `npm run fetch-image`. O resultado vai para `src/assets/capas/<slug>.webp` (1200×630).
3. Preencha o frontmatter (o build falha se algum campo obrigatório faltar ou estiver inválido):

```yaml
---
title: "Título com até 70 caracteres"
description: "Resumo de 70 a 160 caracteres, usado no Google e nas redes."
pubDate: 2026-10-10
updatedDate: 2026-10-10
category: documentacao-do-veiculo   # documentacao-do-veiculo | ipva-licenciamento | seguro-auto | manutencao-do-carro | multas-cnh
tags: [transferência, detran]
author: thiago-teodosio  # id do arquivo em src/content/autores/
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
5. Rode `npm run lint:content` para conferir o artigo contra o padrão editorial e depois `npm run build`.

O padrão editorial completo está em [`docs/PADRAO-EDITORIAL.md`](docs/PADRAO-EDITORIAL.md). Use [`docs/modelo-artigo.mdx`](docs/modelo-artigo.mdx) como ponto de partida.

| Comando | O que faz |
|---|---|
| `npm run lint:content` | Confere tamanho, estrutura, FAQ, fontes oficiais, links internos (enviados e recebidos), frases proibidas e lista os `[VERIFICAR]` |
| `npm run verify` | Modo estrito, para antes do deploy: falha com `[VERIFICAR]` pendente ou se algum artigo receber menos de 2 links |

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

## Publicação (deploy)

- **Hostinger, na hospedagem web comum:** é o caminho recomendado para este site. O passo a passo está em [`docs/HOSTINGER.md`](docs/HOSTINGER.md), e o `.htaccess` é gerado pelo `set-domain`.
- **VPS com Nginx:** o roteiro está em [`docs/DEPLOY.md`](docs/DEPLOY.md). Em resumo:

```bash
node scripts/set-domain.mjs seudominio.com.br   # domínio no site inteiro + configuração do Nginx
npm run verify                                  # preflight, padrão editorial estrito, build e auditoria de SEO
npm run deploy                                  # envia o dist/ para a VPS por rsync (ou use o GitHub Actions)
```

A preparação da VPS (Nginx, SSL com Certbot, firewall e usuário de deploy) é feita uma vez com `scripts/server-setup.sh`.

O checklist final, o cadastro no Google Search Console, o GA4 e o AdSense estão em [`docs/CHECKLIST-FINAL.md`](docs/CHECKLIST-FINAL.md).

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local com recarga automática |
| `npm run build` | Checagem de tipos, verificação do conteúdo e build |
| `npm run lint:content` | Verifica os artigos contra o padrão editorial |
| `npm run audit` | Audita o `dist/`: H1, títulos, canonical, alt, JSON-LD, links e sitemap |
| `npm run verify` | Tudo acima em modo estrito, o que deve passar antes de publicar |
| `npm run covers` | Gera de novo as capas SVG/WebP (`scripts/covers/generate-covers.mjs`) |
| `npm run fetch-image -- --slug <slug> --query "<termos>"` | Busca foto livre no Pexels/Unsplash (chave no `.env`) e grava o crédito |
