#!/usr/bin/env node
/**
 * Busca fotos com licença livre no Pexels (ou Unsplash) e coloca DENTRO do artigo,
 * logo após o "Resumo rápido" (a ilustração continua como capa).
 *
 *   node scripts/fetch-images.mjs --all                      # todos os artigos de scripts/fotos.json
 *   node scripts/fetch-images.mjs --slug <slug> --query "<termos>" [--pick 2] [--provider unsplash]
 *
 * Chave: variável de ambiente PEXELS_API_KEY (ou UNSPLASH_ACCESS_KEY), definida nas
 * configurações do ambiente ou num arquivo .env (nunca commitado).
 * Domínios que precisam estar liberados: api.pexels.com e images.pexels.com.
 *
 * Regras editoriais: sem marcas/logotipos, sem rostos identificáveis, sem placas legíveis.
 * Depois de baixar, confira cada foto e escreva o alt em português (o script grava o alt
 * em inglês do Pexels como rascunho, marcado com [REVISAR ALT]).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

if (existsSync('.env')) process.loadEnvFile('.env');

const argv = process.argv.slice(2);
const arg = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : undefined);
const provider = arg('provider') ?? 'pexels';
const pick = Math.max(1, Number(arg('pick') ?? 1));

async function searchPexels(query, n) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('Defina PEXELS_API_KEY (configurações do ambiente ou .env)');
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${Math.max(n, 5)}&locale=pt-BR`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels respondeu ${res.status}`);
  const photo = (await res.json()).photos?.[n - 1];
  if (!photo) throw new Error(`Nenhuma foto para "${query}"`);
  return {
    download: photo.src.large2x ?? photo.src.original,
    alt: photo.alt || query,
    credit: { name: photo.photographer, url: photo.photographer_url, source: 'Pexels' },
    page: photo.url,
  };
}

async function searchUnsplash(query, n) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('Defina UNSPLASH_ACCESS_KEY');
  const headers = { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' };
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${Math.max(n, 5)}&content_filter=high`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Unsplash respondeu ${res.status}`);
  const photo = (await res.json()).results?.[n - 1];
  if (!photo) throw new Error(`Nenhuma foto para "${query}"`);
  await fetch(photo.links.download_location, { headers }).catch(() => {});
  return {
    download: `${photo.urls.raw}&w=1600&fm=jpg&q=85`,
    alt: photo.alt_description || query,
    credit: { name: photo.user.name, url: `${photo.user.links.html}?utm_source=tudo_em_dia&utm_medium=referral`, source: 'Unsplash' },
    page: photo.links.html,
  };
}

async function process1(slug, query, n) {
  const mdx = `src/content/artigos/${slug}.mdx`;
  if (!existsSync(mdx)) throw new Error(`Artigo não encontrado: ${mdx}`);
  const found = provider === 'unsplash' ? await searchUnsplash(query, n) : await searchPexels(query, n);
  const img = Buffer.from(await (await fetch(found.download)).arrayBuffer());
  await mkdir('src/assets/fotos', { recursive: true });
  const out = `src/assets/fotos/${slug}.webp`;
  // 1200x675 (16:9), sem metadados, compressão para web
  await sharp(img).resize(1200, 675, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }).toFile(out);

  let fm = await readFile(mdx, 'utf8');
  fm = fm.replace(/^foto:\n(?: {2}.*\n)+/m, '');
  const yaml =
    `foto:\n  src: ../../assets/fotos/${slug}.webp\n` +
    `  alt: ${JSON.stringify(`[REVISAR ALT] ${found.alt}`)}\n` +
    `  credito: ${JSON.stringify(found.credit.name)}\n` +
    `  creditoUrl: ${JSON.stringify(found.credit.url)}\n` +
    `  fonte: ${found.credit.source}\n`;
  fm = fm.replace(/^(imageAlt: .*\n)/m, `$1${yaml}`);
  await writeFile(mdx, fm);
  console.log(`✓ ${slug} — ${found.credit.name} (${found.page})`);
}

if (argv.includes('--all')) {
  const map = JSON.parse(await readFile('scripts/fotos.json', 'utf8'));
  for (const [slug, query] of Object.entries(map)) {
    try { await process1(slug, query, pick); } catch (e) { console.log(`✗ ${slug}: ${e.message}`); }
  }
} else {
  const slug = arg('slug'), query = arg('query');
  if (!slug || !query) { console.error('Uso: --all  ou  --slug <slug> --query "<termos>"'); process.exit(1); }
  await process1(slug, query, pick);
}
console.log('Confira as fotos em src/assets/fotos/ e troque os alts marcados com [REVISAR ALT].');
