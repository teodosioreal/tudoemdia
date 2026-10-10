#!/usr/bin/env node
/**
 * Busca uma foto com licença livre (Pexels ou Unsplash), converte para WebP 1200x630,
 * salva como capa do artigo e grava o crédito do fotógrafo no frontmatter.
 *
 * Uso:
 *   node --env-file=.env scripts/fetch-images.mjs --slug calibragem-pneu-pressao-correta --query "car tire" [--provider pexels|unsplash] [--pick 2]
 *
 * Chaves (.env, nunca commitado):
 *   PEXELS_API_KEY=...
 *   UNSPLASH_ACCESS_KEY=...
 *
 * Regras editoriais: não use fotos com marcas ou logotipos visíveis, brasões de órgãos públicos
 * nem pessoas identificáveis. Confira a foto escolhida antes de publicar e revise o imageAlt.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => (cur.startsWith('--') ? [...acc, [cur.slice(2), arr[i + 1]]] : acc), []),
);
const { slug, query } = args;
const provider = args.provider ?? 'pexels';
const pick = Math.max(1, Number(args.pick ?? 1));

if (!slug || !query) {
  console.error('Uso: --slug <slug-do-artigo> --query "<termos em inglês>" [--provider pexels|unsplash] [--pick N]');
  process.exit(1);
}
const mdx = `src/content/artigos/${slug}.mdx`;
if (!existsSync(mdx)) {
  console.error(`Artigo não encontrado: ${mdx}`);
  process.exit(1);
}

async function fromPexels() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('Defina PEXELS_API_KEY no .env');
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${pick}`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels respondeu ${res.status}`);
  const photo = (await res.json()).photos?.[pick - 1];
  if (!photo) throw new Error('Nenhuma foto encontrada');
  return {
    download: photo.src.large2x ?? photo.src.original,
    credit: { name: photo.photographer, url: photo.photographer_url, source: 'Pexels' },
    page: photo.url,
  };
}

async function fromUnsplash() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('Defina UNSPLASH_ACCESS_KEY no .env');
  const headers = { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' };
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${pick}&content_filter=high`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Unsplash respondeu ${res.status}`);
  const photo = (await res.json()).results?.[pick - 1];
  if (!photo) throw new Error('Nenhuma foto encontrada');
  // Exigência das diretrizes da API: registrar o download
  await fetch(photo.links.download_location, { headers }).catch(() => {});
  return {
    download: `${photo.urls.raw}&w=1600&fm=jpg&q=85`,
    credit: {
      name: photo.user.name,
      url: `${photo.user.links.html}?utm_source=tudo_em_dia&utm_medium=referral`,
      source: 'Unsplash',
    },
    page: photo.links.html,
  };
}

const found = provider === 'unsplash' ? await fromUnsplash() : await fromPexels();
const img = Buffer.from(await (await fetch(found.download)).arrayBuffer());
const out = `src/assets/capas/${slug}-foto.webp`;
await sharp(img).resize(1200, 630, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(out);

let fm = await readFile(mdx, 'utf8');
fm = fm.replace(/^image: .*$/m, `image: ../../assets/capas/${slug}-foto.webp`);
fm = fm.replace(/^imageCredit:\n(?: {2}.*\n)+/m, '');
const creditYaml = `imageCredit:\n  name: ${JSON.stringify(found.credit.name)}\n  url: ${JSON.stringify(found.credit.url)}\n  source: ${found.credit.source}\n`;
fm = fm.replace(/^(imageAlt: .*\n)/m, `$1${creditYaml}`);
await writeFile(mdx, fm);

console.log(`Foto salva em ${out}`);
console.log(`Crédito: ${found.credit.name} / ${found.credit.source}`);
console.log(`Página da foto: ${found.page}`);
console.log('IMPORTANTE: confira a foto (sem marcas, logos ou pessoas identificáveis) e reescreva o imageAlt para descrevê-la.');
