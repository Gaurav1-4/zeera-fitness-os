"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Leaf, Drumstick, Trash2, Minus, ChevronDown, Edit3, Bot } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { foods } from "@/lib/data/foods";
import { MealType, FoodItem } from "@/lib/types";
import ProgressRing from "@/components/ui/ProgressRing";
import FoodBot from "@/components/FoodBot";
import indianFoods from "@/lib/indian-food-library.json";

const mealTypes: { label: string; value: MealType; icon: string }[] = [
  { label: "Breakfast", value: "breakfast", icon: "🌅" },
  { label: "Lunch", value: "lunch", icon: "☀️" },
  { label: "Dinner", value: "dinner", icon: "🌙" },
  { label: "Snacks", value: "snacks", icon: "🍎" },
  { label: "Pre-Workout", value: "pre-workout", icon: "⚡" },
  { label: "Post-Workout", value: "post-workout", icon: "💪" },
];

export default function NutritionScreen() {
  const { user, meals, addMeal, removeMeal } = useAppStore();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [foodFilter, setFoodFilter] = useState<"all" | "indian" | "western" | "supplement">("all");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Custom food state
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFats, setCustomFats] = useState("");
  const [showBot, setShowBot] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((m) => m.date === today);

  const totals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + Math.round(m.foodItem.calories * m.quantity),
      protein: acc.protein + Math.round(m.foodItem.protein * m.quantity),
      carbs: acc.carbs + Math.round(m.foodItem.carbs * m.quantity),
      fats: acc.fats + Math.round(m.foodItem.fats * m.quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const calRemaining = Math.max(0, user.calorieTarget - totals.calories);
  const calPercent = Math.min((totals.calories / user.calorieTarget) * 100, 100);

  const allAvailableFoods = useMemo(() => {
    const convertedIndian = (indianFoods as any[]).map(f => ({
      id: f.id,
      name: f.name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fats: f.fat,
      servingSize: "1",
      servingUnit: f.servingUnit || "serving",
      category: "indian",
      isVeg: true
    }));
    return [...foods, ...convertedIndian];
  }, []);

  const filteredFoods = allAvailableFoods.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = foodFilter === "all" || f.category === foodFilter;
    return matchSearch && matchFilter;
  });

  const handleAddFood = (food: FoodItem, qty: number = 1) => {
    addMeal({
      id: `m-${Date.now()}-${Math.random()}`,
      foodItem: food,
      quantity: qty,
      mealType: selectedMealType,
      date: today,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });
    setSelectedFood(null);
    setQuantity(1);
  };

  const handleAddCustomFood = () => {
    if (!customName || !customCalories) return;
    const food: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      calories: parseInt(customCalories) || 0,
      protein: parseInt(customProtein) || 0,
      carbs: parseInt(customCarbs) || 0,
      fats: parseInt(customFats) || 0,
      servingSize: "1",
      servingUnit: "serving",
      category: "western",
      isVeg: true,
    };
    handleAddFood(food, 1);
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFats("");
    setShowCustomFood(false);
    setShowAddFood(false);
  };

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-display font-bold text-text-primary">Nutrition</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBot(true)}
            className="w-10 h-10 rounded-xl bg-surface border border-neon-green/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Bot className="w-5 h-5 text-neon-green" />
          </button>
          <button
            onClick={() => setShowAddFood(true)}
            className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-background" />
          </button>
        </div>
      </div>

      {/* Macro Overview */}
      <div className="bg-surface rounded-2xl border border-border/50 p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-text-secondary text-xs">Calories Remaining</p>
            <p className="text-3xl font-display font-bold text-text-primary">{calRemaining}</p>
            <p className="text-text-muted text-[10px]">{totals.calories} consumed of {user.calorieTarget}</p>
          </div>
          <ProgressRing progress={calPercent} size={64} strokeWidth={5} color={calPercent > 100 ? "#ff5252" : "#00f5a0"}>
            <span className={`text-xs font-bold ${calPercent > 100 ? "text-neon-red" : "text-neon-green"}`}>{Math.round(calPercent)}%</span>
          </ProgressRing>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Protein", value: totals.protein, target: user.proteinTarget, color: "#00d9ff", unit: "g" },
            { label: "Carbs", value: totals.carbs, target: user.carbsTarget, color: "#ffa726", unit: "g" },
            { label: "Fats", value: totals.fats, target: user.fatsTarget, color: "#b84dff", unit: "g" },
          ].map((macro) => (
            <div key={macro.label} className="text-center">
              <ProgressRing progress={(macro.value / macro.target) * 100} size={48} strokeWidth={4} color={macro.color} className="mx-auto mb-1.5">
                <span className="text-[9px] font-bold text-text-primary">{Math.round(macro.value)}</span>
              </ProgressRing>
              <p className="text-text-secondary text-[10px]">{macro.label}</p>
              <p className="text-text-muted text-[10px]">{Math.round(macro.value)}/{macro.target}{macro.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-4">
        {mealTypes.map((mt) => {
          const mealItems = todayMeals.filter((m) => m.mealType === mt.value);
          const mealCalories = mealItems.reduce((s, m) => s + m.foodItem.calories * m.quantity, 0);
          const mealProtein = mealItems.reduce((s, m) => s + m.foodItem.protein * m.quantity, 0);
          if (mealItems.length === 0 && mt.value !== "breakfast" && mt.value !== "lunch" && mt.value !== "dinner") return null;
          return (
            <div key={mt.value} className="bg-surface rounded-2xl border border-border/50 overflow-hidden">
              <button
                onClick={() => { setSelectedMealType(mt.value); setShowAddFood(true); }}
                className="w-full p-3.5 flex items-center justify-between active:bg-surface-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{mt.icon}</span>
                  <div className="text-left">
                    <p className="text-text-primary text-sm font-medium">{mt.label}</p>
                    <p className="text-text-muted text-xs">{mealCalories} kcal • {Math.round(mealProtein)}g protein</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-text-muted" />
              </button>
              {mealItems.length > 0 && (
                <div className="px-3.5 pb-3 space-y-2">
                  {mealItems.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-2.5 bg-surface-light rounded-lg">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {meal.foodItem.isVeg ? <Leaf className="w-3.5 h-3.5 text-neon-green flex-shrink-0" /> : <Drumstick className="w-3.5 h-3.5 text-neon-red flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-text-primary text-xs font-medium truncate">
                            {meal.foodItem.name}
                            {meal.quantity > 1 && <span className="text-neon-blue ml-1">×{meal.quantity}</span>}
                          </p>
                          <p className="text-text-muted text-[10px]">{meal.foodItem.calories * meal.quantity} kcal • P:{Math.round(meal.foodItem.protein * meal.quantity)}g</p>
                        </div>
                      </div>
                      <button onClick={() => removeMeal(meal.id)} className="p-1.5 rounded-lg hover:bg-surface-lighter active:scale-95 transition-transform">
                        <Trash2 className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      <AnimatePresence>
        {showAddFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end"
            onClick={() => { setShowAddFood(false); setSelectedFood(null); setShowCustomFood(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface w-full rounded-t-3xl max-h-[90dvh] overflow-hidden flex flex-col"
            >
              <div className="px-5 pt-3 pb-4 border-b border-border/50">
                <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-display font-bold text-text-primary">
                    Add to {mealTypes.find((m) => m.value === selectedMealType)?.label}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCustomFood(!showCustomFood)}
                      className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent-light text-xs font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Custom
                    </button>
                    <button onClick={() => { setShowAddFood(false); setShowCustomFood(false); }} className="p-1.5 rounded-lg bg-surface-lighter">
                      <X className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                </div>

                {/* Custom Food Form */}
                <AnimatePresence>
                  {showCustomFood && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="bg-surface-light rounded-xl p-3 space-y-2">
                        <input type="text" placeholder="Food name" value={customName} onChange={(e) => setCustomName(e.target.value)}
                          className="w-full py-2 px-3 bg-surface-lighter rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none" />
                        <div className="grid grid-cols-4 gap-2">
                          <input type="number" inputMode="numeric" placeholder="Cal" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)}
                            className="py-2 px-2 bg-surface-lighter rounded-lg text-text-primary text-xs text-center placeholder:text-text-muted focus:outline-none" />
                          <input type="number" inputMode="numeric" placeholder="Prot" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)}
                            className="py-2 px-2 bg-surface-lighter rounded-lg text-text-primary text-xs text-center placeholder:text-text-muted focus:outline-none" />
                          <input type="number" inputMode="numeric" placeholder="Carb" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)}
                            className="py-2 px-2 bg-surface-lighter rounded-lg text-text-primary text-xs text-center placeholder:text-text-muted focus:outline-none" />
                          <input type="number" inputMode="numeric" placeholder="Fat" value={customFats} onChange={(e) => setCustomFats(e.target.value)}
                            className="py-2 px-2 bg-surface-lighter rounded-lg text-text-primary text-xs text-center placeholder:text-text-muted focus:outline-none" />
                        </div>
                        <button
                          onClick={handleAddCustomFood}
                          disabled={!customName || !customCalories}
                          className="w-full py-2 rounded-lg gradient-neon text-background text-sm font-semibold disabled:opacity-50"
                        >
                          Add Custom Food
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={!showCustomFood}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-light rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "All", value: "all" as const },
                    { label: "🇮🇳 Indian", value: "indian" as const },
                    { label: "🌍 Western", value: "western" as const },
                    { label: "💊 Supps", value: "supplement" as const },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFoodFilter(f.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        foodFilter === f.value ? "gradient-neon text-background" : "bg-surface-lighter text-text-secondary"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <AnimatePresence>
                {selectedFood && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-b border-border/50"
                  >
                    <div className="px-5 py-3 bg-accent/5">
                      <p className="text-text-primary text-sm font-medium mb-2">{selectedFood.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                            className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center active:scale-95 transition-transform">
                            <Minus className="w-4 h-4 text-text-secondary" />
                          </button>
                          <span className="text-text-primary text-lg font-bold w-12 text-center">{quantity}</span>
                          <button onClick={() => setQuantity(quantity + 0.5)}
                            className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center active:scale-95 transition-transform">
                            <Plus className="w-4 h-4 text-background" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-neon-green text-sm font-bold">{Math.round(selectedFood.calories * quantity)} kcal</p>
                          <p className="text-text-muted text-[10px]">P:{Math.round(selectedFood.protein * quantity)}g C:{Math.round(selectedFood.carbs * quantity)}g F:{Math.round(selectedFood.fats * quantity)}g</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { handleAddFood(selectedFood, quantity); setShowAddFood(false); setSearchQuery(""); }}
                        className="w-full py-2.5 mt-3 rounded-xl gradient-neon text-background text-sm font-semibold active:scale-[0.98] transition-transform"
                      >
                        Add {quantity > 1 ? `${quantity} servings` : "1 serving"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      if (selectedFood?.id === food.id) {
                        handleAddFood(food, quantity);
                        setShowAddFood(false);
                        setSearchQuery("");
                      } else {
                        setSelectedFood(food);
                        setQuantity(1);
                      }
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 active:scale-[0.98] transition-transform text-left ${
                      selectedFood?.id === food.id ? "bg-accent/10 border border-accent/30" : "bg-surface-light"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center">
                      {food.isVeg ? <Leaf className="w-4 h-4 text-neon-green" /> : <Drumstick className="w-4 h-4 text-neon-red" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{food.name}</p>
                      <p className="text-text-muted text-xs">{food.servingSize} {food.servingUnit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary text-sm font-semibold">{food.calories}</p>
                      <p className="text-text-muted text-[10px]">P:{food.protein}g</p>
                    </div>
                  </button>
                ))}
                {filteredFoods.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-text-secondary text-sm mb-1">No foods found</p>
                    <button onClick={() => setShowCustomFood(true)} className="text-neon-blue text-sm font-medium">
                      Add custom food →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Bot Overlay */}
      <AnimatePresence>
        {showBot && <FoodBot onClose={() => setShowBot(false)} />}
      </AnimatePresence>
    </div>
  );
}
