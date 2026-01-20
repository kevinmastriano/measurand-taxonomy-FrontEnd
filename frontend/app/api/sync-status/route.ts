import { NextResponse } from 'next/server';
import { getSyncMetadata, hasSyncedData, isSyncInProgress, getSyncProgress } from '@/lib/taxonomy-file-finder';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metadata = getSyncMetadata();
    const hasData = hasSyncedData();
    const syncing = isSyncInProgress();
    const progress = syncing ? getSyncProgress() : null;
    
    // Get file info if synced data exists
    let filesInfo: Array<{ name: string; size: number; modified: string }> = [];
    if (hasData) {
      const syncDir = path.join(process.cwd(), 'data', 'taxonomy');
      const files = fs.readdirSync(syncDir).filter(f => !f.startsWith('.'));
      filesInfo = files.map(file => {
        const filePath = path.join(syncDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      });
    }
    
    return NextResponse.json({
      success: true,
      hasSyncedData: hasData,
      metadata: metadata || null,
      files: filesInfo,
      syncing,
      progress: progress || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
