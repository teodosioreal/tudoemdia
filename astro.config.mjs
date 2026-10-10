// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { SITE } from './src/config';
import rehypeAdSlots from './src/lib/rehype-ad-slots';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** URL do artigo -> updatedDate, lido do frontmatter, para o <lastmod> do sitemap. */
function articleLastmod() {
  /** @type {Map<string, string>} */
  const map = new Map();
  /** @param {string} dir */
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.mdx?$/.test(e.name)) {
        const fm = readFileSync(p, 'utf8').split('---')[1] ?? '';
        const cat = fm.match(/^category:\s*["']?([\w-]+)/m)?.[1];
        const upd = fm.match(/^updatedDate:\s*["']?([\d-]+)/m)?.[1];
        if (cat && upd) map.set(`/${cat}/${e.name.replace(/\.mdx?$/, '')}/`, upd);
      }
    }
  };
  walk('./src/content/artigos');
  return map;
}
const lastmod = articleLastmod();
// Home e categorias: data do artigo atualizado mais recentemente
for (const [url, d] of [...lastmod]) {
  const cat = url.split('/')[1];
  const catUrl = `/${cat}/`;
  if ((lastmod.get(catUrl) ?? '') < d) lastmod.set(catUrl, d);
  if ((lastmod.get('/') ?? '') < d) lastmod.set('/', d);
}

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS pequeno vai inline: elimina requisição bloqueante de renderização
    inlineStylesheets: 'always',
  },
  prefetch: false,
  markdown: {
    // MDX herda este processador (e o plugin que insere os espaços de anúncio)
    processor: unified({ rehypePlugins: [rehypeAdSlots] }),
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(busca|404)\/?$/.test(page),
      serialize(item) {
        const d = lastmod.get(new URL(item.url).pathname);
        if (d) item.lastmod = new Date(d).toISOString();
        return item;
      },
    }),
  ],
  image: {
    responsiveStyles: false,
  },
});
