import { get, set } from 'idb-keyval';

const CACHE_KEY = 'zeera_exercises_cache';
const CACHE_TIMESTAMP_KEY = 'zeera_exercises_cache_timestamp';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export async function getCachedExercises() {
  if (typeof window === 'undefined') return null;
  
  const timestamp = await get(CACHE_TIMESTAMP_KEY);
  if (!timestamp || Date.now() - (timestamp as number) > CACHE_TTL) {
    return null;
  }
  
  return await get(CACHE_KEY);
}

export async function setCachedExercises(exercises: any[]) {
  if (typeof window === 'undefined') return;
  
  await set(CACHE_KEY, exercises);
  await set(CACHE_TIMESTAMP_KEY, Date.now());
}
