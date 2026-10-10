#!/usr/bin/env node
/**
 * Configura o domínio do site em um passo.
 *   node scripts/set-domain.mjs meudominio.com.br            # canônico com www (https://www.meudominio.com.br)
 *   node scripts/set-domain.mjs meudominio.com.br --sem-www  # canônico sem www
 *   node scripts/set-domain.mjs meudominio.com.br --email contato@meudominio.com.br
 *
 * Atualiza SITE.url (e SITE.email, se ainda for o provisório) em src/config.ts e gera
 * deploy/nginx/<host>.conf, deploy/nginx/<host>-bootstrap.conf e deploy/nginx/<host>-security.conf.
 */
import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const raw = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--email');
if (!raw) {
  console.error('Uso: node scripts/set-domain.mjs meudominio.com.br [--sem-www] [--email contato@meudominio.com.br]');
  process.exit(1);
}
const apex = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(apex)) {
  console.error(`Domínio inválido: ${raw}`);
  process.exit(1);
}
const noWww = args.includes('--sem-www');
const canonical = noWww ? apex : `www.${apex}`;
const alt = noWww ? `www.${apex}` : apex;
const emailIdx = args.indexOf('--email');
const email = emailIdx >= 0 ? args[emailIdx + 1] : null;
const webRoot = `/var/www/${apex}/html`;

// src/config.ts
let cfg = await readFile('src/config.ts', 'utf8');
cfg = cfg.replace(/url: '[^']*'/, `url: 'https://${canonical}'`);
if (email) cfg = cfg.replace(/email: '[^']*'/, `email: '${email}'`);
else cfg = cfg.replace(/email: 'contato@example\.com'/, `email: 'contato@${apex}'`);
await writeFile('src/config.ts', cfg);

// Nginx
const fill = (t) => t.replaceAll('{{CANONICAL_HOST}}', canonical).replaceAll('{{ALT_HOST}}', alt).replaceAll('{{WEB_ROOT}}', webRoot);
await writeFile(`deploy/nginx/${canonical}.conf`, fill(await readFile('deploy/nginx/site.conf.template', 'utf8')));
await writeFile(`deploy/nginx/${canonical}-bootstrap.conf`, fill(await readFile('deploy/nginx/bootstrap.conf.template', 'utf8')));
await writeFile(`deploy/nginx/${canonical}-security.conf`, await readFile('deploy/nginx/security-headers.conf', 'utf8'));

// Hostinger / Apache / LiteSpeed (.htaccess na raiz do site)
const re = (h) => h.replace(/\./g, '\\.');
await writeFile(
  'public/.htaccess',
  (await readFile('deploy/hostinger/htaccess.template', 'utf8'))
    .replaceAll('{{CANONICAL_HOST}}', canonical)
    .replaceAll('{{ALT_HOST_RE}}', re(alt))
    .replaceAll('{{ALT_HOST}}', alt),
);

// Valores para o deploy
await writeFile(
  'deploy/site.env',
  `# Gerado por scripts/set-domain.mjs\nSITE_APEX=${apex}\nSITE_HOST=${canonical}\nSITE_ALT_HOST=${alt}\nWEB_ROOT=${webRoot}\n`,
);

console.log(`Domínio canônico: https://${canonical} (redireciona ${alt} -> ${canonical})`);
console.log(`E-mail de contato: ${email ?? `contato@${apex} (se ainda era o provisório)`}`);
console.log(`Nginx: deploy/nginx/${canonical}.conf | Hostinger/Apache: public/.htaccess`);
console.log('Próximo passo: npm run verify  (e depois o deploy, ver docs/DEPLOY.md)');
