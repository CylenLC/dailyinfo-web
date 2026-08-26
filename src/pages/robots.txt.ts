import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site.ts';

/** robots.txt — generated from the canonical SITE.origin, no hardcoded URL. */
export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap-index.xml')}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
