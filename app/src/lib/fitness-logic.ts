/**
 * ZEERA Fitness Intelligence Logic
 * Scientific formulas for Metabolic Burn and Training ROI
 */

export type FitnessGoal = 'LOSE_FAT' | 'MAINTAIN' | 'BUILD_MUSCLE' | 'GAIN_STRENGTH';

export interface UserStats {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'MALE' | 'FEMALE';
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  goal: FitnessGoal;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
export const calculateBMR = (stats: UserStats): number => {
  const { weight, height, age, gender } = stats;
  if (gender === 'MALE') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export const calculateTDEE = (stats: UserStats): number => {
  const bmr = calculateBMR(stats);
  const multipliers = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725,
    VERY_ACTIVE: 1.9,
  };
  return bmr * (multipliers[stats.activityLevel] || 1.2);
};

/**
 * Sets Daily Calorie Target based on Goal
 */
export const calculateDailyTarget = (stats: UserStats): number => {
  const tdee = calculateTDEE(stats);
  switch (stats.goal) {
    case 'LOSE_FAT': return tdee - 500;
    case 'BUILD_MUSCLE': return tdee + 300;
    case 'GAIN_STRENGTH': return tdee + 200;
    default: return tdee;
  }
};

/**
 * Treadmill Calorie Burn (Scientific Formula)
 * MET = 3.5 + (0.1 * speed_m_min) + (1.8 * speed_m_min * incline_fraction)
 */
export const calculateTreadmillBurn = (
  weight: number, 
  speedKph: number, 
  inclinePercent: number, 
  minutes: number
): number => {
  const speedMetersPerMin = (speedKph * 1000) / 60;
  const inclineFraction = inclinePercent / 100;
  
  // Vo2 (ml/kg/min)
  const vo2 = 3.5 + (0.1 * speedMetersPerMin) + (1.8 * speedMetersPerMin * inclineFraction);
  
  // Convert Vo2 to METs (1 MET = 3.5 ml/kg/min)
  const mets = vo2 / 3.5;
  
  // Calories = MET * Weight(kg) * Time(hrs)
  return mets * weight * (minutes / 60);
};

/**
 * Cycling Calorie Burn (Resistance Based)
 */
export const calculateCyclingBurn = (
  weight: number,
  resistancePercent: number,
  minutes: number
): number => {
  // Estimated METs based on resistance levels
  let met = 4.0; // Light
  if (resistancePercent > 30) met = 6.0;  // Moderate
  if (resistancePercent > 60) met = 10.0; // Vigorous
  if (resistancePercent > 85) met = 14.0; // Professional/High Intensity
  
  return met * weight * (minutes / 60);
};

/**
 * Exercise ROI Calculation
 * Determines the "Value" of a movement for daily training targets
 */
export const getExerciseROI = (exercise: { isCompound: boolean, muscleGroup: string }): number => {
  if (exercise.isCompound) {
    // Huge ROI for Big Rocks (Squat, Deadlift, Bench)
    const bigRocks = ['legs', 'back', 'chest'];
    return bigRocks.includes(exercise.muscleGroup.toLowerCase()) ? 1.0 : 0.85;
  }
  return 0.6; // Isolation
};
