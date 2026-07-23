import { NextResponse } from 'next/server';
import { syncTaxonomy, FILES_TO_SYNC } from '@/scripts/sync-taxonomy-v2';
import { clearTaxonomyCache } from '@/lib/taxonomy-loader';
import { apiError, isCronAuthorized, parseBooleanParam } from '@/lib/api-helpers';
import fs from 'fs';
import path from 'path';

/**
 * API Route for syncing taxonomy data from the NCSLI-MII repository.
 *
 * Default is fire-and-forget: returns immediately and processes in the
 * background. Pass wait=true (used by the Vercel cron) to wait for
 * completion.
 *
 * When CRON_SECRET is set, requests must carry
 * "Authorization: Bearer <CRON_SECRET>" (Vercel sends this automatically
 * for cron invocations).
 */
export async function GET(request: Request) {
  try {
    if (!isCronAuthorized(request)) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);

    // History rebuilds are expensive, so they are skipped unless the
    // caller explicitly passes skipHistory=false (the nightly cron does).
    const skipHistoryParam = parseBooleanParam(searchParams.get('skipHistory'));
    if (skipHistoryParam === undefined) {
      return apiError('Invalid "skipHistory" parameter: expected "true" or "false"', 400);
    }
    const skipHistory = skipHistoryParam ?? true;

    const wait = parseBooleanParam(searchParams.get('wait'));
    if (wait === undefined) {
      return apiError('Invalid "wait" parameter: expected "true" or "false"', 400);
    }

    // Optional: sync specific file(s), comma-separated. Validated against
    // the allowlist of syncable files so bad input fails fast with a 400.
    const fileParam = searchParams.get('file');
    let files: string[] | undefined;
    if (fileParam !== null) {
      files = fileParam.split(',').map(f => f.trim()).filter(Boolean);
      if (files.length === 0) {
        return apiError('Invalid "file" parameter: no file names provided', 400);
      }
      const invalid = files.filter(f => !FILES_TO_SYNC.includes(f));
      if (invalid.length > 0) {
        return apiError(
          `Invalid "file" parameter: unknown file(s) ${invalid.join(', ')}. Allowed: ${FILES_TO_SYNC.join(', ')}`,
          400
        );
      }
    }

    const syncPromise = syncTaxonomy({ skipHistory, files }).then(result => {
      // Make sure API responses pick up freshly synced XML right away.
      if (result?.success) {
        clearTaxonomyCache();
      }
      return result;
    });

    if (wait === true) {
      const timeoutPromise = new Promise<never>((_, reject) =>
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
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: result.alreadyRunning ? 409 : 500 }
      );
    }

    // Fire-and-forget: return immediately, process in background
    syncPromise.catch((error) => {
      console.error('[Background Sync Error]:', error);
    });

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
export const maxDuration = 60;
