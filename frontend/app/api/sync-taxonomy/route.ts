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
    
    // Run the sync
    const result = await syncTaxonomy();
    
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
