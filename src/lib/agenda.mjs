// Agendamento de artigos: um artigo com pubDate no futuro (ou draft: true) não é publicado.
// O workflow "Publicar" roda todo dia de manhã, então o artigo entra no ar sozinho na data marcada.
// Módulo em JS puro (lê o frontmatter direto do disco) para servir ao astro.config e aos plugins rehype.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = './src/content/artigos';
const showAll = () => process.env.SHOW_DRAFTS === '1' || process.env.NODE_ENV === 'development';

/** Hoje, em UTC, no formato AAAA-MM-DD (as datas do frontmatter também são lidas em UTC). */
export const hoje = () => new Date().toISOString().slice(0, 10);

/** true se o artigo já pode aparecer no site. */
export function estaPublicado({ pubDate, draft }) {
  if (showAll()) return true;
  return !draft && String(pubDate).slice(0, 10) <= hoje();
}

/** slug -> { category, pubDate, updatedDate, draft } de todos os artigos. */
export function artigos() {
  /** @type {Map<string, {category: string, pubDate: string, updatedDate: string, draft: boolean}>} */
  const map = new Map();
  for (const e of readdirSync(DIR, { withFileTypes: true })) {
    if (!/\.mdx?$/.test(e.name)) continue;
    const fm = readFileSync(join(DIR, e.name), 'utf8').split('---')[1] ?? '';
    const get = (k) => fm.match(new RegExp(`^${k}:\\s*["']?([\\w-]+)`, 'm'))?.[1] ?? '';
    map.set(e.name.replace(/\.mdx?$/, ''), {
      category: get('category'),
      pubDate: get('pubDate'),
      updatedDate: get('updatedDate'),
      draft: get('draft') === 'true',
    });
  }
  return map;
}
