import Link from 'next/link';
import { Code, ExternalLink, ArrowRight } from 'lucide-react';

export default function APIPage() {
  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center gap-3 mb-2">
          <Code className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
            API Documentation
          </h1>
        </div>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Programmatic access to the Measurand Taxonomy Catalog. All endpoints return JSON responses.
        </p>
      </div>

      <div className="space-y-8">
        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
            Endpoints
          </h2>

          {/* GET /api/taxons */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
            <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-semibold bg-[#0969da] dark:bg-[#58a6ff] text-white rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono text-[#24292f] dark:text-[#e6edf3]">
                    /api/taxons
                  </code>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Get all taxons. Supports optional query parameters for filtering.
              </p>
              
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Query Parameters
                </h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <code className="px-2 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
                      discipline
                    </code>
                    <span className="ml-2 text-[#656d76] dark:text-[#8b949e]">
                      Filter by discipline name (case-insensitive)
                    </span>
                  </div>
                  <div className="text-sm">
                    <code className="px-2 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
                      deprecated
                    </code>
                    <span className="ml-2 text-[#656d76] dark:text-[#8b949e]">
                      false (default) = active only; true = deprecated only; all = both. Invalid values → 400.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Example Response
                </h4>
                <pre className="text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 overflow-x-auto">
{`{
  "taxons": [...],
  "count": 150,
  "total": 200
}`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Example Request
                </h4>
                <code className="block text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3">
                  GET /api/taxons?discipline=Electrical&deprecated=false
                </code>
              </div>
            </div>
          </div>

          {/* GET /api/taxons/[name] */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
            <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-semibold bg-[#0969da] dark:bg-[#58a6ff] text-white rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono text-[#24292f] dark:text-[#e6edf3]">
                    /api/taxons/[name]
                  </code>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Get a specific taxon by name. The name should be URL-encoded.
              </p>
              
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Example Request
                </h4>
                <code className="block text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3">
                  GET /api/taxons/Measure.Acceleration
                </code>
              </div>
            </div>
          </div>

          {/* GET /api/disciplines */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
            <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-semibold bg-[#0969da] dark:bg-[#58a6ff] text-white rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono text-[#24292f] dark:text-[#e6edf3]">
                    /api/disciplines
                  </code>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Get all disciplines with their taxon counts and metadata. Counts exclude deprecated taxons by default (same as <code className="text-xs">/api/taxons</code>).
              </p>
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Query Parameters
                </h4>
                <div className="text-sm">
                  <code className="px-2 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
                    deprecated
                  </code>
                  <span className="ml-2 text-[#656d76] dark:text-[#8b949e]">
                    false (default) / true / all — same semantics as /api/taxons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GET /api/quantities */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
            <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-semibold bg-[#0969da] dark:bg-[#58a6ff] text-white rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono text-[#24292f] dark:text-[#e6edf3]">
                    /api/quantities
                  </code>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Get all quantity kinds with their M-Layer aspects and taxon counts.
              </p>
            </div>
          </div>

          {/* GET /api/search */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
            <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-semibold bg-[#0969da] dark:bg-[#58a6ff] text-white rounded">
                    GET
                  </span>
                  <code className="text-sm font-mono text-[#24292f] dark:text-[#e6edf3]">
                    /api/search?q=...
                  </code>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Search taxons by name, definition, discipline, parameter, or quantity.
              </p>
              
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Query Parameters
                </h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <code className="px-2 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
                      q
                    </code>
                    <span className="ml-2 text-[#656d76] dark:text-[#8b949e]">
                      Search query (required, min 2 characters)
                    </span>
                  </div>
                  <div className="text-sm">
                    <code className="px-2 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
                      deprecated
                    </code>
                    <span className="ml-2 text-[#656d76] dark:text-[#8b949e]">
                      false (default) / true / all — same semantics as /api/taxons
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Example Request
                </h4>
                <code className="block text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3">
                  GET /api/search?q=temperature
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-8">
          <h2 className="text-2xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-4">
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
              <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                JavaScript/TypeScript
              </h3>
              <pre className="text-xs bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 overflow-x-auto">
{`const response = await fetch('/api/taxons?discipline=Electrical');
const data = await response.json();
console.log(\`Found \${data.count} taxons\`);`}
              </pre>
            </div>

            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
              <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                cURL
              </h3>
              <pre className="text-xs bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 overflow-x-auto">
{`curl "https://your-domain.com/api/taxons?discipline=Electrical"`}
              </pre>
            </div>
          </div>
        </div>

        {/* Contract + ops */}
        <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
            Contract &amp; operations
          </h2>
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            Machine-readable OpenAPI: <code className="text-xs">GET /api/openapi</code>.
            Health/readiness: <code className="text-xs">GET /api/health</code>.
          </p>
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            Nested taxon fields keep XML PascalCase (<code className="text-xs">Definition</code>, <code className="text-xs">Result</code>, <code className="text-xs">Parameter</code>, <code className="text-xs">Discipline</code>) by design. <code className="text-xs">Result.mLayer</code> is optional.
          </p>
        </div>

        {/* Rate Limiting */}
        <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-8">
          <h2 className="text-2xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
            Rate Limiting &amp; caching
          </h2>
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            Public API routes are IP rate-limited (~60/min search, ~300/min other). Catalog responses use CDN caching (<code className="text-xs">s-maxage=3600</code>, <code className="text-xs">stale-while-revalidate=86400</code>) with ETags. For heavy external adoption, also enable Vercel Firewall.
          </p>
        </div>
      </div>
    </div>
  );
}


