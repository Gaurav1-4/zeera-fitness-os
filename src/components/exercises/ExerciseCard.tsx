import React from 'react';
import { motion } from 'framer-motion';
import { getThumbnailUrl } from '../../services/exercise-engine/mediaOptimizer';

export interface ExerciseModel {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  bodyPart: string;
  media?: { url: string; type: string; }[];
  instructions?: string[];
  tips?: string[];
}

interface ExerciseCardProps {
  exercise: ExerciseModel;
  onClick: (exercise: ExerciseModel) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  const media = exercise.media?.[0];
  const thumbnailUrl = media ? getThumbnailUrl(media.url) : '/placeholder-exercise.jpg';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(exercise)}
      className="flex items-center gap-4 p-3 bg-zinc-900 rounded-2xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
        {/* Using standard img for faster rendering in lists, could use Next Image if configured */}
        <img 
          src={thumbnailUrl} 
          alt={exercise.name} 
          className="w-full h-full object-cover opacity-90"
          loading="lazy"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-zinc-100 font-semibold text-base truncate capitalize">
          {exercise.name}
        </h3>
        <p className="text-zinc-400 text-sm truncate capitalize">
          {exercise.targetMuscle} • {exercise.equipment}
        </p>
      </div>
    </motion.div>
  );
};
