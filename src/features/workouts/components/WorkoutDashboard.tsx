"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Dumbbell, Search, ChevronRight, BookOpen } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { workoutPlans } from "@/features/workouts/data/workouts";
import { exercises } from "@/features/workouts/data/exercises";
import { MuscleGroup } from "@/lib/types";

const muscleFilters: { label: string; value: MuscleGroup | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Chest", value: "chest" },
  { label: "Back", value: "back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Legs", value: "legs" },
  { label: "Arms", value: "arms" },
  { label: "Abs", value: "abs" },
  { label: "Cardio", value: "cardio" },
];

const muscleColors: Record<string, string> = {
  chest: "bg-neon-red/15 text-neon-red",
  back: "bg-neon-blue/15 text-neon-blue",
  shoulders: "bg-neon-orange/15 text-neon-orange",
  legs: "bg-neon-green/15 text-neon-green",
  arms: "bg-neon-purple/15 text-neon-purple",
  abs: "bg-neon-pink/15 text-neon-pink",
  cardio: "bg-warning/15 text-warning",
};

import { useRouter } from "next/navigation";

export default function WorkoutScreen() {
  const { startWorkout } = useAppStore();
  const router = useRouter();
  const [view, setView] = useState<"plans" | "library">("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "all">("all");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || e.muscle === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const selEx = selectedExercise ? exercises.find((e) => e.id === selectedExercise) : null;

  return (
    <div className="px-4 pt-14 pb-4">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-4">Workouts</h1>

      {/* View Toggle */}
      <div className="flex bg-surface rounded-xl p-1 mb-5">
        {(["plans", "library"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              view === v ? "bg-surface-lighter text-text-primary" : "text-text-secondary"
            }`}
          >
            {v === "plans" ? "Workout Plans" : "Exercise Library"}
          </button>
        ))}
      </div>

      {view === "plans" ? (
        <div className="space-y-3">
          {workoutPlans.map((workout, idx) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface rounded-2xl border border-border/50 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {workout.day && (
                        <span className="text-[10px] font-bold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">
                          {workout.day}
                        </span>
                      )}
                    </div>
                    <h3 className="text-text-primary font-semibold text-lg">{workout.name}</h3>
                    <p className="text-text-secondary text-sm">{workout.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-text-muted text-xs">
                      <Clock className="w-3 h-3" /> {workout.estimatedDuration}m
                    </div>
                    <div className="flex items-center gap-1 text-text-muted text-xs">
                      <Dumbbell className="w-3 h-3" /> {workout.exercises.length}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {workout.targetMuscles.map((m: string) => (
                    <span key={m} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${muscleColors[m]}`}>
                      {m}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    startWorkout(workout.id, workout.name, workout.exercises);
                    router.push('/session');
                  }}
                  className="w-full py-3 rounded-xl gradient-neon text-background font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Start Workout
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          {/* Exercise Detail Modal */}
          {selEx && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-end"
              onClick={() => setSelectedExercise(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface w-full rounded-t-3xl max-h-[85dvh] overflow-y-auto"
              >
                <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-4" />
                <div className="px-5 pb-8">
                  <h2 className="text-xl font-display font-bold text-text-primary mb-1">{selEx.name}</h2>
                  <div className="flex gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${muscleColors[selEx.muscle]}`}>
                      {selEx.muscle}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-surface-lighter text-text-secondary">
                      {selEx.equipment}
                    </span>
                  </div>

                  <div className="bg-surface-light rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent-light" /> Instructions
                    </h3>
                    <ol className="space-y-2">
                      {selEx.instructions.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-text-secondary">
                          <span className="text-neon-green font-bold text-xs mt-0.5">{i + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-surface-light rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-semibold text-neon-red mb-2">⚠️ Common Mistakes</h3>
                    <ul className="space-y-1.5">
                      {selEx.commonMistakes.map((m: string, i: number) => (
                        <li key={i} className="text-sm text-text-secondary flex gap-2">
                          <span className="text-neon-red">•</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-surface-light rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-semibold text-neon-green mb-2">✅ Safety Tips</h3>
                    <ul className="space-y-1.5">
                      {selEx.safetyTips.map((t: string, i: number) => (
                        <li key={i} className="text-sm text-text-secondary flex gap-2">
                          <span className="text-neon-green">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selEx.secondaryMuscles.length > 0 && (
                    <div className="bg-surface-light rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Secondary Muscles</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selEx.secondaryMuscles.map((m: string) => (
                          <span key={m} className="px-2.5 py-1 rounded-full bg-surface-lighter text-text-secondary text-xs capitalize">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Muscle Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {muscleFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setMuscleFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  muscleFilter === f.value
                    ? "gradient-neon text-background"
                    : "bg-surface text-text-secondary border border-border/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <motion.button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise.id)}
                className="w-full bg-surface rounded-xl p-3.5 border border-border/50 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${muscleColors[exercise.muscle]}`}>
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{exercise.name}</p>
                  <p className="text-text-muted text-xs capitalize">{exercise.muscle} • {exercise.equipment}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
