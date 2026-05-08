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

export function calculateCalories(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activity: "sedentary" | "light" | "moderate" | "active" | "very_active",
  goal: "lose" | "maintain" | "gain"
): number {
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * multipliers[activity];

  switch (goal) {
    case "lose":
      return Math.round(tdee - 500);
    case "gain":
      return Math.round(tdee + 300);
    default:
      return Math.round(tdee);
  }
}

export function calculateMacros(
  calories: number,
  weight: number,
  dietType: "veg" | "veg+egg" | "non-veg"
) {
  let proteinMultiplier = 2.0; // non-veg standard
  if (dietType === "veg") proteinMultiplier = 1.6;
  if (dietType === "veg+egg") proteinMultiplier = 1.8;

  const protein = Math.round(weight * proteinMultiplier);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

  return { protein, carbs, fats };
}
