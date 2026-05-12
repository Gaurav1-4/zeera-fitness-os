import { downloadMedia } from './mediaDownloader';
import { optimizeMedia } from './mediaOptimizer';
import { uploadToSupabase } from './mediaUploader';
import fs from 'fs';

export interface MirroredMedia {
  mp4Url: string;
  webmUrl: string;
  thumbnailUrl: string;
}

/**
 * Full pipeline to mirror a remote GIF to ZEERA self-hosted infrastructure.
 */
export async function mirrorMediaToZeera(
  remoteUrl: string, 
  exerciseId: string
): Promise<MirroredMedia> {
  console.log(`[Pipeline] Starting mirroring for ${exerciseId}...`);
  
  let localGifPath: string | null = null;
  let optimizedPaths: any = null;

  try {
    // 1. Download
    localGifPath = await downloadMedia(remoteUrl, exerciseId);
    console.log(`[Pipeline] Downloaded to ${localGifPath}`);

    // 2. Optimize & Convert
    optimizedPaths = await optimizeMedia(localGifPath);
    console.log(`[Pipeline] Optimized to MP4, WebM, and WebP`);

    // 3. Upload to Supabase
    const bucket = 'exercise-media';
    
    const [mp4Url, webmUrl, thumbnailUrl] = await Promise.all([
      uploadToSupabase(optimizedPaths.mp4Path, bucket, `mp4/${exerciseId}.mp4`),
      uploadToSupabase(optimizedPaths.webmPath, bucket, `webm/${exerciseId}.webm`),
      uploadToSupabase(optimizedPaths.thumbnailPath, bucket, `thumbnails/${exerciseId}.jpg`)
    ]);

    console.log(`[Pipeline] Uploaded all assets to Supabase Storage`);

    return { mp4Url, webmUrl, thumbnailUrl };
  } catch (error) {
    console.error(`[Pipeline] Failed for ${exerciseId}:`, error);
    throw error;
  } finally {
    // Cleanup temporary files
    if (localGifPath && fs.existsSync(localGifPath)) fs.unlinkSync(localGifPath);
    if (optimizedPaths) {
      if (fs.existsSync(optimizedPaths.mp4Path)) fs.unlinkSync(optimizedPaths.mp4Path);
      if (fs.existsSync(optimizedPaths.webmPath)) fs.unlinkSync(optimizedPaths.webmPath);
      if (fs.existsSync(optimizedPaths.thumbnailPath)) fs.unlinkSync(optimizedPaths.thumbnailPath);
    }
  }
}
