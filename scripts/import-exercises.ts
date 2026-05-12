import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { generateExerciseSlug } from '../src/services/exercise-engine/slugGenerator';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ExerciseDBItem {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions: string[];
  secondaryMuscles: string[];
}

async function fetchAllExercises(): Promise<ExerciseDBItem[]> {
  const apiKey = process.env.EXERCISE_DB_API_KEY;
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";

  if (!apiKey) {
    throw new Error("EXERCISE_DB_API_KEY is missing from environment variables.");
  }

  console.log('Fetching exercises from ExerciseDB...');
  // Limiting to 100 for now to avoid huge payload, but you can set limit=0 or higher
  const response = await fetch(`https://${apiHost}/exercises?limit=1000`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': apiHost,
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API Error: ${response.statusText}`);
  }

  return response.json();
}

async function importExercises() {
  try {
    const exercises = await fetchAllExercises();
    console.log(`Fetched ${exercises.length} exercises from API.`);

    let imported = 0;
    let skipped = 0;

    for (const item of exercises) {
      const slug = generateExerciseSlug(item.name);

      // Check if already exists by slug
      const existing = await prisma.exercise.findUnique({
        where: { slug }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Upsert to ensure we don't duplicate
      await prisma.exercise.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: item.name,
          bodyPart: item.bodyPart,
          targetMuscle: item.target,
          equipment: item.equipment,
          difficulty: "Beginner", // default value as ExerciseDB lacks this
          instructions: item.instructions || [],
          secondaryMuscles: item.secondaryMuscles || [],
          tips: [],
          
          media: {
            create: {
              type: "gif",
              url: item.gifUrl || `/api/exercises/media/${item.id}`,
              source: "ExerciseDB",
            }
          },
          instructionSteps: {
            create: (item.instructions || []).map((inst, index) => ({
              stepNumber: index + 1,
              instruction: inst
            }))
          }
        }
      });
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`Imported ${imported} exercises...`);
      }
    }

    console.log(`Import complete! Imported: ${imported}, Skipped: ${skipped}`);
  } catch (error) {
    console.error("Failed to import exercises:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importExercises();
