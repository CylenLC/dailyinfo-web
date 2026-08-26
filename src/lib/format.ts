/**
 * Deterministic UTC formatting helpers.
 *
 * Build output must not depend on the host locale or timezone, so all
 * formatting is done on the ISO string / UTC value directly.
 */

export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export function formatDateTime(iso: string): string {
  const u = new Date(iso).toISOString();
  return `${u.slice(0, 10)} ${u.slice(11, 16)} UTC`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
