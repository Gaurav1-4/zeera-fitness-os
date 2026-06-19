import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Listing users from database...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Onboarded: ${u.onboarded}`);
    }
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
