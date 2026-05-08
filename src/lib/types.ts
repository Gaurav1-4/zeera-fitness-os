// ========================================
// EXERCISE & WORKOUT TYPES
// ========================================

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "legs"
  | "arms"
  | "abs"
  | "cardio";

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  commonMistakes: string[];
  safetyTips: string[];
  videoUrl?: string;
  gifUrl?: string;
  imageUrl?: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  isPersonalRecord?: boolean;
  rpe?: number;
  type?: "warmup" | "normal" | "drop" | "failure";
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  restTime: number; // seconds
  notes?: string;
  previousBest?: { weight: number; reps: number };
  tempo?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  targetMuscles: MuscleGroup[];
  estimatedDuration: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  day?: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number; // seconds
  exercises: WorkoutExercise[];
  totalVolume: number;
  caloriesBurned: number;
  completed: boolean;
  syncStatus?: "pending" | "synced" | "failed";
}

// ========================================
// NUTRITION TYPES
// ========================================

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  servingUnit: string;
  category: "indian" | "western" | "snack" | "supplement" | "beverage";
  isVeg: boolean;
}

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "pre-workout"
  | "post-workout";

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: MealType;
  date: string;
  time: string;
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number; // glasses
  meals: MealEntry[];
}

// ========================================
// PROGRESS TYPES
// ========================================

export interface BodyMeasurement {
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  arms?: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  type: "front" | "side" | "back";
  url: string;
}

// ========================================
// USER TYPES
// ========================================

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: "male" | "female";
  goal: "lose" | "maintain" | "gain";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  experience: "beginner" | "intermediate" | "advanced";
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  waterTarget: number; // glasses
}

export interface AIInsight {
  id: string;
  type: "nutrition" | "workout" | "recovery" | "progress" | "streak";
  message: string;
  priority: "low" | "medium" | "high";
  icon: string;
  date: string;
  read: boolean;
}

export interface DailyStats {
  workoutCompleted: boolean;
  caloriesConsumed: number;
  proteinConsumed: number;
  waterGlasses: number;
  steps: number;
  streak: number;
}
