# Publicação na VPS (Ubuntu + Nginx)

O roteiro para colocar o site no ar. Leva cerca de 30 minutos, a maior parte esperando o DNS propagar.

## 0. Antes de tudo: dados que só você tem

| O quê | Onde editar |
|---|---|
| Nome e bio reais do autor | `src/content/autores/thiago-teodosio.json` |
| Responsável pelo site (LGPD) | `LEGAL.owner` em `src/config.ts` |
| Nome do site (atual: "Tudo em Dia") | `SITE.name` em `src/config.ts` |

O `npm run verify` bloqueia a publicação enquanto algum desses itens estiver provisório.

## 1. Domínio

No painel onde você registrou o domínio (Registro.br ou outro), crie dois registros DNS apontando para o IP da VPS:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` (raiz) | IP da VPS |
| A | `www` | IP da VPS |

Se a VPS tiver IPv6, crie também registros `AAAA`. Confira a propagação com `dig +short www.seudominio.com.br` antes do passo 4.

## 2. Configurar o domínio no projeto

```bash
node scripts/set-domain.mjs seudominio.com.br
# ou, se preferir sem www como endereço principal:
node scripts/set-domain.mjs seudominio.com.br --sem-www
```

O script:
- atualiza `SITE.url` em `src/config.ts` (canonical, sitemap, Open Graph, Schema.org e RSS usam esse valor);
- troca o e-mail provisório por `contato@seudominio.com.br` (use `--email outro@endereco` para escolher outro);
- gera `deploy/nginx/<host>.conf`, `deploy/nginx/<host>-bootstrap.conf`, `deploy/nginx/<host>-security.conf` e `deploy/site.env`.

Depois rode a verificação completa:

```bash
npm run verify
```

## 3. Chave SSH de deploy

No seu computador:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy_site -C "deploy-site"
```

A chave pública (`~/.ssh/deploy_site.pub`) vai para a VPS no passo 4. A privada fica com você e, se usar o GitHub Actions, nos Secrets do repositório.

## 4. Preparar a VPS (uma vez)

Copie o script e a pasta `deploy/` para a VPS e rode como root:

```bash
scp -r deploy scripts/server-setup.sh ~/.ssh/deploy_site.pub root@IP_DA_VPS:/root/site-setup/
ssh root@IP_DA_VPS
cd /root/site-setup && bash server-setup.sh voce@seudominio.com.br deploy_site.pub
```

O script:
1. instala Nginx, Certbot, rsync e UFW;
2. cria o usuário `deploy` e a pasta `/var/www/seudominio.com.br/html`;
3. sobe uma configuração HTTP temporária e emite o certificado SSL (Let's Encrypt) para o domínio com e sem www;
4. instala a configuração final:
   - HTTPS, com redirecionamento de HTTP para HTTPS e do host alternativo (com ou sem www) para o canônico;
   - compressão gzip, com brotli opcional;
   - cache de 1 ano para os arquivos `/_astro/`, 30 dias para imagens e revalidação para o HTML;
   - cabeçalhos de segurança: HSTS, CSP, nosniff, Referrer-Policy e Permissions-Policy;
   - página 404 e bloqueio de arquivos ocultos;
5. libera as portas 22, 80 e 443 no firewall;
6. configura a renovação automática do certificado, com recarga do Nginx.

## 5. Publicar

### Opção A: do seu computador

```bash
cp deploy/deploy.env.example deploy/deploy.env   # preencha DEPLOY_HOST com o IP da VPS
npm run deploy
```

O comando roda `npm run verify` e envia o `dist/` por rsync.

### Opção B: GitHub Actions (a cada push na `main`)

Em **Settings → Secrets and variables → Actions** do repositório, crie:

| Secret | Valor |
|---|---|
| `DEPLOY_HOST` | IP ou host da VPS |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PORT` | `22` (ou a porta SSH da VPS) |
| `DEPLOY_SSH_KEY` | conteúdo de `~/.ssh/deploy_site` (chave **privada**) |
| `DEPLOY_KNOWN_HOSTS` | saída de `ssh-keyscan -p 22 IP_DA_VPS` |

O workflow `.github/workflows/deploy.yml` instala as dependências, roda `npm run verify` e publica. Se qualquer verificação falhar, nada é enviado.

## 6. Conferir no ar

```bash
curl -I https://www.seudominio.com.br/                  # 200, com cabeçalhos de segurança
curl -I http://seudominio.com.br/                       # 301 para https://www...
curl -s https://www.seudominio.com.br/robots.txt
curl -s https://www.seudominio.com.br/sitemap-index.xml
```

Depois rode o Lighthouse (aba Lighthouse do Chrome, modo celular) na home e em um artigo, e siga o checklist em `docs/CHECKLIST-FINAL.md`.

## Brotli (opcional)

O Ubuntu tem módulos de brotli para o Nginx:

```bash
apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
```

Depois, descomente as linhas `brotli` em `/etc/nginx/sites-available/<host>.conf` e rode `nginx -t && systemctl reload nginx`.
