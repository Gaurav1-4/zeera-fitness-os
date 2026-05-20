"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Plus, Sparkles, Trash2, Filter, Search, ArrowRight, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MuscleGroup } from "@/lib/types";

interface SessionBuilderProps {
  planId: string;
  planName: string;
  initialExercises: any[];
  targetMuscles: MuscleGroup[];
  allExercises: any[];
  onStart: (exercises: any[]) => void;
  onBack: () => void;
}

export default function SessionBuilder({ 
  planName, 
  initialExercises, 
  targetMuscles, 
  allExercises,
  onStart,
  onBack 
}: SessionBuilderProps) {
  const [bucketList, setBucketList] = useState(initialExercises);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMuscleFilter, setActiveMuscleFilter] = useState<MuscleGroup | "all">("all");
  const { user, measurements } = useAppStore();

  // Volume Analysis Logic
  const volumeAnalysis = useMemo(() => {
    const analysis: Record<string, { sets: number; status: "low" | "good" | "optimal" }> = {};
    
    const lastM = measurements[measurements.length - 1];
    const bodyFat = lastM?.bodyFat || 20; // Default to 20% if not available

    targetMuscles.forEach(muscle => {
      const muscleSets = bucketList.reduce((acc, ex) => {
        if (ex.exercise?.muscle === muscle || ex.muscle === muscle) {
          return acc + (ex.sets?.length || 3);
        }
        return acc;
      }, 0);

      // Composition-Responsive Logic:
      // Leaner individuals (<15%) need higher volume to preserve muscle.
      // Higher BF% individuals (>25%) can focus more on metabolic intensity.
      const isMajor = ["chest", "back", "legs"].includes(muscle.toLowerCase());
      const isLean = bodyFat < 15;
      const isHighBF = bodyFat > 25;

      const baseGood = isMajor ? 5 : 3;
      const baseOptimal = isMajor ? 9 : 6;

      const goodThreshold = isLean ? baseGood + 2 : isHighBF ? baseGood - 1 : baseGood;
      const optimalThreshold = isLean ? baseOptimal + 2 : isHighBF ? baseOptimal - 1 : baseOptimal;

      let status: "low" | "good" | "optimal" = "low";
      if (muscleSets >= optimalThreshold) status = "optimal";
      else if (muscleSets >= goodThreshold) status = "good";
      
      analysis[muscle] = { sets: muscleSets, status };
    });

    return analysis;
  }, [bucketList, targetMuscles]);

  // Suggestion Engine
  const suggestions = useMemo(() => {
    const gaps = Object.entries(volumeAnalysis)
      .filter(([_, data]) => data.status === "low")
      .map(([muscle]) => muscle);

    if (gaps.length === 0) return [];

    return allExercises
      .filter(ex => gaps.includes(ex.muscle) && !bucketList.some(b => b.id === ex.id || b.exerciseId === ex.id))
      .slice(0, 3);
  }, [volumeAnalysis, allExercises, bucketList]);

  // Library Filtering Logic
  const filteredLibrary = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = activeMuscleFilter === "all" || ex.muscle === activeMuscleFilter;
      const notInBucket = !bucketList.some(b => b.exerciseId === ex.id || b.id === ex.id);
      return matchesSearch && matchesMuscle && notInBucket;
    }).slice(0, 20); // Performance cap
  }, [allExercises, searchQuery, activeMuscleFilter, bucketList]);

  const handleAddExercise = (ex: any) => {
    const newEx = {
      id: `custom-${Date.now()}`,
      exerciseId: ex.id,
      name: ex.name,
      sets: [
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
      ],
      exercise: ex
    };
    setBucketList([...bucketList, newEx]);
  };

  const handleRemoveExercise = (id: string) => {
    setBucketList(bucketList.filter(ex => ex.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col pt-14 px-4 pb-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-text-muted hover:text-text-primary transition-colors">
          Cancel
        </button>
        <h2 className="text-xl font-display font-black text-text-primary uppercase tracking-tighter">
          Architect: {planName}
        </h2>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Volume Satisfaction Gauges */}
      <div className="bg-surface rounded-3xl p-5 border border-border/50 mb-6">
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-neon-green" /> Volume Satisfaction Audit
        </h3>
        <div className="space-y-4">
          {Object.entries(volumeAnalysis).map(([muscle, data]) => (
            <div key={muscle} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-primary capitalize">{muscle}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  data.status === "optimal" ? "bg-neon-green/10 text-neon-green" :
                  data.status === "good" ? "bg-neon-blue/10 text-neon-blue" : "bg-neon-red/10 text-neon-red"
                }`}>
                  {data.sets} Sets • {data.status === "optimal" ? "Bonus Volume" : data.status === "good" ? "Goal Hit" : "Under Trained"}
                </span>
              </div>
              <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.sets / 10) * 100, 100)}%` }}
                  className={`h-full rounded-full ${
                    data.status === "optimal" ? "bg-neon-green" :
                    data.status === "good" ? "bg-neon-blue" : "bg-neon-red"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bucket List */}
      <div className="flex-1 space-y-4 mb-8">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Today's Bucket List</h3>
          <span className="text-[10px] font-bold text-text-muted">{bucketList.length} Exercises</span>
        </div>
        
        <div className="space-y-2">
          {bucketList.map((ex, i) => (
            <motion.div 
              key={ex.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface rounded-2xl p-4 border border-border/30 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img
                    src={ex.exercise?.imageUrl || ex.exercise?.media?.[0]?.thumbnailUrl || ex.exercise?.media?.[0]?.url || ex.imageUrl || ex.media?.[0]?.thumbnailUrl || '/placeholder-exercise.svg'}
                    alt={ex.name || ex.exercise?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">{ex.name || ex.exercise?.name}</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    {ex.exercise?.muscle || ex.muscle} • {ex.sets?.length || 3} Sets
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveExercise(ex.id)}
                className="w-8 h-8 rounded-lg bg-neon-red/10 text-neon-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}

          {bucketList.length === 0 && (
            <div className="py-10 text-center bg-surface/30 rounded-3xl border border-dashed border-border/50">
              <p className="text-xs text-text-muted italic">Your bucket list is empty. Add exercises to start!</p>
            </div>
          )}
        </div>
      </div>

      {/* Library Explorer (The "Manual Add" Section) */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Library Explorer</h3>
          <Filter className="w-4 h-4 text-text-muted" />
        </div>

        {/* Search & Muscle Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border/50 rounded-xl text-sm text-text-primary focus:border-neon-blue outline-none transition-colors"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["all", ...targetMuscles].map(m => (
              <button
                key={m}
                onClick={() => setActiveMuscleFilter(m as any)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  activeMuscleFilter === m ? "bg-neon-blue text-background" : "bg-surface text-text-muted border border-border/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Exercise List */}
        <div className="space-y-2">
          {filteredLibrary.map(ex => (
            <button
              key={ex.id}
              onClick={() => handleAddExercise(ex)}
              className="w-full bg-surface/50 rounded-xl p-3 border border-border/30 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img
                    src={ex.imageUrl || ex.media?.[0]?.thumbnailUrl || ex.media?.[0]?.url || ex.exercise?.imageUrl || '/placeholder-exercise.svg'}
                    alt={ex.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-text-primary">{ex.name}</p>
                  <p className="text-[9px] text-text-muted uppercase font-black">{ex.muscle} • {ex.equipment}</p>
                </div>
              </div>
            </button>
          ))}
          
          {filteredLibrary.length === 0 && searchQuery && (
            <p className="text-center py-4 text-[10px] text-text-muted italic">No matching exercises found.</p>
          )}
        </div>
      </div>

      {/* Suggestion Engine UI */}
      {suggestions.length > 0 && !searchQuery && (
        <div className="mb-6 bg-neon-blue/5 rounded-3xl p-5 border border-neon-blue/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-neon-blue" />
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Agent Recommendations</h3>
          </div>
          <div className="space-y-2">
            {suggestions.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex)}
                className="w-full bg-surface rounded-xl p-3 border border-border/50 flex items-center justify-between group hover:border-neon-blue/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neon-blue/10 text-neon-blue flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-text-primary">{ex.name}</p>
                    <p className="text-[9px] text-text-muted uppercase font-black">Fill {ex.muscle} Volume Gap</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-neon-blue transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="sticky bottom-0 bg-background pt-4">
        <button
          onClick={() => onStart(bucketList)}
          disabled={bucketList.length === 0}
          className="w-full py-4 rounded-2xl gradient-neon text-background font-black text-sm shadow-xl shadow-neon-green/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Zap className="w-5 h-5" /> Initialize Training Session
        </button>
      </div>
    </div>
  );
}
