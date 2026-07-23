import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { apiError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// This endpoint is called by the UI's "refresh history" action, so it is
// intentionally unauthenticated — but deleting the cache forces an
// expensive rebuild, so throttle it to once per interval per instance.
const RESET_THROTTLE_MS = 10 * 1000;
let lastResetAt = 0;

export async function POST() {
  try {
    const now = Date.now();
    if (now - lastResetAt < RESET_THROTTLE_MS) {
      return apiError(
        'Cache was reset recently. Please wait a few seconds before retrying.',
        429,
        { success: false }
      );
    }
    lastResetAt = now;

    const cachePath = path.join(process.cwd(), '.next', 'cache', 'taxonomy-history-cache.json');

    try {
      await fs.unlink(cachePath);
      console.log('[Cache Reset] Deleted cache file:', cachePath);
      return NextResponse.json({
        success: true,
        message: 'Cache file deleted successfully. Cache will rebuild on next request.',
      });
    } catch (error) {
      // File might not exist - that's okay
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('[Cache Reset] Cache file does not exist, nothing to delete');
        return NextResponse.json({
          success: true,
          message: 'Cache file does not exist. Cache will rebuild on next request.',
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('[Cache Reset] Error deleting cache file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return apiError('Failed to delete cache file', 500, {
      errorDetails: errorMessage,
      success: false,
    });
  }
}
