
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

const mapping = [
  { app: "Flat Bench Press", search: "barbell bench press" },
  { app: "Incline Dumbbell Press", search: "dumbbell incline bench press" },
  { app: "Cable Flyes", search: "cable fly" },
  { app: "Push-Ups", search: "push-up" },
  { app: "Dumbbell Flyes", search: "dumbbell fly" },
  { app: "Barbell Rows", search: "barbell bent over row" },
  { app: "Lat Pulldowns", search: "lat pulldown" },
  { app: "Pull-Ups", search: "pull-up" },
  { app: "Seated Cable Rows", search: "cable seated row" },
  { app: "T-Bar Rows", search: "t-bar row" },
  { app: "Overhead Press", search: "barbell standing military press" },
  { app: "Lateral Raises", search: "dumbbell lateral raise" },
  { app: "Face Pulls", search: "cable face pull" },
  { app: "Arnold Press", search: "dumbbell arnold press" },
  { app: "Barbell Squats", search: "barbell squat" },
  { app: "Romanian Deadlifts", search: "barbell romanian deadlift" },
  { app: "Leg Press", search: "sled leg press" },
  { app: "Walking Lunges", search: "dumbbell walking lunge" },
  { app: "Leg Curls", search: "lever lying leg curl" },
  { app: "Barbell Curls", search: "barbell curl" },
  { app: "Tricep Pushdowns", search: "cable triceps pushdown" },
  { app: "Hammer Curls", search: "dumbbell hammer curl" },
  { app: "Skull Crushers", search: "barbell skull crusher" },
  { app: "Hanging Leg Raises", search: "hanging leg raise" },
  { app: "Cable Crunches", search: "cable kneeling crunch" },
  { app: "Planks", search: "front plank" },
  { app: "Treadmill Incline Walk", search: "walking on incline treadmill" },
  { app: "Stairmaster", search: "walking on stepmill" }
];

async function mirrorAppExercises() {
  const apiKey = process.env.EXERCISE_DB_API_KEY;
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";

  for (const item of mapping) {
    try {
      console.log(`Processing: ${item.app}...`);
      
      // 1. Check if already exists in DB with media
      const existing = await prisma.exercise.findFirst({
        where: { name: { contains: item.app, mode: 'insensitive' } },
        include: { media: true }
      });
      
      if (existing && existing.media.length > 0) {
        console.log(`  Already exists in DB with media. Skipping.`);
        continue;
      }

      console.log(`  Searching API for: ${item.search}`);
      const response = await axios.get(`https://${apiHost}/exercises/name/${encodeURIComponent(item.search)}`, {
        headers: { 'x-rapidapi-host': apiHost, 'x-rapidapi-key': apiKey }
      });

      if (!response.data || response.data.length === 0) {
        console.warn(`  No API match found for ${item.app} with search term ${item.search}`);
        continue;
      }

      const match = response.data[0];
      console.log(`  Match found: ${match.name} (${match.id})`);

      const slug = generateExerciseSlug(match.name);
      
      const exercise = await prisma.exercise.upsert({
        where: { slug },
        update: {
          name: match.name,
          bodyPart: match.bodyPart,
          targetMuscle: match.target,
          equipment: match.equipment,
          instructions: match.instructions,
          secondaryMuscles: match.secondaryMuscles,
          sourceId: match.id,
          updatedAt: new Date(),
        },
        create: {
          slug,
          name: match.name,
          bodyPart: match.bodyPart,
          targetMuscle: match.target,
          equipment: match.equipment,
          instructions: match.instructions,
          secondaryMuscles: match.secondaryMuscles,
          sourceId: match.id,
          sourceProvider: "ExerciseDB",
        }
      });

      // Mirror Media
      const sourceGifUrl = match.gifUrl || `https://${apiHost}/image?exerciseId=${match.id}&resolution=360`;
      try {
        const mirroredAssets = await mirrorMediaToZeera(sourceGifUrl, match.id);
        
        await prisma.exerciseMedia.upsert({
          where: { id: (await prisma.exerciseMedia.findFirst({ where: { exerciseId: exercise.id, type: "video" } }))?.id || "new" },
          update: {
            optimizedMp4Url: mirroredAssets.mp4Url,
            optimizedWebmUrl: mirroredAssets.webmUrl,
            thumbnailUrl: mirroredAssets.thumbnailUrl,
            url: mirroredAssets.mp4Url
          },
          create: {
            exerciseId: exercise.id,
            type: "video",
            originalGifUrl: sourceGifUrl,
            optimizedMp4Url: mirroredAssets.mp4Url,
            optimizedWebmUrl: mirroredAssets.webmUrl,
            thumbnailUrl: mirroredAssets.thumbnailUrl,
            url: mirroredAssets.mp4Url,
            sourceProvider: "ExerciseDB"
          }
        });
        console.log(`  Media mirrored.`);
      } catch (err) {
        console.error(`  Media mirroring failed.`);
      }
    } catch (err) {
      console.error(`  Failed to process ${item.app}:`, err);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

mirrorAppExercises();
