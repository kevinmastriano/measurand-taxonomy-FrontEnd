import { BookOpen, Download, GitBranch, ExternalLink, Code, FileText } from 'lucide-react';
import { execSync } from 'child_process';
import path from 'path';

function getRepositoryUrl(): string {
  try {
    const repoPath = path.join(process.cwd(), '..');
    const url = execSync('git config --get remote.origin.url', { 
      cwd: repoPath, 
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    
    // Convert git@github.com:user/repo.git to https://github.com/user/repo
    if (url.startsWith('git@')) {
      return url.replace('git@github.com:', 'https://github.com/').replace(/\.git$/, '');
    }
    // Convert https://github.com/user/repo.git to https://github.com/user/repo
    return url.replace(/\.git$/, '');
  } catch (error) {
    // Fallback: use environment variable or placeholder
    return process.env.NEXT_PUBLIC_REPO_URL || 'https://github.com/NCSLI-MII/measurand-taxonomy';
  }
}

export default function Home() {
  const repoUrl = getRepositoryUrl();

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
            Getting Started
          </h1>
        </div>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Learn how to access, download, and use the NCSL International MII Measurand Taxonomy Catalog.
        </p>
      </div>

      <div className="space-y-6">
        {/* What is the Taxonomy */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
              What is the Measurand Taxonomy?
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#24292f] dark:text-[#e6edf3]">
              The <strong>NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy Catalog</strong> is a standardized, machine-readable taxonomy for describing measurement capabilities and measurands. It provides a structured way to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#24292f] dark:text-[#e6edf3] ml-4">
              <li>Tag measurands in digital documents with unique, unambiguous identifiers</li>
              <li>Describe laboratory calibration and measurement capabilities (CMCs) for machine consumption</li>
              <li>Build digital Statements of Capability (SoAs)</li>
              <li>Locate laboratories with appropriate capabilities for specific measurements</li>
              <li>Enable automated CMC searches and uncertainty calculations</li>
            </ul>
            <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
              Each measurand is identified by a unique <strong>taxon</strong>—a hierarchical string like <code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs">Measure.Temperature.PRT</code> or <code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs">Source.Voltage.DC</code>.
            </p>
          </div>
        </div>

        {/* Accessing the Repository */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                Accessing the Git Repository
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#24292f] dark:text-[#e6edf3]">
              The taxonomy is hosted on GitHub. You can access it in several ways:
            </p>
            
            <div className="space-y-3">
              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Via Web Browser
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-3">
                  Navigate to the repository website to browse files, view documentation, and see the commit history:
                </p>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0969da] dark:text-[#58a6ff] hover:underline text-sm font-medium"
                >
                  {repoUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Via Git Command Line
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-3">
                  Clone the repository to your local machine:
                </p>
                <pre className="text-xs bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 overflow-x-auto">
                  <code>git clone {repoUrl}.git</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Downloading the Repository */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                Downloading the Taxonomy
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#24292f] dark:text-[#e6edf3]">
              There are several ways to download the taxonomy:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Option 1: Clone with Git (Recommended)
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  This gives you the full repository with history and allows you to stay updated:
                </p>
                <pre className="text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 overflow-x-auto">
{`git clone ${repoUrl}.git
cd measurand-taxonomy`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Option 2: Download ZIP Archive
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  Download a snapshot of the repository as a ZIP file:
                </p>
                <a
                  href={`${repoUrl}/archive/refs/heads/main.zip`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0969da] dark:text-[#58a6ff] hover:underline text-sm"
                >
                  Download ZIP Archive
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Option 3: Download Individual Files
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  The main taxonomy file is available directly:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#656d76] dark:text-[#8b949e] ml-4">
                  <li>
                    <a href={`${repoUrl}/blob/main/MeasurandTaxonomyCatalog.xml`} target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                      MeasurandTaxonomyCatalog.xml
                    </a> — Main taxonomy catalog
                  </li>
                  <li>
                    <a href={`${repoUrl}/blob/main/MeasurandTaxonomyCatalog.xsd`} target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                      MeasurandTaxonomyCatalog.xsd
                    </a> — XML schema definition
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                How to Use the Taxonomy
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  1. Browse the Web Interface
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  Use this web interface to explore the taxonomy:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#656d76] dark:text-[#8b949e] ml-4">
                  <li><strong className="text-[#24292f] dark:text-[#e6edf3]">Browse</strong> — View all taxons in a searchable list</li>
                  <li><strong className="text-[#24292f] dark:text-[#e6edf3]">Disciplines</strong> — Explore by measurement discipline</li>
                  <li><strong className="text-[#24292f] dark:text-[#e6edf3]">Quantities</strong> — Browse by quantity kind</li>
                  <li><strong className="text-[#24292f] dark:text-[#e6edf3]">API</strong> — Access taxonomy data programmatically</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  2. Use the XML Files Directly
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  Parse the XML catalog in your applications:
                </p>
                <pre className="text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 overflow-x-auto">
{`import { parseTaxonomyXML } from './lib/xml-parser';
import fs from 'fs';

const xmlContent = fs.readFileSync('MeasurandTaxonomyCatalog.xml', 'utf-8');
const taxons = await parseTaxonomyXML(xmlContent);`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  3. Generate HTML Documentation
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  Generate human-readable HTML from the XML:
                </p>
                <pre className="text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 overflow-x-auto">
{`xsltproc -o MeasurandTaxonomyCatalog.html \\
  MeasurandTaxonomyCatalog.xsl \\
  MeasurandTaxonomyCatalog.xml`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  4. Use the REST API
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  Access taxonomy data via the REST API endpoints:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#656d76] dark:text-[#8b949e] ml-4">
                  <li><code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs">GET /api/taxons</code> — Get all taxons</li>
                  <li><code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs">GET /api/taxons/[name]</code> — Get a specific taxon</li>
                  <li><code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs">GET /api/search?q=...</code> — Search taxons</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* What It Should Be Used For */}
        <div className="border border-[#54aeff] dark:border-[#1f6feb] rounded-md overflow-hidden bg-[#ddf4ff] dark:bg-[#0c2d41]">
          <div className="px-6 py-4 border-b border-[#54aeff] dark:border-[#1f6feb]">
            <h2 className="text-xl font-semibold text-[#0969da] dark:text-[#58a6ff]">
              What Should the Taxonomy Be Used For?
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#0969da] dark:text-[#58a6ff]">
              The Measurand Taxonomy is designed for machine-readable measurement specifications and should be used for:
            </p>
            
            <div className="space-y-3">
              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Digital CMCs (Calibration and Measurement Capabilities)
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  Describe laboratory services unambiguously for machine consumption. Each CMC comprises a measurand specification (using a taxon) together with measurement uncertainty.
                </p>
              </div>

              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Digital Instrument Specifications
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  Tag measuring instruments with their measurand capabilities using standardized taxons, enabling automated matching between instruments and calibration services.
                </p>
              </div>

              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Statements of Capability (SoAs)
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  Build machine-readable SoAs that laboratories can use to communicate their capabilities, and customers can use to search for appropriate calibration services.
                </p>
              </div>

              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Digital Calibration Certificates
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  Reference measurands in calibration certificates using standardized taxons, ensuring consistency and enabling automated processing.
                </p>
              </div>

              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Automated CMC Searches
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  Enable software to automatically search for laboratories with appropriate capabilities based on measurand taxons, measurement ranges, and uncertainty requirements.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                <strong className="text-[#24292f] dark:text-[#e6edf3]">Important:</strong> Taxons are used for internal document encoding and machine processing. For human-readable documents, use aliases or generate readable text from the taxon definitions.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
              Additional Resources
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/browse" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  Browse Taxonomy
                </a> — Explore all taxons in detail
              </li>
              <li>
                <a href="/api" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  API Documentation
                </a> — Programmatic access to the taxonomy
              </li>
              <li>
                <a href="/license" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  License Information
                </a> — Copyright and licensing details
              </li>
              <li>
                <a href="/history" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  Revision History
                </a> — View changes to the taxonomy over time
              </li>
              <li>
                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  GitHub Repository
                </a> — Source code and issue tracking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

