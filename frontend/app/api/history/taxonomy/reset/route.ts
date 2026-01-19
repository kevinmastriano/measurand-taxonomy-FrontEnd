import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST() {
  try {
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
    
    return NextResponse.json(
      { 
        error: 'Failed to delete cache file',
        errorDetails: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}


