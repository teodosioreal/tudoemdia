import { ADS } from '../config';

export type AdVariant = 'in-article' | 'sidebar';

/** Altura mínima reservada por variante — evita CLS quando o anúncio carrega. */
export const AD_MIN_HEIGHT: Record<AdVariant, number> = {
  'in-article': 280,
  sidebar: 600,
};

/** Atributos do <ins> do AdSense, compartilhados entre <AdSlot> e o plugin rehype. */
export function adInsAttributes(variant: AdVariant) {
  const slot = variant === 'sidebar' ? ADS.slots.sidebar : ADS.slots.inArticle;
  return {
    class: 'adsbygoogle',
    style: 'display:block',
    'data-ad-client': ADS.client,
    ...(slot ? { 'data-ad-slot': slot } : {}),
    'data-ad-format': variant === 'sidebar' ? 'vertical' : 'fluid',
    ...(variant === 'in-article' ? { 'data-ad-layout': 'in-article' } : {}),
    'data-full-width-responsive': 'true',
  };
}
