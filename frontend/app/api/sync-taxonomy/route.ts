import { NextResponse } from 'next/server';
import { syncTaxonomy } from '@/scripts/sync-taxonomy';
import fs from 'fs';
import path from 'path';

/**
 * API Route for syncing taxonomy data from NCSLI-MII repository
 * 
 * This endpoint is called by Vercel Cron Jobs to keep the taxonomy data up-to-date.
 * 
 * Security: In production, you may want to add authentication/authorization
 * to prevent unauthorized access to this endpoint.
 */
export async function GET(request: Request) {
  try {
    // Check for authorization header (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require it in the Authorization header
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    // Check query parameters
    const { searchParams } = new URL(request.url);
    const skipHistory = searchParams.get('skipHistory') === 'true';
    const fileParam = searchParams.get('file'); // Optional: sync specific file(s)
    
    // Parse file parameter (can be single file or comma-separated list)
    let files: string[] | null = null;
    if (fileParam) {
      files = fileParam.split(',').map(f => f.trim()).filter(Boolean);
    }
    
    // Set a timeout for the sync operation (55 seconds to allow for file downloads)
    // History generation is skipped for manual syncs to avoid timeouts
    const syncPromise = syncTaxonomy({ 
      skipHistory: skipHistory || true, // Default to skipping history for manual syncs
      files: files || undefined // Sync specific files if provided
    });
    
    // Race between sync and timeout (slightly less than maxDuration to allow for response processing)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sync operation timed out after 55 seconds. File downloads may be slow or the connection may be unstable.')), 55000)
    );
    
    const result = await Promise.race([syncPromise, timeoutPromise]) as Awaited<ReturnType<typeof syncTaxonomy>>;
    
    if (result.success) {
      // Count synced files
      const syncDir = path.join(process.cwd(), 'data', 'taxonomy');
      let filesSynced = 0;
      if (fs.existsSync(syncDir)) {
        filesSynced = fs.readdirSync(syncDir).filter((f: string) => !f.startsWith('.')).length;
      }
      
      return NextResponse.json({
        success: true,
        updated: result.updated,
        commitSHA: result.commitSHA,
        filesSynced,
        message: result.updated 
          ? 'Taxonomy data synced successfully' 
          : 'No updates available',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic since it performs file operations
export const dynamic = 'force-dynamic';

// Set maximum duration to 60 seconds (Pro plan allows up to 300s)
// This gives us enough time for file downloads even if they're slow
export const maxDuration = 60;
