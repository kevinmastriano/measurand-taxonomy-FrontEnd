import Link from 'next/link';
import { BookOpen, List, Tag, Zap, GitBranch, FileText, Code, Search, TrendingUp, Shield, Workflow } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#f6f8fa] to-[#ffffff] dark:from-[#0d1117] dark:to-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-[#0969da] dark:text-[#58a6ff] bg-[#ddf4ff] dark:bg-[#0c2d41] border border-[#54aeff] dark:border-[#1f6feb] rounded-full">
              <Shield className="w-4 h-4" />
              NCSL International MII Standard
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#24292f] dark:text-[#e6edf3] mb-6 leading-tight">
              Measurand Taxonomy
            </h1>
            
            <p className="text-xl sm:text-2xl text-[#656d76] dark:text-[#8b949e] mb-4 max-w-3xl mx-auto">
              A standardized, machine-readable taxonomy for describing measurement capabilities and calibration services
            </p>
            
            <p className="text-base sm:text-lg text-[#656d76] dark:text-[#8b949e] mb-10 max-w-2xl mx-auto">
              Enable automated CMC searches, digital calibration certificates, and seamless laboratory capability discovery
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/getting-started"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-[#ffffff] bg-[#0969da] hover:bg-[#0860ca] dark:bg-[#1f6feb] dark:hover:bg-[#1a5cd7] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-offset-2"
              >
                <BookOpen className="w-5 h-5" />
                Get Started
              </Link>
              
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-[#24292f] dark:text-[#e6edf3] bg-[#ffffff] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-offset-2"
              >
                <List className="w-5 h-5" />
                Browse Taxonomy
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 dark:opacity-10">
          <div className="w-96 h-96 bg-[#0969da] dark:bg-[#1f6feb] rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-20 dark:opacity-10">
          <div className="w-96 h-96 bg-[#54aeff] dark:bg-[#388bfd] rounded-full"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#24292f] dark:text-[#e6edf3] mb-4">
            Why Use the Measurand Taxonomy?
          </h2>
          <p className="text-lg text-[#656d76] dark:text-[#8b949e] max-w-2xl mx-auto">
            Standardize measurement specifications and enable machine-readable calibration capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Feature 1 */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
            <div className="w-12 h-12 bg-[#ddf4ff] dark:bg-[#0c2d41] rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Automated Discovery
            </h3>
            <p className="text-[#656d76] dark:text-[#8b949e]">
              Enable software to automatically search for laboratories with appropriate capabilities based on standardized taxon identifiers.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
            <div className="w-12 h-12 bg-[#ddf4ff] dark:bg-[#0c2d41] rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Digital CMCs
            </h3>
            <p className="text-[#656d76] dark:text-[#8b949e]">
              Describe laboratory calibration and measurement capabilities unambiguously for machine consumption and automated processing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
            <div className="w-12 h-12 bg-[#ddf4ff] dark:bg-[#0c2d41] rounded-lg flex items-center justify-center mb-4">
              <Workflow className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Standardized Workflow
            </h3>
            <p className="text-[#656d76] dark:text-[#8b949e]">
              Use consistent taxon identifiers across digital calibration certificates, instrument specifications, and capability statements.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
            <div className="w-12 h-12 bg-[#ddf4ff] dark:bg-[#0c2d41] rounded-lg flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Version Controlled
            </h3>
            <p className="text-[#656d76] dark:text-[#8b949e]">
              Track changes over time with full Git version history. View evolution of the taxonomy and contribute improvements.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
            <div className="w-12 h-12 bg-[#ddf4ff] dark:bg-[#0c2d41] rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Developer Friendly
            </h3>
            <p className="text-[#656d76] dark:text-[#8b949e]">
              Access via REST API, XML files, or integration libraries. Parse and integrate into your applications with ease.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
            <div className="w-12 h-12 bg-[#ddf4ff] dark:bg-[#0c2d41] rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Growing Ecosystem
            </h3>
            <p className="text-[#656d76] dark:text-[#8b949e]">
              Join a community of metrology professionals building the future of digital measurement infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-[#f6f8fa] dark:bg-[#161b22] border-y border-[#d0d7de] dark:border-[#30363d] py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#24292f] dark:text-[#e6edf3] mb-4">
              Explore the Taxonomy
            </h2>
            <p className="text-lg text-[#656d76] dark:text-[#8b949e]">
              Multiple ways to discover and use measurement specifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/browse"
              className="group border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-all hover:shadow-lg"
            >
              <List className="w-8 h-8 text-[#0969da] dark:text-[#58a6ff] mb-3" />
              <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 group-hover:text-[#0969da] dark:group-hover:text-[#58a6ff]">
                Browse All Taxons
              </h3>
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Search and filter through all taxons in list or tree view
              </p>
            </Link>

            <Link
              href="/disciplines"
              className="group border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-all hover:shadow-lg"
            >
              <Tag className="w-8 h-8 text-[#0969da] dark:text-[#58a6ff] mb-3" />
              <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 group-hover:text-[#0969da] dark:group-hover:text-[#58a6ff]">
                By Discipline
              </h3>
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Explore taxons organized by measurement discipline
              </p>
            </Link>

            <Link
              href="/quantities"
              className="group border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-all hover:shadow-lg"
            >
              <Zap className="w-8 h-8 text-[#0969da] dark:text-[#58a6ff] mb-3" />
              <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 group-hover:text-[#0969da] dark:group-hover:text-[#58a6ff]">
                By Quantity
              </h3>
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Find taxons grouped by M-Layer quantity kinds
              </p>
            </Link>

            <Link
              href="/api"
              className="group border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-6 bg-[#ffffff] dark:bg-[#0d1117] hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-all hover:shadow-lg"
            >
              <Code className="w-8 h-8 text-[#0969da] dark:text-[#58a6ff] mb-3" />
              <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 group-hover:text-[#0969da] dark:group-hover:text-[#58a6ff]">
                API Access
              </h3>
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                Programmatic access via REST API endpoints
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[#0969da] dark:text-[#58a6ff] mb-2">143+</div>
            <div className="text-sm text-[#656d76] dark:text-[#8b949e]">Taxons</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#0969da] dark:text-[#58a6ff] mb-2">15+</div>
            <div className="text-sm text-[#656d76] dark:text-[#8b949e]">Disciplines</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#0969da] dark:text-[#58a6ff] mb-2">40+</div>
            <div className="text-sm text-[#656d76] dark:text-[#8b949e]">Quantity Kinds</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#0969da] dark:text-[#58a6ff] mb-2">Open</div>
            <div className="text-sm text-[#656d76] dark:text-[#8b949e]">Source</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#0969da] to-[#1f6feb] dark:from-[#0c2d41] dark:to-[#1f6feb] py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#ffffff] mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[#ffffff]/90 mb-8 max-w-2xl mx-auto">
            Learn how to integrate the Measurand Taxonomy into your applications and workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-[#0969da] dark:text-[#0d1117] bg-[#ffffff] hover:bg-[#f6f8fa] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:ring-offset-2"
            >
              <BookOpen className="w-5 h-5" />
              View Documentation
            </Link>
            <a
              href="https://github.com/NCSLI-MII/measurand-taxonomy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-[#ffffff] bg-[#ffffff]/20 hover:bg-[#ffffff]/30 backdrop-blur-sm border border-[#ffffff]/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffffff] focus:ring-offset-2"
            >
              <GitBranch className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
