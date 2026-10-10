#!/usr/bin/env bash
# Deploy local: valida tudo, gera o build e envia para a VPS via rsync.
#   npm run deploy
# Requer deploy/site.env (gerado por scripts/set-domain.mjs) e deploy/deploy.env (não commitado):
#   DEPLOY_HOST=203.0.113.10
#   DEPLOY_USER=deploy
#   DEPLOY_PORT=22
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f deploy/site.env ] || { echo "Falta deploy/site.env: rode node scripts/set-domain.mjs seudominio.com.br"; exit 1; }
[ -f deploy/deploy.env ] || { echo "Falta deploy/deploy.env (veja deploy/deploy.env.example)"; exit 1; }
# shellcheck disable=SC1091
source deploy/site.env
# shellcheck disable=SC1091
source deploy/deploy.env

npm run verify

rsync -az --delete --delay-updates \
  -e "ssh -p ${DEPLOY_PORT:-22}" \
  dist/ "${DEPLOY_USER:-deploy}@${DEPLOY_HOST}:${WEB_ROOT}/"

echo "Publicado em https://${SITE_HOST}"
