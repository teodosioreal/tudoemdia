import type { Root, Element, ElementContent, RootContent } from 'hast';
import { ADS } from '../config';
import { AD_MIN_HEIGHT, adInsAttributes } from './ad-markup';

/**
 * Insere espaços de anúncio no corpo do artigo:
 *  - após a introdução (antes do 1º H2)
 *  - antes de cada N-ésimo H2 (N = ADS.inArticle.everyNthH2)
 *  - antes do fechamento (o último H2 do texto, que vem depois do FAQ)
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

    // Primeiro anúncio só depois da introdução (resposta direta completa), antes do 1º H2
    if (cfg.afterIntro) {
      const firstH2 = children.findIndex((n) => isEl(n, 'h2'));
      if (firstH2 > 0) insertBefore.add(firstH2);
    }

    // O fechamento é sempre o último H2 (vem depois do FAQ); o título dele é livre
    const lastH2 = children.reduce((acc, n, i) => (isEl(n, 'h2') ? i : acc), -1);
    let h2Count = 0;
    children.forEach((n, i) => {
      if (!isEl(n, 'h2')) return;
      h2Count++;
      const isConclusion = i === lastH2 && h2Count > 2;
      const isFaq = /perguntas frequentes/i.test(textOf(n));
      if (isFaq) return;
      if ((cfg.beforeConclusion && isConclusion) || (h2Count > 1 && h2Count % cfg.everyNthH2 === 1)) {
        insertBefore.add(i);
      }
    });

    const forbidden = new Set(['ul', 'ol', 'table', 'button', 'nav', 'form', 'a', 'figure', 'img']);
    const candidates = [...insertBefore]
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
      });
    const positions = pickSpread(candidates, cfg.max);

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

/** Mantém o primeiro e o último espaço e distribui os demais de forma uniforme. */
function pickSpread(list: number[], max: number): number[] {
  if (list.length <= max) return list;
  if (max <= 1) return list.slice(0, max);
  const out = new Set<number>();
  for (let i = 0; i < max; i++) out.add(list[Math.round((i * (list.length - 1)) / (max - 1))]);
  return [...out].sort((a, b) => a - b);
}
