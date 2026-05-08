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
        set({
          activeWorkout: {
            id,
            name,
            exercises: exercises.map((e) => ({
              ...e,
              sets: e.sets.map((s) => ({ ...s, reps: 0, weight: 0, completed: false })),
            })),
            startTime: Date.now(),
            currentExerciseIndex: 0,
          },
        }),
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

      measurements: [
        { date: "2025-04-01", weight: 80, bodyFat: 22, waist: 36 },
        { date: "2025-04-15", weight: 78.5, bodyFat: 21, waist: 35.5 },
        { date: "2025-05-01", weight: 77, bodyFat: 20, waist: 35 },
        { date: "2025-05-08", weight: 75, bodyFat: 18.5, waist: 34 },
      ],
      addMeasurement: (m) =>
        set((s) => ({ measurements: [...s.measurements, m] })),

      streak: 12,
      setStreak: (n) => set({ streak: n }),

      insights: [
        { id: "i1", type: "nutrition", message: "Your protein intake has been below target for 3 days. Try adding a whey shake post-workout.", priority: "high", icon: "🥩", date: new Date().toISOString(), read: false },
        { id: "i2", type: "workout", message: "Great job! Bench press strength up 5kg this month.", priority: "medium", icon: "💪", date: new Date().toISOString(), read: false },
        { id: "i3", type: "streak", message: "You're on a 12-day streak! Keep going to hit your 2-week milestone.", priority: "low", icon: "🔥", date: new Date().toISOString(), read: false },
        { id: "i4", type: "progress", message: "Weight trending down consistently. You've lost 5kg in 5 weeks!", priority: "medium", icon: "📉", date: new Date().toISOString(), read: true },
        { id: "i5", type: "recovery", message: "You've trained 5 days in a row. Consider a rest day for recovery.", priority: "high", icon: "😴", date: new Date().toISOString(), read: false },
      ],
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
    }),
    { 
      name: "zeera-fitness-store",
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
