'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard-utils';

interface TaxonShareButtonProps {
  taxonName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TaxonShareButton({ taxonName, size = 'sm' }: TaxonShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Generate URL for the taxon detail view
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/?taxon=${encodeURIComponent(taxonName)}`
      : `/?taxon=${encodeURIComponent(taxonName)}`;
    
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded`}
      aria-label="Share taxon"
      title="Share taxon link"
    >
      {copied ? (
        <Check className={`${sizeClasses[size]} text-[#1a7f37] dark:text-[#3fb950]`} />
      ) : (
        <Share2 className={sizeClasses[size]} />
      )}
    </button>
  );
}


