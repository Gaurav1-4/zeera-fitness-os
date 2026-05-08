"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Dumbbell, PieChart, TrendingUp, User, Bug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAIInsights, useStreakCalculator, useDailyReset } from "@/hooks/useSmartEngine";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { onboarded, isSuperAdmin, addBug, clearDemoData } = useAppStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [bugText, setBugText] = useState("");
  const [showBugModal, setShowBugModal] = useState(false);
  
  useEffect(() => {
    setIsHydrated(useAppStore.persist.hasHydrated());
    if (useAppStore.persist.hasHydrated()) clearDemoData();
    const unsub = useAppStore.persist.onFinishHydration(() => {
      clearDemoData();
      setIsHydrated(true);
    });
    return () => unsub();
  }, []);

  // Background engines
  useOfflineSync();
  useAIInsights();
  useStreakCalculator();
  useDailyReset();

  useEffect(() => {
    if (isHydrated && !onboarded) {
      router.push("/onboarding");
    }
  }, [isHydrated, onboarded, router]);

  if (!isHydrated || !onboarded) {
    return (
      <div className="h-dvh w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/home" },
    { id: "workout", icon: Dumbbell, label: "Workout", path: "/workout" },
    { id: "nutrition", icon: PieChart, label: "Nutrition", path: "/nutrition" },
    { id: "progress", icon: TrendingUp, label: "Progress", path: "/progress" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="min-h-full pb-24"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Super Admin Bug Reporter */}
      {isSuperAdmin && (
        <>
          <button
            onClick={() => setShowBugModal(true)}
            className="fixed bottom-24 right-6 w-12 h-12 bg-neon-red text-white rounded-full shadow-lg shadow-neon-red/20 flex items-center justify-center z-50 active:scale-95 transition-transform"
          >
            <Bug className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showBugModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-surface rounded-2xl p-5 w-full max-w-sm border border-border/50"
                >
                  <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Bug className="w-4 h-4 text-neon-red" /> Report a Bug
                  </h3>
                  <textarea
                    autoFocus
                    value={bugText}
                    onChange={(e) => setBugText(e.target.value)}
                    placeholder="Describe the issue you found..."
                    className="w-full h-32 bg-background border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-neon-red/50 resize-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBugModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (bugText.trim()) {
                          addBug(bugText.trim());
                          setBugText("");
                          setShowBugModal(false);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-neon-red text-white text-sm font-semibold shadow-lg shadow-neon-red/20"
                    >
                      Save Bug
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-surface/80 backdrop-blur-xl border-t border-border/50 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              >
                <div className={`relative z-10 transition-colors duration-300 ${isActive ? "text-neon-green" : "text-text-muted"}`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${isActive ? "text-neon-green" : "text-text-muted"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-neon-green/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
