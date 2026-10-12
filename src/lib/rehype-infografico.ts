import type { Root, Element, RootContent, ElementContent } from 'hast';
import { basename } from 'node:path';
import infograficos from '../data/infograficos.json';

/**
 * Insere o infográfico de resumo (gerado por scripts/infograficos/generate.mjs)
 * no meio do artigo, antes de um H2 de número par. Os anúncios usam a introdução,
 * os H2 ímpares a partir do 3º e a conclusão, então o infográfico nunca cai no mesmo ponto.
 */
export default function rehypeInfografico() {
  return (tree: Root, file: { path?: string; history?: string[] }) => {
    const path = file.path ?? file.history?.[0];
    if (!path) return;
    const slug = basename(path).replace(/\.mdx?$/, '');
    const info = (infograficos as Record<string, { alt: string }>)[slug];
    if (!info) return;

    const children = tree.children;
    const textOf = (n: RootContent | ElementContent): string =>
      n.type === 'text' ? n.value : 'children' in n ? n.children.map(textOf).join('') : '';
    const h2s = children
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => n.type === 'element' && n.tagName === 'h2')
      .filter(({ n }) => !/^(conclus[aã]o|na pr[aá]tica|resumo|para fechar|o que fazer agora|perguntas frequentes)/i.test(textOf(n).trim()));
    // H2 de número par (2º, 4º...) mais perto do meio do texto
    const pares = h2s.filter((_, k) => k % 2 === 1);
    if (!pares.length) return;
    const meio = children.length / 2;
    const alvo = pares.reduce((a, b) => (Math.abs(b.i - meio) < Math.abs(a.i - meio) ? b : a));

    const src = (w: number) => `/infograficos/${slug}-${w}.webp`;
    const figure: Element = {
      type: 'element',
      tagName: 'figure',
      properties: { className: ['infografico'] },
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: {
            src: src(1080),
            srcSet: `${src(540)} 540w, ${src(1080)} 1080w`,
            sizes: '(min-width: 600px) 480px, 100vw',
            width: 1080,
            height: 1350,
            alt: info.alt,
            loading: 'lazy',
            decoding: 'async',
          },
          children: [],
        },
        {
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: 'O essencial deste guia em uma imagem. Salve ou compartilhe.' }],
        },
      ],
    };
    children.splice(alvo.i, 0, figure);
  };
}
