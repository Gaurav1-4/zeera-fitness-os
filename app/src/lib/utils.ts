import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(weight: number, unit: "kg" | "lbs" = "kg"): string {
  return `${weight}${unit}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Mifflin-St Jeor BMR equation (gold standard for estimating BMR).
 * Returns BMR in kcal/day.
 */
export function calculateBMR(
  weight: number,   // kg
  height: number,   // cm
  age: number,
  gender: "male" | "female"
): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

/**
 * TDEE (Total Daily Energy Expenditure) using Harris-Benedict activity multipliers.
 */
export function calculateTDEE(
  bmr: number,
  activity: "sedentary" | "light" | "moderate" | "active" | "very_active"
): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return bmr * multipliers[activity];
}

/**
 * Calculate daily calorie target from body stats and goal.
 * Uses a percentage-based deficit/surplus that scales with body weight
 * instead of a flat ±500 kcal, which is more accurate for different body sizes.
 * 
 * - Lose: 20% deficit (standard safe rate: ~0.5–1kg/week)
 * - Gain: 10% surplus (lean bulk to minimize fat gain)
 * - Maintain: TDEE as-is
 */
export function calculateCalories(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activity: "sedentary" | "light" | "moderate" | "active" | "very_active",
  goal: "lose" | "maintain" | "gain"
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activity);

  switch (goal) {
    case "lose":
      return Math.round(tdee * 0.80);  // 20% deficit
    case "gain":
      return Math.round(tdee * 1.10);  // 10% surplus
    default:
      return Math.round(tdee);
  }
}

/**
 * Calculate macronutrient targets (protein, carbs, fats) in grams.
 * 
 * Protein is set by bodyweight × multiplier (varies by diet type and goal).
 * Fats are 25% of total calories (essential for hormones).
 * Carbs fill the remaining calories.
 * 
 * Protein multipliers (g per kg bodyweight):
 *   non-veg:  2.0 (easy to hit with meat/fish)
 *   veg+egg:  1.8 (eggs & dairy help)
 *   veg:      1.6 (harder to get complete proteins)
 * 
 * For "gain" goal, protein is bumped by 10% (more muscle stimulus).
 * For "lose" goal, protein is bumped by 15% (muscle preservation in deficit).
 */
export function calculateMacros(
  calories: number,
  weight: number,
  dietType: "veg" | "veg+egg" | "non-veg",
  goal?: "lose" | "maintain" | "gain"
) {
  const baseMult: Record<string, number> = {
    "non-veg": 2.0,
    "veg+egg": 1.8,
    "veg": 1.6,
  };

  let proteinMultiplier = baseMult[dietType] || 2.0;

  // Adjust for goal
  if (goal === "lose") proteinMultiplier *= 1.15;   // preserve muscle in deficit
  if (goal === "gain") proteinMultiplier *= 1.10;    // extra for muscle synthesis

  const protein = Math.round(weight * proteinMultiplier);
  const proteinCals = protein * 4;

  // Fats: 25% of total calories, 1g fat = 9 kcal
  const fatCals = calories * 0.25;
  const fats = Math.round(fatCals / 9);

  // Carbs: remaining calories, 1g carb = 4 kcal
  const carbCals = Math.max(0, calories - proteinCals - fatCals);
  const carbs = Math.round(carbCals / 4);

  return { protein, carbs, fats };
}

/**
 * Estimate workout calories burned using the MET (Metabolic Equivalent of Task) method.
 * 
 * Formula: Calories = MET × weight(kg) × duration(hours)
 * 
 * Average weight training MET = 5.0 (moderate intensity)
 * Adjusted by intensity factor based on volume performed vs expected.
 * 
 * This is significantly more accurate than "duration × 0.12" because it
 * accounts for the user's body weight.
 */
export function calculateWorkoutCaloriesBurned(
  durationSeconds: number,
  weightKg: number,
  totalVolume: number,
  totalSets: number
): number {
  const durationHours = durationSeconds / 3600;
  
  // Base MET for weight training = 5.0
  // If volume per set is high (heavy lifting), bump MET up
  const avgVolumePerSet = totalSets > 0 ? totalVolume / totalSets : 0;
  let met = 5.0;
  if (avgVolumePerSet > 200) met = 6.0;       // heavy compound lifts
  if (avgVolumePerSet > 500) met = 7.0;        // very heavy
  if (avgVolumePerSet < 50 && totalSets > 0) met = 3.5;  // light/bodyweight

  // MET formula: kcal = MET × bodyweight(kg) × time(hours)
  return Math.round(met * weightKg * durationHours);
}

/**
 * Calculate total workout volume.
 * Volume = sum of (weight × reps) for all completed sets.
 * For bodyweight exercises (weight = 0), use bodyweight as the load.
 */
export function calculateTotalVolume(
  exercises: any[],
  userWeight: number = 70
): number {
  return exercises.reduce((acc: number, ex: any) => {
    return acc + ex.sets.reduce((s: number, set: any) => {
      if (!set.completed) return s;
      const load = set.weight > 0 ? set.weight : userWeight;
      return s + load * set.reps;
    }, 0);
  }, 0);
}
