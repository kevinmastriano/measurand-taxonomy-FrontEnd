'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/lib/breadcrumb-utils';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-[#656d76] dark:text-[#8b949e] mx-1" />
            )}
            {item.isLast ? (
              <span className="text-[#24292f] dark:text-[#e6edf3] font-medium" aria-current="page">
                {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded"
              >
                {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}


