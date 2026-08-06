import { Bot, GitBranch, ExternalLink, Terminal, MessageSquare, Plug, ShieldCheck } from 'lucide-react';

// The canonical taxonomy data repository (same source the sync scripts use)
const REPO_SLUG = 'NCSLI-MII/measurand-taxonomy';
const REPO_URL = `https://github.com/${REPO_SLUG}`;

const codeBlockClass = 'text-xs bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 overflow-x-auto';
const inlineCodeClass = 'px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs';

export default function McpPage() {
  const repoUrl = REPO_URL;
  const repoSlug = REPO_SLUG;
  const gitMcpUrl = `https://gitmcp.io/${repoSlug}`;

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
            MCP Access
          </h1>
        </div>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Connect AI assistants like Claude, ChatGPT, and Cursor directly to the Measurand Taxonomy repository using the Model Context Protocol (MCP).
        </p>
      </div>

      <div className="space-y-6">
        {/* What is MCP */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <Plug className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                What is MCP?
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#24292f] dark:text-[#e6edf3]">
              The <strong>Model Context Protocol (MCP)</strong> is an open standard that lets AI assistants connect to external tools and data sources. Instead of copying and pasting taxonomy files into a chat, you can give an AI assistant live access to the Git repository — it can read the catalog XML, search the schema, browse documentation, and check revision history on its own.
            </p>
            <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
              This is useful for tasks like asking an assistant to find the right taxon for a calibration service, explain a taxon&apos;s required parameters, validate your measurand tagging against the schema, or summarize what changed between taxonomy revisions.
            </p>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#0969da] dark:text-[#58a6ff] hover:underline text-sm font-medium"
            >
              Learn more about MCP
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Option 1: GitMCP */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                Option 1: GitMCP — No Setup, No Sign-In
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#24292f] dark:text-[#e6edf3]">
              Because the taxonomy repository is public, the easiest way to give an AI assistant read access is <strong>GitMCP</strong>, a free service that exposes any public GitHub repository as a remote MCP server. No account or API token is required.
            </p>
            <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
              The MCP server URL for this repository is:
            </p>
            <pre className={codeBlockClass}>
              <code>{gitMcpUrl}</code>
            </pre>

            <div className="space-y-3">
              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Claude (claude.ai web or desktop)
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-[#656d76] dark:text-[#8b949e] ml-4">
                  <li>Open <strong className="text-[#24292f] dark:text-[#e6edf3]">Settings → Connectors</strong></li>
                  <li>Click <strong className="text-[#24292f] dark:text-[#e6edf3]">Add custom connector</strong></li>
                  <li>Enter a name (e.g. <code className={inlineCodeClass}>measurand-taxonomy</code>) and the URL above</li>
                  <li>Save — the taxonomy tools appear in the tools menu of new chats</li>
                </ol>
              </div>

              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Claude Code (CLI)
                </h3>
                <pre className={codeBlockClass}>
                  <code>{`claude mcp add --transport http measurand-taxonomy ${gitMcpUrl}`}</code>
                </pre>
              </div>

              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Cursor / VS Code / other MCP clients
                </h3>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mb-2">
                  Add the server to your client&apos;s MCP configuration (e.g. <code className={inlineCodeClass}>.cursor/mcp.json</code> or VS Code <code className={inlineCodeClass}>mcp.json</code>):
                </p>
                <pre className={codeBlockClass}>
{`{
  "mcpServers": {
    "measurand-taxonomy": {
      "url": "${gitMcpUrl}"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: GitHub MCP server */}
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
          <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                Option 2: Official GitHub MCP Server — Full Repository Access
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#24292f] dark:text-[#e6edf3]">
              GitHub&apos;s official remote MCP server gives an assistant full GitHub capabilities — reading files on any branch, searching code, listing commits, browsing issues and pull requests, and (with your permission) contributing changes. It requires signing in with your GitHub account via OAuth.
            </p>
            <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
              The server URL is:
            </p>
            <pre className={codeBlockClass}>
              <code>https://api.githubcopilot.com/mcp/</code>
            </pre>

            <div className="space-y-3">
              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Claude (claude.ai web or desktop)
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-[#656d76] dark:text-[#8b949e] ml-4">
                  <li>Open <strong className="text-[#24292f] dark:text-[#e6edf3]">Settings → Connectors</strong></li>
                  <li>Add the GitHub connector (or a custom connector with the URL above)</li>
                  <li>Complete the GitHub OAuth sign-in when prompted</li>
                </ol>
              </div>

              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Claude Code (CLI)
                </h3>
                <pre className={codeBlockClass}>
                  <code>claude mcp add --transport http github https://api.githubcopilot.com/mcp/</code>
                </pre>
                <p className="text-sm text-[#656d76] dark:text-[#8b949e] mt-2">
                  Then run <code className={inlineCodeClass}>/mcp</code> inside a session to authenticate with GitHub.
                </p>
              </div>
            </div>

            <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
              See the{' '}
              <a
                href="https://github.com/github/github-mcp-server"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0969da] dark:text-[#58a6ff] hover:underline"
              >
                GitHub MCP server documentation
              </a>{' '}
              for other clients and a local (Docker) installation option.
            </p>
          </div>
        </div>

        {/* Using it */}
        <div className="border border-[#54aeff] dark:border-[#1f6feb] rounded-md overflow-hidden bg-[#ddf4ff] dark:bg-[#0c2d41]">
          <div className="px-6 py-4 border-b border-[#54aeff] dark:border-[#1f6feb]">
            <h2 className="text-xl font-semibold text-[#0969da] dark:text-[#58a6ff]">
              Using the Connection: Example Prompts
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[#0969da] dark:text-[#58a6ff]">
              Once connected, just ask in plain language — the assistant calls the MCP tools for you. For example:
            </p>
            <div className="space-y-3">
              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  &ldquo;Read <code className={inlineCodeClass}>MeasurandTaxonomyCatalog.xml</code> from the {repoSlug} repository and list every taxon in the Torque discipline with its required parameters.&rdquo;
                </p>
              </div>
              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  &ldquo;What taxon should I use for calibrating a digital pressure gauge? Search the taxonomy repo and explain the difference between the candidates.&rdquo;
                </p>
              </div>
              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  &ldquo;Check the schema in <code className={inlineCodeClass}>MeasurandTaxonomyCatalog.xsd</code> and validate whether this taxon entry I wrote is structured correctly.&rdquo;
                </p>
              </div>
              <div className="bg-[#ffffff] dark:bg-[#0d1117] border border-[#54aeff] dark:border-[#1f6feb] rounded-md p-4">
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  &ldquo;List the most recent commits to the taxonomy repository and summarize which taxons changed.&rdquo; <span className="text-xs">(GitHub MCP server)</span>
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                <strong className="text-[#24292f] dark:text-[#e6edf3]">Tip:</strong> For quick programmatic access without MCP, the raw catalog is always available at{' '}
                <a
                  href={`https://raw.githubusercontent.com/${repoSlug}/main/MeasurandTaxonomyCatalog.xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline break-all"
                >
                  raw.githubusercontent.com/{repoSlug}/main/MeasurandTaxonomyCatalog.xml
                </a>
                , and this site&apos;s <a href="/api" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">REST API</a> serves the parsed taxonomy as JSON.
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
                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  Taxonomy GitHub Repository
                </a> — The source repository the MCP servers expose
              </li>
              <li>
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  Model Context Protocol
                </a> — Protocol specification and documentation
              </li>
              <li>
                <a href="https://gitmcp.io" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  GitMCP
                </a> — Instant MCP server for any public GitHub repository
              </li>
              <li>
                <a href="https://github.com/github/github-mcp-server" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  GitHub MCP Server
                </a> — GitHub&apos;s official MCP server
              </li>
              <li>
                <a href="/api" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  API Documentation
                </a> — This site&apos;s REST API for the parsed taxonomy
              </li>
              <li>
                <a href="/getting-started" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
                  Getting Started
                </a> — Other ways to access and use the taxonomy
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
