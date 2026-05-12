export function getOptimizedMediaUrl(url: string, type: string = 'gif'): string {
  // Currently we use ExerciseDB remote URLs directly.
  // Future architecture: Map ExerciseDB URLs to Supabase Storage URLs,
  // compress media, convert heavy GIFs to MP4/WebP, and generate thumbnails.
  
  if (!url) return '/placeholder-exercise.jpg'; // graceful fallback
  
  return url;
}

export function getThumbnailUrl(url: string): string {
  // In the future, this will return an optimized static thumbnail URL.
  // For now, it returns the base URL but will be rendered as a static image
  // or lazy-loaded to prevent mobile performance issues.
  return getOptimizedMediaUrl(url);
}
