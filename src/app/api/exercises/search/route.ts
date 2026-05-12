import { NextResponse } from 'next/server';
import { searchExercises } from '../../../../services/exercise-engine/searchEngine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const bodyPart = searchParams.get('bodyPart') || undefined;
    const targetMuscle = searchParams.get('targetMuscle') || undefined;
    const equipment = searchParams.get('equipment') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await searchExercises({
      query,
      bodyPart,
      targetMuscle,
      equipment,
      limit,
      offset
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to search exercises:', error);
    return NextResponse.json({ error: 'Failed to search exercises' }, { status: 500 });
  }
}
