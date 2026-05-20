"use client";

import { motion } from "framer-motion";
import { Flame, Droplets, Plus, Minus, ChevronRight, Zap, Trophy, Brain, Target, Footprints, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getGreeting } from "@/lib/utils";
import { workoutPlans } from "@/features/workouts/data/workouts";
import ProgressRing from "@/components/ui/ProgressRing";
import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const { user, streak, meals, waterIntake, setWaterIntake, startWorkout, insights, markInsightRead, workoutLogs } = useAppStore();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((m) => m.date === today);
  const caloriesConsumed = todayMeals.reduce((s, m) => s + m.foodItem.calories * m.quantity, 0);
  const proteinConsumed = todayMeals.reduce((s, m) => s + m.foodItem.protein * m.quantity, 0);
  const calPercent = Math.min((caloriesConsumed / user.calorieTarget) * 100, 100);
  const proPercent = Math.min((proteinConsumed / user.proteinTarget) * 100, 100);
  const dayOfWeek = new Date().getDay();
  const todayWorkout = workoutPlans[dayOfWeek % workoutPlans.length];
  const unreadInsights = insights.filter((i) => !i.read);
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  const handleStartWorkout = () => {
    startWorkout(todayWorkout.id, todayWorkout.name, todayWorkout.exercises);
    router.push("/session");
  };

  // Compute today's workout completion
  const todayWorkoutLog = workoutLogs.find((l) => l.date === today);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="px-4 pt-14 pb-4">
      {/* Header */}
      <motion.div variants={item} className="mb-6">
        <p className="text-text-secondary text-sm">{getGreeting()}</p>
        <h1 className="text-2xl font-display font-bold text-text-primary">{user.name} 👋</h1>
      </motion.div>

      {/* Streak Banner */}
      <motion.div variants={item} className="mb-5 rounded-2xl gradient-neon p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-black/70 text-xs font-medium">Current Streak</p>
            <p className="text-black text-2xl font-display font-bold">{streak} Days</p>
          </div>
        </div>
        <div className="text-right">
          <Trophy className="w-8 h-8 text-black/30" />
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-5">
        {/* Calories Card */}
        <div className="bg-surface rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-xs font-medium">Calories</span>
            <Zap className="w-4 h-4 text-neon-orange" />
          </div>
          <ProgressRing progress={calPercent} size={72} strokeWidth={6} color="#ffa726" className="mx-auto mb-2">
            <span className="text-sm font-bold text-text-primary">{Math.round(calPercent)}%</span>
          </ProgressRing>
          <p className="text-center text-xs text-text-secondary">
            <span className="text-text-primary font-semibold">{caloriesConsumed}</span> / {user.calorieTarget}
          </p>
        </div>

        {/* Protein Card */}
        <div className="bg-surface rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-xs font-medium">Protein</span>
            <Target className="w-4 h-4 text-neon-blue" />
          </div>
          <ProgressRing progress={proPercent} size={72} strokeWidth={6} color="#00d9ff" className="mx-auto mb-2">
            <span className="text-sm font-bold text-text-primary">{Math.round(proPercent)}%</span>
          </ProgressRing>
          <p className="text-center text-xs text-text-secondary">
            <span className="text-text-primary font-semibold">{proteinConsumed}g</span> / {user.proteinTarget}g
          </p>
        </div>
      </motion.div>

      {/* Water Intake */}
      <motion.div variants={item} className="bg-surface rounded-2xl p-4 border border-border/50 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-neon-blue" />
            <span className="text-text-secondary text-sm font-medium">Water Intake</span>
          </div>
          <span className="text-text-primary text-sm font-semibold">{waterIntake}/{user.waterTarget} glasses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-surface-lighter rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-neon-blue"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((waterIntake / user.waterTarget) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
              className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center active:scale-95 transition-transform"
            >
              <Minus className="w-3.5 h-3.5 text-text-secondary" />
            </button>
            <button
              onClick={() => setWaterIntake(waterIntake + 1)}
              className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 text-background" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Today's Workout */}
      <motion.div variants={item} className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-text-primary">Today&apos;s Workout</h2>
          <button onClick={() => router.push("/workout")} className="text-accent-light text-sm flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-surface rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-text-primary font-semibold text-lg">{todayWorkout.name}</h3>
                <p className="text-text-secondary text-sm">{todayWorkout.description}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted text-xs">{todayWorkout.exercises.length} exercises</p>
                <p className="text-text-muted text-xs">~{todayWorkout.estimatedDuration} min</p>
              </div>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {todayWorkout.targetMuscles.map((m: string) => (
                <span key={m} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-medium capitalize">
                  {m}
                </span>
              ))}
            </div>
            {todayWorkoutLog ? (
              <div className="w-full py-3.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green font-semibold text-base flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Completed Today
              </div>
            ) : (
              <button
                onClick={handleStartWorkout}
                className="w-full py-3.5 rounded-xl gradient-neon text-background font-semibold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" /> Start Workout
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      {unreadInsights.length > 0 && (
        <motion.div variants={item} className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
              <Brain className="w-5 h-5 text-neon-purple" /> AI Insights
            </h2>
            <span className="w-5 h-5 rounded-full bg-neon-purple text-white text-xs flex items-center justify-center font-bold">
              {unreadInsights.length}
            </span>
          </div>
          <div className="space-y-2">
            {unreadInsights.slice(0, 3).map((insight) => (
              <motion.div
                key={insight.id}
                className={`bg-surface rounded-xl p-3.5 border ${
                  insight.priority === "high" ? "border-neon-red/30" : "border-border/50"
                }`}
                whileTap={{ scale: 0.98 }}
                onClick={() => markInsightRead(insight.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{insight.icon}</span>
                  <p className="text-text-secondary text-sm leading-relaxed flex-1">{insight.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div variants={item}>
        <h2 className="text-lg font-display font-bold text-text-primary mb-3">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4 border border-border/50">
            <Footprints className="w-5 h-5 text-neon-green mb-2" />
            <p className="text-2xl font-display font-bold text-text-primary">
              {workoutLogs.filter((l) => {
                const d = new Date(l.date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-text-secondary text-xs">Workouts This Month</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border/50">
            <Trophy className="w-5 h-5 text-neon-orange mb-2" />
            <p className="text-2xl font-display font-bold text-text-primary">
              {workoutLogs.reduce((s, l) => s + l.totalVolume, 0).toLocaleString()}
            </p>
            <p className="text-text-secondary text-xs">Total Volume (kg)</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
