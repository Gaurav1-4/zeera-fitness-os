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

    const pendingLogs = workoutLogs.filter(
      (log) => log.syncStatus === "pending" || !log.syncStatus
    );
    
    // We can also sync the user profile to ensure it exists in DB
    const { user: userProfile } = useAppStore.getState();

    if (pendingLogs.length === 0 && !userProfile.name) return;

    isSyncingRef.current = true;

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: userProfile,
          logs: pendingLogs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync");
      }

      for (const log of pendingLogs) {
        updateWorkoutLogSyncStatus(log.id, "synced");
      }
    } catch (err) {
      console.error("Sync error", err);
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
