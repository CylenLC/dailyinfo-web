import type { CategoryId } from './categories.ts';
import { itemPath } from './urls.ts';
import { absoluteUrl } from './site.ts';

/**
 * Identity derivation — frozen by docs/contracts/publication-v1.md.
 *
 * Identity derives ONLY from (category, stable id). Title, summary, tags,
 * file names, timestamps and every other mutable field are deliberately not
 * inputs to anything in this module.
 */

/** Deterministic Briefing identity: same category + same date ⇒ same briefing. */
export function briefingId(category: CategoryId, date: string): string {
  return `${category}-${date}`;
}

/** Absolute canonical Item URL — the one URL an Item is forever addressable at. */
export function itemCanonicalUrl(category: CategoryId, itemId: string): string {
  return absoluteUrl(itemPath(category, itemId));
}

/**
 * RSS GUID for an Item.
 *
 * Contract: GUID === canonical Item URL. Same publication identity ⇒ same
 * GUID, across builds, forever. Title/summary/tag updates never change it;
 * only a category mutation (an identity migration, forbidden for the
 * WebPublisher to perform silently) would.
 */
export function itemGuid(category: CategoryId, itemId: string): string {
  return itemCanonicalUrl(category, itemId);
}
