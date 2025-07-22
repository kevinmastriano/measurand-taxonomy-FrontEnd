'use client';

import TaxonomyViewer from '@/components/TaxonomyViewer';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Main Taxonomy Viewer */}
      <TaxonomyViewer 
        onAddNew={() => {
          router.push('/add-measurand');
        }}
      />
    </div>
  );
}
