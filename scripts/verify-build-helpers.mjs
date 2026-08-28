/**
 * Pure helpers for production artifact verification.
 *
 * The verifier must choose representative content from links that Astro
 * actually rendered. Collection traversal order is not a statement about
 * which entries the homepage displays.
 */
export function findRenderedItem(contentItems, html, itemHrefFor) {
  const itemsByHref = new Map(
    contentItems.map((item) => [itemHrefFor(item), item]),
  );

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    const item = itemsByHref.get(href);
    if (item) return { item, href };
  }

  return { item: null, href: '' };
}
