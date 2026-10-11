# Padrão editorial

Vale para todos os artigos. O que pode ser verificado automaticamente é checado por `npm run lint:content`, que também roda no `npm run build`. O restante entra no checklist de revisão no fim deste documento.

## 1. Tamanho

- Entre **1.200 e 2.000 palavras**, contando o FAQ. Abaixo de 1.200 o build falha; acima de 2.000 aparece um aviso.
- O tamanho vem da dúvida, não da meta. Se o tema se resolve em 1.300 palavras, o texto fica com 1.300. Seções de enchimento são proibidas ("História do IPVA", "O que é um carro", definições óbvias).

## 2. Estrutura

| Bloco | Regra |
|---|---|
| Abertura | Os **2 primeiros parágrafos respondem à pergunta do título**. Quem parar aí já sai com a resposta, e o resto do texto detalha. Nada de introdução genérica. |
| Títulos | Um H1 (vem do `title`), H2 para as seções e H3 só dentro de H2. O H2 deve ser descritivo, por exemplo "Prazo para transferir: 30 dias" e não "Prazos". |
| Parágrafos | De 2 a 3 linhas no celular, cerca de 40 a 60 palavras. Acima de 65 palavras gera aviso. |
| Tabela ou lista | Pelo menos uma, e que seja útil: comparação, documentos necessários, prazos, prós e contras. |
| Passo a passo | Lista numerada sempre que o leitor precisa executar algo (pagar, recorrer, transferir). |
| FAQ | De 3 a 5 perguntas no frontmatter, renderizadas com `<Faq items={frontmatter.faq} />` antes da conclusão. Devem ser perguntas que o texto ainda não respondeu do mesmo jeito, nunca uma repetição dos H2. |
| Conclusão | H2 começando com "Conclusão", "Na prática", "Resumo", "Para fechar" ou "O que fazer agora". Varie entre os artigos. Traz a recomendação prática e o próximo passo, sem resumir o texto inteiro. |

## 3. E-E-A-T

- **Fontes oficiais com link:** legislação no planalto.gov.br, resoluções do Contran, Senatran/gov.br, Detrans, Sefaz, SUSEP, CDC e o site do PROCON. Vão em `sources` e, quando ajudar, também no corpo, junto da afirmação.
  - Cite o dispositivo exato: "art. 123, § 1º, do CTB", e não só "segundo a lei".
- **Data de atualização:** `updatedDate`. Ela aparece no topo, no Schema.org e no sitemap. Mude a data só quando houver revisão real do texto.
- **Caixa do autor:** automática em todo artigo.
- **Regra estadual:** quando algo varia por estado (IPVA, taxas, calendário), diga isso de forma explícita e mostre onde consultar. Nunca apresente a regra de um estado como se fosse nacional.

## 4. Proibido inventar

- Nenhum valor, alíquota, prazo, número de artigo de lei, estatística ou data sem fonte verificável.
- Na dúvida, escreva **`[VERIFICAR: o que precisa ser checado]`** no próprio texto. O `npm run verify` (modo estrito, usado antes do deploy) falha enquanto houver alguma marcação pendente.
- Nada de números "aproximados" sem fonte, como "cerca de 70% dos motoristas…".
- Exemplos numéricos de cálculo são permitidos quando:
  - estiverem rotulados como hipotéticos ("Exemplo: carro avaliado em R$ 50.000 num estado com alíquota de X%");
  - a fórmula vier da fonte.

## 5. Voz e estilo

- Fale com o leitor ("você"), em frases diretas e na voz ativa.
- **Dê opinião prática quando ela existir:** "Na prática, vale pedir o comprovante de comunicação de venda antes de entregar a chave." Deixe claro o que é recomendação e o que é regra.
- Explique jargão na primeira vez em que ele aparecer (ATPV-e, CRLV, JARI).
- Frases proibidas (o script detecta): "No mundo atual…", "Nos dias de hoje…", "É importante ressaltar…", "Vale ressaltar que…", "Em resumo, é importante…", "Neste artigo, vamos…", "Sem mais delongas", "Em suma", "desempenha um papel crucial", entre outras. A lista completa está em `scripts/check-content.mjs`.
- Não prometa o que o texto não entrega. O título é a promessa e o corpo é a entrega.
- Clickbait está fora: nada de "você não vai acreditar" ou "o segredo que…".

## 6. Links internos

- De **3 a 8 links para outros artigos** no corpo (o ideal é 5 a 7), com âncora descritiva ("como funciona a [indicação de condutor](/multas-cnh/indicacao-de-condutor/)"). Âncoras como "clique aqui", "aqui" ou "leia mais" fazem o build falhar.
- Cada artigo deve **receber pelo menos 2 links** de outros artigos. A matriz de links está no plano da Fase 1.
- Coloque o link onde ele resolve uma dúvida que surge naquele ponto do texto, não amontoado no fim.
- Links internos quebrados fazem o build falhar.

## 7. Frontmatter

Obrigatórios: `title` (20 a 70 caracteres), `description` (70 a 160), `pubDate`, `updatedDate`, `category`, `tags`, `author`, `image`, `imageAlt` (descritivo, sem começar com "imagem de"), `keyword`, `faq` (3 a 5) e `sources` (pelo menos 1).

Opcionais: `imageCredit` (preenchido pelo script de fotos), `draft`.

O `title` e a `description` precisam ser únicos no site.

## 8. Checklist de revisão (manual, por artigo)

- [ ] Os 2 primeiros parágrafos respondem ao título?
- [ ] Todo número, prazo e dispositivo legal tem fonte ou `[VERIFICAR]`?
- [ ] Existe ao menos uma recomendação prática que vem de experiência, e não só da paráfrase da lei?
- [ ] O que varia por estado está sinalizado?
- [ ] Alguma seção pode ser cortada sem perda? Se sim, corte.
- [ ] O FAQ traz perguntas novas, e não repetições dos H2?
- [ ] A conclusão diz o que fazer agora?
- [ ] `npm run lint:content` passou sem erros?
