import type { Root, Element } from 'hast';
import { basename } from 'node:path';
// @ts-ignore módulo JS
import { proximoDe } from './proximo.mjs';

/**
 * Caixa "Próximo passo" no meio do artigo: depois do primeiro parágrafo da 2ª seção (H2).
 * Fica longe dos espaços de anúncio, que são inseridos antes de H2.
 */
export default function rehypeProximoPasso() {
  return (tree: Root, file: { path?: string; history?: string[] }) => {
    const path = file.path ?? file.history?.[0];
    if (!path) return;
    const prox = proximoDe(basename(path).replace(/\.mdx?$/, ''));
    if (!prox) return;
    const kids = tree.children;
    const h2s = kids.map((n, i) => ({ n, i })).filter(({ n }) => n.type === 'element' && n.tagName === 'h2');
    const sec = h2s[1] ?? h2s[0];
    if (!sec) return;
    let alvo = -1;
    for (let j = sec.i + 1; j < kids.length; j++) {
      const n = kids[j];
      if (n.type !== 'element') continue;
      if (n.tagName === 'h2') break;
      if (n.tagName === 'p') { alvo = j; break; }
    }
    if (alvo < 0) return;
    const caixa: Element = {
      type: 'element',
      tagName: 'aside',
      properties: { className: ['proximo-passo'], ariaLabel: 'Próximo passo' },
      children: [
        { type: 'element', tagName: 'p', properties: { className: ['proximo-passo__rotulo'] }, children: [{ type: 'text', value: prox.rotulo }] },
        {
          type: 'element',
          tagName: 'a',
          properties: { href: prox.url, className: ['proximo-passo__link'] },
          children: [
            { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: prox.title }] },
            { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: prox.description }] },
          ],
        },
      ],
    };
    kids.splice(alvo + 1, 0, caixa);
  };
}
