"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ChevronRight, Dumbbell, Target, Scale, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { calculateCalories, calculateMacros } from "@/lib/utils";

import { useRouter } from "next/navigation";

const steps = [
  { id: "welcome", title: "Welcome to ZEERA", subtitle: "Your fitness operating system" },
  { id: "name", title: "What's your name?", subtitle: "Let's personalize your experience" },
  { id: "body", title: "Your Body Stats", subtitle: "We'll use this to calculate your targets" },
  { id: "diet", title: "Diet Preference", subtitle: "We'll adjust your macro splits" },
  { id: "goal", title: "What's your goal?", subtitle: "This shapes your entire plan" },
  { id: "experience", title: "Gym Experience?", subtitle: "We'll adjust workout difficulty" },
  { id: "ready", title: "You're All Set!", subtitle: "Let's start your transformation" },
];

export default function OnboardingScreen() {
  const { setUser, setOnboarded, user } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.name === "Athlete" ? "" : user.name);
  const [age, setAge] = useState(String(user.age));
  const [height, setHeight] = useState(String(user.height));
  const [weight, setWeight] = useState(String(user.weight));
  const [gender, setGender] = useState<"male" | "female">(user.gender as any);
  const [dietType, setDietType] = useState(user.dietType);
  const [goal, setGoal] = useState(user.goal);
  const [experience, setExperience] = useState(user.experience);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const finish = () => {
    const w = parseFloat(weight);
    const cals = calculateCalories(w, parseFloat(height), parseInt(age), gender, "moderate", goal as any);
    const { protein, carbs, fats } = calculateMacros(cals, w, dietType as any);

    setUser({
      name: name || "Athlete",
      age: parseInt(age),
      height: parseFloat(height),
      weight: w,
      gender: gender as any,
      dietType: dietType as any,
      goal: goal as any,
      experience: experience as any,
      calorieTarget: cals,
      proteinTarget: protein,
      carbsTarget: carbs,
      fatsTarget: fats,
    });
    setOnboarded(true);
    router.push("/home");
  };

  const goalOptions = [
    { value: "lose" as const, label: "Fat Loss", desc: "Lose fat, maintain muscle", icon: "🔥", color: "border-neon-red/50 bg-neon-red/5" },
    { value: "gain" as const, label: "Muscle Gain", desc: "Build muscle, gain strength", icon: "💪", color: "border-neon-blue/50 bg-neon-blue/5" },
    { value: "maintain" as const, label: "Maintenance", desc: "Stay fit, maintain weight", icon: "⚖️", color: "border-neon-green/50 bg-neon-green/5" },
  ];

  const expOptions = [
    { value: "beginner" as const, label: "Beginner", desc: "0-6 months", icon: "🌱" },
    { value: "intermediate" as const, label: "Intermediate", desc: "6-24 months", icon: "💪" },
    { value: "advanced" as const, label: "Advanced", desc: "2+ years", icon: "🏆" },
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-16 pb-8">
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-neon-green" : i < step ? "w-4 bg-neon-green/50" : "w-4 bg-surface-lighter"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {/* Welcome */}
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-3xl gradient-neon flex items-center justify-center mb-6"
              >
                <Flame className="w-12 h-12 text-background" />
              </motion.div>
              <h1 className="text-3xl font-display font-bold text-text-primary mb-2">ZEERA</h1>
              <p className="text-text-secondary text-lg mb-2">Your Fitness Operating System</p>
              <p className="text-text-muted text-sm max-w-xs">Track workouts, nutrition, and progress in one powerful app built for the gym.</p>
            </div>
          )}

          {/* Name */}
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center">
              <User className="w-10 h-10 text-accent-light mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{steps[1].title}</h2>
              <p className="text-text-secondary text-sm mb-6">{steps[1].subtitle}</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full py-4 px-5 bg-surface rounded-xl text-text-primary text-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 border border-border/50"
              />
            </div>
          )}

          {/* Body Stats */}
          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center">
              <Scale className="w-10 h-10 text-neon-blue mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{steps[2].title}</h2>
              <p className="text-text-secondary text-sm mb-6">{steps[2].subtitle}</p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((g) => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${gender === g ? "gradient-neon text-background" : "bg-surface text-text-secondary border border-border/50"}`}
                    >{g === "male" ? "♂ Male" : "♀ Female"}</button>
                  ))}
                </div>
                {[{ label: "Age", value: age, set: setAge, ph: "24", unit: "years", min: 14, max: 100 },
                  { label: "Height", value: height, set: setHeight, ph: "175", unit: "cm", min: 120, max: 250 },
                  { label: "Weight", value: weight, set: setWeight, ph: "75", unit: "kg", min: 30, max: 200 },
                ].map((f) => (
                  <div key={f.label} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-text-secondary text-sm block">{f.label} ({f.unit})</label>
                      <span className="text-neon-green font-bold">{f.value}</span>
                    </div>
                    <input type="range" min={f.min} max={f.max} value={f.value} onChange={(e) => f.set(e.target.value)} className="w-full accent-neon-green" />
                    <input type="number" inputMode="decimal" value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full py-2 px-4 bg-surface rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 border border-border/50 hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diet Type */}
          {step === 3 && (
            <div className="flex-1 flex flex-col justify-center">
              <span className="w-10 h-10 text-neon-green mb-4 text-3xl">🥗</span>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{steps[3].title}</h2>
              <p className="text-text-secondary text-sm mb-6">{steps[3].subtitle}</p>
              <div className="space-y-3">
                {[
                  { value: "veg", label: "Vegetarian", desc: "Plant-based only" },
                  { value: "veg+egg", label: "Vegetarian + Egg", desc: "Plant-based and eggs" },
                  { value: "non-veg", label: "Non-Vegetarian", desc: "Includes meat and seafood" }
                ].map((opt) => (
                  <button key={opt.value} onClick={() => { setDietType(opt.value as any); next(); }}
                    className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${dietType === opt.value ? "border-neon-green/50 bg-neon-green/5" : "border-border/50 bg-surface"}`}
                  >
                    <p className="text-text-primary font-semibold">{opt.label}</p>
                    <p className="text-text-secondary text-xs">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goal */}
          {step === 4 && (
            <div className="flex-1 flex flex-col justify-center">
              <Target className="w-10 h-10 text-neon-green mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{steps[4].title}</h2>
              <p className="text-text-secondary text-sm mb-6">{steps[3].subtitle}</p>
              <div className="space-y-3">
                {goalOptions.map((opt) => (
                  <button key={opt.value} onClick={() => { setGoal(opt.value); next(); }}
                    className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${goal === opt.value ? opt.color : "border-border/50 bg-surface"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="text-text-primary font-semibold">{opt.label}</p>
                        <p className="text-text-secondary text-xs">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {step === 5 && (
            <div className="flex-1 flex flex-col justify-center">
              <Dumbbell className="w-10 h-10 text-neon-purple mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{steps[5].title}</h2>
              <p className="text-text-secondary text-sm mb-6">{steps[5].subtitle}</p>
              <div className="space-y-3">
                {expOptions.map((opt) => (
                  <button key={opt.value} onClick={() => { setExperience(opt.value); next(); }}
                    className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${experience === opt.value ? "border-accent/50 bg-accent/5" : "border-border/50 bg-surface"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="text-text-primary font-semibold">{opt.label}</p>
                        <p className="text-text-secondary text-xs">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ready */}
          {step === 6 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="w-20 h-20 rounded-full gradient-neon flex items-center justify-center mb-6"
              >
                <span className="text-4xl">🎯</span>
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{steps[5].title}</h2>
              <p className="text-text-secondary text-sm mb-1">{steps[5].subtitle}</p>
              <p className="text-text-muted text-xs mb-6">Your personalized plan is ready</p>
              <div className="bg-surface rounded-xl p-4 border border-border/50 w-full max-w-xs">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between"><span className="text-text-secondary text-sm">Daily Calories</span>
                    <span className="text-neon-green text-sm font-semibold">{calculateCalories(parseFloat(weight), parseFloat(height), parseInt(age), gender, "moderate", goal)} kcal</span>
                  </div>
                  <div className="flex justify-between"><span className="text-text-secondary text-sm">Protein Target</span>
                    <span className="text-neon-blue text-sm font-semibold">{Math.round(parseFloat(weight) * 2)}g</span>
                  </div>
                  <div className="flex justify-between"><span className="text-text-secondary text-sm">Goal</span>
                    <span className="text-neon-purple text-sm font-semibold capitalize">{goal === "lose" ? "Fat Loss" : goal === "gain" ? "Muscle Gain" : "Maintain"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Button */}
      {step !== 3 && step !== 4 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={step === steps.length - 1 ? finish : next}
          className="w-full py-4 rounded-xl gradient-neon text-background font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-6"
        >
          {step === steps.length - 1 ? "Let's Go!" : "Continue"}
          {step < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
        </motion.button>
      )}
    </div>
  );
}
