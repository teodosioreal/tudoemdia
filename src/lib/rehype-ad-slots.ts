import type { Root, Element, ElementContent, RootContent } from 'hast';
import { ADS } from '../config';
import { AD_MIN_HEIGHT, adInsAttributes } from './ad-markup';

/**
 * Insere espaços de anúncio no corpo do artigo:
 *  - após o 1º parágrafo
 *  - antes de cada N-ésimo H2 (N = ADS.inArticle.everyNthH2)
 *  - antes da conclusão (H2 cujo texto começa com "Conclusão")
 * Nunca insere colado a listas, tabelas, botões ou ao bloco de FAQ, e nunca
 * dois blocos seguidos. Com ADS.enabled = false o plugin não faz nada.
 */
export default function rehypeAdSlots() {
  return (tree: Root) => {
    if (!ADS.enabled) return;
    const cfg = ADS.inArticle;
    const children = tree.children;
    const insertBefore = new Set<number>();

    const textOf = (n: RootContent | ElementContent): string =>
      n.type === 'text' ? n.value : 'children' in n ? n.children.map(textOf).join('') : '';
    const isEl = (n: RootContent | undefined, tag: string): n is Element =>
      !!n && n.type === 'element' && n.tagName === tag;
    const nextEl = (i: number) => {
      for (let j = i; j < children.length; j++) if (children[j].type === 'element') return j;
      return -1;
    };

    if (cfg.afterFirstParagraph) {
      const p = children.findIndex((n) => isEl(n, 'p'));
      if (p >= 0) insertBefore.add(p + 1);
    }

    let h2Count = 0;
    children.forEach((n, i) => {
      if (!isEl(n, 'h2')) return;
      h2Count++;
      const isConclusion = /^conclus[aã]o/i.test(textOf(n).trim());
      const isFaq = /perguntas frequentes/i.test(textOf(n));
      if (isFaq) return;
      if ((cfg.beforeConclusion && isConclusion) || (h2Count > 1 && h2Count % cfg.everyNthH2 === 1)) {
        insertBefore.add(i);
      }
    });

    const forbidden = new Set(['ul', 'ol', 'table', 'button', 'nav', 'form', 'a']);
    const positions = [...insertBefore]
      .sort((a, b) => a - b)
      .filter((pos) => {
        // Componentes MDX (ex.: <Faq />) contam como bloco anterior e não são proibidos
        const prev = children
          .slice(0, pos)
          .reverse()
          .find((n) => n.type === 'element' || (n.type as string) === 'mdxJsxFlowElement') as Element | undefined;
        const nIdx = nextEl(pos);
        const next = nIdx >= 0 ? (children[nIdx] as Element) : undefined;
        if (!next) return false; // nunca no fim do texto
        if (prev && forbidden.has(prev.tagName)) return false;
        if (forbidden.has(next.tagName)) return false;
        if (next.properties?.className?.toString().includes('faq')) return false;
        return true;
      })
      .slice(0, cfg.max);

    for (const pos of positions.reverse()) {
      children.splice(pos, 0, adNode());
    }
  };
}

function adNode(): Element {
  const ins = adInsAttributes('in-article');
  return {
    type: 'element',
    tagName: 'aside',
    properties: {
      className: ['ad-slot', 'ad-slot--in-article'],
      ariaLabel: 'Publicidade',
      style: `min-height:${AD_MIN_HEIGHT['in-article']}px`,
    },
    children: [
      { type: 'element', tagName: 'span', properties: { className: ['ad-slot__label'] }, children: [{ type: 'text', value: 'Publicidade' }] },
      {
        type: 'element',
        tagName: 'ins',
        properties: Object.fromEntries(
          Object.entries(ins).map(([k, v]) => [k === 'class' ? 'className' : k, v]),
        ),
        children: [],
      },
    ],
  };
}
