import { AIInsight, WorkoutLog, MealEntry, BodyMeasurement, UserProfile } from "@/lib/types";

/**
 * AI Insights Engine
 * Generates actionable, context-aware fitness insights from real user data.
 */
export function generateInsights(
  user: UserProfile,
  workoutLogs: WorkoutLog[],
  meals: MealEntry[],
  measurements: BodyMeasurement[],
  streak: number,
  waterIntake: number
): AIInsight[] {
  const insights: AIInsight[] = [];
  const today = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((m) => m.date === today);
  const now = new Date();

  // ── Nutrition Insights ──────────────────────────
  const todayCalories = todayMeals.reduce((s, m) => s + m.foodItem.calories * m.quantity, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.foodItem.protein * m.quantity, 0);

  // Low protein warning (afternoon check)
  if (now.getHours() >= 14 && todayProtein < user.proteinTarget * 0.5) {
    insights.push({
      id: `ai-protein-${today}`,
      type: "nutrition",
      message: `You've only had ${Math.round(todayProtein)}g of protein so far today. Try adding chicken breast, paneer, or a whey shake to hit your ${user.proteinTarget}g target.`,
      priority: "high",
      icon: "🥩",
      date: today,
      read: false,
    });
  }

  // Over-eating warning
  if (todayCalories > user.calorieTarget * 1.15 && todayCalories > 0) {
    insights.push({
      id: `ai-overcal-${today}`,
      type: "nutrition",
      message: `You're ${todayCalories - user.calorieTarget} kcal over your target today. Consider a lighter dinner or a brisk walk to balance it out.`,
      priority: "medium",
      icon: "⚠️",
      date: today,
      read: false,
    });
  }

  // Under-eating warning (evening)
  if (now.getHours() >= 18 && todayCalories < user.calorieTarget * 0.4 && todayCalories > 0) {
    insights.push({
      id: `ai-undercal-${today}`,
      type: "nutrition",
      message: `You've only consumed ${todayCalories} kcal today. Under-eating can hurt your metabolism and muscle recovery. Make sure to eat a proper dinner.`,
      priority: "high",
      icon: "🍽️",
      date: today,
      read: false,
    });
  }

  // ── Water Insight ──────────────────────────
  if (now.getHours() >= 15 && waterIntake < Math.floor(user.waterTarget * 0.5)) {
    insights.push({
      id: `ai-water-${today}`,
      type: "recovery",
      message: `You've had only ${waterIntake} glasses of water. Aim for at least ${user.waterTarget} glasses daily for better recovery and performance.`,
      priority: "medium",
      icon: "💧",
      date: today,
      read: false,
    });
  }

  // ── Workout Insights ──────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  const workoutsThisWeek = workoutLogs.filter((l) => last7Days.includes(l.date));

  // No workout today
  const workedOutToday = workoutLogs.some((l) => l.date === today);
  if (!workedOutToday && now.getHours() >= 10) {
    insights.push({
      id: `ai-noworkout-${today}`,
      type: "workout",
      message: "You haven't worked out yet today. Even a quick 30-minute session can boost your metabolism and mood!",
      priority: "low",
      icon: "🏋️",
      date: today,
      read: false,
    });
  }

  // Overtraining detection
  const consecutiveDays = getConsecutiveWorkoutDays(workoutLogs);
  if (consecutiveDays >= 5) {
    insights.push({
      id: `ai-overtrain-${today}`,
      type: "recovery",
      message: `You've trained ${consecutiveDays} days in a row! Your muscles grow during rest. Consider a light active recovery or full rest day.`,
      priority: "high",
      icon: "😴",
      date: today,
      read: false,
    });
  }

  // ── Streak Insights ──────────────────────────
  if (streak >= 7 && streak % 7 === 0) {
    insights.push({
      id: `ai-streak-${streak}`,
      type: "streak",
      message: `Incredible ${streak}-day streak! 🔥 Consistency is the #1 predictor of fitness success. You're building an unbreakable habit.`,
      priority: "medium",
      icon: "🏆",
      date: today,
      read: false,
    });
  }

  if (streak === 0 && workoutLogs.length > 0) {
    insights.push({
      id: `ai-streakbroken-${today}`,
      type: "streak",
      message: "Your streak reset! Don't worry — every champion has setbacks. Get back in the gym today and start a new one.",
      priority: "medium",
      icon: "🔄",
      date: today,
      read: false,
    });
  }

  // ── Progress Insights ──────────────────────────
  if (measurements.length >= 2) {
    const latest = measurements[measurements.length - 1];
    const previous = measurements[measurements.length - 2];
    const weightDiff = latest.weight - previous.weight;

    if (user.goal === "lose" && weightDiff < -0.5) {
      insights.push({
        id: `ai-weightloss-${today}`,
        type: "progress",
        message: `Great progress! You've lost ${Math.abs(weightDiff).toFixed(1)} kg since your last check-in. Keep up the deficit and training.`,
        priority: "medium",
        icon: "📉",
        date: today,
        read: false,
      });
    }

    if (user.goal === "gain" && weightDiff > 0.3) {
      insights.push({
        id: `ai-weightgain-${today}`,
        type: "progress",
        message: `You've gained ${weightDiff.toFixed(1)} kg since last check-in. Make sure it's coming with progressive overload in the gym!`,
        priority: "medium",
        icon: "📈",
        date: today,
        read: false,
      });
    }
  }

  // ── Volume Progression ──────────────────────────
  if (workoutLogs.length >= 4) {
    const recent2 = workoutLogs.slice(0, 2);
    const previous2 = workoutLogs.slice(2, 4);
    const recentVol = recent2.reduce((s, l) => s + l.totalVolume, 0) / 2;
    const previousVol = previous2.reduce((s, l) => s + l.totalVolume, 0) / 2;

    if (recentVol > previousVol * 1.05) {
      insights.push({
        id: `ai-volume-up-${today}`,
        type: "workout",
        message: `Your average workout volume is up ${Math.round(((recentVol - previousVol) / previousVol) * 100)}%! This progressive overload is key for muscle growth.`,
        priority: "medium",
        icon: "💪",
        date: today,
        read: false,
      });
    }
  }

  return insights;
}

function getConsecutiveWorkoutDays(logs: WorkoutLog[]): number {
  if (logs.length === 0) return 0;

  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  let count = 0;
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (uniqueDates.includes(dateStr)) {
      count++;
    } else if (i > 0) {
      break; // gap found
    }
  }

  return count;
}
