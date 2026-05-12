import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchOptions {
  query?: string;
  bodyPart?: string;
  targetMuscle?: string;
  equipment?: string;
  limit?: number;
  offset?: number;
}

export async function searchExercises(options: SearchOptions) {
  const { query, bodyPart, targetMuscle, equipment, limit = 20, offset = 0 } = options;

  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { slug: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (bodyPart) {
    where.bodyPart = { equals: bodyPart, mode: 'insensitive' };
  }

  if (targetMuscle) {
    where.targetMuscle = { equals: targetMuscle, mode: 'insensitive' };
  }

  if (equipment) {
    where.equipment = { equals: equipment, mode: 'insensitive' };
  }

  const [total, exercises] = await Promise.all([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        media: true,
      },
      orderBy: {
        name: 'asc'
      }
    })
  ]);

  return {
    total,
    items: exercises,
    hasMore: offset + limit < total
  };
}
