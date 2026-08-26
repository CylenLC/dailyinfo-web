import { SITE, absoluteUrl } from './site.ts';

export interface SeoInput {
  title: string;
  description: string;
  /** Root-relative canonical path (with trailing slash for HTML pages). */
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogType: string;
  ogImage: string | null;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * The single place where page metadata is mapped to SEO tags.
 * BaseLayout renders these; individual pages never build meta tags themselves.
 */
export function buildSeo(input: SeoInput): SeoMeta {
  const title = input.title.includes(SITE.name)
    ? input.title
    : `${input.title} · ${SITE.name}`;
  return {
    title,
    description: input.description,
    canonical: absoluteUrl(input.path),
    ogTitle: title,
    ogDescription: input.description,
    ogUrl: absoluteUrl(input.path),
    ogType: input.type ?? 'website',
    ogImage: SITE.ogImage ? absoluteUrl(SITE.ogImage) : null,
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
  };
}
