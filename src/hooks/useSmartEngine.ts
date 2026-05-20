"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { generateInsights } from "@/features/ai/generateInsights";

/**
 * Hook that runs the AI Insights engine reactively.
 * Regenerates insights when user data changes significantly.
 */
export function useAIInsights() {
  const {
    user,
    workoutLogs,
    meals,
    measurements,
    streak,
    waterIntake,
    setInsights,
    insights,
  } = useAppStore();

  const lastRunRef = useRef<string>("");

  useEffect(() => {
    // Create a hash of relevant data to avoid unnecessary reruns
    const hash = `${meals.length}-${workoutLogs.length}-${measurements.length}-${streak}-${waterIntake}-${new Date().getHours()}`;

    if (hash === lastRunRef.current) return;
    lastRunRef.current = hash;

    const newInsights = generateInsights(
      user,
      workoutLogs,
      meals,
      measurements,
      streak,
      waterIntake
    );

    // Merge: keep read state of existing insights, add new ones
    const merged = newInsights.map((ni) => {
      const existing = insights.find((ei) => ei.id === ni.id);
      return existing ? { ...ni, read: existing.read } : ni;
    });

    // Only update if there's actual change
    if (JSON.stringify(merged.map((m) => m.id)) !== JSON.stringify(insights.map((i) => i.id))) {
      setInsights(merged);
    }
  }, [meals.length, workoutLogs.length, measurements.length, streak, waterIntake, user, setInsights]);
}

/**
 * Hook to compute and update the streak based on workout logs.
 */
export function useStreakCalculator() {
  const { workoutLogs, setStreak, streak } = useAppStore();

  useEffect(() => {
    if (workoutLogs.length === 0) {
      if (streak !== 0) setStreak(0);
      return;
    }

    const uniqueDates = [...new Set(workoutLogs.map((l) => l.date))].sort().reverse();
    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
      } else if (i === 0) {
        // Today doesn't count against streak — maybe they haven't gone yet
        continue;
      } else {
        break;
      }
    }

    if (currentStreak !== streak) {
      setStreak(currentStreak);
    }
  }, [workoutLogs, setStreak, streak]);
}

/**
 * Hook that resets daily state (water intake) at midnight.
 */
export function useDailyReset() {
  const { setWaterIntake } = useAppStore();

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setWaterIntake(0);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [setWaterIntake]);
}
