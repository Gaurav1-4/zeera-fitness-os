import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getOptimizedMediaUrl } from '../../services/exercise-engine/mediaOptimizer';
import { ExerciseModel } from './ExerciseCard';

interface ExerciseDetailModalProps {
  exercise: ExerciseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, isOpen, onClose }) => {
  if (!exercise) return null;

  const media = exercise.media?.[0];
  const mediaUrl = media ? getOptimizedMediaUrl(media.url, media.type) : '/placeholder-exercise.jpg';

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-zinc-950 rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl border-t border-zinc-800"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 150 || velocity.y > 500) {
                onClose();
              }
            }}
          >
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto my-4 flex-shrink-0" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="overflow-y-auto pb-safe flex-1">
              {/* Media Section */}
              <div className="w-full aspect-square bg-white relative">
                <img 
                  src={mediaUrl} 
                  alt={exercise.name} 
                  className="w-full h-full object-contain mix-blend-multiply p-4" 
                />
              </div>

              {/* Details Section */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white capitalize mb-2">{exercise.name}</h2>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm font-medium rounded-full capitalize border border-green-500/20">
                    {exercise.targetMuscle}
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full capitalize border border-zinc-700">
                    {exercise.equipment}
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full capitalize border border-zinc-700">
                    {exercise.bodyPart}
                  </span>
                </div>

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
                    <div className="space-y-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                      {exercise.instructions.map((step: string, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-zinc-400 leading-relaxed text-sm">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {exercise.tips && exercise.tips.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Expert Tips</h3>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                      {exercise.tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
