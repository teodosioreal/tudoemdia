#!/usr/bin/env bash
# Prepara a VPS Ubuntu para servir o site. Rode UMA vez, como root, na VPS:
#   sudo bash server-setup.sh admin@seudominio.com.br [caminho/da/chave_publica_do_deploy.pub]
# Pré-requisitos: DNS do domínio e do www já apontando para o IP da VPS, e a pasta deploy/
# (gerada por scripts/set-domain.mjs) copiada junto com este script.
set -euo pipefail

CERT_EMAIL="${1:?Informe o e-mail para os avisos do certificado SSL}"
PUBKEY="${2:-}"
HERE="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$HERE/../deploy"; [ -d "$DEPLOY_DIR" ] || DEPLOY_DIR="$HERE/deploy"
# shellcheck disable=SC1091
source "$DEPLOY_DIR/site.env"

echo "==> Pacotes"
apt-get update -y
apt-get install -y nginx certbot rsync ufw

echo "==> Usuário de deploy e pasta do site"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
mkdir -p "$WEB_ROOT"
chown -R deploy:www-data "$(dirname "$WEB_ROOT")"
chmod -R 755 "$(dirname "$WEB_ROOT")"
if [ -n "$PUBKEY" ]; then
  install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
  cat "$PUBKEY" >> /home/deploy/.ssh/authorized_keys
  chown deploy:deploy /home/deploy/.ssh/authorized_keys
  chmod 600 /home/deploy/.ssh/authorized_keys
fi
[ -f "$WEB_ROOT/index.html" ] || echo "<!doctype html><title>Em breve</title>" > "$WEB_ROOT/index.html"

echo "==> Nginx temporário (HTTP) para emitir o certificado"
cp "$DEPLOY_DIR/nginx/$SITE_HOST-bootstrap.conf" "/etc/nginx/sites-available/$SITE_HOST.conf"
ln -sf "/etc/nginx/sites-available/$SITE_HOST.conf" "/etc/nginx/sites-enabled/$SITE_HOST.conf"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Certificado SSL (Let's Encrypt)"
certbot certonly --webroot -w "$WEB_ROOT" -d "$SITE_HOST" -d "$SITE_ALT_HOST" \
  --email "$CERT_EMAIL" --agree-tos --non-interactive

echo "==> Recarregar o Nginx a cada renovação automática"
install -d /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "==> Configuração final (HTTPS, cache, compressão, segurança)"
cp "$DEPLOY_DIR/nginx/$SITE_HOST-security.conf" "/etc/nginx/snippets/$SITE_HOST-security.conf"
cp "$DEPLOY_DIR/nginx/$SITE_HOST.conf" "/etc/nginx/sites-available/$SITE_HOST.conf"
nginx -t && systemctl reload nginx

echo "Pronto: https://$SITE_HOST — agora faça o primeiro deploy (npm run deploy ou GitHub Actions)."
