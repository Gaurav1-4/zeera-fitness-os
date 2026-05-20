"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Timer, Check, ChevronLeft, ChevronRight, Trophy, HelpCircle, Pointer, Settings2, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDuration, calculateWorkoutCaloriesBurned, calculateTotalVolume } from "@/lib/utils";
import { useRouter } from "next/navigation";
import WorkoutIntelligence from "./ActiveWorkout/WorkoutIntelligence";

// Smart defaults based on exercise type
const getSmartDefaults = (exerciseName: string, muscle: string, equipment: string) => {
  const name = exerciseName.toLowerCase();
  if (name.includes("squat")) return { weight: 40, reps: 10 };
  if (name.includes("bench") || name.includes("press")) return { weight: 30, reps: 10 };
  if (name.includes("deadlift") || name.includes("row")) return { weight: 30, reps: 10 };
  if (name.includes("curl")) return { weight: 10, reps: 12 };
  if (name.includes("lateral") || name.includes("fly") || name.includes("raise")) return { weight: 8, reps: 12 };
  if (name.includes("push-up") || name.includes("pull-up") || name.includes("plank")) return { weight: 0, reps: 10 };
  if (name.includes("leg press")) return { weight: 60, reps: 12 };
  if (name.includes("lunge")) return { weight: 12, reps: 10 };
  if (equipment === "Bodyweight") return { weight: 0, reps: 12 };
  if (muscle === "legs") return { weight: 30, reps: 10 };
  if (muscle === "arms") return { weight: 10, reps: 12 };
  return { weight: 20, reps: 10 };
};

export default function ActiveWorkoutScreen() {
  const { 
    activeWorkout, 
    endWorkout, 
    updateSet, 
    setCurrentExerciseIndex, 
    addWorkoutLog, 
    restTimerActive, 
    restTimerDuration, 
    startRestTimer, 
    stopRestTimer, 
    hasSeenWorkoutTutorial, 
    setHasSeenWorkoutTutorial, 
    user 
  } = useAppStore();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isAdvancedUser = user.experience === "advanced";

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!restTimerActive) { setRestTime(0); return; }
    setRestTime(restTimerDuration);
    const interval = setInterval(() => {
      setRestTime((t) => {
        if (t <= 1) { stopRestTimer(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerActive, restTimerDuration, stopRestTimer]);

  const handleFinish = useCallback(() => {
    if (!activeWorkout) return;
    const totalVolume = calculateTotalVolume(activeWorkout.exercises, user.weight);
    const totalSets = activeWorkout.exercises.reduce((a: number, e: any) => a + e.sets.filter((s: any) => s.completed).length, 0);
    const caloriesBurned = calculateWorkoutCaloriesBurned(elapsed, user.weight, totalVolume, totalSets);
    addWorkoutLog({
      id: `wl-${Date.now()}`,
      workoutId: activeWorkout.id,
      workoutName: activeWorkout.name,
      date: new Date().toISOString().split("T")[0],
      duration: elapsed,
      exercises: activeWorkout.exercises,
      totalVolume,
      caloriesBurned,
      completed: true,
    });
    endWorkout();
    router.push('/home');
  }, [activeWorkout, elapsed, addWorkoutLog, endWorkout, router, user.weight]);

  if (!activeWorkout) return null;

  const { exercises: exs, currentExerciseIndex } = activeWorkout;
  const currentEx = exs[currentExerciseIndex];
  const totalSetsAll = exs.reduce((a: number, e: any) => a + e.sets.length, 0);
  const completedAll = exs.reduce((a: number, e: any) => a + e.sets.filter((s: any) => s.completed).length, 0);
  
  const nextSetIndex = currentEx.sets.findIndex((s: any) => !s.completed);
  const allSetsComplete = nextSetIndex === -1;
  const defaults = getSmartDefaults(currentEx.exercise.name, currentEx.exercise.muscle, currentEx.exercise.equipment);

  const handleAutoAdvance = () => {
    if (currentExerciseIndex < exs.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleCompleteSet = (setIndex: number, set: any) => {
    const willComplete = !set.completed;
    if (willComplete && (!set.weight && set.weight !== 0) && !set.reps) {
      updateSet(currentExerciseIndex, setIndex, { 
        weight: defaults.weight, 
        reps: defaults.reps, 
        completed: true 
      });
    } else {
      updateSet(currentExerciseIndex, setIndex, { completed: willComplete });
    }
    if (willComplete && currentEx.restTime > 0) {
      startRestTimer(currentEx.restTime);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Tutorial Overlay */}
      <AnimatePresence>
        {(!hasSeenWorkoutTutorial || showTutorial) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col justify-center p-6"
          >
            <div className="bg-surface rounded-2xl p-6 border border-border/50 max-w-sm mx-auto w-full relative overflow-hidden">
              <h2 className="text-xl font-display font-bold text-text-primary text-center mb-5">How It Works</h2>
              
              <div className="bg-surface-lighter rounded-xl h-20 mb-5 relative flex items-center justify-center border border-border/50">
                <div className="flex w-full px-4 items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neon-green/10 text-neon-green flex items-center justify-center font-bold text-sm">1</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-9 rounded-lg bg-surface/50 border border-border/30 flex items-center justify-center text-xs text-text-muted">30kg</div>
                    <div className="flex-1 h-9 rounded-lg bg-surface/50 border border-border/30 flex items-center justify-center text-xs text-text-muted">10</div>
                  </div>
                  <motion.div
                    animate={{ backgroundColor: ["#1A1A24", "#30FF691a", "#1A1A24"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-border/30"
                  >
                    <motion.div
                      animate={{ color: ["#6B7280", "#30FF69", "#6B7280"], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>
                <motion.div 
                  className="absolute z-10 text-white drop-shadow-lg"
                  animate={{ x: [30, 60, 30], y: [20, 0, 20], scale: [1, 0.85, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Pointer className="w-5 h-5 fill-white" />
                </motion.div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex gap-3 items-center">
                  <div className="w-7 h-7 rounded-lg bg-neon-green/10 text-neon-green flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-text-secondary text-sm">Enter weight & reps, then tap <strong className="text-neon-green">✓</strong></p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-7 h-7 rounded-lg bg-neon-blue/10 text-neon-blue flex items-center justify-center shrink-0"><Zap className="w-3.5 h-3.5" /></div>
                  <p className="text-text-secondary text-sm">We <strong className="text-text-primary">auto-fill</strong> smart defaults</p>
                </div>
              </div>

              <button
                onClick={() => { setHasSeenWorkoutTutorial(true); setShowTutorial(false); }}
                className="w-full py-3 rounded-xl gradient-neon text-background font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                Got it, let's go!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimerActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary text-sm mb-2 font-medium">REST</p>
              <motion.p className="text-7xl font-display font-bold text-neon-green mb-6" key={restTime} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>{formatDuration(restTime)}</motion.p>
              <button onClick={stopRestTimer} className="px-8 py-3 rounded-xl bg-surface-lighter text-text-primary font-medium active:scale-95 transition-transform">Skip Rest</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Confirm */}
      <AnimatePresence>
        {showFinish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setShowFinish(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-surface rounded-2xl p-6 w-full max-w-sm">
              <Trophy className="w-12 h-12 text-neon-green mx-auto mb-3" />
              <h2 className="text-xl font-display font-bold text-text-primary text-center mb-2">Finish Workout?</h2>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowFinish(false)} className="flex-1 py-3 rounded-xl bg-surface-lighter text-text-primary font-medium">Continue</button>
                <button onClick={handleFinish} className="flex-1 py-3 rounded-xl gradient-neon text-background font-semibold">Finish</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => setShowFinish(true)} className="p-2 rounded-lg bg-surface-lighter">
          <X className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="text-center">
          <p className="text-text-primary font-semibold text-sm">{activeWorkout.name}</p>
          <p className="text-neon-green text-xs font-mono">{formatDuration(elapsed)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowTutorial(true)} className="p-1.5 rounded-full bg-surface-lighter">
            <HelpCircle className="w-5 h-5 text-neon-blue" />
          </button>
          <button onClick={() => setShowFinish(true)} className="px-4 py-2 rounded-lg gradient-neon text-background text-sm font-semibold">
            Finish
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-4">
        <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden">
          <motion.div className="h-full bg-neon-green rounded-full" animate={{ width: `${(completedAll / totalSetsAll) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <p className="text-text-muted text-xs mt-1.5 text-right">{completedAll}/{totalSetsAll} sets complete</p>
      </div>

      {/* Exercise Navigation */}
      <div className="px-4 flex items-center justify-between mb-3">
        <button disabled={currentExerciseIndex === 0} onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)} className="p-2 rounded-lg bg-surface disabled:opacity-30">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="text-text-secondary text-sm">Exercise {currentExerciseIndex + 1} of {exs.length}</p>
        <button disabled={currentExerciseIndex === exs.length - 1} onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)} className="p-2 rounded-lg bg-surface disabled:opacity-30">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Current Exercise */}
      <div className="flex-1 px-4 overflow-y-auto pb-6">
        <WorkoutIntelligence />
        
        <AnimatePresence mode="wait">
          <motion.div key={currentExerciseIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="bg-surface rounded-2xl border border-border/50 p-4 mb-4">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-display font-bold text-text-primary">{currentEx.exercise.name}</h2>
                {isAdvancedUser && (
                  <button onClick={() => setShowAdvanced(!showAdvanced)} className={`p-1.5 rounded-lg transition-colors ${showAdvanced ? 'bg-neon-blue/10 text-neon-blue' : 'bg-surface-lighter text-text-muted'}`}>
                    <Settings2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-text-secondary text-sm capitalize mb-4">{currentEx.exercise.muscle} • {currentEx.exercise.equipment}</p>
              
              {currentEx.exercise.exerciseType === "Cardio" || currentEx.exercise.muscle === "cardio" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl text-center">
                    <p className="text-xs text-text-muted uppercase tracking-widest font-black mb-1">Session Target</p>
                    <p className="text-2xl font-black text-neon-blue">{currentEx.notes || "Target Time"}</p>
                  </div>
                  <button 
                    onClick={() => handleCompleteSet(0, currentEx.sets[0])}
                    className="w-full py-4 rounded-2xl gradient-neon text-background font-black text-sm active:scale-[0.98] transition-transform"
                  >
                    {currentEx.sets[0].completed ? "Logged ✓" : "Log Cardio Complete"}
                  </button>
                </div>
              ) : (
                <>
                  {allSetsComplete && currentExerciseIndex < exs.length - 1 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-3 px-3 py-3 bg-neon-green/8 border border-neon-green/20 rounded-xl text-center">
                      <p className="text-neon-green text-sm font-semibold mb-2">✅ All sets done!</p>
                      <button onClick={handleAutoAdvance} className="px-6 py-2 rounded-xl gradient-neon text-background text-sm font-semibold active:scale-95 transition-transform">
                        Next Exercise →
                      </button>
                    </motion.div>
                  )}

                  {showAdvanced && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <input type="text" placeholder="Tempo" value={currentEx.tempo || ""} onChange={(e) => useAppStore.getState().updateExercise(currentExerciseIndex, { tempo: e.target.value })} className="w-full py-2 px-3 bg-surface border border-border/50 rounded-lg text-sm text-text-primary" />
                        <input type="text" placeholder="Notes" value={currentEx.notes || ""} onChange={(e) => useAppStore.getState().updateExercise(currentExerciseIndex, { notes: e.target.value })} className="w-full py-2 px-3 bg-surface border border-border/50 rounded-lg text-sm text-text-primary" />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <div className="grid grid-cols-[36px_1fr_1fr_44px] gap-2 px-1">
                      <span className="text-text-muted text-[10px] text-center font-medium">SET</span>
                      <span className="text-text-muted text-[10px] text-center font-medium">KG</span>
                      <span className="text-text-muted text-[10px] text-center font-medium">REPS</span>
                      <span className="text-text-muted text-[10px] text-center font-medium">DONE</span>
                    </div>
                    {currentEx.sets.map((set: any, i: number) => (
                      <div key={set.id} className={`grid grid-cols-[36px_1fr_1fr_44px] gap-2 items-center p-2 rounded-xl transition-all ${set.completed ? "bg-neon-green/5 opacity-60" : "bg-surface-light"}`}>
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold ${set.completed ? "text-neon-green bg-neon-green/10" : "text-text-secondary bg-surface-lighter"}`}>
                          {set.completed ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <input type="number" value={set.weight || ""} onChange={(e) => updateSet(currentExerciseIndex, i, { weight: parseFloat(e.target.value) || 0 })} placeholder={String(defaults.weight)} className="w-full h-9 px-2 bg-surface-lighter rounded-lg text-center text-sm font-bold" />
                        <input type="number" value={set.reps || ""} onChange={(e) => updateSet(currentExerciseIndex, i, { reps: parseInt(e.target.value) || 0 })} placeholder={String(defaults.reps)} className="w-full h-9 px-2 bg-surface-lighter rounded-lg text-center text-sm font-bold" />
                        <button onClick={() => handleCompleteSet(i, set)} className={`w-10 h-9 rounded-lg flex items-center justify-center mx-auto ${set.completed ? "gradient-neon" : "bg-surface-lighter border border-border"}`}>
                          <Check className={`w-5 h-5 ${set.completed ? "text-background" : "text-text-muted"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              {[60, 90, 120, 180].map((t) => (
                <button key={t} onClick={() => startRestTimer(t)} className="flex-1 py-2.5 rounded-xl bg-surface border border-border/50 text-text-secondary text-sm font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                  <Timer className="w-3.5 h-3.5" /> {t < 120 ? `${t}s` : `${t / 60}m`}
                </button>
              ))}
            </div>

            {currentExerciseIndex < exs.length - 1 && (
              <button onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)} className="w-full p-3.5 rounded-xl bg-surface border border-border/50 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="text-left">
                  <p className="text-text-muted text-xs">Up Next</p>
                  <p className="text-text-primary text-sm font-medium">{exs[currentExerciseIndex + 1].exercise.name}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
