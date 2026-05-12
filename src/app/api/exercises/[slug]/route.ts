import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const exercise = await prisma.exercise.findUnique({
      where: { slug },
      include: {
        media: true,
        instructionSteps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error(`Failed to fetch exercise:`, error);
    return NextResponse.json({ error: 'Failed to fetch exercise' }, { status: 500 });
  }
}
