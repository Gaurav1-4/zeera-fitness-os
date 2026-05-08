"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function useOfflineSync() {
  const { workoutLogs, updateWorkoutLogSyncStatus } = useAppStore();
  const isSyncingRef = useRef(false);

  const runSync = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.onLine) return;
    if (isSyncingRef.current) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const pendingLogs = workoutLogs.filter(
      (log) => log.syncStatus === "pending" || !log.syncStatus
    );
    if (pendingLogs.length === 0) return;

    isSyncingRef.current = true;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { isSyncingRef.current = false; return; }

      for (const log of pendingLogs) {
        try {
          const { error } = await supabase.from("workout_logs").insert({
            id: log.id,
            user_id: userData.user.id,
            workout_id: log.workoutId,
            workout_name: log.workoutName,
            date: log.date,
            duration: log.duration,
            total_volume: log.totalVolume,
            calories_burned: log.caloriesBurned,
            completed: log.completed,
            exercises_json: log.exercises,
          });

          if (error) {
            console.error("Sync failed for log", log.id, error);
          } else {
            updateWorkoutLogSyncStatus(log.id, "synced");
          }
        } catch (err) {
          console.error("Sync error for log", log.id, err);
        }
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [workoutLogs, updateWorkoutLogSyncStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", runSync);
    // Try syncing on mount if online
    const timer = setTimeout(runSync, 2000);

    return () => {
      window.removeEventListener("online", runSync);
      clearTimeout(timer);
    };
  }, [runSync]);
}
