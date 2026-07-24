import { jsonResponse, CATALOG_CACHE_CONTROL } from '@/lib/api-response';
import { MIN_SEARCH_QUERY_LENGTH } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

/**
 * Machine-readable OpenAPI 3.0 contract for the public taxonomy API.
 * Field casing mirrors the XML catalog (PascalCase nested objects) by design.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Measurand Taxonomy API',
      version: '1.0.0',
      description:
        'Public read-only API for the NCSLI MII Measurand Taxonomy Catalog. ' +
        'Nested taxon fields use PascalCase (Definition, Result, Parameter, Discipline) ' +
        'to preserve XML fidelity; top-level envelope fields use camelCase ' +
        '(name, deprecated, count, total). Result.mLayer is optional on some taxons.',
      contact: {
        name: 'Kevin Mastriano',
        email: 'kmastriano@customcalibration.com',
      },
    },
    servers: [{ url: origin, description: 'Current host' }],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health / readiness',
          operationId: 'getHealth',
          responses: {
            '200': { description: 'Catalog loaded' },
            '503': { description: 'Catalog unavailable' },
          },
        },
      },
      '/api/taxons': {
        get: {
          summary: 'List taxons',
          operationId: 'listTaxons',
          parameters: [
            {
              name: 'discipline',
              in: 'query',
              schema: { type: 'string' },
              description: 'Case-insensitive discipline filter (trimmed)',
            },
            {
              name: 'deprecated',
              in: 'query',
              schema: { type: 'string', enum: ['true', 'false', 'all'] },
              description:
                'false/absent = active only; true = deprecated only; all = both',
            },
          ],
          responses: {
            '200': {
              description: 'Taxon list',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TaxonList' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '429': { $ref: '#/components/responses/RateLimited' },
          },
        },
      },
      '/api/taxons/{name}': {
        get: {
          summary: 'Get taxon by name',
          operationId: 'getTaxon',
          parameters: [
            {
              name: 'name',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'URL-encoded taxon name',
            },
          ],
          responses: {
            '200': {
              description: 'Taxon',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Taxon' },
                },
              },
            },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/disciplines': {
        get: {
          summary: 'List disciplines',
          operationId: 'listDisciplines',
          parameters: [
            {
              name: 'deprecated',
              in: 'query',
              schema: { type: 'string', enum: ['true', 'false', 'all'] },
            },
          ],
          responses: {
            '200': {
              description: 'Discipline list with counts aligned to /api/taxons defaults',
            },
            '400': { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/quantities': {
        get: {
          summary: 'List quantity kinds',
          operationId: 'listQuantities',
          responses: { '200': { description: 'Quantity list' } },
        },
      },
      '/api/search': {
        get: {
          summary: 'Search taxons',
          operationId: 'searchTaxons',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string', minLength: MIN_SEARCH_QUERY_LENGTH },
            },
            {
              name: 'deprecated',
              in: 'query',
              schema: { type: 'string', enum: ['true', 'false', 'all'] },
            },
          ],
          responses: {
            '200': { description: 'Ranked search results' },
            '400': { $ref: '#/components/responses/BadRequest' },
            '429': { $ref: '#/components/responses/RateLimited' },
          },
        },
      },
      '/api/openapi': {
        get: {
          summary: 'OpenAPI document',
          operationId: 'getOpenApi',
          responses: { '200': { description: 'OpenAPI 3.0 JSON' } },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: { type: 'string' },
          },
        },
        Taxon: {
          type: 'object',
          required: ['name', 'deprecated'],
          properties: {
            name: { type: 'string' },
            deprecated: { type: 'boolean' },
            replacement: { type: 'string' },
            Definition: { type: 'string' },
            Result: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                Quantity: {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                },
                mLayer: {
                  type: 'object',
                  nullable: true,
                  description: 'Optional; absent on some catalog entries',
                  properties: {
                    aspect: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
            },
            Parameter: { type: 'array', items: { type: 'object' } },
            Discipline: {
              type: 'array',
              items: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
        TaxonList: {
          type: 'object',
          required: ['taxons', 'count', 'total'],
          properties: {
            taxons: {
              type: 'array',
              items: { $ref: '#/components/schemas/Taxon' },
            },
            count: { type: 'integer' },
            total: { type: 'integer' },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Invalid query parameter',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        RateLimited: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  };

  return jsonResponse(spec, { request, cacheControl: CATALOG_CACHE_CONTROL });
}
