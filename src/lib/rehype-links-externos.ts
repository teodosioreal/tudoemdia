import type { Root, Element } from 'hast';
import { SITE } from '../config';

/** Links para outros sites abrem em nova aba; os internos continuam na mesma aba. */
export default function rehypeLinksExternos() {
  const host = new URL(SITE.url).host;
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      for (const c of node.children) {
        if (c.type !== 'element') continue;
        if (c.tagName === 'a') {
          const href = String(c.properties?.href ?? '');
          if (/^https?:\/\//.test(href) && new URL(href).host !== host) {
            c.properties = { ...c.properties, target: '_blank', rel: ['noopener'] };
          }
        }
        visit(c);
      }
    };
    visit(tree);
  };
}
