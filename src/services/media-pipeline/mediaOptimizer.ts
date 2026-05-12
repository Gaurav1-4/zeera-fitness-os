import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export interface OptimizationResult {
  mp4Path: string;
  webmPath: string;
  thumbnailPath: string;
}

/**
 * Uses FFmpeg to convert GIF to optimized MP4 and WebM formats,
 * and generates a high-quality static thumbnail.
 */
export async function optimizeMedia(inputPath: string): Promise<OptimizationResult> {
  const baseDir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  
  const mp4Path = path.join(baseDir, `${baseName}.mp4`);
  const webmPath = path.join(baseDir, `${baseName}.webm`);
  const thumbnailPath = path.join(baseDir, `${baseName}.webp`);

  try {
    // 1. Convert GIF to MP4 (Optimized for mobile: H.264, YUV420P)
    // We use CRF 28 for a good balance of size/quality, and "faststart" for instant playback
    await execPromise(`ffmpeg -y -i "${inputPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=truncate(iw/2)*2:truncate(ih/2)*2" -crf 28 "${mp4Path}"`);

    // 2. Convert GIF to WebM (Optimized for modern browsers)
    await execPromise(`ffmpeg -y -i "${inputPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -an "${webmPath}"`);

    // 3. Generate Thumbnail (WEBP, first frame)
    await execPromise(`ffmpeg -y -i "${inputPath}" -frames:v 1 -q:v 80 "${thumbnailPath}"`);

    return { mp4Path, webmPath, thumbnailPath };
  } catch (error) {
    console.error('FFmpeg optimization failed:', error);
    throw error;
  }
}
