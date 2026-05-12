"use client";

import { ExerciseSearchList } from '../../components/exercises/ExerciseSearchList';

export default function ExercisesPage() {
  return (
    <main className="h-screen bg-black">
      <div className="pt-12 px-4 pb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Exercises</h1>
        <p className="text-zinc-400 mt-1">Browse and search our entire exercise library</p>
      </div>
      <div className="h-[calc(100vh-100px)]">
        <ExerciseSearchList />
      </div>
    </main>
  );
}
