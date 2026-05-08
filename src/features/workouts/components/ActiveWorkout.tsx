"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Timer, Check, ChevronLeft, ChevronRight, Trophy, Pause, Play } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ActiveWorkoutScreen() {
  const { activeWorkout, endWorkout, updateSet, setCurrentExerciseIndex, addWorkoutLog, restTimerActive, restTimerDuration, startRestTimer, stopRestTimer } = useAppStore();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [showFinish, setShowFinish] = useState(false);

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
    const totalVolume = activeWorkout.exercises.reduce(
      (acc: number, ex) => acc + ex.sets.reduce((s: number, set: any) => s + (set.completed ? set.weight * set.reps : 0), 0), 0
    );
    addWorkoutLog({
      id: `wl-${Date.now()}`,
      workoutId: activeWorkout.id,
      workoutName: activeWorkout.name,
      date: new Date().toISOString().split("T")[0],
      duration: elapsed,
      exercises: activeWorkout.exercises,
      totalVolume,
      caloriesBurned: Math.round(elapsed * 0.12),
      completed: true,
    });
    endWorkout();
    router.push('/home');
  }, [activeWorkout, elapsed, addWorkoutLog, endWorkout, router]);

  if (!activeWorkout) return null;

  const { exercises: exs, currentExerciseIndex } = activeWorkout;
  const currentEx = exs[currentExerciseIndex];
  const completedSets = currentEx.sets.filter((s: any) => s.completed).length;
  const totalSetsAll = exs.reduce((a: number, e: any) => a + e.sets.length, 0);
  const completedAll = exs.reduce((a: number, e: any) => a + e.sets.filter((s: any) => s.completed).length, 0);

  const toggleSetType = (currentType: string = "normal") => {
    if (currentType === "normal") return "warmup";
    if (currentType === "warmup") return "drop";
    if (currentType === "drop") return "failure";
    return "normal";
  };

  const getSetLabel = (type: string = "normal", index: number) => {
    if (type === "warmup") return "W";
    if (type === "drop") return "D";
    if (type === "failure") return "F";
    return index + 1;
  };

  const getSetColor = (type: string = "normal", completed: boolean) => {
    if (completed) return "text-neon-green bg-neon-green/10";
    if (type === "warmup") return "text-neon-orange bg-neon-orange/10";
    if (type === "drop") return "text-neon-purple bg-neon-purple/10";
    if (type === "failure") return "text-neon-red bg-neon-red/10";
    return "text-text-secondary bg-surface-lighter";
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimerActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-text-secondary text-sm mb-2 font-medium">REST</p>
              <motion.p
                className="text-7xl font-display font-bold text-neon-green mb-6"
                key={restTime}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatDuration(restTime)}
              </motion.p>
              <div className="w-48 h-1.5 bg-surface-lighter rounded-full mx-auto mb-8 overflow-hidden">
                <motion.div
                  className="h-full bg-neon-green rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: restTimerDuration, ease: "linear" }}
                />
              </div>
              <button
                onClick={stopRestTimer}
                className="px-8 py-3 rounded-xl bg-surface-lighter text-text-primary font-medium active:scale-95 transition-transform"
              >
                Skip Rest
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Confirm */}
      <AnimatePresence>
        {showFinish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => setShowFinish(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl p-6 w-full max-w-sm"
            >
              <Trophy className="w-12 h-12 text-neon-green mx-auto mb-3" />
              <h2 className="text-xl font-display font-bold text-text-primary text-center mb-2">Finish Workout?</h2>
              <p className="text-text-secondary text-sm text-center mb-1">Duration: {formatDuration(elapsed)}</p>
              <p className="text-text-secondary text-sm text-center mb-5">
                Completed: {completedAll}/{totalSetsAll} sets
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowFinish(false)} className="flex-1 py-3 rounded-xl bg-surface-lighter text-text-primary font-medium">
                  Continue
                </button>
                <button onClick={handleFinish} className="flex-1 py-3 rounded-xl gradient-neon text-background font-semibold">
                  Finish
                </button>
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
        <button onClick={() => setShowFinish(true)} className="px-4 py-2 rounded-lg gradient-neon text-background text-sm font-semibold">
          Finish
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-4">
        <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-neon-green rounded-full"
            animate={{ width: `${(completedAll / totalSetsAll) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-text-muted text-xs mt-1.5 text-right">{completedAll}/{totalSetsAll} sets complete</p>
      </div>

      {/* Exercise Navigation */}
      <div className="px-4 flex items-center justify-between mb-3">
        <button
          disabled={currentExerciseIndex === 0}
          onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
          className="p-2 rounded-lg bg-surface disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <p className="text-text-secondary text-sm">
          Exercise {currentExerciseIndex + 1} of {exs.length}
        </p>
        <button
          disabled={currentExerciseIndex === exs.length - 1}
          onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
          className="p-2 rounded-lg bg-surface disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Current Exercise */}
      <div className="flex-1 px-4 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-surface rounded-2xl border border-border/50 p-4 mb-4">
              <h2 className="text-xl font-display font-bold text-text-primary mb-1">{currentEx.exercise.name}</h2>
              <p className="text-text-secondary text-sm capitalize mb-3">
                {currentEx.exercise.muscle} • {currentEx.exercise.equipment}
              </p>
              
              {currentEx.exercise.imageUrl && (
                <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-surface-lighter">
                  <img 
                    src={currentEx.exercise.imageUrl} 
                    alt={currentEx.exercise.name} 
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              )}
              {currentEx.previousBest && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-accent/10 rounded-lg">
                  <Trophy className="w-4 h-4 text-accent-light" />
                  <span className="text-accent-light text-xs font-medium">
                    Previous Best: {currentEx.previousBest.weight}kg × {currentEx.previousBest.reps} reps
                  </span>
                </div>
              )}

              {/* Tempo and Notes */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Tempo (e.g. 3-0-1-0)"
                  value={currentEx.tempo || ""}
                  onChange={(e) => useAppStore.getState().updateExercise(currentExerciseIndex, { tempo: e.target.value })}
                  className="w-full py-2 px-3 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
                <input
                  type="text"
                  placeholder="Notes (e.g. seat level 4)"
                  value={currentEx.notes || ""}
                  onChange={(e) => useAppStore.getState().updateExercise(currentExerciseIndex, { notes: e.target.value })}
                  className="w-full py-2 px-3 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
              </div>

              {/* Sets */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-[40px_1fr_1fr_40px_48px] gap-2 px-1">
                  <span className="text-text-muted text-[10px] text-center font-medium">TYPE</span>
                  <span className="text-text-muted text-[10px] text-center font-medium">KG</span>
                  <span className="text-text-muted text-[10px] text-center font-medium">REPS</span>
                  <span className="text-text-muted text-[10px] text-center font-medium">RPE</span>
                  <span className="text-text-muted text-[10px] text-center font-medium">DONE</span>
                </div>
                {currentEx.sets.map((set: any, i: number) => (
                  <motion.div
                    key={set.id}
                    className={`grid grid-cols-[40px_1fr_1fr_40px_48px] gap-2 items-center p-2 rounded-xl transition-colors ${
                      set.completed ? "bg-neon-green/5" : "bg-surface-light"
                    }`}
                    layout
                  >
                    <button
                      onClick={() => updateSet(currentExerciseIndex, i, { type: toggleSetType(set.type) })}
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${getSetColor(set.type, set.completed)}`}
                    >
                      {getSetLabel(set.type, i)}
                    </button>
                    
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(currentExerciseIndex, i, { weight: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full h-10 px-2 bg-surface-lighter rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                    
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(currentExerciseIndex, i, { reps: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full h-10 px-2 bg-surface-lighter rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />

                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.rpe || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateSet(currentExerciseIndex, i, { rpe: val >= 1 && val <= 10 ? val : 8 });
                      }}
                      placeholder="8"
                      className="w-full h-10 px-1 bg-surface-lighter rounded-lg text-center text-text-muted text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />

                    <button
                      onClick={() => {
                        const willComplete = !set.completed;
                        updateSet(currentExerciseIndex, i, { completed: willComplete });
                        if (willComplete && currentEx.restTime > 0) {
                          startRestTimer(currentEx.restTime);
                        }
                      }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-all active:scale-90 ${
                        set.completed ? "gradient-neon" : "bg-surface-lighter border border-border"
                      }`}
                    >
                      <Check className={`w-5 h-5 ${set.completed ? "text-background" : "text-text-muted"}`} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Rest Timer */}
            <div className="flex gap-2 mb-4">
              {[60, 90, 120, 180].map((t) => (
                <button
                  key={t}
                  onClick={() => startRestTimer(t)}
                  className="flex-1 py-2.5 rounded-xl bg-surface border border-border/50 text-text-secondary text-sm font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Timer className="w-3.5 h-3.5" /> {t < 120 ? `${t}s` : `${t / 60}m`}
                </button>
              ))}
            </div>

            {/* Next Exercise Preview */}
            {currentExerciseIndex < exs.length - 1 && (
              <button
                onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                className="w-full p-3.5 rounded-xl bg-surface border border-border/50 flex items-center justify-between active:scale-[0.98] transition-transform"
              >
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
