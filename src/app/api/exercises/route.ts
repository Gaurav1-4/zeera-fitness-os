import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const exercises = await prisma.exercise.findMany({
      take: limit,
      skip: offset,
      include: {
        media: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    const total = await prisma.exercise.count();

    return NextResponse.json({
      items: exercises,
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}
