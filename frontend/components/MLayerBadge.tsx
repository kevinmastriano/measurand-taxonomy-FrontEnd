'use client';

import { MLayer } from '@/lib/types';
import { Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface MLayerBadgeProps {
  mLayer: MLayer;
  showLabel?: boolean;
}

function getMLayerRegistryUrl(aspect: string, id: string): string | null {
  // M-Layer registry URL pattern
  return `https://api.mlayer.org/aspects/${id}`;
}

export default function MLayerBadge({ mLayer, showLabel = true }: MLayerBadgeProps) {
  const registryUrl = getMLayerRegistryUrl(mLayer.aspect, mLayer.id);
  
  const badgeContent = (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-[#fff8c5] dark:bg-[#6e4c02] text-[#6e4c02] dark:text-[#fff8c5] rounded-md border border-[#d4a72c] dark:border-[#d4a72c] hover:bg-[#fff8c5]/90 dark:hover:bg-[#6e4c02]/90 transition-colors">
      <Zap className="w-3 h-3" />
      {showLabel && <span>M-Layer:</span>}
      <code className="font-mono">{mLayer.aspect}</code>
      <span className="text-[#656d76] dark:text-[#8b949e]">({mLayer.id})</span>
      {registryUrl && <ExternalLink className="w-3 h-3" />}
    </div>
  );

  if (registryUrl) {
    return (
      <Link
        href={registryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}

