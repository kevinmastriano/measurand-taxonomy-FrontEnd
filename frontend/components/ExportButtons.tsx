'use client';

import { Taxon } from '@/lib/types';
import { Download, FileJson, FileCode, FileSpreadsheet, FileText } from 'lucide-react';
import { exportAsJSON, exportAsXML, exportAsCSV, exportAsMarkdown } from '@/lib/export-utils';

interface ExportButtonsProps {
  taxon: Taxon;
}

export default function ExportButtons({ taxon }: ExportButtonsProps) {
  const handleExport = (format: 'json' | 'xml' | 'csv' | 'markdown') => {
    let content: string;
    let filename: string;
    let mimeType: string;
    
    switch (format) {
      case 'json':
        content = exportAsJSON(taxon);
        filename = `${taxon.name.replace(/\./g, '_')}.json`;
        mimeType = 'application/json';
        break;
      case 'xml':
        content = exportAsXML(taxon);
        filename = `${taxon.name.replace(/\./g, '_')}.xml`;
        mimeType = 'application/xml';
        break;
      case 'csv':
        content = exportAsCSV(taxon);
        filename = `${taxon.name.replace(/\./g, '_')}.csv`;
        mimeType = 'text/csv';
        break;
      case 'markdown':
        content = exportAsMarkdown(taxon);
        filename = `${taxon.name.replace(/\./g, '_')}.md`;
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
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#d0d7de] dark:border-[#30363d]">
      <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
        Export Taxon
      </h4>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleExport('json')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
        >
          <FileJson className="w-3 h-3" />
          JSON
        </button>
        <button
          onClick={() => handleExport('xml')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
        >
          <FileCode className="w-3 h-3" />
          XML
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
        >
          <FileSpreadsheet className="w-3 h-3" />
          CSV
        </button>
        <button
          onClick={() => handleExport('markdown')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
        >
          <FileText className="w-3 h-3" />
          Markdown
        </button>
      </div>
    </div>
  );
}


