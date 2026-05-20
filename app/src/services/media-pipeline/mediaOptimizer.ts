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
  const thumbnailPath = path.join(baseDir, `${baseName}.jpg`);

  try {
    // 1. Convert GIF to MP4 (Pro-Grade: H.264, High Bitrate)
    // Adding unsharp filter to crisp up edges and using CRF 17 for near-lossless quality
    await execPromise(`ffmpeg -y -i "${inputPath}" -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,unsharp=5:5:1.0:5:5:0.0" -c:v libx264 -crf 17 -preset slow "${mp4Path}"`);

    // 2. Convert GIF to WebM (Pro-Grade VP9)
    await execPromise(`ffmpeg -y -i "${inputPath}" -c:v libvpx-vp9 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,unsharp=5:5:1.0:5:5:0.0" -crf 20 -b:v 0 -an "${webmPath}"`);

    // 3. Generate Thumbnail (High Quality JPG)
    await execPromise(`ffmpeg -y -i "${inputPath}" -frames:v 1 -q:v 1 "${thumbnailPath}"`);

    return { mp4Path, webmPath, thumbnailPath };
  } catch (error) {
    console.error('FFmpeg optimization failed:', error);
    throw error;
  }
}
