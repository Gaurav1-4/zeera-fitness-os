"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity, Clock, Trash2, Plus, ArrowRight, Gauge, Trophy } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

export default function DailyCardioTab() {
  const { user, addWorkoutLog, workoutLogs } = useAppStore();
  const [activeMachine, setActiveMachine] = useState<"treadmill" | "cycling">("treadmill");
  
  // Form State
  const [duration, setDuration] = useState(15);
  const [speed, setSpeed] = useState(6.0); // kph
  const [incline, setIncline] = useState(1.0); // %
  const [resistance, setResistance] = useState(10); // 1-20 level

  // Get today's cardio logs
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = useMemo(() => {
    return workoutLogs.filter(log => 
      log.date === today && 
      (log.workoutName === "Daily Cardio Session" || log.exercises.some(e => e.exercise?.exerciseType === "Cardio"))
    );
  }, [workoutLogs, today]);

  const todayBurn = useMemo(() => {
    return todayLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);
  }, [todayLogs]);

  const targetBurn = 250;
  const progress = Math.min((todayBurn / targetBurn) * 100, 100);

  const calculateCurrentBurn = () => {
    const weight = user.weight || 75;
    const hours = duration / 60;
    
    if (activeMachine === "treadmill") {
      // Basic MET for treadmill speed
      const baseMet = speed * 0.9; // Simplified speed-to-MET
      const inclineBonus = incline * 0.5;
      const totalMet = baseMet + inclineBonus;
      return Math.round(totalMet * weight * hours);
    } else {
      // Basic MET for stationary cycling
      const baseMet = (resistance * 0.4) + 4;
      return Math.round(baseMet * weight * hours);
    }
  };

  const currentBurn = calculateCurrentBurn();

  const handleLogCardio = () => {
    const burn = calculateCurrentBurn();
    const log = {
      id: `cardio-${Date.now()}`,
      workoutId: "daily-cardio",
      workoutName: "Daily Cardio Session",
      date: today,
      duration: duration * 60,
      caloriesBurned: burn,
      completed: true,
      exercises: [
        {
          id: `ex-${Date.now()}`,
          name: activeMachine === "treadmill" ? "Treadmill Run" : "Stationary Cycling",
          sets: [{ reps: 1, weight: 0, completed: true }],
          notes: activeMachine === "treadmill" 
            ? `${speed}kph at ${incline}% incline` 
            : `Level ${resistance} resistance`,
          exercise: {
            name: activeMachine === "treadmill" ? "Treadmill" : "Stationary Bike",
            muscle: "cardio",
            equipment: activeMachine === "treadmill" ? "Treadmill" : "Bike",
            exerciseType: "Cardio"
          }
        }
      ]
    };

    addWorkoutLog(log as any);
    // Success feedback or reset could go here
  };

  return (
    <div className="space-y-6">
      {/* Burn Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-3xl p-6 border border-border/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity className="w-32 h-32 text-neon-green" />
        </div>
        
        <div className="flex justify-between items-end mb-4 relative z-10">
          <div>
            <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-1">Daily Metabolic Target</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-text-primary">{todayBurn}</span>
              <span className="text-text-muted font-bold">/ {targetBurn} kcal</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-neon-green font-black text-xl">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="h-4 bg-surface-lighter rounded-full overflow-hidden mb-2 relative z-10 p-1 border border-border/30">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-neon-green rounded-full shadow-[0_0_12px_rgba(48,255,105,0.4)]"
          />
        </div>
        
        <p className="text-[10px] text-text-muted font-medium text-center italic">
          {progress >= 100 ? "🔥 Daily target crushed! You're in peak fat-burning mode." : `${targetBurn - todayBurn} kcal remaining to hit your daily metabolic goal.`}
        </p>
      </motion.div>

      {/* Machine Toggle */}
      <div className="flex bg-surface rounded-2xl p-1.5 border border-border/50">
        <button
          onClick={() => setActiveMachine("treadmill")}
          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeMachine === "treadmill" ? "bg-neon-blue text-background" : "text-text-secondary"
          }`}
        >
          <Activity className="w-4 h-4" /> Treadmill
        </button>
        <button
          onClick={() => setActiveMachine("cycling")}
          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeMachine === "cycling" ? "bg-neon-purple text-background" : "text-text-secondary"
          }`}
        >
          <Zap className="w-4 h-4" /> Cycling
        </button>
      </div>

      {/* Logging Form */}
      <div className="bg-surface rounded-3xl p-6 border border-border/50 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3" /> Duration (min)
            </label>
            <input 
              type="number" 
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-surface-lighter border border-border/30 rounded-xl px-4 py-3 text-text-primary font-bold focus:border-neon-green outline-none transition-colors"
            />
          </div>

          {activeMachine === "treadmill" ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Speed (kph)
              </label>
              <input 
                type="number" 
                step="0.1"
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full bg-surface-lighter border border-border/30 rounded-xl px-4 py-3 text-text-primary font-bold focus:border-neon-blue outline-none transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3" /> Resistance
              </label>
              <input 
                type="number" 
                value={resistance} 
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-full bg-surface-lighter border border-border/30 rounded-xl px-4 py-3 text-text-primary font-bold focus:border-neon-purple outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {activeMachine === "treadmill" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Incline: {incline}%</label>
              <span className="text-[10px] font-bold text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded-full">Intensity: {incline > 5 ? "High" : "Standard"}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="15" 
              step="0.5"
              value={incline}
              onChange={(e) => setIncline(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-lighter rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>
        )}

        <div className="pt-2">
          <div className="bg-background rounded-2xl p-4 mb-4 border border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase">Estimated Burn</p>
                <p className="text-xl font-black text-text-primary">{currentBurn} <span className="text-sm font-normal text-text-secondary">kcal</span></p>
              </div>
            </div>
            <button 
              onClick={handleLogCardio}
              className="px-6 py-3 rounded-xl gradient-neon text-background font-black text-sm shadow-lg shadow-neon-green/20 active:scale-95 transition-transform"
            >
              Log Burn
            </button>
          </div>
        </div>
      </div>

      {/* Today's History */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest px-1">Today's Cardio History</h3>
        
        {todayLogs.length > 0 ? (
          todayLogs.map((log, i) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface rounded-2xl p-4 border border-border/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.exercises[0]?.exercise?.name.includes("Treadmill") ? "bg-neon-blue/10 text-neon-blue" : "bg-neon-purple/10 text-neon-purple"}`}>
                  {log.exercises[0]?.exercise?.name.includes("Treadmill") ? <Activity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{log.exercises[0]?.exercise?.name}</p>
                  <p className="text-[10px] text-text-muted">{formatDuration(log.duration)} • {log.exercises[0]?.notes}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-neon-green">+{log.caloriesBurned} kcal</p>
                <p className="text-[10px] text-text-muted">Logged today</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center bg-surface/30 rounded-3xl border border-dashed border-border/50">
            <Trophy className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-20" />
            <p className="text-xs text-text-muted italic">No cardio logged yet. Let's start burning!</p>
          </div>
        )}
      </div>
    </div>
  );
}
