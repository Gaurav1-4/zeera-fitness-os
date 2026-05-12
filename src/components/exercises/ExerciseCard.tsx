import React from 'react';
import { motion } from 'framer-motion';
import { getThumbnailUrl } from '../../services/exercise-engine/mediaOptimizer';

export interface ExerciseModel {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  bodyPart: string;
  media?: { url: string; type: string; thumbnailUrl?: string }[];
  instructions?: string[];
  tips?: string[];
}

interface ExerciseCardProps {
  exercise: ExerciseModel;
  onClick: (exercise: ExerciseModel) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  const media = exercise.media?.[0];
  const thumbnailUrl = media?.thumbnailUrl || '/placeholder-exercise.jpg';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(exercise)}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex items-center p-3 gap-4"
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
        <img
          src={thumbnailUrl}
          alt={exercise.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold truncate capitalize">{exercise.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{exercise.bodyPart}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{exercise.equipment}</span>
        </div>
      </div>

      <div className="text-zinc-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </motion.div>
  );
};
