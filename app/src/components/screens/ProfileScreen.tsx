"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Target, Ruler, Settings, ChevronRight, LogOut, Award, Calendar, Flame, Edit3, Save, X, Download, Shield, Bug, CheckCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { calculateCalories, calculateMacros } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileScreen() {
  const { user, setUser, streak, workoutLogs, meals, measurements, setOnboarded, isSuperAdmin, reportedBugs, resolveBug, clearBugs } = useAppStore();
  const [editMode, setEditMode] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  // Edit state
  const [editName, setEditName] = useState(user.name);
  const [editAge, setEditAge] = useState(String(user.age));
  const [editHeight, setEditHeight] = useState(String(user.height));
  const [editWeight, setEditWeight] = useState(String(user.weight));
  const [editGoal, setEditGoal] = useState(user.goal);
  const [editActivity, setEditActivity] = useState(user.activityLevel);
  const [editDietType, setEditDietType] = useState(user.dietType);

  const stats = [
    { icon: Flame, label: "Streak", value: `${streak} days`, color: "text-neon-orange" },
    { icon: Calendar, label: "Workouts", value: `${workoutLogs.length}`, color: "text-neon-blue" },
    { icon: Award, label: "Level", value: user.experience, color: "text-neon-purple" },
  ];

  const handleSaveProfile = () => {
    const newWeight = parseFloat(editWeight) || user.weight;
    const newHeight = parseFloat(editHeight) || user.height;
    const newAge = parseInt(editAge) || user.age;
    const cals = calculateCalories(newWeight, newHeight, newAge, user.gender, editActivity as any, editGoal as any);
    const { protein, carbs, fats } = calculateMacros(cals, newWeight, editDietType as any, editGoal as any);

    setUser({
      name: editName || user.name,
      age: newAge,
      height: newHeight,
      weight: newWeight,
      goal: editGoal as any,
      activityLevel: editActivity as any,
      dietType: editDietType as any,
      calorieTarget: cals,
      proteinTarget: protein,
      carbsTarget: carbs,
      fatsTarget: fats,
    });
    setEditMode(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    
    // Clear admin state on logout
    useAppStore.getState().setIsSuperAdmin(false);
    
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      workoutLogs,
      meals: meals.slice(0, 100),
      measurements,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zeera-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const profileItems = [
    { label: "Age", value: editMode ? editAge : `${user.age} years`, key: "age", editable: true },
    { label: "Height", value: editMode ? editHeight : `${user.height} cm`, key: "height", editable: true },
    { label: "Weight", value: editMode ? editWeight : `${user.weight} kg`, key: "weight", editable: true },
    { label: "Diet", value: user.dietType === "veg" ? "Vegetarian" : user.dietType === "veg+egg" ? "Veg + Egg" : "Non-Veg", key: "diet", editable: false },
    { label: "Goal", value: user.goal === "lose" ? "Fat Loss" : user.goal === "gain" ? "Muscle Gain" : "Maintenance", key: "goal", editable: false },
    { label: "Activity", value: user.activityLevel.replace("_", " "), key: "activityLevel", editable: false },
  ];

  const nutritionItems = [
    { label: "Calories", value: `${user.calorieTarget} kcal` },
    { label: "Protein", value: `${user.proteinTarget}g` },
    { label: "Carbs", value: `${user.carbsTarget}g` },
    { label: "Fats", value: `${user.fatsTarget}g` },
    { label: "Water", value: `${user.waterTarget} glasses` },
  ];

  const goalOptions = [
    { value: "lose", label: "Fat Loss" },
    { value: "maintain", label: "Maintenance" },
    { value: "gain", label: "Muscle Gain" },
  ];

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full gradient-neon mx-auto mb-3 flex items-center justify-center">
          <User className="w-9 h-9 text-background" />
        </div>
        {editMode ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="text-2xl font-display font-bold text-text-primary text-center bg-transparent border-b border-accent/50 focus:outline-none w-full max-w-xs mx-auto block"
          />
        ) : (
          <h1 className="text-2xl font-display font-bold text-text-primary">{user.name}</h1>
        )}
        <p className="text-text-secondary text-sm capitalize">{user.experience} • {user.goal === "lose" ? "Fat Loss" : user.goal === "gain" ? "Muscle Gain" : "Maintenance"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface rounded-2xl p-3 border border-border/50 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
            <p className="text-text-primary text-lg font-bold capitalize">{s.value}</p>
            <p className="text-text-muted text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Toggle */}
      <div className="flex justify-end mb-3">
        {editMode ? (
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)} className="px-3 py-1.5 rounded-lg bg-surface-lighter text-text-secondary text-sm flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={handleSaveProfile} className="px-3 py-1.5 rounded-lg gradient-neon text-background text-sm font-semibold flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditMode(true)} className="px-3 py-1.5 rounded-lg bg-surface-lighter text-text-secondary text-sm flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
      </div>

      {/* Body Stats */}
      <div className="bg-surface rounded-2xl border border-border/50 mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <h3 className="text-text-primary font-semibold text-sm flex items-center gap-2">
            <Ruler className="w-4 h-4 text-accent-light" /> Body Stats
          </h3>
        </div>
        {profileItems.map((item) => (
          <div key={item.key} className="px-4 py-3 border-b border-border/20 last:border-0">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">{item.label}</span>
              {editMode && item.editable ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={item.value}
                  onChange={(e) => {
                    if (item.key === "age") setEditAge(e.target.value);
                    if (item.key === "height") setEditHeight(e.target.value);
                    if (item.key === "weight") setEditWeight(e.target.value);
                  }}
                  className="w-20 py-1 px-2 bg-surface-lighter rounded-lg text-right text-text-primary text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              ) : (
                <span className="text-text-primary text-sm font-medium capitalize">{typeof item.value === 'string' && !editMode ? item.value : `${item.value}`}</span>
              )}
            </div>
            
            {editMode && item.editable && (
              <div className="mt-3">
                <input 
                  type="range" 
                  min={item.key === "age" ? 14 : item.key === "height" ? 120 : 30}
                  max={item.key === "age" ? 100 : item.key === "height" ? 250 : 200}
                  value={item.value as string} 
                  onChange={(e) => {
                    if (item.key === "age") setEditAge(e.target.value);
                    if (item.key === "height") setEditHeight(e.target.value);
                    if (item.key === "weight") setEditWeight(e.target.value);
                  }} 
                  className="w-full accent-neon-green" 
                />
              </div>
            )}
          </div>
        ))}

        {/* Edit mode options for Diet and Goal */}
        {editMode && (
          <div className="px-4 py-3 border-t border-border/20 bg-surface-light/30">
            <span className="text-text-secondary text-xs block mb-2">Diet Preference</span>
            <div className="flex gap-2 mb-4">
              {[
                { value: "veg", label: "Veg" },
                { value: "veg+egg", label: "Veg+Egg" },
                { value: "non-veg", label: "Non-Veg" }
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setEditDietType(d.value as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    editDietType === d.value ? "border-neon-green/50 bg-neon-green/10 text-neon-green" : "border-border/50 bg-surface-lighter text-text-secondary"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <span className="text-text-secondary text-xs block mb-2">Goal</span>
            <div className="flex gap-2">
              {goalOptions.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setEditGoal(g.value as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    editGoal === g.value ? "border-neon-blue/50 bg-neon-blue/10 text-neon-blue" : "border-border/50 bg-surface-lighter text-text-secondary"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nutrition Targets */}
      <div className="bg-surface rounded-2xl border border-border/50 mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <h3 className="text-text-primary font-semibold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-neon-green" /> Nutrition Targets
            {editMode && <span className="text-text-muted text-[10px] ml-1">(auto-calculated)</span>}
          </h3>
        </div>
        {nutritionItems.map((item) => (
          <div key={item.label} className="px-4 py-3 flex items-center justify-between border-b border-border/20 last:border-0">
            <span className="text-text-secondary text-sm">{item.label}</span>
            <span className="text-text-primary text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Super Admin Dashboard */}
      {isSuperAdmin && (
        <div className="bg-surface rounded-2xl border border-neon-red/50 mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 bg-neon-red/5">
            <h3 className="text-text-primary font-semibold text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><Bug className="w-4 h-4 text-neon-red" /> Reported Bugs</span>
              <button onClick={clearBugs} className="text-xs text-text-muted hover:text-neon-red">Clear All</button>
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {reportedBugs.length === 0 ? (
              <div className="p-4 text-center text-text-muted text-sm">No bugs reported yet.</div>
            ) : (
              reportedBugs.map((bug) => (
                <div key={bug.id} className="p-4 border-b border-border/20 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-text-muted">{new Date(bug.date).toLocaleString()}</span>
                    {bug.status === "open" ? (
                      <button onClick={() => resolveBug(bug.id)} className="flex items-center gap-1 text-[10px] bg-neon-red/10 text-neon-red px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" /> Mark Resolved
                      </button>
                    ) : (
                      <span className="text-[10px] text-neon-green">Resolved</span>
                    )}
                  </div>
                  <p className={`text-sm ${bug.status === "resolved" ? "text-text-muted line-through" : "text-text-primary"}`}>
                    {bug.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings & Actions */}
      <div className="bg-surface rounded-2xl border border-border/50 mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <h3 className="text-text-primary font-semibold text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-text-secondary" /> Settings
          </h3>
        </div>

        <button
          onClick={handleExportData}
          className="w-full px-4 py-3 flex items-center justify-between border-b border-border/20 active:bg-surface-light transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-neon-blue" />
            <span className="text-text-secondary text-sm">Export My Data</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button
          onClick={() => setOnboarded(false)}
          className="w-full px-4 py-3 flex items-center justify-between border-b border-border/20 active:bg-surface-light transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-neon-orange" />
            <span className="text-text-secondary text-sm">Re-configure Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full px-4 py-3 flex items-center gap-3 active:bg-surface-light transition-colors"
        >
          <LogOut className="w-4 h-4 text-neon-red" />
          <span className="text-neon-red text-sm font-medium">{signingOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
