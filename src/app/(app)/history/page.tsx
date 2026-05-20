"use client";
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryPage() {
  const { workoutLogs, meals, measurements } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we already have data in store, skip fetch; otherwise pull from API.
    if (workoutLogs.length && meals.length && measurements.length) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const data = await res.json();
          // Safely and reactively set Zustand state
          const store = useAppStore.getState();
          useAppStore.setState({
            workoutLogs: Array.isArray(data.logs) ? data.logs : store.workoutLogs,
            meals: Array.isArray(data.meals) ? data.meals : store.meals,
            measurements: Array.isArray(data.measurements) ? data.measurements : store.measurements,
          });
        }
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-dvh bg-background p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-display font-bold text-text-primary mb-6"
      >
        Your History
      </motion.h1>

      {loading && (
        <div className="text-center text-text-muted">Loading...</div>
      )}

      {/* Workout History */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Workouts</h2>
        {workoutLogs.length ? (
          <ul className="space-y-4">
            {workoutLogs.map((log) => (
              <li key={log.id} className="bg-surface rounded-xl p-4 shadow-neon-green/10">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">{log.workoutName}</span>
                  <span className="text-text-muted">{new Date(log.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 text-sm text-text-secondary">
                  Duration: {Math.round(log.duration / 60)} min • Calories: {log.caloriesBurned ?? '—'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No workout logs yet.</p>
        )}
      </section>

      {/* Nutrition History */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Nutrition</h2>
        {meals.length ? (
          <ul className="space-y-4">
            {meals.map((meal) => (
              <li key={meal.id} className="bg-surface rounded-xl p-4 shadow-neon-green/10">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">{meal.foodItem.name}</span>
                  <span className="text-text-muted">{new Date(meal.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 text-sm text-text-secondary">
                  {meal.quantity}× {meal.foodItem.servingSize}{meal.foodItem.servingUnit} – {meal.foodItem.calories} kcal
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No nutrition logs yet.</p>
        )}
      </section>

      {/* Measurement History */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Body Measurements</h2>
        {measurements.length ? (
          <ul className="space-y-4">
            {measurements.map((m) => (
              <li key={m.date} className="bg-surface rounded-xl p-4 shadow-neon-green/10">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">{new Date(m.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 text-sm text-text-secondary">
                  Weight: {m.weight}kg{m.bodyFat ? ` • BF: ${m.bodyFat}%` : ''}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No measurements logged yet.</p>
        )}
      </section>
    </div>
  );
}
