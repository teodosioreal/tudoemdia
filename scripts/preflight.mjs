#!/usr/bin/env node
// Confere a configuração antes do deploy: nada provisório pode ir para produção.
import { readFileSync } from 'node:fs';

const cfg = readFileSync('src/config.ts', 'utf8');
const author = JSON.parse(readFileSync('src/content/autores/autor.json', 'utf8'));
const problems = [];

if (/url: 'https:\/\/www\.example\.com'/.test(cfg)) problems.push('SITE.url ainda é example.com → rode: node scripts/set-domain.mjs seudominio.com.br');
if (/email: 'contato@example\.com'/.test(cfg)) problems.push('SITE.email ainda é o provisório (src/config.ts)');
if (/owner: ''/.test(cfg)) problems.push('LEGAL.owner vazio: informe o responsável pelo site (exigência da LGPD) em src/config.ts');
if (/Nome do Autor/i.test(author.name)) problems.push('Autor provisório: edite src/content/autores/autor.json (nome real e bio)');
if (/pendente/i.test(author.bio)) problems.push('Bio do autor provisória: edite src/content/autores/autor.json');

if (problems.length) {
  console.log('Preflight: itens obrigatórios antes de publicar:');
  for (const p of problems) console.log('  -', p);
  process.exit(1);
}
console.log('Preflight OK.');
