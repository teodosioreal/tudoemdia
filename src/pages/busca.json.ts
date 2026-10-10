import type { APIRoute } from 'astro';
import { getCategory } from '../config';
import { getArticles, articleUrl } from '../lib/content';

/** Índice de busca estático, gerado no build. */
export const GET: APIRoute = async () => {
  const articles = await getArticles();
  const index = articles.map((a) => ({
    t: a.data.title,
    d: a.data.description,
    u: articleUrl(a),
    c: getCategory(a.data.category).name,
    k: [a.data.keyword, ...a.data.tags].join(' '),
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
