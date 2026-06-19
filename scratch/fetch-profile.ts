import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'gauravgoyal2112007@gmail.com' },
      include: {
        preferences: true,
        bodyMeasurements: { orderBy: { date: 'desc' }, take: 1 },
        workoutPlans: {
          include: {
            days: {
              include: {
                exercises: {
                  include: { exercise: true }
                }
              }
            }
          }
        },
        goals: true,
        streaks: true,
        recoveryLogs: { orderBy: { date: 'desc' }, take: 5 },
      }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
