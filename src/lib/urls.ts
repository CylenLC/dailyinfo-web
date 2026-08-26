import { CATEGORY_BY_ID } from './categories.ts';
import type { CategoryId } from './categories.ts';

/**
 * Root-relative canonical URL builders.
 *
 * Item URLs depend on the stable item id — never on the title, never on the
 * markdown filename. Renaming a title therefore cannot change any URL.
 */

export interface NavLink {
  label: string;
  href: string;
}

export function categoryPath(id: CategoryId): string {
  return `/${CATEGORY_BY_ID[id].slug}/`;
}

export function itemPath(category: CategoryId, itemId: string): string {
  return `/${CATEGORY_BY_ID[category].slug}/${itemId}/`;
}

export function dailyPath(date: string): string {
  return `/daily/${date}/`;
}

export function briefingPath(date: string, category: CategoryId): string {
  return `/daily/${date}/${CATEGORY_BY_ID[category].slug}/`;
}

export function archivePath(): string {
  return '/archive/';
}

export function feedPath(category?: CategoryId): string {
  return category ? `/feed/${CATEGORY_BY_ID[category].slug}.xml` : '/feed.xml';
}
