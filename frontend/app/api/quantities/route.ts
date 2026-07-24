import { getAllQuantityKinds } from '@/lib/quantity-analyzer';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  CATALOG_CACHE_CONTROL,
  errorResponse,
  jsonResponse,
} from '@/lib/api-response';

// Render per-request so this endpoint reflects revalidated taxonomy data
// instead of being frozen with build-time data (it reads no request state,
// so Next would otherwise statically prerender it).
export const dynamic = 'force-dynamic';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(request: Request) {
  try {
    const taxons = await getTaxonomyData();
    const quantityMap = getAllQuantityKinds(taxons);
    const quantities = Array.from(quantityMap.values()).map((q) => ({
      name: q.name,
      aspect: q.aspect,
      id: q.id,
      taxonCount: q.taxonCount,
      disciplines: q.disciplines,
    }));

    return jsonResponse(
      {
        quantities,
        count: quantities.length,
      },
      { request, cacheControl: CATALOG_CACHE_CONTROL }
    );
  } catch (error) {
    console.error('[api/quantities] Failed to fetch quantities:', error);
    return errorResponse('Failed to fetch quantities', 500);
  }
}
