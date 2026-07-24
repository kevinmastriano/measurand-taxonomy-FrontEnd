import { NextResponse } from 'next/server';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  filterByDeprecated,
  invalidDeprecatedResponse,
  parseDeprecatedParam,
} from '@/lib/api-utils';
import type { Taxon } from '@/lib/types';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

/** Lower score = higher rank. Prefer name matches over nested field matches. */
function searchScore(taxon: Taxon, query: string): number {
  const name = taxon.name.toLowerCase();
  if (name === query) return 0;
  if (name.startsWith(query) || name.includes(`.${query}`)) return 1;
  if (name.includes(query)) return 2;
  if (taxon.Result?.Quantity?.name?.toLowerCase().includes(query)) return 3;
  if (taxon.Discipline?.some((d) => d.name.toLowerCase().includes(query))) return 4;
  if (taxon.Definition?.toLowerCase().includes(query)) return 5;
  if (taxon.Parameter?.some((p) => p.name.toLowerCase().includes(query))) return 6;
  return 7;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const deprecatedParam = parseDeprecatedParam(searchParams.get('deprecated'));

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (!deprecatedParam.ok) {
      return invalidDeprecatedResponse(deprecatedParam.error);
    }

    const taxons = await getTaxonomyData();
    const scoped = filterByDeprecated(taxons, deprecatedParam.filter);
    const query = q.toLowerCase().trim();

    const results = scoped
      .filter(
        (taxon) =>
          taxon.name.toLowerCase().includes(query) ||
          taxon.Definition?.toLowerCase().includes(query) ||
          taxon.Discipline?.some((d) => d.name.toLowerCase().includes(query)) ||
          taxon.Parameter?.some((p) => p.name.toLowerCase().includes(query)) ||
          taxon.Result?.Quantity?.name.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const scoreDiff = searchScore(a, query) - searchScore(b, query);
        if (scoreDiff !== 0) return scoreDiff;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('[api/search] Failed to search taxons:', error);
    return NextResponse.json(
      { error: 'Failed to search taxons' },
      { status: 500 }
    );
  }
}
