// Gera um infográfico de resumo (1080x1350) para cada artigo, a partir do frontmatter.
// Renderiza HTML no Chromium (mesma fonte Inter do site) e salva em public/infograficos/.
// Uso: node scripts/infograficos/generate.mjs [slug ...]
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import YAML from 'yaml';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(`${execSync('npm root -g').toString().trim()}/playwright`));
}

const DIR = 'src/content/artigos';
const OUT = 'public/infograficos';
const config = await readFile('src/config.ts', 'utf8');
const siteName = config.match(/name:\s*'([^']+)'/)[1];
const siteHost = new URL(config.match(/url:\s*'([^']+)'/)[1]).host;
const catNames = Object.fromEntries([...config.matchAll(/slug:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Destaca valores, prazos e medidas para leitura rápida
const highlight = (s) =>
  esc(s).replace(
    /(R\$\s?[\d.]+(?:,\d+)?|\d+(?:[.,]\d+)?\s?(?:%|mg\/L|km\/h|cv|cc|anos?|meses|mês|dias|pontos|horas)|\b\d{1,3}(?:[.,]\d+)?\s?(?:mil)\b)/g,
    (m) => `<b>${m.replace(/\s/g, '&nbsp;')}</b>`
  );
const fmtDate = (d) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const shorten = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

const logo = `<svg viewBox="0 0 32 32" width="44" height="44" aria-hidden="true"><path d="M16 1.2A14.8 14.8 0 0 0 16 30.8" fill="none" stroke="#f4b740" stroke-width="2.4"/><path d="M16 1.2A14.8 14.8 0 0 1 16 30.8" fill="none" stroke="#16794d" stroke-width="2.4"/><circle cx="16" cy="16" r="11.6" fill="#16794d"/><path d="M10.6 16.4l3.9 3.9 7.4-7.7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;

function html(fm) {
  const items = fm.resumo
    .map((r, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><p>${highlight(r)}</p></li>`)
    .join('');
  const fonte = fm.sources?.[0]?.title ? shorten(fm.sources[0].title.split(' (')[0], 60) : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1080px; height: 1350px; }
  body { font-family: Inter, sans-serif; background: #fff; color: #1d2b31; --s: 1; display: flex; flex-direction: column; }
  .bar { height: 14px; background: linear-gradient(90deg, #0f4c5c 0 58%, #16794d 58% 82%, #f4b740 82% 100%); flex: none; }
  main { flex: 1; display: flex; flex-direction: column; padding: calc(70px * var(--s)) 84px 0; min-height: 0; }
  .cat { align-self: flex-start; font-size: 24px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #16794d; background: #e8f3ee; border-radius: 999px; padding: 8px 20px; }
  h1 { margin-top: calc(28px * var(--s)); font-size: calc(62px * var(--s)); line-height: 1.12; font-weight: 800; letter-spacing: -.02em; color: #0a3540; }
  .label { margin-top: calc(40px * var(--s)); font-size: 22px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6a7a82; display: flex; align-items: center; gap: 16px; }
  .label::after { content: ''; flex: 1; height: 2px; background: #e3e9ec; }
  ol { list-style: none; padding: 0; margin-top: calc(14px * var(--s)); }
  li { display: grid; grid-template-columns: 78px 1fr; gap: 8px; padding: calc(26px * var(--s)) 0; border-bottom: 2px solid #eef2f4; }
  li:last-child { border-bottom: 0; }
  .n { font-size: calc(34px * var(--s)); font-weight: 800; color: #f0a91a; font-variant-numeric: tabular-nums; line-height: 1.3; }
  li p { font-size: calc(35px * var(--s)); line-height: 1.38; color: #24343b; }
  li b { font-weight: 800; color: #0a3540; white-space: nowrap; }
  footer { flex: none; margin: 0 84px; padding: 30px 0 44px; border-top: 2px solid #e3e9ec; display: flex; align-items: center; gap: 16px; }
  .brand { display: flex; flex-direction: column; }
  .brand strong { font-size: 30px; font-weight: 800; color: #0a3540; }
  .brand strong em { font-style: normal; color: #16794d; }
  .brand span { font-size: 22px; color: #6a7a82; }
  .meta { margin-left: auto; text-align: right; font-size: 21px; color: #6a7a82; line-height: 1.4; max-width: 520px; }
  .meta b { color: #24343b; font-weight: 600; }
</style></head><body>
<div class="bar"></div>
<main id="m">
  <span class="cat">${esc(catNames[fm.category] ?? '')}</span>
  <h1>${esc(fm.title)}</h1>
  <p class="label">O essencial</p>
  <ol>${items}</ol>
</main>
<footer>
  ${logo}
  <div class="brand"><strong>${esc(siteName.replace(/ em Dia$/, ''))}${/ em Dia$/.test(siteName) ? ' <em>em Dia</em>' : ''}</strong><span>${siteHost}</span></div>
  <div class="meta">Atualizado em <b>${fmtDate(fm.updatedDate)}</b>${fonte ? `<br>Base: ${esc(fonte)}` : ''}</div>
</footer>
</body></html>`;
}

const only = process.argv.slice(2);
const files = (await readdir(DIR)).filter((f) => f.endsWith('.mdx') && (!only.length || only.includes(f.replace(/\.mdx$/, ''))));
await mkdir(OUT, { recursive: true });
const manifestPath = 'src/data/infograficos.json';
let manifest = {};
try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch {}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const f of files) {
  const slug = f.replace(/\.mdx$/, '');
  const fm = YAML.parse((await readFile(`${DIR}/${f}`, 'utf8')).split(/^---$/m)[1]);
  if (fm.draft || !fm.resumo?.length) continue;
  await page.setContent(html(fm), { waitUntil: 'load' });
  // Reduz a escala até o conteúdo caber na arte
  await page.evaluate(() => {
    const m = document.getElementById('m');
    const set = (v) => document.body.style.setProperty('--s', String(v));
    const fits = () => m.scrollHeight <= m.clientHeight + 1;
    let s = 1;
    // Cresce até preencher a arte (resumos curtos) e recua se passar
    while (fits() && s < 1.3) { s += 0.03; set(s); }
    while (!fits() && s > 0.6) { s -= 0.02; set(s); }
  });
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).webp({ quality: 84 }).toFile(`${OUT}/${slug}-1080.webp`);
  await sharp(png).resize(540).webp({ quality: 84 }).toFile(`${OUT}/${slug}-540.webp`);
  manifest[slug] = {
    alt: `Infográfico com o resumo do guia "${fm.title}": ${fm.resumo.join(' ')}`,
  };
  console.log(`✓ ${slug}`);
}
await browser.close();
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`${files.length} infográfico(s) processado(s).`);
