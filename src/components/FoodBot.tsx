"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Plus, Check, Utensils } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { foods } from "@/lib/data/foods";
import { FoodItem, MealType } from "@/lib/types";
import indianFoods from "@/lib/indian-food-library.json";
import { searchUSDA } from "@/lib/usda-api";

// Extended knowledge base for foods NOT in the database
const foodKnowledge: Record<string, { calories: number; protein: number; carbs: number; fats: number; serving: string }> = {
  "maggi": { calories: 310, protein: 7, carbs: 44, fats: 13, serving: "1 packet" },
  "noodles": { calories: 310, protein: 7, carbs: 44, fats: 13, serving: "1 packet" },
  "samosa": { calories: 260, protein: 4, carbs: 28, fats: 15, serving: "1 piece" },
  "biryani": { calories: 350, protein: 15, carbs: 45, fats: 12, serving: "1 plate" },
  "veg biryani": { calories: 280, protein: 8, carbs: 48, fats: 8, serving: "1 plate" },
  "chicken biryani": { calories: 400, protein: 22, carbs: 45, fats: 14, serving: "1 plate" },
  "pizza": { calories: 270, protein: 11, carbs: 33, fats: 10, serving: "1 slice" },
  "burger": { calories: 350, protein: 17, carbs: 34, fats: 16, serving: "1 piece" },
  "sandwich": { calories: 250, protein: 10, carbs: 30, fats: 10, serving: "1 piece" },
  "momos": { calories: 200, protein: 8, carbs: 26, fats: 7, serving: "6 pieces" },
  "veg momos": { calories: 180, protein: 6, carbs: 28, fats: 5, serving: "6 pieces" },
  "milk": { calories: 150, protein: 8, carbs: 12, fats: 8, serving: "1 glass" },
  "tea": { calories: 50, protein: 1, carbs: 8, fats: 1.5, serving: "1 cup" },
  "chai": { calories: 50, protein: 1, carbs: 8, fats: 1.5, serving: "1 cup" },
  "coffee": { calories: 5, protein: 0, carbs: 1, fats: 0, serving: "1 cup black" },
  "cold coffee": { calories: 180, protein: 5, carbs: 25, fats: 6, serving: "1 glass" },
  "juice": { calories: 110, protein: 1, carbs: 26, fats: 0, serving: "1 glass" },
  "lasagna": { calories: 350, protein: 18, carbs: 32, fats: 16, serving: "1 serving" },
  "pasta": { calories: 300, protein: 10, carbs: 42, fats: 10, serving: "1 plate" },
  "naan": { calories: 260, protein: 7, carbs: 42, fats: 7, serving: "1 piece" },
  "butter naan": { calories: 310, protein: 7, carbs: 42, fats: 12, serving: "1 piece" },
  "garlic naan": { calories: 300, protein: 7, carbs: 44, fats: 10, serving: "1 piece" },
  "kulcha": { calories: 290, protein: 7, carbs: 40, fats: 10, serving: "1 piece" },
  "puri": { calories: 120, protein: 2, carbs: 14, fats: 6, serving: "1 piece" },
  "bhatura": { calories: 200, protein: 4, carbs: 26, fats: 9, serving: "1 piece" },
  "upma": { calories: 200, protein: 5, carbs: 30, fats: 7, serving: "1 bowl" },
  "uttapam": { calories: 200, protein: 5, carbs: 30, fats: 6, serving: "1 piece" },
  "vada": { calories: 170, protein: 5, carbs: 18, fats: 9, serving: "1 piece" },
  "medu vada": { calories: 170, protein: 5, carbs: 18, fats: 9, serving: "1 piece" },
  "pav bhaji": { calories: 350, protein: 8, carbs: 45, fats: 15, serving: "1 plate" },
  "dahi vada": { calories: 200, protein: 6, carbs: 28, fats: 7, serving: "2 pieces" },
  "khichdi": { calories: 200, protein: 7, carbs: 32, fats: 5, serving: "1 bowl" },
  "pulao": { calories: 250, protein: 5, carbs: 42, fats: 7, serving: "1 plate" },
  "raita": { calories: 60, protein: 3, carbs: 5, fats: 3, serving: "1 bowl" },
  "dal makhani": { calories: 220, protein: 10, carbs: 22, fats: 10, serving: "1 bowl" },
  "palak paneer": { calories: 240, protein: 14, carbs: 10, fats: 16, serving: "1 bowl" },
  "shahi paneer": { calories: 300, protein: 14, carbs: 12, fats: 22, serving: "1 bowl" },
  "matar paneer": { calories: 260, protein: 14, carbs: 14, fats: 16, serving: "1 bowl" },
  "butter chicken": { calories: 340, protein: 28, carbs: 10, fats: 20, serving: "1 bowl" },
  "chicken tikka": { calories: 200, protein: 26, carbs: 4, fats: 9, serving: "6 pieces" },
  "fish curry": { calories: 250, protein: 22, carbs: 8, fats: 14, serving: "1 bowl" },
  "egg curry": { calories: 220, protein: 14, carbs: 8, fats: 15, serving: "1 bowl" },
  "fried rice": { calories: 300, protein: 8, carbs: 42, fats: 11, serving: "1 plate" },
  "manchurian": { calories: 250, protein: 6, carbs: 30, fats: 12, serving: "1 bowl" },
  "spring roll": { calories: 150, protein: 3, carbs: 18, fats: 7, serving: "2 pieces" },
  "gulab jamun": { calories: 150, protein: 2, carbs: 22, fats: 6, serving: "2 pieces" },
  "rasgulla": { calories: 120, protein: 3, carbs: 22, fats: 2, serving: "2 pieces" },
  "jalebi": { calories: 150, protein: 1, carbs: 30, fats: 5, serving: "2 pieces" },
  "kheer": { calories: 200, protein: 5, carbs: 30, fats: 7, serving: "1 bowl" },
  "ice cream": { calories: 210, protein: 4, carbs: 28, fats: 10, serving: "1 scoop" },
  "chocolate": { calories: 230, protein: 3, carbs: 26, fats: 13, serving: "1 bar (40g)" },
  "chips": { calories: 150, protein: 2, carbs: 15, fats: 9, serving: "1 small pack" },
  "biscuit": { calories: 50, protein: 1, carbs: 7, fats: 2, serving: "1 piece" },
  "bread": { calories: 70, protein: 2, carbs: 13, fats: 1, serving: "1 slice" },
  "toast": { calories: 70, protein: 2, carbs: 13, fats: 1, serving: "1 slice" },
  "egg": { calories: 78, protein: 6, carbs: 0.5, fats: 5, serving: "1 egg" },
  "boiled egg": { calories: 78, protein: 6, carbs: 0.5, fats: 5, serving: "1 egg" },
  "omelette": { calories: 180, protein: 12, carbs: 1, fats: 14, serving: "2 eggs" },
  "paneer": { calories: 260, protein: 18, carbs: 3, fats: 20, serving: "100g" },
  "chicken": { calories: 165, protein: 31, carbs: 0, fats: 4, serving: "100g" },
  "fish": { calories: 140, protein: 24, carbs: 0, fats: 5, serving: "100g" },
  "mutton": { calories: 250, protein: 25, carbs: 0, fats: 16, serving: "100g" },
  "soya chunk": { calories: 170, protein: 26, carbs: 16, fats: 0.5, serving: "50g dry" },
  "tofu": { calories: 80, protein: 8, carbs: 2, fats: 4, serving: "100g" },
  "sprouts": { calories: 80, protein: 7, carbs: 12, fats: 1, serving: "1 bowl" },
  "salad": { calories: 60, protein: 2, carbs: 10, fats: 1, serving: "1 bowl" },
  "soup": { calories: 80, protein: 4, carbs: 10, fats: 2, serving: "1 bowl" },
  "fruit": { calories: 80, protein: 1, carbs: 20, fats: 0, serving: "1 medium" },
  "mango": { calories: 100, protein: 1, carbs: 25, fats: 0.5, serving: "1 medium" },
  "watermelon": { calories: 50, protein: 1, carbs: 12, fats: 0, serving: "1 cup" },
  "papaya": { calories: 60, protein: 0.5, carbs: 15, fats: 0, serving: "1 cup" },
  "pomegranate": { calories: 85, protein: 1.5, carbs: 19, fats: 1, serving: "1 cup" },
  "coke": { calories: 140, protein: 0, carbs: 39, fats: 0, serving: "1 can" },
  "pepsi": { calories: 150, protein: 0, carbs: 41, fats: 0, serving: "1 can" },
  "sprite": { calories: 140, protein: 0, carbs: 38, fats: 0, serving: "1 can" },
  "beer": { calories: 150, protein: 1, carbs: 13, fats: 0, serving: "1 can" },
  "wine": { calories: 125, protein: 0, carbs: 4, fats: 0, serving: "1 glass" },
  "protein shake": { calories: 120, protein: 24, carbs: 3, fats: 1, serving: "1 scoop" },
  "smoothie": { calories: 180, protein: 5, carbs: 32, fats: 4, serving: "1 glass" },
  "coconut water": { calories: 45, protein: 1, carbs: 9, fats: 0, serving: "1 glass" },
  "buttermilk": { calories: 40, protein: 3, carbs: 5, fats: 1, serving: "1 glass" },
  "chaas": { calories: 40, protein: 3, carbs: 5, fats: 1, serving: "1 glass" },
};

// MCQ categories for unknown foods
const foodCategories = [
  { label: "🍚 Rice/Grain Dish", cal: 280, p: 8, c: 42, f: 8 },
  { label: "🍗 Meat/Protein", cal: 220, p: 25, c: 4, f: 12 },
  { label: "🥬 Vegetable Dish", cal: 140, p: 4, c: 16, f: 7 },
  { label: "🍞 Bread/Roti", cal: 150, p: 4, c: 24, f: 5 },
  { label: "🥤 Drink/Beverage", cal: 100, p: 2, c: 18, f: 2 },
  { label: "🍰 Dessert/Sweet", cal: 200, p: 3, c: 32, f: 8 },
  { label: "🍿 Snack/Fried", cal: 180, p: 4, c: 20, f: 10 },
  { label: "🥗 Salad/Light", cal: 80, p: 3, c: 12, f: 2 },
];

const portionMultipliers = [
  { label: "Small", mult: 0.7 },
  { label: "Regular", mult: 1.0 },
  { label: "Large", mult: 1.4 },
];

interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text: string;
  options?: { label: string; value: string }[];
  foodResult?: { name: string; calories: number; protein: number; carbs: number; fats: number; qty: number };
}

type BotState = "idle" | "ask_meal_type" | "ask_category" | "ask_portion" | "confirm";

interface PendingFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  qty: number;
}

function parseFoodInput(input: string): { items: { name: string; qty: number }[] } {
  const text = input.toLowerCase().trim();
  const items: { name: string; qty: number }[] = [];
  
  // Split by "and", ",", "&", "with"
  const parts = text.split(/\s*(?:and|,|&|with|\+)\s*/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Extract quantity: "2 rotis", "3 eggs", "1 bowl rice"
    const qtyMatch = trimmed.match(/^(\d+\.?\d*)\s*(.+)/);
    if (qtyMatch) {
      items.push({ name: qtyMatch[2].trim(), qty: parseFloat(qtyMatch[1]) });
    } else {
      items.push({ name: trimmed, qty: 1 });
    }
  }
  return { items };
}

function findFood(name: string): { source: "db" | "knowledge" | "indian" | null; food: any } {
  const n = name.toLowerCase().replace(/s$/, ""); // remove trailing s (plurals)
  
  // 1. Check Indian Database first (Priority for this user)
  const indianMatch = (indianFoods as any[]).find(f => 
    f.name.toLowerCase() === n || 
    f.name.toLowerCase().includes(n) ||
    n.includes(f.name.toLowerCase())
  );
  if (indianMatch) return { source: "indian", food: indianMatch };

  // 2. Check main database second
  const dbMatch = foods.find(f => 
    f.name.toLowerCase().includes(n) || 
    n.includes(f.name.toLowerCase().split("(")[0].trim().toLowerCase())
  );
  if (dbMatch) return { source: "db", food: dbMatch };
  
  // 3. Check hardcoded knowledge base
  for (const [key, val] of Object.entries(foodKnowledge)) {
    if (key.includes(n) || n.includes(key)) {
      return { source: "knowledge", food: { name: key, ...val } };
    }
  }
  
  return { source: null, food: null };
}

export default function FoodBot({ onClose }: { onClose: () => void }) {
  const { addMeal } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "bot", text: "Hey! 👋 Tell me what you ate. For example:\n\"2 rotis with dal\" or \"chicken biryani and lassi\"" }
  ]);
  const [input, setInput] = useState("");
  const [botState, setBotState] = useState<BotState>("idle");
  const [pendingFood, setPendingFood] = useState<PendingFood | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const addMsg = (msg: Omit<ChatMessage, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random() }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    addMsg({ from: "user", text });

    if (botState === "idle") {
      processUserInput(text);
    }
  };

  const handleOption = (value: string, label: string) => {
    addMsg({ from: "user", text: label });

    if (botState === "ask_meal_type") {
      setSelectedMealType(value as MealType);
      setBotState("confirm");
      if (pendingFood) {
        addMsg({
          from: "bot",
          text: `Got it! Here's what I'll log:\n\n🍽️ **${pendingFood.name}** × ${pendingFood.qty}\n🔥 ${Math.round(pendingFood.calories * pendingFood.qty)} kcal\n🥩 ${Math.round(pendingFood.protein * pendingFood.qty)}g protein\n🍞 ${Math.round(pendingFood.carbs * pendingFood.qty)}g carbs\n🧈 ${Math.round(pendingFood.fats * pendingFood.qty)}g fats`,
          options: [
            { label: "✅ Log it!", value: "confirm" },
            { label: "❌ Cancel", value: "cancel" },
          ],
        });
      }
    } else if (botState === "ask_category") {
      const cat = foodCategories.find(c => c.label === value);
      if (cat && pendingFood) {
        setPendingFood({ ...pendingFood, calories: cat.cal, protein: cat.p, carbs: cat.c, fats: cat.f });
        setBotState("ask_portion");
        addMsg({
          from: "bot",
          text: `What was the portion size?`,
          options: portionMultipliers.map(p => ({ label: `${p.label} (×${p.mult})`, value: String(p.mult) })),
        });
      }
    } else if (botState === "ask_portion") {
      const mult = parseFloat(value);
      if (pendingFood) {
        const updated = {
          ...pendingFood,
          calories: Math.round(pendingFood.calories * mult),
          protein: Math.round(pendingFood.protein * mult),
          carbs: Math.round(pendingFood.carbs * mult),
          fats: Math.round(pendingFood.fats * mult),
        };
        setPendingFood(updated);
        setBotState("ask_meal_type");
        addMsg({
          from: "bot",
          text: "Which meal is this for?",
          options: [
            { label: "🌅 Breakfast", value: "breakfast" },
            { label: "☀️ Lunch", value: "lunch" },
            { label: "🌙 Dinner", value: "dinner" },
            { label: "🍎 Snack", value: "snacks" },
          ],
        });
      }
    } else if (botState === "confirm") {
      if (value === "confirm" && pendingFood) {
        const food: FoodItem = {
          id: `bot-${Date.now()}`,
          name: pendingFood.name,
          calories: Math.round(pendingFood.calories),
          protein: Math.round(pendingFood.protein),
          carbs: Math.round(pendingFood.carbs),
          fats: Math.round(pendingFood.fats),
          servingSize: "1",
          servingUnit: "serving",
          category: "indian",
          isVeg: true,
        };
        addMeal({
          id: `m-${Date.now()}`,
          foodItem: food,
          quantity: pendingFood.qty,
          mealType: selectedMealType,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
        addMsg({ from: "bot", text: "✅ Logged! Tell me if you ate anything else." });
        setPendingFood(null);
        setBotState("idle");
      } else {
        addMsg({ from: "bot", text: "Cancelled. Tell me what else you ate!" });
        setPendingFood(null);
        setBotState("idle");
      }
    }
  };

  const processUserInput = (text: string) => {
    const { items } = parseFoodInput(text);
    if (items.length === 0) {
      addMsg({ from: "bot", text: "I didn't catch that. Try something like \"2 rotis and dal\" or \"chicken biryani\"." });
      return;
    }

    // Process first item (we'll handle multiple sequentially)
    let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
    const foundItems: string[] = [];
    let unknownItem: { name: string; qty: number } | null = null;

    const runProcess = async () => {
      for (const item of items) {
        const result = findFood(item.name);
        if (result.source === "db") {
          const f = result.food as FoodItem;
          totalCals += f.calories * item.qty;
          totalP += f.protein * item.qty;
          totalC += f.carbs * item.qty;
          totalF += f.fats * item.qty;
          foundItems.push(`${item.qty}× ${f.name}`);
        } else if (result.source === "indian") {
          totalCals += result.food.calories * item.qty;
          totalP += result.food.protein * item.qty;
          totalC += result.food.carbs * item.qty;
          totalF += result.food.fat * item.qty;
          foundItems.push(`${item.qty}× ${result.food.name}`);
        } else if (result.source === "knowledge") {
          totalCals += result.food.calories * item.qty;
          totalP += result.food.protein * item.qty;
          totalC += result.food.carbs * item.qty;
          totalF += result.food.fats * item.qty;
          foundItems.push(`${item.qty}× ${result.food.name}`);
        } else {
          // USDA Global Fallback
          const usdaResults = await searchUSDA(item.name);
          if (usdaResults.length > 0) {
            const f = usdaResults[0];
            totalCals += f.calories * item.qty;
            totalP += f.protein * item.qty;
            totalC += f.carbs * item.qty;
            totalF += f.fats * item.qty;
            foundItems.push(`${item.qty}× ${f.name}`);
          } else {
            unknownItem = item;
          }
        }
      }

      // If we have unknown items, ask MCQ
      if (unknownItem && foundItems.length === 0) {
        setPendingFood({ name: unknownItem.name, calories: 0, protein: 0, carbs: 0, fats: 0, qty: unknownItem.qty });
        setBotState("ask_category");
        addMsg({
          from: "bot",
          text: `I don't have "${unknownItem.name}" in my database. What type of food is it?`,
          options: foodCategories.map(c => ({ label: c.label, value: c.label })),
        });
        return;
      }

      if (foundItems.length > 0) {
        const name = foundItems.join(" + ");
        setPendingFood({ name, calories: totalCals, protein: totalP, carbs: totalC, fats: totalF, qty: 1 });
        setBotState("ask_meal_type");
        addMsg({
          from: "bot",
          text: `Found it! Which meal is this for?`,
          options: [
            { label: "🌅 Breakfast", value: "breakfast" },
            { label: "☀️ Lunch", value: "lunch" },
            { label: "🌙 Dinner", value: "dinner" },
            { label: "🍎 Snack", value: "snacks" },
          ],
        });
      }
    };

    runProcess();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[70] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="px-4 pt-14 pb-3 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-neon flex items-center justify-center">
            <Bot className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm">ZEERA Food Bot</p>
            <p className="text-neon-green text-[10px]">● Online</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg bg-surface-lighter">
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.from === "user" ? "bg-neon-green/15 text-text-primary rounded-tr-sm" : "bg-surface border border-border/50 text-text-secondary rounded-tl-sm"
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
              {msg.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleOption(opt.value, opt.label)}
                      className="px-3 py-1.5 rounded-full bg-surface-lighter border border-border/50 text-text-primary text-xs font-medium active:scale-95 transition-transform hover:border-neon-green/50"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50 bg-surface/50 backdrop-blur-xl pb-safe">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={botState === "idle" ? "I ate 2 rotis with dal..." : "Type or tap an option..."}
            className="flex-1 h-11 px-4 rounded-xl bg-background border border-border/50 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-xl gradient-neon flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 text-background" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
