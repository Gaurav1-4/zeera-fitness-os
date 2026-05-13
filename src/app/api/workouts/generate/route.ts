
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { 
      selectedExerciseIds, 
      cardioType, 
      goal, 
      experience,
      userWeight,
      calorieTarget,
      strengthTarget
    } = await req.json();

    // Fetch exercise details
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: selectedExerciseIds } }
    });

    const prompt = `
      You are a world-class AI Fitness Coach. Generate a personalized workout plan based on the following:
      
      GOAL: ${goal} (e.g., Fat Loss, Muscle Gain)
      EXPERIENCE: ${experience}
      USER WEIGHT: ${userWeight}kg
      DAILY CALORIE BURN TARGET: ${calorieTarget} kcal
      SELECTED EXERCISES: ${exercises.map(e => e.name).join(', ')}
      CARDIO TYPE: ${cardioType}

      SCIENTIFIC REQUIREMENTS:
      1. CALORIE CALCULATION: Use the MET formula [Calories = MET * Weight(kg) * Time(hrs)]. 
         Approx METs: Treadmill(8), Cycling(7.5), Rowing(7), Stairmaster(9), Elliptical(5).
         Calculate the exact duration (minutes) for the ${cardioType} to burn approximately ${calorieTarget} kcal, but cap it at 45 mins for safety.
      
      2. STRENGTH PROGRAMMING: 
         - If goal is FAT LOSS: Use 3-4 sets, 12-15 reps, 45s rest. High intensity, high density.
         - If goal is STRENGTH: Use 4-5 sets, 3-5 reps, 180s rest. Focus on mechanical tension.
         - If goal is MUSCLE GAIN: Use 3 sets, 8-12 reps, 90s rest. Focus on metabolic stress.
      
      3. BIOMECHANICAL ORDER: Order the strength exercises from most demanding (compound) to least demanding (isolation).
      
      4. AI COACHING: Provide specific cues for each exercise to prevent common injuries.

      Output the plan in the following JSON format:
      {
        "planName": "Personalized ${goal} Session",
        "description": "...",
        "warmup": {
          "exercise": "${cardioType}",
          "durationMinutes": 10,
          "intensity": "Moderate",
          "estimatedCalories": 100
        },
        "exercises": [
          {
            "exerciseId": "...",
            "name": "...",
            "sets": 3,
            "reps": "8-12",
            "restSeconds": 90,
            "coachingTips": "..."
          }
        ],
        "analysis": {
          "totalEstimatedTime": 60,
          "totalEstimatedCalories": 400,
          "goalAlignment": "..."
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from markdown if needed
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
    const plan = JSON.parse(jsonString);

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
