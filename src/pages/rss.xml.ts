import type { APIRoute } from 'astro';
import { SITE, getCategory } from '../config';
import { getArticles, articleUrl } from '../lib/content';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Feed RSS 2.0 gerado no build, sem dependências. */
export const GET: APIRoute = async () => {
  const articles = await getArticles();
  const site = SITE.url;
  const items = articles
    .map((a) => {
      const url = new URL(articleUrl(a), site).href;
      return `<item><title>${esc(a.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${esc(a.data.description)}</description><category>${esc(getCategory(a.data.category).name)}</category><pubDate>${a.data.pubDate.toUTCString()}</pubDate></item>`;
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(SITE.name)}</title><link>${site}/</link><description>${esc(SITE.description)}</description><language>pt-BR</language><atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>${
    articles[0] ? `<lastBuildDate>${articles[0].data.updatedDate.toUTCString()}</lastBuildDate>` : ''
  }${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
