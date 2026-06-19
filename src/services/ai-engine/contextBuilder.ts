import { prisma } from '@/lib/prisma';

export async function buildUserContext(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      goals: true,
      streaks: {
        where: { type: 'workout' }
      },
      workoutLogs: {
        orderBy: { date: 'desc' },
        take: 3,
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: true
            }
          }
        }
      },
      nutritionLogs: {
        orderBy: { date: 'desc' },
        take: 10, // today and yesterday
        include: {
          foodItem: true
        }
      },
      bodyMeasurements: {
        orderBy: { date: 'desc' },
        take: 1
      }
    }
  });

  if (!user) return 'User context not found.';

  const latestWeight = user.bodyMeasurements[0]?.weight || user.weight || 'unknown';
  const workoutStreak = user.streaks[0]?.currentStreak || 0;

  // Format workout history
  const workoutHistory = user.workoutLogs.length > 0
    ? user.workoutLogs.map(log => {
        return `- ${log.date.toISOString().split('T')[0]}: ${log.name} (Duration: ${log.duration}s, Volume: ${log.totalVolume}kg)`;
      }).join('\n')
    : 'No recent workouts recorded.';

  const context = `
=== USER PROFILE ===
Name: ${user.name}
Age: ${user.age || 'Unknown'}
Gender: ${user.gender || 'Unknown'}
Height: ${user.height || 'Unknown'} cm
Weight: ${latestWeight} kg
Goal: ${user.goal || 'Unknown'}
Experience Level: ${user.experience || 'Unknown'}

=== NUTRITION TARGETS ===
Calories: ${user.calorieTarget || 0} kcal
Protein: ${user.proteinTarget || 0} g
Carbs: ${user.carbsTarget || 0} g
Fats: ${user.fatsTarget || 0} g
Water: ${user.waterTarget || 8} glasses

=== PROGRESS ===
Current Workout Streak: ${workoutStreak} days

=== RECENT WORKOUTS ===
${workoutHistory}
`;

  return context.trim();
}
