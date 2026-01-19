'use client';

import { Taxon } from '@/lib/types';
import { Download, FileJson, FileCode, FileSpreadsheet, FileText } from 'lucide-react';
import { exportTaxonomyAsJSON, exportTaxonomyAsXML, exportTaxonomyAsCSV, exportTaxonomyAsMarkdown } from '@/lib/export-utils';
import { useState } from 'react';

interface CompleteTaxonomyExportProps {
  taxons: Taxon[];
}

export default function CompleteTaxonomyExport({ taxons }: CompleteTaxonomyExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'json' | 'xml' | 'csv' | 'markdown') => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;
      
      switch (format) {
        case 'json':
          content = exportTaxonomyAsJSON(taxons);
          filename = `complete-taxonomy.json`;
          mimeType = 'application/json';
          break;
        case 'xml':
          content = exportTaxonomyAsXML(taxons);
          filename = `complete-taxonomy.xml`;
          mimeType = 'application/xml';
          break;
        case 'csv':
          content = exportTaxonomyAsCSV(taxons);
          filename = `complete-taxonomy.csv`;
          mimeType = 'text/csv';
          break;
        case 'markdown':
          content = exportTaxonomyAsMarkdown(taxons);
          filename = `complete-taxonomy.md`;
          mimeType = 'text/markdown';
          break;
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting taxonomy:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Download className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
      <span className="text-sm text-[#656d76] dark:text-[#8b949e] mr-1">Export:</span>
      <button
        onClick={() => handleExport('json')}
        disabled={isExporting || taxons.length === 0}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export complete taxonomy as JSON"
      >
        <FileJson className="w-3 h-3" />
        JSON
      </button>
      <button
        onClick={() => handleExport('xml')}
        disabled={isExporting || taxons.length === 0}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export complete taxonomy as XML"
      >
        <FileCode className="w-3 h-3" />
        XML
      </button>
      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting || taxons.length === 0}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export complete taxonomy as CSV"
      >
        <FileSpreadsheet className="w-3 h-3" />
        CSV
      </button>
      <button
        onClick={() => handleExport('markdown')}
        disabled={isExporting || taxons.length === 0}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export complete taxonomy as Markdown"
      >
        <FileText className="w-3 h-3" />
        Markdown
      </button>
    </div>
  );
}


