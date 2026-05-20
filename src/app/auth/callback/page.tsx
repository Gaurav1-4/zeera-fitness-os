 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAppStore } from "@/lib/store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      // Ensure session is ready
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      // Fetch sync data
      try {
        const res = await fetch("/api/sync");
        if (res.ok) {
          const { profile, logs, meals, measurements } = await res.json();
          if (profile) {
            useAppStore.getState().setUser({
              name: profile.name,
              age: profile.age,
              height: profile.height,
              weight: profile.weight,
              gender: profile.gender?.toLowerCase(),
              calorieTarget: profile.calorieTarget,
              proteinTarget: profile.proteinTarget,
              carbsTarget: profile.carbsTarget,
              fatsTarget: profile.fatsTarget,
            });
            useAppStore.getState().setOnboarded(profile.onboarded);
          }
        }
      } catch (err) {
        console.error("Failed to sync after OAuth", err);
      }
      router.replace("/home");
    };
    init();
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center h-dvh">
      <p className="text-text-primary">Signing you in…</p>
    </div>
  );
}
