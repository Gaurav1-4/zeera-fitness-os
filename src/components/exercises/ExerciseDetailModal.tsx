import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ExerciseModel } from './ExerciseCard';

interface ExerciseDetailModalProps {
  exercise: ExerciseModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, isOpen, onClose }) => {
  if (!exercise) return null;

  const media = exercise.media?.[0];
  const videoUrl = media?.optimizedMp4Url || media?.url;
  const thumbnailUrl = media?.thumbnailUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-xl bg-zinc-900 rounded-t-[32px] sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle (Visual) */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-zinc-800" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Media Header */}
            <div className="relative aspect-square w-full bg-black">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  poster={thumbnailUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-8 bg-zinc-950">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                    {exercise.difficulty || 'Beginner'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    {exercise.mechanics || 'Compound'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white capitalize leading-tight">
                  {exercise.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Target</p>
                  <p className="text-zinc-200 font-medium capitalize">{exercise.targetMuscle}</p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Equipment</p>
                  <p className="text-zinc-200 font-medium capitalize">{exercise.equipment}</p>
                </div>
              </div>

              <div className="space-y-8 pb-12">
                {exercise.instructions && exercise.instructions.length > 0 && (
                  <section>
                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      Instructions
                    </h4>
                    <div className="space-y-4">
                      {exercise.instructions.map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {idx + 1}
                          </span>
                          <p className="text-zinc-400 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {exercise.tips && exercise.tips.length > 0 && (
                  <section>
                    <h4 className="text-white font-bold text-lg mb-4">Expert Tips</h4>
                    <ul className="space-y-2 text-zinc-400 text-sm list-disc pl-4">
                      {exercise.tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
