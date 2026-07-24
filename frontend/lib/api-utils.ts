import type { Taxon } from './types';
import { errorResponse } from './api-response';

export type DeprecatedFilter = 'active' | 'deprecated' | 'all';

/**
 * Parse the `deprecated` query param.
 * - null/absent → active only (matches list default)
 * - "false" → active only
 * - "true" → deprecated only
 * - "all" → no deprecated filter
 * - anything else → invalid (400)
 */
export function parseDeprecatedParam(
  value: string | null
): { ok: true; filter: DeprecatedFilter } | { ok: false; error: string } {
  if (value === null || value === 'false') {
    return { ok: true, filter: 'active' };
  }
  if (value === 'true') {
    return { ok: true, filter: 'deprecated' };
  }
  if (value === 'all') {
    return { ok: true, filter: 'all' };
  }
  return {
    ok: false,
    error: 'Invalid deprecated parameter. Use "true", "false", or "all".',
  };
}

/** Apply deprecated filter: active-only, deprecated-only, or all. */
export function filterByDeprecated(taxons: Taxon[], filter: DeprecatedFilter): Taxon[] {
  if (filter === 'all') return taxons;
  if (filter === 'deprecated') return taxons.filter((taxon) => taxon.deprecated);
  return taxons.filter((taxon) => !taxon.deprecated);
}

/** Normalize discipline query: trim whitespace; empty → null. */
export function normalizeDisciplineParam(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Case-insensitive discipline name match. */
export function taxonHasDiscipline(taxon: Taxon, discipline: string): boolean {
  const target = discipline.trim().toLowerCase();
  return (
    taxon.Discipline?.some((d) => d.name?.trim().toLowerCase() === target) ??
    false
  );
}

/** Minimum search query length (after trim). */
export const MIN_SEARCH_QUERY_LENGTH = 2;

export function invalidDeprecatedResponse(error: string) {
  return errorResponse(error, 400);
}
