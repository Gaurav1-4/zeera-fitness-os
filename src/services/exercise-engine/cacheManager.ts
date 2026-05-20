import { get, set } from 'idb-keyval';

const CACHE_KEY = 'zeera_exercises_cache';

export async function getCachedExercises() {
  if (typeof window === 'undefined') return null;
  return await get(CACHE_KEY);
}

export async function setCachedExercises(exercises: any[]) {
  if (typeof window === 'undefined') return;
  await set(CACHE_KEY, exercises);
}
