import type { CategoryId } from './categories.ts';
import { itemRoute } from './urls.ts';
import { absoluteUrl } from './site.ts';

/**
 * Identity derivation — frozen by docs/contracts/publication-v1.md.
 *
 * Identity derives ONLY from (category, stable id). Title, summary, tags,
 * file names, timestamps and every other mutable field are deliberately not
 * inputs to anything in this module. The deployment base is equally NOT part
 * of publication identity — it is applied only at the absolute-URL layer.
 */

/** Deterministic Briefing identity: same category + same date ⇒ same briefing. */
export function briefingId(category: CategoryId, date: string): string {
  return `${category}-${date}`;
}

/**
 * Absolute canonical Item URL — the one URL an Item is addressable at under
 * the CURRENT deployment (origin + base from src/lib/site.ts). Changing the
 * deployment (custom domain, base path) does not change publication identity.
 */
export function itemCanonicalUrl(category: CategoryId, itemId: string): string {
  return absoluteUrl(itemRoute(category, itemId));
}

/**
 * RSS GUID for an Item.
 *
 * Contract: GUID === canonical Item URL. Same publication identity ⇒ same
 * GUID, across builds. Title/summary/tag updates never change it; only a
 * category mutation (an identity migration, forbidden for the
 * WebPublisher to perform silently) would.
 *
 * Deployment note (publication-v1.md §8): the GUID currently embeds the
 * GitHub Pages origin+base. Complete the final domain migration BEFORE real
 * RSS subscribers exist, or design GUID compatibility separately.
 */
export function itemGuid(category: CategoryId, itemId: string): string {
  return itemCanonicalUrl(category, itemId);
}
