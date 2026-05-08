"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, Scale, Dumbbell, Calendar, Plus, ChevronDown, ChevronUp, Flame, Target } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatDuration } from "@/lib/utils";

export default function ProgressScreen() {
  const { measurements, workoutLogs, streak, addMeasurement } = useAppStore();
  const [tab, setTab] = useState<"weight" | "workouts" | "body">("weight");
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [newWaist, setNewWaist] = useState("");
  const [newChest, setNewChest] = useState("");
  const [newArms, setNewArms] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const weightData = measurements.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    weight: m.weight,
    bodyFat: m.bodyFat,
  }));

  const latestMeasurement = measurements[measurements.length - 1];
  const firstMeasurement = measurements[0];
  const weightChange = latestMeasurement && firstMeasurement ? latestMeasurement.weight - firstMeasurement.weight : 0;

  // Generate real weekly workout data
  const getWeeklyWorkouts = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return days.map((day, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const count = workoutLogs.filter((l) => l.date === dateStr).length;
      const isFuture = date > today;
      return { day, count, isFuture, dateStr };
    });
  };

  const weeklyWorkouts = getWeeklyWorkouts();
  const weeklyTotal = weeklyWorkouts.reduce((s, d) => s + d.count, 0);

  const handleAddMeasurement = () => {
    if (!newWeight) return;
    addMeasurement({
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(newWeight),
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : undefined,
      waist: newWaist ? parseFloat(newWaist) : undefined,
      chest: newChest ? parseFloat(newChest) : undefined,
      arms: newArms ? parseFloat(newArms) : undefined,
    });
    setNewWeight("");
    setNewBodyFat("");
    setNewWaist("");
    setNewChest("");
    setNewArms("");
    setShowAddMeasurement(false);
  };

  // Volume trend data
  const volumeData = workoutLogs
    .slice(0, 10)
    .reverse()
    .map((l) => ({
      date: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      volume: l.totalVolume,
    }));

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-display font-bold text-text-primary">Progress</h1>
        <button
          onClick={() => setShowAddMeasurement(true)}
          className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-background" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface rounded-2xl p-3.5 border border-border/50 text-center">
          <Scale className="w-5 h-5 text-neon-blue mx-auto mb-1.5" />
          <p className="text-xl font-display font-bold text-text-primary">{latestMeasurement?.weight || "--"}</p>
          <p className="text-text-muted text-[10px]">Current (kg)</p>
        </div>
        <div className="bg-surface rounded-2xl p-3.5 border border-border/50 text-center">
          <TrendingDown className="w-5 h-5 text-neon-green mx-auto mb-1.5" />
          <p className={`text-xl font-display font-bold ${weightChange <= 0 ? "text-neon-green" : "text-neon-red"}`}>
            {weightChange <= 0 ? "" : "+"}{weightChange.toFixed(1)}
          </p>
          <p className="text-text-muted text-[10px]">Change (kg)</p>
        </div>
        <div className="bg-surface rounded-2xl p-3.5 border border-border/50 text-center">
          <Calendar className="w-5 h-5 text-neon-orange mx-auto mb-1.5" />
          <p className="text-xl font-display font-bold text-text-primary">{streak}</p>
          <p className="text-text-muted text-[10px]">Day Streak</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-surface rounded-xl p-1 mb-5">
        {(["weight", "workouts", "body"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
              tab === v ? "bg-surface-lighter text-text-primary" : "text-text-secondary"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Weight Chart */}
      {tab === "weight" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-surface rounded-2xl border border-border/50 p-4 mb-4">
            <h3 className="text-text-primary font-semibold text-sm mb-4">Weight Trend</h3>
            {weightData.length > 1 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00f5a0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#55556a", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#55556a", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a25", border: "1px solid #2a2a3a", borderRadius: "8px", fontSize: 12 }}
                      labelStyle={{ color: "#8888a0" }}
                      itemStyle={{ color: "#00f5a0" }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="#00f5a0" strokeWidth={2} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-center">
                <div>
                  <Scale className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-text-secondary text-sm">Log at least 2 weigh-ins to see your trend</p>
                </div>
              </div>
            )}
          </div>

          {weightData.some((d) => d.bodyFat) && (
            <div className="bg-surface rounded-2xl border border-border/50 p-4">
              <h3 className="text-text-primary font-semibold text-sm mb-4">Body Fat %</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData.filter((d) => d.bodyFat)}>
                    <defs>
                      <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#55556a", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#55556a", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a25", border: "1px solid #2a2a3a", borderRadius: "8px", fontSize: 12 }} />
                    <Area type="monotone" dataKey="bodyFat" stroke="#00d9ff" strokeWidth={2} fill="url(#colorFat)" name="Body Fat %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Workout History */}
      {tab === "workouts" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Weekly Calendar */}
          <div className="bg-surface rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-text-primary font-semibold text-sm">This Week</h3>
              <span className="text-neon-green text-xs font-semibold">{weeklyTotal}/7 days</span>
            </div>
            <div className="flex justify-between">
              {weeklyWorkouts.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    d.count > 0 ? "gradient-neon" : d.isFuture ? "bg-surface-lighter/50" : "bg-surface-lighter"
                  }`}>
                    {d.count > 0 ? <Dumbbell className="w-4 h-4 text-background" /> : <span className="w-2 h-2 rounded-full bg-border" />}
                  </div>
                  <span className={`text-[10px] font-medium ${d.count > 0 ? "text-neon-green" : "text-text-muted"}`}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Trend */}
          {volumeData.length > 2 && (
            <div className="bg-surface rounded-2xl border border-border/50 p-4">
              <h3 className="text-text-primary font-semibold text-sm mb-3">Volume Trend</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b84dff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#b84dff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#55556a", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a25", border: "1px solid #2a2a3a", borderRadius: "8px", fontSize: 12 }} />
                    <Area type="monotone" dataKey="volume" stroke="#b84dff" strokeWidth={2} fill="url(#colorVolume)" name="Volume (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Workouts — Expandable */}
          <div className="space-y-2">
            <h3 className="text-text-primary font-semibold text-sm">Recent Workouts</h3>
            {workoutLogs.length === 0 ? (
              <div className="bg-surface rounded-xl p-6 text-center border border-border/50">
                <Dumbbell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-secondary text-sm">No workouts logged yet</p>
                <p className="text-text-muted text-xs">Complete a workout to see it here</p>
              </div>
            ) : (
              workoutLogs.slice(0, 20).map((log) => (
                <motion.div
                  key={log.id}
                  className="bg-surface rounded-xl border border-border/50 overflow-hidden"
                  layout
                >
                  <button
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left"
                  >
                    <div>
                      <p className="text-text-primary text-sm font-medium">{log.workoutName}</p>
                      <p className="text-text-muted text-xs">{new Date(log.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-neon-green text-xs font-semibold">{Math.round(log.duration / 60)} min</p>
                        <p className="text-text-muted text-[10px]">{log.totalVolume.toLocaleString()} kg</p>
                      </div>
                      {expandedLog === log.id ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedLog === log.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5 space-y-2 border-t border-border/20 pt-3">
                          {log.exercises.map((ex: any, i: number) => {
                            const completedSets = ex.sets.filter((s: any) => s.completed);
                            const maxWeight = Math.max(...completedSets.map((s: any) => s.weight || 0), 0);
                            return (
                              <div key={i} className="flex items-center justify-between py-1.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-text-primary text-xs font-medium truncate">{ex.exercise?.name || "Exercise"}</p>
                                  <p className="text-text-muted text-[10px]">{completedSets.length}/{ex.sets.length} sets</p>
                                </div>
                                {maxWeight > 0 && (
                                  <span className="text-neon-blue text-xs font-semibold">{maxWeight} kg</span>
                                )}
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-between pt-2 border-t border-border/20">
                            <span className="text-text-muted text-[10px]">
                              <Flame className="w-3 h-3 inline mr-1" />{log.caloriesBurned} kcal
                            </span>
                            {log.syncStatus && (
                              <span className={`text-[10px] font-medium ${
                                log.syncStatus === "synced" ? "text-neon-green" :
                                log.syncStatus === "pending" ? "text-neon-orange" : "text-neon-red"
                              }`}>
                                {log.syncStatus === "synced" ? "✓ Synced" : log.syncStatus === "pending" ? "⏳ Pending" : "✗ Failed"}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Body Measurements */}
      {tab === "body" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {measurements.length === 0 ? (
            <div className="bg-surface rounded-xl p-6 text-center border border-border/50">
              <Target className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-text-secondary text-sm">No measurements yet</p>
              <p className="text-text-muted text-xs mb-3">Tap + to log your first weigh-in</p>
              <button onClick={() => setShowAddMeasurement(true)} className="px-4 py-2 rounded-lg gradient-neon text-background text-sm font-semibold">
                Add Measurement
              </button>
            </div>
          ) : (
            [...measurements].reverse().map((m, i) => (
              <div key={i} className="bg-surface rounded-xl p-3.5 border border-border/50">
                <p className="text-text-muted text-xs mb-2">{new Date(m.date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-text-primary text-sm font-semibold">{m.weight} kg</p><p className="text-text-muted text-[10px]">Weight</p></div>
                  {m.bodyFat && <div><p className="text-text-primary text-sm font-semibold">{m.bodyFat}%</p><p className="text-text-muted text-[10px]">Body Fat</p></div>}
                  {m.waist && <div><p className="text-text-primary text-sm font-semibold">{m.waist}&quot;</p><p className="text-text-muted text-[10px]">Waist</p></div>}
                  {m.chest && <div><p className="text-text-primary text-sm font-semibold">{m.chest}&quot;</p><p className="text-text-muted text-[10px]">Chest</p></div>}
                  {m.arms && <div><p className="text-text-primary text-sm font-semibold">{m.arms}&quot;</p><p className="text-text-muted text-[10px]">Arms</p></div>}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Add Measurement Modal — Full Body */}
      <AnimatePresence>
        {showAddMeasurement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end"
            onClick={() => setShowAddMeasurement(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface w-full rounded-t-3xl p-5"
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
              <h2 className="text-lg font-display font-bold text-text-primary mb-4">Log Measurements</h2>
              
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-text-secondary text-xs mb-1 block">Weight (kg) *</label>
                  <input
                    type="number" inputMode="decimal" value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)} placeholder="e.g., 74.5" autoFocus
                    className="w-full py-3 px-4 bg-surface-light rounded-xl text-text-primary text-lg font-bold placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Body Fat %</label>
                    <input type="number" inputMode="decimal" value={newBodyFat} onChange={(e) => setNewBodyFat(e.target.value)} placeholder="18"
                      className="w-full py-2.5 px-3 bg-surface-light rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50" />
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Waist (inches)</label>
                    <input type="number" inputMode="decimal" value={newWaist} onChange={(e) => setNewWaist(e.target.value)} placeholder="34"
                      className="w-full py-2.5 px-3 bg-surface-light rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50" />
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Chest (inches)</label>
                    <input type="number" inputMode="decimal" value={newChest} onChange={(e) => setNewChest(e.target.value)} placeholder="40"
                      className="w-full py-2.5 px-3 bg-surface-light rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50" />
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Arms (inches)</label>
                    <input type="number" inputMode="decimal" value={newArms} onChange={(e) => setNewArms(e.target.value)} placeholder="14"
                      className="w-full py-2.5 px-3 bg-surface-light rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddMeasurement}
                disabled={!newWeight}
                className="w-full py-3.5 rounded-xl gradient-neon text-background font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                Save Measurement
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
