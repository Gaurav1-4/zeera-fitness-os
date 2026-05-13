"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Dumbbell, 
  Zap, 
  ChevronDown, 
  Timer, 
  Activity,
  Trophy,
  ArrowUpRight,
  Bike,
  Footprints,
  Utensils
} from "lucide-react";
import { 
  calculateTreadmillBurn, 
  calculateCyclingBurn, 
  getExerciseROI,
  calculateDailyTarget
} from "@/lib/fitness-logic";
import { useAppStore } from "@/lib/store";

export default function WorkoutIntelligence() {
  const { activeWorkout, user, updateExercise, meals } = useAppStore();
  const [showCardioLab, setShowCardioLab] = useState(false);
  
  // Cardio States
  const [speed, setSpeed] = useState(6.0);
  const [incline, setIncline] = useState(1.0);
  const [resistance, setResistance] = useState(20);
  const [cardioTime, setCardioTime] = useState(15);

  if (!activeWorkout) return null;

  const currentEx = activeWorkout.exercises[activeWorkout.currentExerciseIndex];
  const isCardio = currentEx?.exercise.exerciseType === "Cardio" || 
                   currentEx?.exercise.name.toLowerCase().includes("treadmill") ||
                   currentEx?.exercise.name.toLowerCase().includes("bike") ||
                   currentEx?.exercise.name.toLowerCase().includes("cycling");

  // Calculate Daily Target
  const dailyTarget = useMemo(() => calculateDailyTarget({
    weight: user.weight || 75,
    height: user.height || 175,
    age: user.age || 25,
    gender: (user.gender as any).toUpperCase(),
    activityLevel: (user.activityLevel as any).toUpperCase(),
    goal: (user.goal === "lose" ? "LOSE_FAT" : user.goal === "build" ? "BUILD_MUSCLE" : "MAINTAIN") as any
  }), [user]);

  // Calculate Daily Calorie Intake
  const today = new Date().toISOString().split("T")[0];
  const totalIntake = useMemo(() => {
    return meals
      .filter(m => m.date === today)
      .reduce((sum, m) => sum + (m.foodItem.calories * m.quantity), 0);
  }, [meals, today]);

  // Workout Goal (15% of Daily TDEE)
  const workoutCalorieGoal = Math.round(dailyTarget * 0.15);

  // Calculate Completed ROI Volume
  const completedVolumeROI = useMemo(() => {
    return activeWorkout.exercises.reduce((total, ex) => {
      const roi = getExerciseROI({ 
        isCompound: ex.exercise.isCompound || true, 
        muscleGroup: ex.exercise.bodyPart || "full body" 
      });
      const completedSets = ex.sets.filter(s => s.completed).length;
      return total + (completedSets * roi);
    }, 0);
  }, [activeWorkout]);

  // Target ROI volume (e.g., 18-24 "Quality Sets" for a pro workout)
  const targetROIVolume = user.experience === "advanced" ? 24 : 15;
  const roiProgress = Math.min((completedVolumeROI / targetROIVolume) * 100, 100);

  // Live Cardio Burn
  const liveBurn = isCardio ? (
    currentEx.exercise.name.toLowerCase().includes("bike") 
      ? calculateCyclingBurn(user.weight, resistance, cardioTime)
      : calculateTreadmillBurn(user.weight, speed, incline, cardioTime)
  ) : 0;

  // Smart Suggestion Logic
  const suggestion = useMemo(() => {
    if (roiProgress > 95) return null;
    const muscle = currentEx?.exercise.muscle || "chest";
    
    const recommendations: Record<string, string> = {
      chest: "Push-ups to failure or Cable Flys",
      back: "Face Pulls or Straight-Arm Pulldowns",
      legs: "Goblet Squats or Calf Raises",
      shoulders: "Lateral Raises or Front Raises",
      arms: "Hammer Curls or Tricep Dips"
    };

    return recommendations[muscle as string] || "one more compound set";
  }, [roiProgress, currentEx]);

  return (
    <div className="space-y-3 mb-6">
      {/* Intelligence Dashboard */}
      <div className="grid grid-cols-3 gap-2">
        {/* Calorie Progress */}
        <div className="bg-surface border border-border/50 rounded-2xl p-3 relative overflow-hidden group">
          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Burn Target</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-neon-orange">{Math.round(liveBurn)}</span>
            <span className="text-[8px] font-bold text-text-muted">/ {workoutCalorieGoal}</span>
          </div>
          <div className="mt-2 h-1 bg-surface-lighter rounded-full overflow-hidden">
            <motion.div animate={{ width: `${(liveBurn / workoutCalorieGoal) * 100}%` }} className="h-full bg-neon-orange" />
          </div>
        </div>

        {/* ROI Volume Progress */}
        <div className="bg-surface border border-border/50 rounded-2xl p-3 relative overflow-hidden group">
          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">ROI Volume</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-neon-blue">{completedVolumeROI.toFixed(1)}</span>
            <span className="text-[8px] font-bold text-text-muted">/ {targetROIVolume}</span>
          </div>
          <div className="mt-2 h-1 bg-surface-lighter rounded-full overflow-hidden">
            <motion.div animate={{ width: `${roiProgress}%` }} className="h-full bg-neon-blue" />
          </div>
        </div>

        {/* Net Calorie Balance */}
        <div className="bg-surface border border-border/50 rounded-2xl p-3 relative overflow-hidden group">
          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Net Balance</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-neon-green">{Math.round(totalIntake - liveBurn)}</span>
            <span className="text-[8px] font-bold text-text-muted"> kcal</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <Utensils className="w-2 h-2 text-text-muted" />
            <span className="text-[8px] text-text-muted">{totalIntake} in</span>
          </div>
        </div>
      </div>

      {/* Interactive Cardio Lab (Only for Cardio exercises) */}
      <AnimatePresence>
        {isCardio && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-surface-lighter border border-neon-orange/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-orange" />
                <h3 className="font-bold text-sm">Cardio Precision Lab</h3>
              </div>
              <div className="bg-neon-orange/10 text-neon-orange px-2 py-1 rounded text-[10px] font-black uppercase">
                Active Calculation
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {currentEx.exercise.name.toLowerCase().includes("bike") ? (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase">Resistance %</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="1" max="100" value={resistance}
                        onChange={(e) => setResistance(parseInt(e.target.value))}
                        className="flex-1 accent-neon-orange"
                      />
                      <span className="text-sm font-black w-8">{resistance}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase">Time (Min)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="1" max="60" value={cardioTime}
                        onChange={(e) => setCardioTime(parseInt(e.target.value))}
                        className="flex-1 accent-neon-orange"
                      />
                      <span className="text-sm font-black w-8">{cardioTime}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase">Speed (KPH)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="1" max="20" step="0.5" value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="flex-1 accent-neon-orange"
                      />
                      <span className="text-sm font-black w-8">{speed}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase">Incline %</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="0" max="15" step="0.5" value={incline}
                        onChange={(e) => setIncline(parseFloat(e.target.value))}
                        className="flex-1 accent-neon-orange"
                      />
                      <span className="text-sm font-black w-8">{incline}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <p className="text-[11px] text-text-secondary">
                AI Tip: Increase {speed < 8 ? 'speed' : 'incline'} to burn +15% faster.
              </p>
              <div className="flex items-center gap-1 text-neon-orange font-black text-sm">
                +{Math.round(liveBurn)} kcal <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROI Coach Message */}
      <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl p-3 flex items-center gap-3">
        <Zap className="w-4 h-4 text-neon-blue shrink-0" />
        <div className="space-y-1">
          <p className="text-[11px] text-text-secondary leading-tight">
            {roiProgress < 50 
              ? "Your volume is currently at 'Warmup' levels. Focus on high-ROI compounds to hit your daily growth target."
              : roiProgress < 90 
              ? `Great intensity! You're ${Math.ceil((targetROIVolume - completedVolumeROI) / 0.6)} sets away from completing your ROI.`
              : "Daily ROI Achieved! Any further exercises are pure bonus volume."}
          </p>
          {suggestion && (
            <p className="text-[10px] text-neon-blue font-bold">
              AI Recommendation: Add {suggestion} to finish the muscle.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
