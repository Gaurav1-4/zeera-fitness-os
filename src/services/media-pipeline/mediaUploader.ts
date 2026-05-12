import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Handles uploading optimized media assets to Supabase Storage.
 * Uses SERVICE_ROLE_KEY to bypass RLS for admin ingestion.
 */
export async function uploadToSupabase(
  localPath: string, 
  bucket: string, 
  storagePath: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires Service Role for uploads

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const fileBuffer = fs.readFileSync(localPath);
  const fileExt = path.extname(localPath).replace('.', '');
  
  let contentType = 'application/octet-stream';
  if (fileExt === 'mp4') contentType = 'video/mp4';
  if (fileExt === 'webm') contentType = 'video/webm';
  if (fileExt === 'webp') contentType = 'image/webp';
  if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg';

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`Upload failed for ${storagePath}:`, error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  return publicUrl;
}
