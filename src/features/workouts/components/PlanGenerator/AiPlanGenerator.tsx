
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Dumbbell, 
  Zap, 
  ChevronLeft, 
  Plus, 
  X, 
  Target, 
  Flame, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Trophy
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { 
  calculateTDEE, 
  calculateDailyTarget, 
  FitnessGoal 
} from "@/lib/fitness-logic";

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
}

export default function AiPlanGenerator({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { user, startWorkout } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Setup, 2: Select Exercises, 3: Generating/Result
  const [loading, setLoading] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [goal, setGoal] = useState<FitnessGoal>(
    user.goal === "lose" ? "LOSE_FAT" : 
    user.goal === "gain" ? "BUILD_MUSCLE" : "MAINTAIN"
  );
  const [cardioType, setCardioType] = useState("Treadmill");
  
  // Calculate Initial Target from Profile
  const initialTarget = calculateDailyTarget({
    weight: user.weight || 75,
    height: user.height || 175,
    age: user.age || 25,
    gender: (user.gender as any).toUpperCase(),
    activityLevel: (user.activityLevel as any).toUpperCase(),
    goal: goal
  });

  const [calorieTarget, setCalorieTarget] = useState(Math.round(initialTarget * 0.15)); // Target 15% of TDEE in workout
  const [strengthTarget, setStrengthTarget] = useState("Balanced");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Re-calculate when goal changes
  useEffect(() => {
    const newTarget = calculateDailyTarget({
      weight: user.weight || 75,
      height: user.height || 175,
      age: user.age || 25,
      gender: (user.gender as any).toUpperCase(),
      activityLevel: (user.activityLevel as any).toUpperCase(),
      goal: goal
    });
    // For workout burn, we usually target 15-20% of total daily burn
    setCalorieTarget(Math.round(newTarget * 0.15));
  }, [goal, user]);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const res = await fetch("/api/exercises?limit=100");
        const data = await res.json();
        if (data.items) {
          setAllExercises(data.items.map((e: any) => ({
            id: e.id,
            name: e.name,
            muscle: e.bodyPart,
            equipment: e.equipment
          })));
        }
      } catch (err) {
        console.error("Failed to fetch exercises:", err);
      }
    }
    fetchExercises();
  }, []);

  const handleGenerate = async () => {
    setStep(3);
    setLoading(true);
    try {
      const res = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedExerciseIds,
          cardioType,
          goal,
          experience: user.experience,
          userWeight: user.weight,
          calorieTarget,
          strengthTarget
        })
      });
      const data = await res.json();
      setGeneratedPlan(data);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = allExercises.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExercise = (id: string) => {
    setSelectedExerciseIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-border/50">
        <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-blue" />
          <h2 className="text-lg font-display font-bold">AI Plan Generator</h2>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 space-y-8"
          >
            <div>
              <h3 className="text-xl font-bold mb-2">Define Your Goal</h3>
              <p className="text-text-secondary text-sm mb-6">Zeera AI will calculate optimal volume based on your target.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "LOSE_FAT", label: "Fat Loss", color: "text-neon-orange" },
                  { id: "BUILD_MUSCLE", label: "Muscle Gain", color: "text-neon-blue" },
                  { id: "GAIN_STRENGTH", label: "Pure Strength", color: "text-neon-green" },
                  { id: "MAINTAIN", label: "Maintenance", color: "text-text-primary" }
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id as FitnessGoal)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 ${
                      goal === g.id 
                        ? "bg-surface border-neon-blue text-text-primary shadow-lg" 
                        : "bg-surface border-border/50 text-text-secondary"
                    }`}
                  >
                    <Target className={`w-5 h-5 ${goal === g.id ? g.color : "opacity-70"}`} />
                    <span className="font-bold text-sm">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-neon-orange" /> Cardio Warm-up
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {["Treadmill", "Cycling", "Stairmaster", "Rowing", "Elliptical"].map(c => (
                    <button
                      key={c}
                      onClick={() => setCardioType(c)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                        cardioType === c
                          ? "bg-neon-orange/10 border-neon-orange text-neon-orange"
                          : "bg-surface border-border/50 text-text-secondary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-text-primary block mb-3">
                  Daily Calorie Burn Target: <span className="text-neon-green">{calorieTarget} kcal</span>
                </label>
                <input 
                  type="range" 
                  min="100" 
                  max="1000" 
                  step="50"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
                  className="w-full accent-neon-green bg-surface h-1.5 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl gradient-neon text-background font-black flex items-center justify-center gap-2 shadow-xl shadow-neon-green/20"
            >
              Choose Exercises <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className="p-6 pb-2">
              <h3 className="text-xl font-bold mb-2">Build Your Routine</h3>
              <p className="text-text-secondary text-sm mb-4">Select the exercises you enjoy, and AI will do the math.</p>
              
              <div className="relative mb-4">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search and add exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-border/50 text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>

              {selectedExerciseIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedExerciseIds.map(id => {
                    const ex = allExercises.find(e => e.id === id);
                    return (
                      <div key={id} className="bg-neon-blue/10 border border-neon-blue/30 text-neon-blue px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        {ex?.name}
                        <button onClick={() => toggleExercise(id)}><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-2">
              {filteredExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                    selectedExerciseIds.includes(ex.id)
                      ? "bg-neon-blue/5 border-neon-blue/50"
                      : "bg-surface border-border/30"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-text-primary">{ex.name}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase">{ex.muscle} • {ex.equipment}</p>
                  </div>
                  {selectedExerciseIds.includes(ex.id) ? (
                    <div className="bg-neon-blue text-white p-1 rounded-full"><Plus className="w-3 h-3 rotate-45" /></div>
                  ) : (
                    <div className="bg-surface-lighter text-text-muted p-1 rounded-full"><Plus className="w-3 h-3" /></div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 bg-background/80 backdrop-blur-md sticky bottom-0 border-t border-border/50">
              <button
                disabled={selectedExerciseIds.length === 0}
                onClick={handleGenerate}
                className="w-full py-4 rounded-2xl bg-neon-blue text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-neon-blue/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" /> Analyze & Generate Plan
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <div className="p-6">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-neon-blue animate-spin" />
                  <Sparkles className="w-6 h-6 text-neon-green absolute top-0 right-0 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Zeera AI is Thinking...</h3>
                  <p className="text-text-secondary text-sm max-w-[240px]">Analyzing bio-mechanics and calculating optimal volume for your targets.</p>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="bg-neon-blue h-full"
                  />
                </div>
              </div>
            ) : generatedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 bg-neon-green/10 rounded-2xl mb-4">
                    <Trophy className="w-8 h-8 text-neon-green" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-text-primary">{generatedPlan.planName}</h3>
                  <p className="text-text-secondary text-sm mt-2">{generatedPlan.description}</p>
                </div>

                {/* Analysis Box */}
                <div className="bg-surface-lighter rounded-2xl p-5 border border-border/50 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Target Analysis</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-text-muted text-[10px] font-bold mb-1">TIME</p>
                      <p className="text-text-primary font-black">{generatedPlan.analysis.totalEstimatedTime}m</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <p className="text-text-muted text-[10px] font-bold mb-1">CALORIES</p>
                      <p className="text-neon-orange font-black">~{generatedPlan.analysis.totalEstimatedCalories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-text-muted text-[10px] font-bold mb-1">LOAD</p>
                      <p className="text-neon-blue font-black">{strengthTarget}</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary italic leading-relaxed border-t border-border/50 pt-3">
                    {generatedPlan.analysis.goalAlignment}
                  </p>
                </div>

                {/* Warmup */}
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-neon-orange" /> Warm-up Cardio
                  </h4>
                  <div className="bg-surface rounded-2xl p-4 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-text-primary">{generatedPlan.warmup.exercise}</p>
                      <p className="text-xs text-text-secondary">{generatedPlan.warmup.intensity} Intensity</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-neon-orange">{generatedPlan.warmup.durationMinutes}m</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase">Duration</p>
                    </div>
                  </div>
                </div>

                {/* Exercises */}
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-neon-blue" /> Strength Block
                  </h4>
                  {generatedPlan.exercises.map((ex: any, idx: number) => (
                    <div key={idx} className="bg-surface rounded-2xl p-5 border border-border/50 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-text-primary font-bold">{ex.name}</p>
                          <p className="text-[10px] font-bold text-neon-blue uppercase tracking-wider">{ex.sets} Sets • {ex.reps} Reps</p>
                        </div>
                        <div className="bg-surface-lighter px-2 py-1 rounded text-[10px] font-bold text-text-muted">
                          {ex.restSeconds}s Rest
                        </div>
                      </div>
                      <div className="bg-neon-green/5 p-3 rounded-xl border border-neon-green/10">
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          <span className="text-neon-green font-bold">AI TIP:</span> {ex.coachingTips}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      // Adapt generated plan to the active workout format
                      const exercises = generatedPlan.exercises.map((ex: any) => ({
                        id: ex.exerciseId,
                        name: ex.name,
                        sets: Array.from({ length: ex.sets }).map(() => ({ reps: 0, weight: 0, completed: false })),
                        notes: ex.coachingTips
                      }));
                      startWorkout(Math.random().toString(), generatedPlan.planName, exercises);
                      router.push('/session');
                    }}
                    className="w-full py-4 rounded-2xl gradient-neon text-background font-black flex items-center justify-center gap-2 shadow-xl shadow-neon-green/30"
                  >
                    <Zap className="w-5 h-5" /> Start This Session
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-4 rounded-2xl bg-surface text-text-secondary font-bold text-sm"
                  >
                    Try Another Selection
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
