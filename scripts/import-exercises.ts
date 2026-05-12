import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';
import { generateExerciseSlug } from '../src/services/exercise-engine/slugGenerator';
import { mirrorMediaToZeera } from '../src/services/media-pipeline/mediaPipeline';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MIRROR_MEDIA = process.env.MIRROR_MEDIA === 'true';

interface ExerciseDBItem {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl?: string;
  instructions: string[];
  secondaryMuscles: string[];
  description?: string;
  difficulty?: string;
}

async function fetchAllExercises(): Promise<ExerciseDBItem[]> {
  const apiKey = process.env.EXERCISE_DB_API_KEY;
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";

  if (!apiKey) {
    throw new Error("EXERCISE_DB_API_KEY is missing.");
  }

  console.log('Fetching all exercises from ExerciseDB...');
  // Note: Most ExerciseDB versions use limit=1300 to get everything or require pagination
  const response = await axios.get(`https://${apiHost}/exercises?limit=1500`, {
    headers: {
      'x-rapidapi-host': apiHost,
      'x-rapidapi-key': apiKey
    }
  });

  return response.data;
}

/**
 * Enriches the basic ExerciseDB data with ZEERA specific metadata.
 */
function enrichData(item: ExerciseDBItem) {
  const name = item.name.toLowerCase();
  
  // Basic heuristics for enrichment
  let movementPattern = 'Other';
  if (name.includes('press')) movementPattern = 'Push';
  if (name.includes('row') || name.includes('pull')) movementPattern = 'Pull';
  if (name.includes('squat')) movementPattern = 'Squat';
  if (name.includes('deadlift') || name.includes('hinge')) movementPattern = 'Hinge';
  if (name.includes('lunge')) movementPattern = 'Lunge';
  if (name.includes('crunch') || name.includes('plank')) movementPattern = 'Core';

  let mechanics = 'Isolation';
  if (['squat', 'deadlift', 'bench press', 'overhead press', 'row'].some(k => name.includes(k))) {
    mechanics = 'Compound';
  }

  return {
    movementPattern,
    mechanics,
    difficulty: item.difficulty || 'Beginner',
    exerciseType: 'Strength',
    injuryRisk: 'Low'
  };
}

async function importExercises() {
  try {
    const exercises = await fetchAllExercises();
    console.log(`Fetched ${exercises.length} exercises. Starting processing...`);

    let imported = 0;
    let mirrored = 0;

    for (const item of exercises) {
      const slug = generateExerciseSlug(item.name);
      const enrichment = enrichData(item);

      console.log(`[${imported + 1}/${exercises.length}] Processing: ${item.name}`);

      // 1. Create or Update Exercise
      const exercise = await prisma.exercise.upsert({
        where: { slug },
        update: {
          name: item.name,
          bodyPart: item.bodyPart,
          targetMuscle: item.target,
          equipment: item.equipment,
          instructions: item.instructions,
          secondaryMuscles: item.secondaryMuscles,
          ...enrichment,
          sourceId: item.id,
          updatedAt: new Date(),
        },
        create: {
          slug,
          name: item.name,
          bodyPart: item.bodyPart,
          targetMuscle: item.target,
          equipment: item.equipment,
          instructions: item.instructions,
          secondaryMuscles: item.secondaryMuscles,
          ...enrichment,
          sourceId: item.id,
          sourceProvider: "ExerciseDB",
        }
      });

      // 2. Handle Media Mirroring
      if (MIRROR_MEDIA) {
        const existingMedia = await prisma.exerciseMedia.findFirst({
          where: { exerciseId: exercise.id, optimizedMp4Url: { not: null } }
        });

        if (!existingMedia) {
          try {
            const sourceGifUrl = item.gifUrl || `https://${process.env.EXERCISE_DB_HOST}/image?exerciseId=${item.id}&resolution=360`;
            const mirroredAssets = await mirrorMediaToZeera(sourceGifUrl, item.id);
            
            await prisma.exerciseMedia.create({
              data: {
                exerciseId: exercise.id,
                type: "video",
                originalGifUrl: sourceGifUrl,
                optimizedMp4Url: mirroredAssets.mp4Url,
                optimizedWebmUrl: mirroredAssets.webmUrl,
                thumbnailUrl: mirroredAssets.thumbnailUrl,
                url: mirroredAssets.mp4Url, // Legacy support
                sourceProvider: "ExerciseDB"
              }
            });
            mirrored++;
          } catch (err) {
            console.error(`Media mirroring failed for ${item.name}, skipping media...`);
          }
        } else {
          try {
            const sourceGifUrl = item.gifUrl || `https://${process.env.EXERCISE_DB_HOST}/image?exerciseId=${item.id}&resolution=360`;
            const mirroredAssets = await mirrorMediaToZeera(sourceGifUrl, item.id);
            
            await prisma.exerciseMedia.update({
              where: { id: existingMedia.id },
              data: {
                optimizedMp4Url: mirroredAssets.mp4Url,
                optimizedWebmUrl: mirroredAssets.webmUrl,
                thumbnailUrl: mirroredAssets.thumbnailUrl,
                url: mirroredAssets.mp4Url
              }
            });
            mirrored++;
          } catch (err) {
            console.error(`Media update failed for ${item.name}...`);
          }
        }
      }

      // 3. Instruction Steps
      await prisma.exerciseInstruction.deleteMany({ where: { exerciseId: exercise.id } });
      await prisma.exerciseInstruction.createMany({
        data: item.instructions.map((inst, idx) => ({
          exerciseId: exercise.id,
          stepNumber: idx + 1,
          instruction: inst,
          type: "execution"
        }))
      });

      imported++;
    }

    console.log(`Import finished. Exercises: ${imported}, Mirrored: ${mirrored}`);
  } catch (error) {
    console.error("Import failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

importExercises();
