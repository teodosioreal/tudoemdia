#!/usr/bin/env node
/**
 * Auditoria de SEO e integridade do site gerado (dist/). Rode depois do build:
 *   node scripts/audit-dist.mjs
 * Verifica, em cada página HTML: 1 H1, <title> e meta description únicos e com tamanho
 * adequado, canonical, lang pt-BR, alt em todas as imagens, JSON-LD válido e links
 * internos que apontam para páginas existentes. Também valida sitemap e robots.txt.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
if (!existsSync(DIST)) {
  console.error('Rode o build antes: npm run build');
  process.exit(1);
}
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const routeOf = (f) => '/' + f.slice(DIST.length + 1).replace(/index\.html$/, '').replace(/\.html$/, '');
const exists = (path) => {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return true;
  const p = join(DIST, clean);
  return existsSync(p) && !p.endsWith('/') ? true : existsSync(join(p, 'index.html')) || existsSync(p);
};

const errors = [];
const warns = [];
const titles = new Map();
const descs = new Map();

for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  const route = routeOf(f);
  const isNoindex = /<meta name="robots" content="noindex/.test(html);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) errors.push(`${route}: ${h1} H1 (esperado 1)`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
  if (!title) errors.push(`${route}: sem <title>`);
  if (title.length > 65) warns.push(`${route}: title com ${title.length} caracteres`);
  if (!desc) errors.push(`${route}: sem meta description`);
  if (desc.length > 165) warns.push(`${route}: description com ${desc.length} caracteres`);
  if (!isNoindex) {
    if (titles.has(title)) errors.push(`${route}: title repetido de ${titles.get(title)}`);
    if (descs.has(desc)) errors.push(`${route}: description repetida de ${descs.get(desc)}`);
    titles.set(title, route);
    descs.set(desc, route);
    if (!/<link rel="canonical" href="https?:\/\/[^"]+"/.test(html)) errors.push(`${route}: sem canonical`);
  }
  if (!/<html lang="pt-BR"/.test(html)) errors.push(`${route}: lang diferente de pt-BR`);
  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    // alt="" é válido para imagem decorativa (ex.: foto do autor ao lado do nome já escrito)
    if (!/\balt(=|\s|>)/.test(img)) errors.push(`${route}: imagem sem atributo alt: ${img.slice(0, 80)}`);
    if (!/\bwidth="\d+"/.test(img) || !/\bheight="\d+"/.test(img)) errors.push(`${route}: imagem sem width/height`);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(m[1]); } catch { errors.push(`${route}: JSON-LD inválido`); }
  }
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (href.startsWith('//')) continue;
    if (!exists(href)) errors.push(`${route}: link interno quebrado → ${href}`);
  }
  if (/\[VERIFICAR/.test(html)) errors.push(`${route}: contém [VERIFICAR]`);
  if (/example\.com/.test(html)) warns.push(`${route}: ainda usa o domínio provisório example.com`);
}

// sitemap e robots
const sm = join(DIST, 'sitemap-0.xml');
if (!existsSync(join(DIST, 'sitemap-index.xml')) || !existsSync(sm)) errors.push('sitemap ausente');
else {
  const locs = [...readFileSync(sm, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  for (const l of locs) if (!exists(l)) errors.push(`sitemap aponta para página inexistente: ${l}`);
  console.log(`sitemap: ${locs.length} URLs`);
}
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!/Sitemap: https?:\/\//.test(robots)) errors.push('robots.txt sem linha Sitemap');
for (const req of ['sobre', 'contato', 'politica-de-privacidade', 'termos-de-uso', 'aviso-legal']) {
  if (!existsSync(join(DIST, req, 'index.html'))) errors.push(`página obrigatória ausente: /${req}/`);
}
if (!existsSync(join(DIST, 'ads.txt'))) errors.push('ads.txt ausente');
if (!existsSync(join(DIST, '404.html'))) errors.push('404.html ausente');

console.log(`${pages.length} páginas auditadas.`);
const uniqWarns = [...new Set(warns.map((w) => w.replace(/^\/[^:]*: /, '')))];
for (const w of warns.filter((w) => !w.includes('example.com'))) console.log('aviso:', w);
if (warns.some((w) => w.includes('example.com'))) console.log('aviso: o site ainda usa o domínio provisório example.com (configure com scripts/set-domain.mjs)');
for (const e of errors) console.log('ERRO:', e);
console.log(`${errors.length} erro(s).`);
process.exit(errors.length ? 1 : 0);
