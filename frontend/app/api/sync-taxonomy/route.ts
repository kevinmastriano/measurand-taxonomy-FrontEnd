import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { TAXONOMY_TAG } from '@/lib/taxonomy-loader';

/**
 * Sync endpoint (Path A — ISR based, no runtime disk writes).
 *
 * On Vercel the deployment filesystem is read-only, so we cannot download and
 * persist files at request time. Instead, this endpoint invalidates the
 * taxonomy cache tag; the next read of the catalog re-fetches fresh XML from
 * GitHub (see lib/taxonomy-loader.ts). This is cheap, idempotent, and safe.
 *
 * Triggered by:
 *  - the daily Vercel cron (vercel.json), which automatically sends
 *    `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is configured, and
 *  - the in-app "Sync Now" button on /sync.
 *
 * Security: because the only side effect is an idempotent cache revalidation,
 * the endpoint is safe to expose. If CRON_SECRET is set, it is enforced so the
 * endpoint can be fully locked down; when it is unset the endpoint stays open
 * so the in-app button works without shipping a secret to the browser.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // Optional lockdown: when CRON_SECRET is configured, require it.
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    revalidateTag(TAXONOMY_TAG);

    return NextResponse.json({
      success: true,
      revalidated: true,
      tag: TAXONOMY_TAG,
      message:
        'Taxonomy cache revalidated. Fresh data will be fetched from GitHub on the next request.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync] Failed to revalidate taxonomy cache:', error);
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

// Revalidation must run per-request, never statically.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
