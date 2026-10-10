#!/usr/bin/env node
/**
 * Verifica os artigos contra o padrão editorial (docs/PADRAO-EDITORIAL.md).
 *
 *   node scripts/check-content.mjs            # relatório; falha só em erros
 *   node scripts/check-content.mjs --strict   # também falha em [VERIFICAR] e em artigo com < 2 links recebidos
 *   node scripts/check-content.mjs --drafts   # inclui rascunhos
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const STRICT = process.argv.includes('--strict');
const DRAFTS = process.argv.includes('--drafts');
const ROOT = 'src/content/artigos';
const STATIC_ROUTES = new Set([
  '/', '/sobre/', '/contato/', '/politica-de-privacidade/', '/termos-de-uso/', '/aviso-legal/', '/busca/',
  '/documentacao/', '/ipva-licenciamento/', '/seguro-auto/', '/manutencao/', '/multas-cnh/', '/autor/thiago-teodosio/',
]);
const OFFICIAL = /(\.gov\.br|planalto\.gov\.br|\.jus\.br|\.leg\.br|susep\.gov\.br)/i;

// Frases genéricas de texto automático — proibidas no corpo
const BANNED = [
  'no mundo atual', 'nos dias de hoje', 'nos dias atuais', 'em resumo, é importante', 'é importante ressaltar',
  'vale ressaltar que', 'cabe ressaltar', 'é fundamental destacar', 'neste artigo, vamos', 'neste artigo vamos',
  'sem mais delongas', 'em um mundo cada vez mais', 'desempenha um papel crucial', 'no cenário atual',
  'não é segredo que', 'mergulhar', 'desvendar', 'em suma', 'por fim, mas não menos importante',
];

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : /\.mdx?$/.test(e.name) ? [join(dir, e.name)] : [],
  );
}

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: frontmatter ausente`);
  const fm = m[1];
  const get = (k) => fm.match(new RegExp(`^${k}:\\s*["']?(.*?)["']?\\s*$`, 'm'))?.[1] ?? '';
  const faqCount = (fm.match(/^\s*-\s*q:/gm) ?? []).length;
  const sources = [...fm.matchAll(/^\s*url:\s*["']?(\S+?)["']?\s*$/gm)].map((x) => x[1]);
  return {
    file,
    slug: basename(file).replace(/\.mdx?$/, ''),
    title: get('title'),
    description: get('description'),
    category: get('category'),
    keyword: get('keyword'),
    draft: /^draft:\s*true/m.test(fm),
    faqCount,
    sources,
    fmRaw: fm,
    body: m[2],
  };
}

/** Texto "visível" do corpo: sem JSX, código, sintaxe de link/tabela. */
function plainText(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[A-Z][\s\S]*?\/>/g, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/^import .*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, ' ')
    .replace(/[#>*_|`]/g, ' ');
}
const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-.,%/]*/gu) ?? []).length;

const files = walk(ROOT);
const all = files.map(parse);
const articles = all.filter((a) => DRAFTS || !a.draft);
const urlOf = (a) => `/${a.category}/${a.slug}/`;
const known = new Set([...STATIC_ROUTES, ...all.map(urlOf)]);
const inbound = new Map(articles.map((a) => [urlOf(a), new Set()]));

const report = [];
let errors = 0;
let warnings = 0;
const verificar = [];

for (const a of articles) {
  const E = [];
  const W = [];
  const text = plainText(a.body);
  const wc = words(text);
  // FAQ não está no corpo (vem do frontmatter), mas é texto visível: soma ao total
  const faqWords = words(plainText(a.fmRaw.split(/^faq:/m)[1]?.split(/^\w+:/m)[0] ?? ''));
  const total = wc + faqWords;

  if (a.title.length < 20 || a.title.length > 70) E.push(`title com ${a.title.length} caracteres (20 a 70)`);
  if (a.description.length < 70 || a.description.length > 160) E.push(`description com ${a.description.length} caracteres (70 a 160)`);
  if (total < 1200) E.push(`${total} palavras (mín. 1.200)`);
  if (total > 2000) W.push(`${total} palavras (máx. recomendado 2.000)`);

  // Estrutura
  const beforeH2 = a.body.split(/^## /m)[0];
  const introParas = beforeH2.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !p.startsWith('import') && !p.startsWith('<'));
  if (introParas.length < 2) E.push('menos de 2 parágrafos antes do primeiro H2 (resposta direta)');
  if (/^### /m.test(beforeH2)) E.push('H3 antes do primeiro H2');
  if (/^# /m.test(a.body)) E.push('H1 no corpo (o título já é o H1)');
  const h2s = [...a.body.matchAll(/^## (.+)$/gm)].map((x) => x[1]);
  if (h2s.length < 3) E.push(`só ${h2s.length} H2`);
  if (!h2s.some((h) => /^conclus[aã]o/i.test(h))) E.push('falta H2 de "Conclusão"');
  if (!/^\|.+\|\s*$/m.test(a.body) && !/^\s*(?:[-*]|\d+\.)\s+/m.test(a.body)) E.push('nenhuma tabela ou lista');
  if (a.faqCount < 3 || a.faqCount > 5) E.push(`FAQ com ${a.faqCount} perguntas (exigido 3 a 5)`);
  if (!/<Faq\b/.test(a.body)) E.push('componente <Faq /> ausente no corpo');

  // Parágrafos longos (2–3 linhas no celular ≈ até ~60 palavras)
  const longParas = a.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^(#|\||[-*] |\d+\. |<|import|>)/.test(p))
    .filter((p) => words(plainText(p)) > 65);
  if (longParas.length) W.push(`${longParas.length} parágrafo(s) com mais de 65 palavras: "${longParas[0].slice(0, 60)}…"`);

  // Palavra-chave nos dois primeiros parágrafos
  const kw = norm(a.keyword);
  const kwTokens = kw.split(/\s+/).filter((t) => t.length > 3);
  const introN = norm(plainText(introParas.slice(0, 2).join(' ')) + ' ' + a.title);
  if (kwTokens.length && kwTokens.filter((t) => introN.includes(t)).length < Math.ceil(kwTokens.length * 0.6)) {
    W.push(`palavra-chave "${a.keyword}" pouco presente no título/abertura`);
  }

  // Fontes oficiais
  if (!a.sources.some((u) => OFFICIAL.test(u))) E.push('nenhuma fonte oficial (gov.br, planalto, jus.br, leg.br) em sources');

  // Links internos
  const links = [...a.body.matchAll(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g)].map((x) => (x[1].endsWith('/') ? x[1] : x[1] + '/'));
  const toArticles = [...new Set(links.filter((l) => inbound.has(l) || all.some((o) => urlOf(o) === l)).filter((l) => l !== urlOf(a)))];
  for (const l of links) if (!known.has(l)) E.push(`link interno quebrado: ${l}`);
  if (toArticles.length < 3 || toArticles.length > 5) {
    (STRICT ? E : W).push(`${toArticles.length} links para outros artigos (exigido 3 a 5)`);
  }
  for (const l of toArticles) inbound.get(l)?.add(urlOf(a));
  const vague = [...a.body.matchAll(/\[(clique aqui|aqui|leia mais|veja mais|neste link|este artigo)\]\(/gi)];
  if (vague.length) E.push(`âncora não descritiva: "${vague[0][1]}"`);

  // Frases proibidas
  const bodyN = norm(text);
  for (const b of BANNED) if (bodyN.includes(norm(b))) E.push(`frase genérica proibida: "${b}"`);

  // Marcações [VERIFICAR]
  const raw = readFileSync(a.file, 'utf8');
  for (const v of raw.matchAll(/\[VERIFICAR:\s*([^\]]+)\]/g)) verificar.push(`${urlOf(a)} → ${v[1].trim()}`);

  report.push({ a, total, E, W });
}

// Unicidade de title/description
for (const key of ['title', 'description']) {
  const seen = new Map();
  for (const a of articles) {
    if (seen.has(a[key])) report.find((r) => r.a === a).E.push(`${key} duplicado com ${seen.get(a[key])}`);
    else seen.set(a[key], a.slug);
  }
}

// Links recebidos
for (const r of report) {
  const n = inbound.get(urlOf(r.a))?.size ?? 0;
  if (n < 2) (STRICT ? r.E : r.W).push(`recebe ${n} link(s) de outros artigos (mín. 2)`);
}

for (const { a, total, E, W } of report) {
  const status = E.length ? '✗' : W.length ? '!' : '✓';
  console.log(`${status} ${urlOf(a)}  (${total} palavras)`);
  for (const e of E) console.log(`    erro:  ${e}`);
  for (const w of W) console.log(`    aviso: ${w}`);
  errors += E.length;
  warnings += W.length;
}

if (verificar.length) {
  console.log(`\n[VERIFICAR] pendentes (${verificar.length}):`);
  for (const v of verificar) console.log(`  - ${v}`);
  if (STRICT) errors += verificar.length;
}

console.log(`\n${articles.length} artigo(s), ${errors} erro(s), ${warnings} aviso(s).`);
process.exit(errors ? 1 : 0);
