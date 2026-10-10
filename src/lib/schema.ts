import { SITE } from '../config';

export const abs = (path: string) => new URL(path, SITE.url).href;

export const ORG_ID = abs('/#organization');
export const WEBSITE_ID = abs('/#website');
export const personId = (slug: string) => abs(`/autor/${slug}/#person`);

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: abs('/'),
    logo: { '@type': 'ImageObject', url: abs('/logo.png'), width: 512, height: 512 },
    email: SITE.email,
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: abs('/'),
    name: SITE.name,
    inLanguage: SITE.locale,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: abs('/busca/') + '?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface PersonData {
  slug: string;
  name: string;
  jobTitle: string;
  bio: string;
  sameAs: string[];
  image?: string;
}

export function person(p: PersonData) {
  return {
    '@type': 'Person',
    '@id': personId(p.slug),
    name: p.name,
    jobTitle: p.jobTitle,
    description: p.bio,
    url: abs(`/autor/${p.slug}/`),
    worksFor: { '@id': ORG_ID },
    ...(p.image ? { image: p.image } : {}),
    ...(p.sameAs.length ? { sameAs: p.sameAs } : {}),
  };
}

export type Crumb = { name: string; href: string };

export function breadcrumbList(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.href),
    })),
  };
}

export function faqPage(faq: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
