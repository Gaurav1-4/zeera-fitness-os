export {};

import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Testing DB connection...');
    const count = await prisma.exercise.count();
    console.log(`Found ${count} exercises in DB.`);
    
    if (count > 0) {
      const sample = await prisma.exercise.findFirst({
        include: { media: true }
      });
      console.log('Sample exercise:', JSON.stringify(sample, null, 2));
    }
  } catch (error) {
    console.error('DB Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
