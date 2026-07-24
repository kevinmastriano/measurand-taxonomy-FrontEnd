import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  CATALOG_CACHE_CONTROL,
  errorResponse,
  jsonResponse,
} from '@/lib/api-response';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const taxons = await getTaxonomyData();
    const taxonName = decodeURIComponent(params.name);
    const taxon = taxons.find((t) => t.name === taxonName);

    if (!taxon) {
      return errorResponse('Taxon not found', 404);
    }

    return jsonResponse(taxon, { request, cacheControl: CATALOG_CACHE_CONTROL });
  } catch (error) {
    console.error('[api/taxons/[name]] Failed to fetch taxon:', error);
    return errorResponse('Failed to fetch taxon', 500);
  }
}
