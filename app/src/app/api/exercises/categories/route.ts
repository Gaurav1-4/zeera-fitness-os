import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    // Get unique body parts, target muscles, and equipment
    const [bodyParts, targetMuscles, equipment] = await Promise.all([
      prisma.exercise.findMany({ select: { bodyPart: true }, distinct: ['bodyPart'] }),
      prisma.exercise.findMany({ select: { targetMuscle: true }, distinct: ['targetMuscle'] }),
      prisma.exercise.findMany({ select: { equipment: true }, distinct: ['equipment'] })
    ]);

    return NextResponse.json({
      bodyParts: bodyParts.map(bp => bp.bodyPart).filter(Boolean),
      targetMuscles: targetMuscles.map(tm => tm.targetMuscle).filter(Boolean),
      equipment: equipment.map(e => e.equipment).filter(Boolean)
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
