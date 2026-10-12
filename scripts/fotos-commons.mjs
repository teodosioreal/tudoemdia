#!/usr/bin/env node
/**
 * Baixa fotos candidatas do Wikimedia Commons (licença livre) para revisão.
 * Lê scripts/fotos-commons.json: { "<chave>": { "categorias": [...], "arquivos": [...] } }
 * Grava em commons/<chave>/NN.jpg e commons/<chave>/creditos.json (autor, licença, página).
 * Roda no GitHub Actions (workflow "Buscar fotos (Commons)"); a escolha final é manual.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = { 'User-Agent': 'TudoEmDiaBot/1.0 (https://tudoemdia.blog.br; contato@tudoemdia.blog.br)' };
const MAX = 10;
const strip = (h = '') => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const api = async (params) => (await fetch(`${API}?${new URLSearchParams({ format: 'json', ...params })}`, { headers: UA })).json();

const cfg = JSON.parse(await readFile('scripts/fotos-commons.json', 'utf8'));
for (const [chave, { categorias = [], arquivos = [] }] of Object.entries(cfg)) {
  const titulos = new Set(arquivos.map((a) => (a.startsWith('File:') ? a : `File:${a}`)));
  for (const cat of categorias) {
    const r = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: 'file', cmlimit: '25' });
    for (const m of r.query?.categorymembers ?? []) if (/\.(jpe?g|png)$/i.test(m.title)) titulos.add(m.title);
  }
  const lista = [...titulos].slice(0, MAX);
  await mkdir(`commons/${chave}`, { recursive: true });
  const creditos = [];
  let n = 0;
  for (const t of lista) {
    const r = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1400' });
    const info = Object.values(r.query?.pages ?? {})[0]?.imageinfo?.[0];
    if (!info?.thumburl) continue;
    const m = info.extmetadata ?? {};
    n++;
    const nome = String(n).padStart(2, '0') + '.jpg';
    const img = Buffer.from(await (await fetch(info.thumburl, { headers: UA })).arrayBuffer());
    await writeFile(`commons/${chave}/${nome}`, img);
    creditos.push({
      arquivo: nome,
      titulo: t,
      autor: strip(m.Artist?.value),
      licenca: strip(m.LicenseShortName?.value),
      licencaUrl: m.LicenseUrl?.value ?? '',
      pagina: info.descriptionurl,
      descricao: strip(m.ImageDescription?.value).slice(0, 200),
    });
    console.log(`✓ ${chave}/${nome} ${t}`);
  }
  await writeFile(`commons/${chave}/creditos.json`, JSON.stringify(creditos, null, 2) + '\n');
}
