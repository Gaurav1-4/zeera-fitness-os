import { prisma } from '../../lib/prisma';

export async function searchExercises(options: {
  query?: string;
  bodyPart?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}) {
  const { query, bodyPart, muscle, equipment, difficulty, limit = 20, offset = 0 } = options;

  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { targetMuscle: { contains: query, mode: 'insensitive' } },
      { bodyPart: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (bodyPart) where.bodyPart = bodyPart;
  if (muscle) where.targetMuscle = muscle;
  if (equipment) where.equipment = equipment;
  if (difficulty) where.difficulty = difficulty;

  const [total, exercises] = await Promise.all([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        media: true,
      },
      orderBy: [
        { qualityScore: 'desc' },
        { name: 'asc' },
      ],
    })
  ]);

  return {
    total,
    items: exercises,
    hasMore: offset + limit < total
  };
}
