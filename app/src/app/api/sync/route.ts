import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profile, logs, meals, measurements } = body;

    // 1. Sync User Profile
    if (profile) {
      console.log(`[Sync] Syncing profile for user ${user.id}`);
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email!,
            name: profile.name || "Athlete",
            onboarded: true,
            age: Number(profile.age) || 24,
            height: Number(profile.height) || 175,
            weight: Number(profile.weight) || 75,
            gender: profile.gender === "male" ? "MALE" : profile.gender === "female" ? "FEMALE" : "OTHER",
            calorieTarget: Number(profile.calorieTarget) || 2000,
            proteinTarget: Number(profile.proteinTarget) || 150,
            carbsTarget: Number(profile.carbsTarget) || 200,
            fatsTarget: Number(profile.fatsTarget) || 60,
          },
          update: {
            name: profile.name || "Athlete",
            onboarded: true,
            age: Number(profile.age) || 24,
            height: Number(profile.height) || 175,
            weight: Number(profile.weight) || 75,
            gender: profile.gender === "male" ? "MALE" : profile.gender === "female" ? "FEMALE" : "OTHER",
            calorieTarget: Number(profile.calorieTarget) || 2000,
            proteinTarget: Number(profile.proteinTarget) || 150,
            carbsTarget: Number(profile.carbsTarget) || 200,
            fatsTarget: Number(profile.fatsTarget) || 60,
          },
        });
      } catch (err: any) {
        console.error("[Sync] User Upsert Error:", err.message);
        throw new Error(`Profile sync failed: ${err.message}`);
      }
    }

    // 3. Sync Meals
    if (meals && Array.isArray(meals)) {
      console.log(`[Sync] Syncing ${meals.length} meals for user ${user.id}`);
      for (const meal of meals) {
        try {
          const mealDate = new Date(meal.date);
          if (isNaN(mealDate.getTime())) continue;

          // First, upsert the FoodItem if it doesn't exist (this is simplified)
          // In a real app, we'd check against a master food library
          const foodId = meal.foodItem.id;
          await prisma.foodItem.upsert({
            where: { id: foodId },
            create: {
              id: foodId,
              name: meal.foodItem.name,
              calories: meal.foodItem.calories,
              protein: meal.foodItem.protein,
              carbs: meal.foodItem.carbs,
              fats: meal.foodItem.fats,
              servingSize: 1,
              servingUnit: meal.foodItem.servingUnit || "serving",
              category: meal.foodItem.category || "generic",
            },
            update: {
              name: meal.foodItem.name,
              calories: meal.foodItem.calories,
            }
          });

          await prisma.nutritionLog.upsert({
            where: { id: meal.id },
            create: {
              id: meal.id,
              userId: user.id,
              foodItemId: foodId,
              quantity: meal.quantity,
              mealType: meal.mealType.toUpperCase(),
              date: mealDate,
              synced: true,
            },
            update: {
              quantity: meal.quantity,
              mealType: meal.mealType.toUpperCase(),
              date: mealDate,
              synced: true,
            },
          });
        } catch (err: any) {
          console.error(`[Sync] Meal Upsert Error (ID: ${meal.id}):`, err.message);
        }
      }
    }

    // 4. Sync Body Measurements
    if (measurements && Array.isArray(measurements)) {
      console.log(`[Sync] Syncing ${measurements.length} measurements for user ${user.id}`);
      for (const m of measurements) {
        try {
          const mDate = new Date(m.date);
          if (isNaN(mDate.getTime())) continue;

          await prisma.bodyMeasurement.upsert({
            where: { id: m.id || `m-${m.date}-${user.id}` },
            create: {
              id: m.id || `m-${m.date}-${user.id}`,
              userId: user.id,
              date: mDate,
              weight: Number(m.weight),
              bodyFat: Number(m.bodyFat),
              chest: Number(m.chest) || null,
              waist: Number(m.waist) || null,
              hips: Number(m.hips) || null,
            },
            update: {
              weight: Number(m.weight),
              bodyFat: Number(m.bodyFat),
              chest: Number(m.chest) || null,
              waist: Number(m.waist) || null,
              hips: Number(m.hips) || null,
            }
          });
        } catch (err: any) {
          console.error(`[Sync] Measurement Upsert Error:`, err.message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sync API Full Error:", error);
    return NextResponse.json({ 
      error: "Sync failed", 
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: { userId: user.id },
      include: { foodItem: true },
      orderBy: { date: 'desc' },
    });

    const bodyMeasurements = await prisma.bodyMeasurement.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ 
      profile: userProfile, 
      logs: workoutLogs, 
      meals: nutritionLogs, 
      measurements: bodyMeasurements 
    });
  } catch (error: any) {
    console.error("Sync GET API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
