import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { ExerciseCard, ExerciseModel } from './ExerciseCard';
import { ExerciseDetailModal } from './ExerciseDetailModal';

export const ExerciseSearchList: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseModel[]>([]);
  const [query, setQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseModel | null>(null);
  const [loading, setLoading] = useState(true);

  // In a full implementation, use TanStack Query here with standard stale-while-revalidate patterns
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/exercises/search?q=${query}&limit=50`);
        const data = await res.json();
        if (data.items) {
          setExercises(data.items);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchExercises();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Search Header */}
      <div className="px-4 pt-4 pb-2 sticky top-0 bg-black/80 backdrop-blur-xl z-10">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-zinc-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors text-sm"
          />
          <button className="absolute right-2 p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full transition-colors">
            <Filter size={16} />
          </button>
        </div>
        
        {/* Quick Filters (Optional) */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
          {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map(cat => (
            <button key={cat} className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-zinc-300 whitespace-nowrap hover:bg-zinc-800 transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700">
              <Search size={24} />
            </div>
            <h3 className="text-zinc-300 font-medium mb-1">No exercises found</h3>
            <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          exercises.map((ex: ExerciseModel) => (
            <ExerciseCard 
              key={ex.id} 
              exercise={ex} 
              onClick={setSelectedExercise} 
            />
          ))
        )}
      </div>

      <ExerciseDetailModal 
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};
