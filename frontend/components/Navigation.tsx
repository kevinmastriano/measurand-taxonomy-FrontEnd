'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, History, List, Tag, Zap, GitCompare, Code, BookOpen, Home } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  // Determine if a link is active based on pathname
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    if (path === '/browse') {
      return pathname === '/browse';
    }
    return pathname.startsWith(path);
  };

  const getLinkClassName = (path: string) => {
    const active = isActive(path);
    return `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] ${
      active
        ? 'text-[#24292f] dark:text-[#e6edf3] bg-[#f6f8fa] dark:bg-[#161b22]'
        : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#ffffff]/80 dark:bg-[#0d1117]/80 backdrop-blur-sm border-b border-[#d0d7de] dark:border-[#30363d]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] hover:text-[#0969da] dark:hover:text-[#58a6ff] focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded transition-colors">
                Measurand Taxonomy
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link href="/" className={getLinkClassName('/')}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link href="/getting-started" className={getLinkClassName('/getting-started')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Getting Started
              </Link>
              <Link href="/browse" className={getLinkClassName('/browse')}>
                <List className="w-4 h-4 mr-2" />
                Browse
              </Link>
              <Link href="/disciplines" className={getLinkClassName('/disciplines')}>
                <Tag className="w-4 h-4 mr-2" />
                Disciplines
              </Link>
              <Link href="/quantities" className={getLinkClassName('/quantities')}>
                <Zap className="w-4 h-4 mr-2" />
                Quantities
              </Link>
              <Link href="/compare" className={getLinkClassName('/compare')}>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </Link>
              <Link href="/api" className={getLinkClassName('/api')}>
                <Code className="w-4 h-4 mr-2" />
                API
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex sm:space-x-1">
              <Link href="/license" className={getLinkClassName('/license')}>
                <FileText className="w-4 h-4 mr-2" />
                License
              </Link>
              <Link href="/history" className={getLinkClassName('/history')}>
                <History className="w-4 h-4 mr-2" />
                History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

