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
    const { profile, logs } = body;

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

    // 2. Sync Workout Logs
    if (logs && Array.isArray(logs)) {
      console.log(`[Sync] Syncing ${logs.length} logs for user ${user.id}`);
      for (const log of logs) {
        try {
          const logDate = new Date(log.date);
          if (isNaN(logDate.getTime())) {
            console.warn(`[Sync] Skipping log ${log.id} due to invalid date: ${log.date}`);
            continue;
          }

          await prisma.workoutLog.upsert({
            where: { id: log.id },
            create: {
              id: log.id,
              userId: user.id,
              name: log.workoutName || "Workout",
              date: logDate,
              duration: Math.floor(Number(log.duration)) || 0,
              totalVolume: Number(log.totalVolume) || 0,
              caloriesBurned: Math.floor(Number(log.caloriesBurned)) || 0,
              isCompleted: log.completed ?? true,
              synced: true,
            },
            update: {
              name: log.workoutName || "Workout",
              date: logDate,
              duration: Math.floor(Number(log.duration)) || 0,
              totalVolume: Number(log.totalVolume) || 0,
              caloriesBurned: Math.floor(Number(log.caloriesBurned)) || 0,
              isCompleted: log.completed ?? true,
              synced: true,
            },
          });
        } catch (err: any) {
          console.error(`[Sync] Log Upsert Error (ID: ${log.id}):`, err.message);
          // Don't throw here, continue with other logs
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

    return NextResponse.json({ profile: userProfile, logs: workoutLogs });
  } catch (error: any) {
    console.error("Sync GET API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
