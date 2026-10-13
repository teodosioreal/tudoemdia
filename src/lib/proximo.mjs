// Escolhe o "próximo passo" de cada artigo: a etapa seguinte da trilha de leitura,
// se o artigo fizer parte de uma; senão, o artigo publicado mais parecido (mesma
// categoria e tags em comum). Só aponta para artigos já publicados.
import { artigos, estaPublicado } from './agenda.mjs';
import { TRILHAS } from '../data/trilhas.mjs';

let cache;
const todos = () => (cache ??= artigos());
export const urlDe = (slug) => `/${todos().get(slug).category}/${slug}/`;

/** Trilha e posição do artigo, contando só as etapas publicadas. */
export function trilhaDe(slug) {
  for (const t of TRILHAS) {
    const etapas = t.etapas.filter((e) => todos().has(e.slug) && estaPublicado(todos().get(e.slug)));
    const i = etapas.findIndex((e) => e.slug === slug);
    if (i >= 0) return { trilha: t, etapas, indice: i };
  }
  return null;
}

export function proximoDe(slug) {
  const a = todos().get(slug);
  if (!a) return null;
  const t = trilhaDe(slug);
  if (t && t.indice < t.etapas.length - 1) {
    const e = t.etapas[t.indice + 1];
    const alvo = todos().get(e.slug);
    return { slug: e.slug, url: urlDe(e.slug), title: alvo.title, description: alvo.description, rotulo: `Próximo passo · etapa ${t.indice + 2} de ${t.etapas.length}` };
  }
  const tags = new Set(a.tags.map((x) => x.toLowerCase()));
  const candidatos = [...todos()]
    .filter(([s, b]) => s !== slug && estaPublicado(b))
    .map(([s, b]) => ({ s, b, score: (b.category === a.category ? 2 : 0) + b.tags.filter((x) => tags.has(x.toLowerCase())).length }))
    .filter((c) => c.score > 0)
    .sort((x, y) => y.score - x.score || (y.b.pubDate > x.b.pubDate ? 1 : -1));
  const c = candidatos[0];
  return c ? { slug: c.s, url: urlDe(c.s), title: c.b.title, description: c.b.description, rotulo: 'Próximo passo' } : null;
}
