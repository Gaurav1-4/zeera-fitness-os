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
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          name: profile.name || "Athlete",
          onboarded: true,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender === "male" ? "MALE" : profile.gender === "female" ? "FEMALE" : "OTHER",
          calorieTarget: profile.calorieTarget,
          proteinTarget: profile.proteinTarget,
          carbsTarget: profile.carbsTarget,
          fatsTarget: profile.fatsTarget,
        },
        update: {
          name: profile.name || "Athlete",
          onboarded: true,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender === "male" ? "MALE" : profile.gender === "female" ? "FEMALE" : "OTHER",
          calorieTarget: profile.calorieTarget,
          proteinTarget: profile.proteinTarget,
          carbsTarget: profile.carbsTarget,
          fatsTarget: profile.fatsTarget,
        },
      });
    }

    // 2. Sync Workout Logs
    if (logs && Array.isArray(logs)) {
      for (const log of logs) {
        // Upsert log
        await prisma.workoutLog.upsert({
          where: { id: log.id },
          create: {
            id: log.id,
            userId: user.id,
            name: log.workoutName || "Workout",
            date: new Date(log.date),
            duration: log.duration,
            totalVolume: log.totalVolume || 0,
            caloriesBurned: log.caloriesBurned || 0,
            isCompleted: log.completed || true,
            synced: true,
          },
          update: {
            name: log.workoutName || "Workout",
            date: new Date(log.date),
            duration: log.duration,
            totalVolume: log.totalVolume || 0,
            caloriesBurned: log.caloriesBurned || 0,
            isCompleted: log.completed || true,
            synced: true,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
