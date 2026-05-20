import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "./indexedDBStorage";
import {
  UserProfile,
  WorkoutLog,
  MealEntry,
  BodyMeasurement,
  DailyStats,
  AIInsight,
  WorkoutExercise,
  WorkoutSet,
} from "./types";

interface AppState {
  // User
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  hasSeenWorkoutTutorial: boolean;
  setHasSeenWorkoutTutorial: (v: boolean) => void;

  // Active Workout
  activeWorkout: {
    id: string;
    name: string;
    exercises: WorkoutExercise[];
    startTime: number;
    currentExerciseIndex: number;
  } | null;
  startWorkout: (id: string, name: string, exercises: WorkoutExercise[]) => void;
  endWorkout: () => void;
  setCurrentExerciseIndex: (i: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<WorkoutSet>) => void;
  updateExercise: (exerciseIndex: number, data: Partial<WorkoutExercise>) => void;

  // Workout Logs
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: WorkoutLog) => void;
  updateWorkoutLogSyncStatus: (id: string, status: "pending" | "synced" | "failed") => void;

  // Nutrition
  meals: MealEntry[];
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  waterIntake: number;
  setWaterIntake: (n: number) => void;

  // Measurements
  measurements: BodyMeasurement[];
  addMeasurement: (m: BodyMeasurement) => void;
  clearDemoData: () => void;

  // Stats
  streak: number;
  setStreak: (n: number) => void;

  // AI Insights
  insights: AIInsight[];
  setInsights: (insights: AIInsight[]) => void;
  markInsightRead: (id: string) => void;

  // Super Admin
  isSuperAdmin: boolean;
  setIsSuperAdmin: (v: boolean) => void;
  reportedBugs: { id: string; date: string; description: string; status: "open" | "resolved" }[];
  addBug: (description: string) => void;
  resolveBug: (id: string) => void;
  clearBugs: () => void;

  // Rest Timer
  restTimerActive: boolean;
  restTimerDuration: number;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Reminders
  checkMeasurementReminder: () => void;
}

const defaultUser: UserProfile = {
  name: "",
  age: 24,
  height: 175,
  weight: 75,
  gender: "male",
  goal: "lose",
  activityLevel: "moderate",
  experience: "intermediate",
  dietType: "veg",
  calorieTarget: 2200,
  proteinTarget: 150,
  carbsTarget: 220,
  fatsTarget: 65,
  waterTarget: 8,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: defaultUser,
      setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),
      onboarded: false,
      setOnboarded: (v) => set({ onboarded: v }),
      hasSeenWorkoutTutorial: false,
      setHasSeenWorkoutTutorial: (v) => set({ hasSeenWorkoutTutorial: v }),

      isSuperAdmin: false,
      setIsSuperAdmin: (v) => set({ isSuperAdmin: v }),
      reportedBugs: [],
      addBug: (desc) => set((s) => ({ reportedBugs: [{ id: Date.now().toString(), date: new Date().toISOString(), description: desc, status: "open" }, ...s.reportedBugs] })),
      resolveBug: (id) => set((s) => ({ reportedBugs: s.reportedBugs.map((b) => b.id === id ? { ...b, status: "resolved" } : b) })),
      clearBugs: () => set({ reportedBugs: [] }),

      activeWorkout: null,
      startWorkout: (id, name, exercises) =>
        set((s) => ({
          activeWorkout: {
            id,
            name,
            exercises: exercises.map((e) => ({
              ...e,
              sets: e.sets.map((s) => ({ ...s, reps: s.reps || 0, weight: s.weight || 0, completed: false })),
            })),
            startTime: Date.now(),
            currentExerciseIndex: 0,
          },
        })),
      endWorkout: () => set({ activeWorkout: null }),
      setCurrentExerciseIndex: (i) =>
        set((s) =>
          s.activeWorkout
            ? { activeWorkout: { ...s.activeWorkout, currentExerciseIndex: i } }
            : {}
        ),
      updateSet: (exerciseIndex, setIndex, data) =>
        set((s) => {
          if (!s.activeWorkout) return {};
          const exercises = [...s.activeWorkout.exercises];
          const sets = [...exercises[exerciseIndex].sets];
          sets[setIndex] = { ...sets[setIndex], ...data };
          exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),
      updateExercise: (exerciseIndex, data) =>
        set((s) => {
          if (!s.activeWorkout) return {};
          const exercises = [...s.activeWorkout.exercises];
          exercises[exerciseIndex] = { ...exercises[exerciseIndex], ...data };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        }),

      workoutLogs: [],
      addWorkoutLog: (log) =>
        set((s) => ({ workoutLogs: [{ ...log, syncStatus: "pending" }, ...s.workoutLogs] })),
      updateWorkoutLogSyncStatus: (id, status) =>
        set((s) => ({
          workoutLogs: s.workoutLogs.map((l) =>
            l.id === id ? { ...l, syncStatus: status } : l
          ),
        })),

      meals: [],
      addMeal: (meal) => set((s) => ({ meals: [meal, ...s.meals] })),
      removeMeal: (id) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      waterIntake: 0,
      setWaterIntake: (n) => set({ waterIntake: n }),

      measurements: [],
      addMeasurement: (m) =>
        set((s) => ({ measurements: [...s.measurements, m] })),
      clearDemoData: () => set((s) => ({
        measurements: s.measurements.filter(m => !m.date.startsWith("2025-04") && !m.date.startsWith("2025-05-01")),
        insights: s.insights.filter(i => !i.id.startsWith("i")),
        streak: s.streak === 12 ? 0 : s.streak
      })),

      streak: 0,
      setStreak: (n) => set({ streak: n }),

      insights: [],
      setInsights: (insights) => set({ insights }),
      markInsightRead: (id) =>
        set((s) => ({
          insights: s.insights.map((i) =>
            i.id === id ? { ...i, read: true } : i
          ),
        })),

      restTimerActive: false,
      restTimerDuration: 90,
      startRestTimer: (seconds) =>
        set({ restTimerActive: true, restTimerDuration: seconds }),
      stopRestTimer: () => set({ restTimerActive: false }),

      activeTab: "home",
      setActiveTab: (tab) => set({ activeTab: tab }),

      checkMeasurementReminder: () => set((s) => {
        const lastM = s.measurements[s.measurements.length - 1];
        const lastDate = lastM ? new Date(lastM.date).getTime() : 0;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        const hasRecentReminder = s.insights.some(i => i.type === "progress" && i.id === "measurement-reminder");

        if (lastDate < sevenDaysAgo && !hasRecentReminder) {
          const reminder: AIInsight = {
            id: "measurement-reminder",
            type: "progress",
            message: "Weekly Progress Pulse: It's been over 7 days since your last weigh-in. Update your data to keep your calorie targets 100% accurate.",
            priority: "high",
            icon: "Scale",
            date: new Date().toISOString(),
            read: false
          };
          return { insights: [reminder, ...s.insights] };
        }
        return {};
      }),
    }),
    { 
      name: "zeera-fitness-store",
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
