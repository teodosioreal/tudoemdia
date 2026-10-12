import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'artigos'>;

/**
 * Rascunhos e artigos agendados (pubDate no futuro) aparecem só no `astro dev`
 * ou com SHOW_DRAFTS=1 no build. O build diário publica cada um na sua data.
 */
const showDrafts = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';
const today = new Date().toISOString().slice(0, 10);

export const isPublished = (a: Article) =>
  showDrafts || (!a.data.draft && a.data.pubDate.toISOString().slice(0, 10) <= today);

export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('artigos', isPublished);
  return all.sort((a, b) => b.data.updatedDate.valueOf() - a.data.updatedDate.valueOf());
}

/** Slug = nome do arquivo sem extensão nem pasta. */
export function articleSlug(a: Article): string {
  return a.id.split('/').pop()!;
}

export function articleUrl(a: Article): string {
  return `/${a.data.category}/${articleSlug(a)}/`;
}

/** Relacionados: mesma categoria primeiro, depois por tags em comum. */
export function relatedArticles(current: Article, all: Article[], limit = 3): Article[] {
  const tags = new Set(current.data.tags);
  return all
    .filter((a) => a.id !== current.id)
    .map((a) => ({
      a,
      score:
        (a.data.category === current.data.category ? 2 : 0) +
        a.data.tags.filter((t) => tags.has(t)).length,
    }))
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a);
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => dateFmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
