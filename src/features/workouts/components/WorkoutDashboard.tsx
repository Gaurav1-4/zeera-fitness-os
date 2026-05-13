"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, Dumbbell, Search, ChevronRight, BookOpen, Sparkles } from "lucide-react";
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
import { useEffect } from "react";
import DailyCardioTab from "./DailyCardio/DailyCardioTab";

export default function WorkoutScreen() {
  const { startWorkout } = useAppStore();
  const router = useRouter();
  const [view, setView] = useState<"plans" | "cardio" | "library">("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "all">("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [apiExercises, setApiExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchExercises() {
      setLoading(true);
      try {
        const res = await fetch("/api/exercises?limit=100");
        const data = await res.json();
        if (data.items) {
          setApiExercises(data.items);
        }
      } catch (err) {
        console.error("Failed to fetch exercises:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExercises();
  }, []);

  // Merge API exercises with local fallback
  const allExercises = apiExercises.length > 0 
    ? apiExercises.map(e => {
        const videoMedia = e.media?.find((m: any) => m.type === 'video');
        const gifMedia = e.media?.find((m: any) => m.type === 'gif');
        const bestMedia = videoMedia || gifMedia || e.media?.[0];

        return {
          id: e.id,
          name: e.name,
          muscle: (() => {
            const part = (e.bodyPart || "").toLowerCase();
            if (part === "cardio") return "cardio";
            if (part === "waist") return "abs";
            if (part.includes("arms")) return "arms";
            if (part.includes("legs")) return "legs";
            return (part || "chest") as MuscleGroup;
          })() as MuscleGroup,
          secondaryMuscles: e.secondaryMuscles || [],
          equipment: e.equipment || "Bodyweight",
          difficulty: (e.difficulty || "intermediate").toLowerCase() as any,
          instructions: e.instructions || [],
          commonMistakes: e.commonMistakes || [],
          safetyTips: e.safetyWarnings || [],
          imageUrl: videoMedia?.thumbnailUrl || bestMedia?.thumbnailUrl || bestMedia?.url || e.media?.[0]?.url,
          videoUrl: videoMedia?.optimizedMp4Url || videoMedia?.url,
        };
      })
    : exercises;

  const filteredExercises = allExercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || e.muscle === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const selEx = selectedExerciseId ? allExercises.find((e) => e.id === selectedExerciseId) : null;

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold text-text-primary">Workouts</h1>
      </div>

      {/* View Toggle */}
      <div className="flex bg-surface rounded-xl p-1 mb-5">
        {(["plans", "cardio", "library"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              view === v ? "bg-surface-lighter text-text-primary shadow-sm" : "text-text-muted"
            }`}
          >
            {v === "plans" ? "Plans" : v === "cardio" ? "Daily Cardio" : "Library"}
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
      ) : view === "cardio" ? (
        <DailyCardioTab />
      ) : (
        <>
          {/* Exercise Detail Modal */}
          <AnimatePresence>
            {selEx && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-end"
                onClick={() => setSelectedExerciseId(null)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-surface w-full rounded-t-3xl max-h-[90dvh] overflow-y-auto"
                >
                  <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-4" />
                  <div className="px-5 pb-8">
                    <h2 className="text-xl font-display font-bold text-text-primary mb-1">{selEx.name}</h2>
                    <div className="flex gap-2 mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${muscleColors[selEx.muscle] || 'bg-surface-lighter'}`}>
                        {selEx.muscle}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs bg-surface-lighter text-text-secondary">
                        {selEx.equipment}
                      </span>
                    </div>

                    <div className="w-full aspect-video mb-4 rounded-2xl overflow-hidden bg-black border border-border/30 shadow-2xl relative group">
                      {selEx.videoUrl ? (
                        <video
                          src={selEx.videoUrl}
                          poster={selEx.imageUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : selEx.imageUrl ? (
                        <img 
                          src={selEx.imageUrl} 
                          alt={selEx.name} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <Dumbbell className="w-10 h-10 opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {selEx.instructions.length > 0 && (
                        <div className="bg-surface-lighter rounded-2xl p-5 border border-border/30">
                          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-neon-blue" /> Execution Guide
                          </h3>
                          <ol className="space-y-3">
                            {selEx.instructions.map((step: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
                                <span className="text-neon-green font-black text-xs mt-0.5 opacity-50">{String(i + 1).padStart(2, '0')}</span> {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {selEx.commonMistakes.length > 0 && (
                        <div className="bg-neon-red/5 rounded-2xl p-5 border border-neon-red/10">
                          <h3 className="text-sm font-bold text-neon-red mb-3 flex items-center gap-2">
                            ⚠️ Common Mistakes
                          </h3>
                          <ul className="space-y-2">
                            {selEx.commonMistakes.map((m: string, i: number) => (
                              <li key={i} className="text-sm text-text-secondary flex gap-2">
                                <span className="text-neon-red font-bold">•</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selEx.safetyTips.length > 0 && (
                        <div className="bg-neon-green/5 rounded-2xl p-5 border border-neon-green/10">
                          <h3 className="text-sm font-bold text-neon-green mb-3 flex items-center gap-2">
                            ✅ Pro Tips
                          </h3>
                          <ul className="space-y-2">
                            {selEx.safetyTips.map((t: string, i: number) => (
                              <li key={i} className="text-sm text-text-secondary flex gap-2">
                                <span className="text-neon-green font-bold">•</span> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-surface rounded-2xl border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 transition-colors"
            />
          </div>

          {/* Muscle Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {muscleFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setMuscleFilter(f.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  muscleFilter === f.value
                    ? "bg-neon-green text-background shadow-lg shadow-neon-green/20"
                    : "bg-surface text-text-secondary border border-border/50 hover:border-text-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="space-y-2.5">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-text-muted">
                <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
                <p className="text-sm animate-pulse">Syncing Exercise Library...</p>
              </div>
            ) : filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <motion.button
                  key={exercise.id}
                  onClick={() => setSelectedExerciseId(exercise.id)}
                  className="w-full bg-surface rounded-2xl p-4 border border-border/50 flex items-center gap-4 active:scale-[0.98] transition-transform text-left group hover:border-neon-green/30"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${muscleColors[exercise.muscle] || 'bg-surface-lighter text-text-muted'}`}>
                    {exercise.imageUrl ? (
                      <img src={exercise.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Dumbbell className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-bold truncate group-hover:text-neon-green transition-colors">{exercise.name}</p>
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">{exercise.muscle} • {exercise.equipment}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 group-hover:text-neon-green group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-text-muted text-sm italic">No exercises found matching your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
