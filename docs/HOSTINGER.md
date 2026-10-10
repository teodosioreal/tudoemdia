# Publicação na Hostinger (hospedagem web, sem VPS)

O site é estático: basta enviar o conteúdo da pasta `dist/` para a pasta `public_html` do domínio.

## 1. Comprar e apontar o domínio

- **Domínio comprado na própria Hostinger:** ele já aparece no hPanel. Pule para o passo 2.
- **Domínio comprado no Registro.br:** no Registro.br, troque os servidores DNS pelos da Hostinger, informados no hPanel em **Domínios → (seu domínio) → DNS / Nameservers**. A propagação pode levar algumas horas.

## 2. Criar o site no hPanel

1. **Sites → Adicionar site → Site vazio** (não escolha WordPress).
2. Selecione o domínio `tudoemdia.blog.br`.

## 3. Ativar o SSL (HTTPS)

**Sites → (seu site) → Segurança → SSL** → instale o certificado SSL gratuito. Espere o status ficar "Ativo" antes de testar o site.

## 4. Gerar o pacote

No projeto:

```bash
node scripts/set-domain.mjs tudoemdia.blog.br --sem-www   # já feito; refaça se trocar o domínio
npm run verify                                            # confere tudo e gera o dist/
```

Compacte **o conteúdo** da pasta `dist/` em um `.zip`, sem a pasta em si: o `index.html` deve ficar na raiz do zip. O arquivo oculto `.htaccess` precisa ir junto. Ele cuida de:

- HTTPS e redirecionamento de `www` para o endereço sem `www`;
- barra final nas URLs e página 404;
- cache, compressão gzip e cabeçalhos de segurança.

Se preferir, peça o zip pronto ao Claude.

## 5. Enviar

1. **Sites → (seu site) → Gerenciador de arquivos** e abra `public_html`.
2. Apague o `default.php` ou o `index.php` que a Hostinger cria.
3. **Upload** do `.zip` → botão direito → **Extrair** dentro de `public_html`.
4. Confira se `index.html`, `.htaccess`, `_astro/`, `sitemap-index.xml` e `robots.txt` estão diretamente em `public_html`.
5. Apague o `.zip`.

Em cada atualização, repita o passo 4 e substitua os arquivos, apagando antes o conteúdo antigo de `public_html`.

## 6. Conferir

- `https://tudoemdia.blog.br` abre com cadeado.
- `http://tudoemdia.blog.br` e `https://www.tudoemdia.blog.br` redirecionam para `https://tudoemdia.blog.br`.
- `https://tudoemdia.blog.br/sitemap-index.xml` e `/robots.txt` abrem.
- Uma URL inexistente mostra a página "Página não encontrada".

Depois siga o checklist em `docs/CHECKLIST-FINAL.md`: Search Console, Lighthouse e AdSense.

## Atualização automática (opcional)

A Hostinger permite deploy a partir de um repositório Git (**Avançado → Git**). Como o site precisa ser gerado (`npm run build`) antes de publicar, o caminho mais simples é manter o envio pelo zip. Outra opção é usar um GitHub Actions que publica o `dist/` por FTP; posso configurar quando o repositório estiver no GitHub.
