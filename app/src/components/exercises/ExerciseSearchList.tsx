import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { ExerciseCard, ExerciseModel } from './ExerciseCard';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { getCachedExercises, setCachedExercises } from '../../services/exercise-engine/cacheManager';

export const ExerciseSearchList: React.FC = () => {
  const [allExercises, setAllExercises] = useState<ExerciseModel[]>([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from cache first, then fetch in background (SWR pattern)
  useEffect(() => {
    const initializeExercises = async () => {
      try {
        const cached = await getCachedExercises();
        if (cached && cached.length > 0) {
          setAllExercises(cached);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load cached exercises:', err);
      }

      try {
        // Fetch a large page of exercises in a single batch to populate local cache
        const res = await fetch('/api/exercises?limit=1000');
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setAllExercises(data.items);
          await setCachedExercises(data.items);
        }
      } catch (error) {
        console.error('Failed to fetch exercises from API:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeExercises();
  }, []);

  // Instant local filtering (0ms latency, runs as the user types)
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const name = ex.name?.toLowerCase() || '';
      const target = ex.targetMuscle?.toLowerCase() || '';
      const bodyPart = ex.bodyPart?.toLowerCase() || '';
      const equip = ex.equipment?.toLowerCase() || '';
      
      const matchesQuery = !query ? true : (
        name.includes(query.toLowerCase()) ||
        target.includes(query.toLowerCase()) ||
        bodyPart.includes(query.toLowerCase()) ||
        equip.includes(query.toLowerCase())
      );

      let matchesCategory = true;
      if (activeCategory !== 'All') {
        const catLower = activeCategory.toLowerCase();
        // Match either the body part or muscle group
        matchesCategory = bodyPart === catLower || target.includes(catLower) || (
          catLower === 'legs' && (bodyPart.includes('legs') || bodyPart.includes('waist'))
        );
      }

      return matchesQuery && matchesCategory;
    });
  }, [allExercises, query, activeCategory]);

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
        
        {/* Quick Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
          {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 border rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-green-500 border-green-500 text-black font-semibold shadow-md shadow-green-500/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {loading && allExercises.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700">
              <Search size={24} />
            </div>
            <h3 className="text-zinc-300 font-medium mb-1">No exercises found</h3>
            <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredExercises.map((ex: ExerciseModel) => (
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
