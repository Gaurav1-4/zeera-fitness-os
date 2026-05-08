import { Workout } from "@/lib/types";
import { exercises } from "./exercises";

const findEx = (id: string) => exercises.find((e) => e.id === id)!;
const makeSet = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `s${i}`,
    reps: 0,
    weight: 0,
    completed: false,
    type: "normal" as const,
    rpe: 8,
  }));

export const workoutPlans: Workout[] = [
  {
    id: "w1",
    name: "Push Day",
    description: "Chest, Shoulders & Triceps",
    targetMuscles: ["chest", "shoulders", "arms"],
    estimatedDuration: 60,
    difficulty: "intermediate",
    day: "Monday",
    exercises: [
      { exerciseId: "ex1", exercise: findEx("ex1"), sets: makeSet(4), restTime: 120, previousBest: { weight: 60, reps: 8 } },
      { exerciseId: "ex2", exercise: findEx("ex2"), sets: makeSet(3), restTime: 90, previousBest: { weight: 22, reps: 10 } },
      { exerciseId: "ex3", exercise: findEx("ex3"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex11", exercise: findEx("ex11"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex12", exercise: findEx("ex12"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex21", exercise: findEx("ex21"), sets: makeSet(3), restTime: 60 },
    ],
  },
  {
    id: "w2",
    name: "Pull Day",
    description: "Back & Biceps",
    targetMuscles: ["back", "arms"],
    estimatedDuration: 55,
    difficulty: "intermediate",
    day: "Tuesday",
    exercises: [
      { exerciseId: "ex6", exercise: findEx("ex6"), sets: makeSet(4), restTime: 120 },
      { exerciseId: "ex7", exercise: findEx("ex7"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex9", exercise: findEx("ex9"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex13", exercise: findEx("ex13"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex20", exercise: findEx("ex20"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex22", exercise: findEx("ex22"), sets: makeSet(3), restTime: 60 },
    ],
  },
  {
    id: "w3",
    name: "Leg Day",
    description: "Quads, Hamstrings & Glutes",
    targetMuscles: ["legs"],
    estimatedDuration: 65,
    difficulty: "intermediate",
    day: "Wednesday",
    exercises: [
      { exerciseId: "ex15", exercise: findEx("ex15"), sets: makeSet(4), restTime: 150 },
      { exerciseId: "ex17", exercise: findEx("ex17"), sets: makeSet(3), restTime: 120 },
      { exerciseId: "ex16", exercise: findEx("ex16"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex18", exercise: findEx("ex18"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex19", exercise: findEx("ex19"), sets: makeSet(3), restTime: 60 },
    ],
  },
  {
    id: "w4",
    name: "Upper Body",
    description: "Full Upper Body Workout",
    targetMuscles: ["chest", "back", "shoulders", "arms"],
    estimatedDuration: 60,
    difficulty: "intermediate",
    day: "Thursday",
    exercises: [
      { exerciseId: "ex1", exercise: findEx("ex1"), sets: makeSet(3), restTime: 120 },
      { exerciseId: "ex6", exercise: findEx("ex6"), sets: makeSet(3), restTime: 120 },
      { exerciseId: "ex14", exercise: findEx("ex14"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex7", exercise: findEx("ex7"), sets: makeSet(3), restTime: 90 },
      { exerciseId: "ex20", exercise: findEx("ex20"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex21", exercise: findEx("ex21"), sets: makeSet(3), restTime: 60 },
    ],
  },
  {
    id: "w5",
    name: "Core & Cardio",
    description: "Abs & Fat Burning",
    targetMuscles: ["abs", "cardio"],
    estimatedDuration: 40,
    difficulty: "beginner",
    day: "Friday",
    exercises: [
      { exerciseId: "ex24", exercise: findEx("ex24"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex25", exercise: findEx("ex25"), sets: makeSet(3), restTime: 60 },
      { exerciseId: "ex26", exercise: findEx("ex26"), sets: makeSet(3), restTime: 45 },
      { exerciseId: "ex27", exercise: findEx("ex27"), sets: makeSet(1), restTime: 0 },
    ],
  },
];
