import { NextResponse } from 'next/server';
import type { Taxon } from './types';

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

/** Case-insensitive discipline name match. */
export function taxonHasDiscipline(taxon: Taxon, discipline: string): boolean {
  const target = discipline.toLowerCase();
  return (
    taxon.Discipline?.some((d) => d.name?.toLowerCase() === target) ?? false
  );
}

export function invalidDeprecatedResponse(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
