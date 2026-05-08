"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { createBrowserClient } from "@supabase/ssr";

export function useOfflineSync() {
  const { workoutLogs, updateWorkoutLogSyncStatus } = useAppStore();
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const syncMutation = useMutation({
    mutationFn: async (log: any) => {
      // In a real implementation, you'd have a 'workout_logs' table in Supabase
      // and map the Zustand 'log' object to your DB schema.
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user");

      const { error } = await supabase.from("workout_logs").insert({
        id: log.id,
        user_id: user.user.id,
        workout_id: log.workoutId,
        workout_name: log.workoutName,
        date: log.date,
        duration: log.duration,
        total_volume: log.totalVolume,
        calories_burned: log.caloriesBurned,
        completed: log.completed,
        exercises_json: log.exercises, // Storing complex structure as JSON for now
      });

      if (error) throw error;
      return log.id;
    },
    onSuccess: (id) => {
      updateWorkoutLogSyncStatus(id, "synced");
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] });
    },
    onError: (err, log) => {
      console.error("Sync failed for log", log.id, err);
      // We keep it as pending so it will retry next time
    },
  });

  const runSync = useCallback(() => {
    if (!navigator.onLine) return;

    const pendingLogs = workoutLogs.filter(
      (log) => log.syncStatus === "pending" || !log.syncStatus
    );

    for (const log of pendingLogs) {
      syncMutation.mutate(log);
    }
  }, [workoutLogs, syncMutation]);

  useEffect(() => {
    window.addEventListener("online", runSync);
    // Also try syncing periodically or on mount if online
    if (navigator.onLine) {
      runSync();
    }

    return () => {
      window.removeEventListener("online", runSync);
    };
  }, [runSync]);

  return { isSyncing: syncMutation.isPending };
}
