"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Dumbbell,
  Flame,
  Droplets,
  ChevronRight,
  ChevronLeft,
  Clock,
  Target,
  Zap,
  Trophy,
  Utensils,
  Scale,
  X,
  Check,
  TrendingUp,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { MealEntry, WorkoutLog, BodyMeasurement } from "@/lib/types";

// ─── Helpers ───────────────────────────────────────────
function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  items.forEach((item) => {
    const d = item.date.split("T")[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(item);
  });
  return grouped;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - d.getTime();
  const dayMs = 86400000;
  if (diff < dayMs && diff >= 0) return "Today";
  if (diff < dayMs * 2 && diff >= dayMs) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

interface DayData {
  date: string;
  workouts: WorkoutLog[];
  meals: MealEntry[];
  measurement: BodyMeasurement | null;
  totalCaloriesConsumed: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCaloriesBurned: number;
  totalVolume: number;
  totalDuration: number;
}

// ─── Main Component ────────────────────────────────────
export default function HistoryPage() {
  const { workoutLogs, meals, measurements, user } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build a unified timeline grouped by date
  const dayMap = useMemo(() => {
    const allDates = new Set<string>();
    workoutLogs.forEach((l) => allDates.add(l.date.split("T")[0]));
    meals.forEach((m) => allDates.add(m.date.split("T")[0]));
    measurements.forEach((m) => allDates.add(m.date.split("T")[0]));

    const mealsByDate = groupByDate(meals);
    const workoutsByDate = groupByDate(workoutLogs);
    const measByDate: Record<string, BodyMeasurement> = {};
    measurements.forEach((m) => { measByDate[m.date.split("T")[0]] = m; });

    const result: Record<string, DayData> = {};
    allDates.forEach((date) => {
      const dayMeals = mealsByDate[date] || [];
      const dayWorkouts = workoutsByDate[date] || [];
      const dayMeas = measByDate[date] || null;

      result[date] = {
        date,
        workouts: dayWorkouts,
        meals: dayMeals,
        measurement: dayMeas,
        totalCaloriesConsumed: dayMeals.reduce((s, m) => s + (m.foodItem?.calories || 0) * (m.quantity || 1), 0),
        totalProtein: dayMeals.reduce((s, m) => s + (m.foodItem?.protein || 0) * (m.quantity || 1), 0),
        totalCarbs: dayMeals.reduce((s, m) => s + (m.foodItem?.carbs || 0) * (m.quantity || 1), 0),
        totalFats: dayMeals.reduce((s, m) => s + (m.foodItem?.fats || 0) * (m.quantity || 1), 0),
        totalCaloriesBurned: dayWorkouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0),
        totalVolume: dayWorkouts.reduce((s, w) => s + (w.totalVolume || 0), 0),
        totalDuration: dayWorkouts.reduce((s, w) => s + (w.duration || 0), 0),
      };
    });
    return result;
  }, [workoutLogs, meals, measurements]);

  const sortedDates = useMemo(
    () => Object.keys(dayMap).sort((a, b) => b.localeCompare(a)),
    [dayMap]
  );

  const selectedDayData = selectedDay ? dayMap[selectedDay] : null;

  const isEmpty = sortedDates.length === 0;

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="px-4 pt-14 pb-4 min-h-dvh">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-1">History</h1>
        <p className="text-text-secondary text-sm mb-5">Your complete daily journal</p>
      </motion.div>

      {isEmpty ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="w-12 h-12 text-text-muted mb-4 opacity-30" />
          <p className="text-text-muted text-sm">No history yet. Start a workout or log a meal to see your daily records here.</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
          {sortedDates.map((date) => {
            const day = dayMap[date];
            const hasWorkout = day.workouts.length > 0;
            const hasMeals = day.meals.length > 0;
            const hasMeasurement = !!day.measurement;

            return (
              <motion.button
                key={date}
                variants={item}
                onClick={() => setSelectedDay(date)}
                className="w-full bg-surface rounded-2xl p-4 border border-border/50 text-left active:scale-[0.98] transition-transform group hover:border-neon-green/30"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <p className="text-text-primary font-bold text-sm">{formatDateLabel(date)}</p>
                    <p className="text-text-muted text-[10px] font-medium">{formatFullDate(date)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-neon-green transition-colors" />
                </div>

                {/* Quick Badges */}
                <div className="flex flex-wrap gap-2">
                  {hasWorkout && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-green/10 text-neon-green text-[10px] font-bold">
                      <Dumbbell className="w-3 h-3" /> {day.workouts.length} Workout{day.workouts.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {hasMeals && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-orange/10 text-neon-orange text-[10px] font-bold">
                      <Utensils className="w-3 h-3" /> {day.totalCaloriesConsumed} kcal
                    </span>
                  )}
                  {hasMeals && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-bold">
                      <Target className="w-3 h-3" /> {Math.round(day.totalProtein)}g protein
                    </span>
                  )}
                  {hasMeasurement && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-[10px] font-bold">
                      <Scale className="w-3 h-3" /> {day.measurement!.weight}kg
                    </span>
                  )}
                  {hasWorkout && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-red/10 text-neon-red text-[10px] font-bold">
                      <Flame className="w-3 h-3" /> {day.totalCaloriesBurned} burned
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* ─── Day Detail Sheet ─── */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 w-full bg-background rounded-t-3xl max-h-[92dvh] overflow-y-auto"
            >
              {/* Handle + Close */}
              <div className="sticky top-0 bg-background z-10 pt-3 pb-2 px-5">
                <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-display font-bold text-text-primary">
                      {formatDateLabel(selectedDayData.date)}
                    </h2>
                    <p className="text-text-muted text-xs">{formatFullDate(selectedDayData.date)}</p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-2 rounded-lg bg-surface-lighter">
                    <X className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-10 space-y-5">
                {/* ── Daily Summary Cards ── */}
                <div className="grid grid-cols-2 gap-2.5">
                  <SummaryCard icon={<Flame className="w-4 h-4" />} color="neon-orange" label="Consumed" value={`${selectedDayData.totalCaloriesConsumed}`} unit="kcal" />
                  <SummaryCard icon={<Zap className="w-4 h-4" />} color="neon-red" label="Burned" value={`${selectedDayData.totalCaloriesBurned}`} unit="kcal" />
                  <SummaryCard icon={<Target className="w-4 h-4" />} color="neon-blue" label="Protein" value={`${Math.round(selectedDayData.totalProtein)}`} unit={`/ ${user.proteinTarget}g`} />
                  <SummaryCard icon={<Trophy className="w-4 h-4" />} color="neon-green" label="Volume" value={selectedDayData.totalVolume.toLocaleString()} unit="kg" />
                </div>

                {/* ── Macro Breakdown ── */}
                {selectedDayData.meals.length > 0 && (
                  <div className="bg-surface rounded-2xl p-4 border border-border/50">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Macro Split</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <MacroBar label="Protein" value={Math.round(selectedDayData.totalProtein)} target={user.proteinTarget} color="bg-neon-blue" unit="g" />
                      <MacroBar label="Carbs" value={Math.round(selectedDayData.totalCarbs)} target={user.carbsTarget} color="bg-neon-green" unit="g" />
                      <MacroBar label="Fats" value={Math.round(selectedDayData.totalFats)} target={user.fatsTarget} color="bg-neon-orange" unit="g" />
                    </div>
                  </div>
                )}

                {/* ── Workouts Section ── */}
                {selectedDayData.workouts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-neon-green" /> Workouts
                    </h3>
                    <div className="space-y-3">
                      {selectedDayData.workouts.map((wk) => (
                        <WorkoutDetailCard key={wk.id} workout={wk} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Nutrition Section ── */}
                {selectedDayData.meals.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-neon-orange" /> Nutrition Log
                    </h3>
                    <MealsByType meals={selectedDayData.meals} />
                  </div>
                )}

                {/* ── Body Measurement ── */}
                {selectedDayData.measurement && (
                  <div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-neon-purple" /> Body Measurement
                    </h3>
                    <MeasurementCard m={selectedDayData.measurement} />
                  </div>
                )}

                {/* Empty state for a day with nothing */}
                {selectedDayData.workouts.length === 0 && selectedDayData.meals.length === 0 && !selectedDayData.measurement && (
                  <div className="py-12 text-center">
                    <p className="text-text-muted text-sm italic">No detailed data for this day.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-Components ────────────────────────────────────

function SummaryCard({ icon, color, label, value, unit }: { icon: React.ReactNode; color: string; label: string; value: string; unit: string }) {
  return (
    <div className="bg-surface rounded-2xl p-3.5 border border-border/50">
      <div className={`flex items-center gap-1.5 mb-1.5 text-${color}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
      </div>
      <p className="text-xl font-display font-bold text-text-primary">
        {value} <span className="text-xs font-normal text-text-muted">{unit}</span>
      </p>
    </div>
  );
}

function MacroBar({ label, value, target, color, unit }: { label: string; value: number; target: number; color: string; unit: string }) {
  const pct = Math.min((value / Math.max(target, 1)) * 100, 100);
  return (
    <div className="text-center">
      <p className="text-text-muted text-[10px] font-bold mb-1">{label}</p>
      <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-text-primary text-xs font-bold">{value}<span className="text-text-muted font-normal">/{target}{unit}</span></p>
    </div>
  );
}

function WorkoutDetailCard({ workout }: { workout: WorkoutLog }) {
  const [expanded, setExpanded] = useState(false);
  const completedSets = workout.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <div className="bg-surface rounded-2xl border border-border/50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left flex items-center justify-between">
        <div>
          <p className="text-text-primary font-bold text-sm">{workout.workoutName}</p>
          <div className="flex items-center gap-3 mt-1 text-text-muted text-[10px] font-medium">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.round(workout.duration / 60)} min</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {workout.caloriesBurned} kcal</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {completedSets}/{totalSets}</span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2.5 border-t border-border/30 pt-3">
              {workout.exercises.map((ex, i) => {
                const doneSets = ex.sets.filter((s) => s.completed);
                const bestSet = doneSets.reduce((best, s) => (s.weight * s.reps > best.weight * best.reps ? s : best), { weight: 0, reps: 0 } as any);
                return (
                  <div key={i} className="bg-surface-lighter rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-text-primary text-xs font-bold truncate max-w-[200px]">{ex.exercise?.name || "Exercise"}</p>
                      <span className="text-[9px] font-bold text-text-muted uppercase">{ex.exercise?.muscle || ""}</span>
                    </div>
                    {/* Set details */}
                    <div className="flex flex-wrap gap-1.5">
                      {ex.sets.map((set, si) => (
                        <span key={si} className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${set.completed ? "bg-neon-green/10 text-neon-green" : "bg-surface text-text-muted"}`}>
                          {set.weight > 0 ? `${set.weight}kg × ${set.reps}` : set.reps > 0 ? `BW × ${set.reps}` : "—"}
                        </span>
                      ))}
                    </div>
                    {bestSet.weight > 0 && (
                      <p className="text-[9px] text-neon-green mt-1.5 font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Best: {bestSet.weight}kg × {bestSet.reps}
                      </p>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <span className="text-[10px] text-text-muted font-bold">Total Volume</span>
                <span className="text-xs text-text-primary font-bold">{workout.totalVolume.toLocaleString()} kg</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MealsByType({ meals }: { meals: MealEntry[] }) {
  const grouped: Record<string, MealEntry[]> = {};
  meals.forEach((m) => {
    const type = m.mealType || "other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(m);
  });

  const typeLabels: Record<string, string> = {
    breakfast: "🌅 Breakfast", lunch: "☀️ Lunch", dinner: "🌙 Dinner",
    snacks: "🍿 Snacks", "pre-workout": "⚡ Pre-Workout", "post-workout": "💪 Post-Workout", other: "🍽️ Other",
  };
  const typeOrder = ["breakfast", "pre-workout", "lunch", "snacks", "post-workout", "dinner", "other"];

  return (
    <div className="space-y-3">
      {typeOrder.filter((t) => grouped[t]).map((type) => {
        const typeMeals = grouped[type];
        const typeCals = typeMeals.reduce((s, m) => s + (m.foodItem?.calories || 0) * (m.quantity || 1), 0);
        const typePro = typeMeals.reduce((s, m) => s + (m.foodItem?.protein || 0) * (m.quantity || 1), 0);

        return (
          <div key={type} className="bg-surface rounded-2xl border border-border/50 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-primary">{typeLabels[type] || type}</span>
              <span className="text-[10px] font-bold text-text-muted">{typeCals} kcal • {Math.round(typePro)}g P</span>
            </div>
            <div className="space-y-1.5">
              {typeMeals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-xs font-medium truncate">{meal.foodItem?.name || "Food Item"}</p>
                    <p className="text-text-muted text-[9px]">{meal.quantity || 1} × {meal.foodItem?.servingSize || ""}{meal.foodItem?.servingUnit || ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-text-primary text-[10px] font-bold">{(meal.foodItem?.calories || 0) * (meal.quantity || 1)} kcal</p>
                    <p className="text-neon-blue text-[9px] font-bold">{Math.round((meal.foodItem?.protein || 0) * (meal.quantity || 1))}g P</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MeasurementCard({ m }: { m: BodyMeasurement }) {
  const fields = [
    { label: "Weight", value: m.weight, unit: "kg", icon: <Scale className="w-3.5 h-3.5" /> },
    m.bodyFat ? { label: "Body Fat", value: m.bodyFat, unit: "%", icon: <TrendingUp className="w-3.5 h-3.5" /> } : null,
    m.waist ? { label: "Waist", value: m.waist, unit: "cm", icon: <Target className="w-3.5 h-3.5" /> } : null,
    m.chest ? { label: "Chest", value: m.chest, unit: "cm", icon: <Target className="w-3.5 h-3.5" /> } : null,
    m.arms ? { label: "Arms", value: m.arms, unit: "cm", icon: <Target className="w-3.5 h-3.5" /> } : null,
  ].filter(Boolean) as { label: string; value: number; unit: string; icon: React.ReactNode }[];

  return (
    <div className="bg-surface rounded-2xl border border-border/50 p-4">
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/10 text-neon-purple flex items-center justify-center">{f.icon}</div>
            <div>
              <p className="text-text-muted text-[9px] font-bold uppercase">{f.label}</p>
              <p className="text-text-primary text-sm font-bold">{f.value}<span className="text-text-muted text-xs font-normal ml-0.5">{f.unit}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
