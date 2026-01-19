'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard-utils';

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  onCopy?: () => void;
  className?: string;
}

export default function CopyButton({
  text,
  label = 'Copy',
  size = 'md',
  variant = 'icon',
  onCopy,
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] ${buttonSizeClasses[size]} ${className}`}
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <>
            <Check className={sizeClasses[size]} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className={sizeClasses[size]} />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded ${className}`}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check className={`${sizeClasses[size]} text-[#1a7f37] dark:text-[#3fb950]`} />
      ) : (
        <Copy className={sizeClasses[size]} />
      )}
    </button>
  );
}

