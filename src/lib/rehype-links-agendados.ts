import type { Root, Element, ElementContent } from 'hast';
// @ts-ignore módulo JS
import { artigos, estaPublicado } from './agenda.mjs';

/**
 * Link para um artigo que ainda não foi publicado (agendado ou rascunho) vira texto
 * simples, para não gerar link quebrado. Quando o artigo entra no ar, o build diário
 * devolve o link automaticamente.
 */
export default function rehypeLinksAgendados() {
  const pendentes = new Set<string>();
  for (const [slug, a] of artigos() as Map<string, { category: string; pubDate: string; draft: boolean }>) {
    if (!estaPublicado(a)) pendentes.add(`/${a.category}/${slug}/`);
  }
  return (tree: Root) => {
    if (!pendentes.size) return;
    const visit = (node: Root | Element) => {
      const out: ElementContent[] = [];
      for (const c of node.children as ElementContent[]) {
        if (c.type === 'element' && c.tagName === 'a' && pendentes.has(String(c.properties?.href ?? '').split('#')[0])) {
          out.push(...c.children);
          continue;
        }
        if (c.type === 'element') visit(c);
        out.push(c);
      }
      node.children = out;
    };
    visit(tree);
  };
}
