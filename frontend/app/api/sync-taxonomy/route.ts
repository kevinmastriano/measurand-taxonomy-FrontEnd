import { NextResponse } from 'next/server';
import { syncTaxonomy } from '@/scripts/sync-taxonomy-v2';
import fs from 'fs';
import path from 'path';

/**
 * Optimized API Route for syncing taxonomy data from NCSLI-MII repository
 * 
 * Uses fire-and-forget pattern: returns immediately, processes in background
 * This prevents timeouts and provides better UX
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
    const wait = searchParams.get('wait') === 'true'; // Optional: wait for completion (for cron jobs)
    
    // Parse file parameter (can be single file or comma-separated list)
    let files: string[] | null = null;
    if (fileParam) {
      files = fileParam.split(',').map(f => f.trim()).filter(Boolean);
    }
    
    // Fire-and-forget pattern: start sync but don't wait for it
    // This prevents timeouts and allows the function to return quickly
    const syncPromise = syncTaxonomy({ 
      skipHistory: skipHistory || true, // Default to skipping history for manual syncs
      files: files || undefined // Sync specific files if provided
    });
    
    // If wait=true (for cron jobs), wait for completion with timeout
    if (wait) {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sync operation timed out after 50 seconds')), 50000)
      );
      
      const result = await Promise.race([syncPromise, timeoutPromise]) as Awaited<ReturnType<typeof syncTaxonomy>>;
      
      if (result.success) {
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
          downloaded: result.downloaded || 0,
          skipped: result.skipped || 0,
          failed: result.failed || 0,
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
    }
    
    // Fire-and-forget: return immediately, process in background
    // Don't await - let it run asynchronously
    syncPromise.catch((error) => {
      console.error('[Background Sync Error]:', error);
      // Error is logged but doesn't affect the response
    });
    
    // Return immediately with "processing" status
    return NextResponse.json({
      success: true,
      message: 'Sync started in background. Check sync status page for progress.',
      timestamp: new Date().toISOString(),
      processing: true,
    });
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
