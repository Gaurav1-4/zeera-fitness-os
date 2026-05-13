
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

const proLibrary = [
  // CHEST
  { name: "Barbell Bench Press", search: "barbell bench press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Shoulder impingement", "Wrist strain"], mistakes: ["Bouncing off chest", "Flaring elbows too wide"], tips: ["Drive with your legs", "Keep a slight arch in your lower back"] },
  { name: "Incline Dumbbell Press", search: "dumbbell incline bench press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Shoulder strain"], mistakes: ["Incline too steep (hits delts)", "Partial range of motion"], tips: ["Focus on the upper chest stretch", "Control the weights on the way down"] },
  { name: "Flat Dumbbell Press", search: "dumbbell bench press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Shoulder stability"], mistakes: ["Banging dumbbells at the top", "Dropping elbows too low"], tips: ["Keep shoulder blades retracted", "Squeeze chest at the top"] },
  { name: "Incline Barbell Bench Press", search: "barbell incline bench press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Front delt strain"], mistakes: ["Bar path too close to neck", "Bouncing"], tips: ["Touch the upper chest", "Tuck elbows slightly"] },
  { name: "Chest Dips", search: "chest dip", category: "push", movement: "vertical push", compound: true, beginner: false, cautions: ["Shoulder pain", "Sternum pressure"], mistakes: ["Staying too upright (hits triceps)", "Locking elbows too hard"], tips: ["Lean forward to engage chest", "Go until elbows are at 90 degrees"] },
  { name: "Cable Fly", search: "cable fly", category: "push", movement: "horizontal push", compound: false, beginner: true, cautions: ["Overstretching"], mistakes: ["Using too much weight", "Pressing instead of flying"], tips: ["Imagine hugging a large barrel", "Focus on the mind-muscle connection"] },
  { name: "Push-Up", search: "push-up", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Wrist pain"], mistakes: ["Sagging hips", "Elbows flaring 90 degrees"], tips: ["Keep core tight (plank position)", "Tuck elbows to 45 degrees"] },
  { name: "Machine Chest Press", search: "lever chest press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Fixed bar path"], mistakes: ["Seat height too low/high", "Not using full range"], tips: ["Ensure handles align with mid-chest", "Push through the palms"] },
  { name: "Pec Deck Fly", search: "butterfly", category: "push", movement: "horizontal push", compound: false, beginner: true, cautions: ["Rotator cuff strain"], mistakes: ["Bending elbows too much", "Using momentum"], tips: ["Squeeze at the center", "Slow eccentric"] },
  { name: "Decline Dumbbell Press", search: "dumbbell decline bench press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Blood pressure to head"], mistakes: ["Weights drifting over face", "Unstable legs"], tips: ["Lower dumbbells slowly", "Keep feet locked in"] },

  // BACK
  { name: "Pull-Up", search: "pull-up", category: "pull", movement: "vertical pull", compound: true, beginner: false, cautions: ["Bicep tendonitis"], mistakes: ["Using momentum/kicking", "Not getting chin over bar"], tips: ["Drive elbows down", "Engage lats before pulling"] },
  { name: "Lat Pulldown", search: "lat pulldown", category: "pull", movement: "vertical pull", compound: true, beginner: true, cautions: ["Shoulder health"], mistakes: ["Pulling behind the neck", "Leaning back too much"], tips: ["Pull towards upper chest", "Squeeze shoulder blades"] },
  { name: "Barbell Bent-Over Row", search: "barbell bent over row", category: "pull", movement: "horizontal pull", compound: true, beginner: false, cautions: ["Lower back strain"], mistakes: ["Rounding the back", "Standing too upright"], tips: ["Keep back flat/parallel to floor", "Pull bar to navel"] },
  { name: "One-Arm Dumbbell Row", search: "dumbbell one arm row", category: "pull", movement: "horizontal pull", compound: true, beginner: true, cautions: ["Shoulder rotation"], mistakes: ["Twisting the torso", "Pulling with the arm only"], tips: ["Pull the dumbbell to the hip", "Keep back flat"] },
  { name: "Seated Cable Row", search: "cable seated row", category: "pull", movement: "horizontal pull", compound: true, beginner: true, cautions: ["Low back rounding"], mistakes: ["Rocking back and forth", "Shrugging shoulders"], tips: ["Keep chest up", "Drive elbows back"] },
  { name: "Deadlift", search: "barbell deadlift", category: "legs", movement: "hinge", compound: true, beginner: false, cautions: ["Disc herniation risk"], mistakes: ["Rounding back", "Bar drifting away from shins"], tips: ["Push the floor away", "Keep bar close to body"] },
  { name: "Chest-Supported Row", search: "lever chest supported row", category: "pull", movement: "horizontal pull", compound: true, beginner: true, cautions: ["Rib pressure"], mistakes: ["Short reps", "Head position"], tips: ["Let arms hang fully at bottom", "Squeeze at top"] },
  { name: "T-Bar Row", search: "lever t-bar row", category: "pull", movement: "horizontal pull", compound: true, beginner: false, cautions: ["Lower back"], mistakes: ["Ego lifting", "Pulling with traps"], tips: ["Focus on the stretch", "Elbows out for upper back"] },
  { name: "Straight-Arm Pulldown", search: "cable straight arm pulldown", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Shoulder joint"], mistakes: ["Bending elbows", "Short range"], tips: ["Keep a slight bend in knees", "Pull through the lats"] },
  { name: "Face Pull", search: "rope face pull", category: "pull", movement: "horizontal pull", compound: false, beginner: true, cautions: ["Shoulder impingement"], mistakes: ["Pulling too high", "Using too much weight"], tips: ["Pull towards forehead", "Rotate hands outward at the end"] },

  // SHOULDERS
  { name: "Overhead Press", search: "military press", category: "push", movement: "vertical push", compound: true, beginner: false, cautions: ["Low back arching"], mistakes: ["Pushing bar forward", "Not locking out"], tips: ["Squeeze glutes and core", "Keep bar close to face"] },
  { name: "Dumbbell Shoulder Press", search: "dumbbell shoulder press", category: "push", movement: "vertical push", compound: true, beginner: true, cautions: ["Shoulder stability"], mistakes: ["Elbows flaring 90 degrees", "Arched back"], tips: ["Keep elbows slightly forward", "Press in a natural arc"] },
  { name: "Lateral Raise", search: "dumbbell lateral raise", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Supraspinatus strain"], mistakes: ["Swinging the weights", "Leading with the hands"], tips: ["Lead with the elbows", "Pinkies slightly up at the top"] },
  { name: "Rear Delt Fly", search: "dumbbell rear lateral raise", category: "pull", movement: "horizontal pull", compound: false, beginner: true, cautions: ["Shoulder joint"], mistakes: ["Using traps", "Swinging"], tips: ["Keep torso stable", "Focus on the back of the shoulder"] },
  { name: "Arnold Press", search: "arnold press", category: "push", movement: "vertical push", compound: true, beginner: true, cautions: ["Shoulder rotation"], mistakes: ["Partial rotation", "Arching back"], tips: ["Full rotation at bottom", "Smooth motion"] },
  { name: "Cable Lateral Raise", search: "cable lateral raise", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Rotator cuff"], mistakes: ["Pulling behind body", "Wrist lead"], tips: ["Constant tension", "Control the descent"] },
  { name: "Front Raise", search: "front raise", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Shoulder impingement"], mistakes: ["Going above shoulder height", "Rocking"], tips: ["Slow and controlled", "Alternate arms"] },
  { name: "Machine Shoulder Press", search: "lever shoulder press", category: "push", movement: "vertical push", compound: true, beginner: true, cautions: ["Fixed path"], mistakes: ["Wrong seat height", "Short reps"], tips: ["Handles at ear level start", "Push fully"] },
  { name: "Upright Row", search: "upright row", category: "push", movement: "vertical pull", compound: true, beginner: false, cautions: ["High shoulder risk"], mistakes: ["Pulling too high", "Narrow grip"], tips: ["Use a wider grip", "Stop at mid-chest"] },

  // BICEPS
  { name: "Barbell Curl", search: "barbell curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Wrist/Elbow strain"], mistakes: ["Swinging the bar", "Using momentum"], tips: ["Keep elbows at your sides", "Squeeze at the top"] },
  { name: "Dumbbell Curl", search: "dumbbell curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Elbow health"], mistakes: ["Partial reps", "Shoulder involvement"], tips: ["Rotate wrists at the top", "Full stretch at bottom"] },
  { name: "Hammer Curl", search: "dumbbell hammer curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Brachialis strain"], mistakes: ["Swinging", "Not full range"], tips: ["Keep palms facing each other", "Build thick forearms"] },
  { name: "Incline Dumbbell Curl", search: "dumbbell incline curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Bicep stretch risk"], mistakes: ["Head off bench", "Swinging"], tips: ["Keep shoulders back", "Focus on the peak stretch"] },
  { name: "Preacher Curl", search: "barbell preacher curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Bicep tear risk at bottom"], mistakes: ["Not full extension", "Heavy ego lifting"], tips: ["Control the weight fully", "Don't bounce at the bottom"] },
  { name: "Cable Curl", search: "cable curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Tension"], mistakes: ["Stepping too far back", "Wrist curl"], tips: ["Constant tension", "Slow eccentric"] },
  { name: "EZ-Bar Curl", search: "ez bar curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Wrist comfort"], mistakes: ["Swinging", "Traps involvement"], tips: ["Better for wrist health", "Squeeze hard"] },
  { name: "Concentration Curl", search: "dumbbell concentration curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Back posture"], mistakes: ["Not leaning forward", "Using other arm to help"], tips: ["Stabilize elbow against thigh", "Total isolation"] },
  { name: "Spider Curl", search: "barbell spider curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Chest pressure on bench"], mistakes: ["Swinging", "Short reps"], tips: ["Let arms hang vertically", "No cheating allowed"] },
  { name: "Reverse Curl", search: "barbell reverse curl", category: "pull", movement: "vertical pull", compound: false, beginner: true, cautions: ["Forearm strain"], mistakes: ["Wrist extension", "Momentum"], tips: ["Hits the brachioradialis", "Thickens forearms"] },

  // TRICEPS
  { name: "Close-Grip Bench Press", search: "barbell close grip bench press", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Wrist strain"], mistakes: ["Grip too narrow", "Flaring elbows"], tips: ["Keep elbows tucked", "Focus on tricep lockout"] },
  { name: "Tricep Pushdown", search: "cable triceps pushdown", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Elbow tendonitis"], mistakes: ["Leaning too far forward", "Moving elbows"], tips: ["Pin elbows to your sides", "Squeeze at the bottom"] },
  { name: "Overhead Dumbbell Extension", search: "dumbbell seated triceps extension", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Shoulder mobility"], mistakes: ["Elbows flaring wide", "Lowering too far"], tips: ["Keep elbows pointing up", "Full stretch"] },
  { name: "Skull Crusher", search: "barbell skull crusher", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Elbow pain"], mistakes: ["Lowering to face (dangerous)", "Moving shoulders"], tips: ["Lower to forehead/top of head", "Keep elbows parallel"] },
  { name: "Bench Dips", search: "bench dip", category: "push", movement: "vertical push", compound: true, beginner: true, cautions: ["Shoulder impingement"], mistakes: ["Shoulders rolling forward", "Partial depth"], tips: ["Stay close to the bench", "Keep chest up"] },
  { name: "Cable Overhead Extension", search: "cable overhead triceps extension", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Shoulder joint"], mistakes: ["Moving the upper arm", "Short reps"], tips: ["Focus on the stretch at the bottom", "Full lockout"] },
  { name: "Rope Pushdown", search: "cable rope triceps extension", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Elbow tendonitis"], mistakes: ["Not spreading the rope", "Momentum"], tips: ["Spread the rope at the bottom", "Hold the contraction"] },
  { name: "Single-Arm Pushdown", search: "cable one arm triceps pushdown", category: "push", movement: "vertical push", compound: false, beginner: true, cautions: ["Wrist stability"], mistakes: ["Using other hand to help", "Partial reps"], tips: ["Focus on each arm individually", "Total isolation"] },
  { name: "Diamond Push-Up", search: "diamond push-up", category: "push", movement: "horizontal push", compound: true, beginner: true, cautions: ["Wrist strain"], mistakes: ["Sagging hips", "Elbows flaring"], tips: ["Form a diamond with hands", "Keep body in a straight line"] },
  { name: "Machine Dip", search: "lever dip", category: "push", movement: "vertical push", compound: true, beginner: true, cautions: ["Shoulder pressure"], mistakes: ["Seat too low", "Shrugging"], tips: ["Keep chest up", "Control the weight"] },

  // LEGS
  { name: "Barbell Squat", search: "barbell squat", category: "legs", movement: "squat", compound: true, beginner: false, cautions: ["Knee strain", "Lower back"], mistakes: ["Heels lifting", "Knees caving in"], tips: ["Drive through your heels", "Keep chest up and core tight"] },
  { name: "Romanian Deadlift", search: "barbell romanian deadlift", category: "legs", movement: "hinge", compound: true, beginner: true, cautions: ["Hamstring tear risk"], mistakes: ["Rounding the back", "Bending knees too much"], tips: ["Hinge at the hips", "Feel the stretch in hamstrings"] },
  { name: "Leg Press", search: "leg press", category: "legs", movement: "squat", compound: true, beginner: true, cautions: ["Low back rounding"], mistakes: ["Locking knees at the top", "Butt coming off seat"], tips: ["Don't lock knees", "Feet shoulder-width apart"] },
  { name: "Walking Lunges", search: "walking lunge", category: "legs", movement: "lunge", compound: true, beginner: true, cautions: ["Knee stability"], mistakes: ["Short steps", "Knee hitting ground hard"], tips: ["Take long steps", "Keep torso upright"] },
  { name: "Bulgarian Split Squat", search: "dumbbell bulgarian split squat", category: "legs", movement: "lunge", compound: true, beginner: false, cautions: ["Balance and knee strain"], mistakes: ["Front knee over toes", "Unstable back foot"], tips: ["Focus on the front leg", "Lean slightly forward"] },
  { name: "Leg Extension", search: "lever leg extension", category: "legs", movement: "squat", compound: false, beginner: true, cautions: ["ACL pressure"], mistakes: ["Kicking the weight", "Butt off seat"], tips: ["Slow and controlled", "Squeeze at the top"] },
  { name: "Hamstring Curl", search: "lever lying leg curl", category: "legs", movement: "hinge", compound: false, beginner: true, cautions: ["Knee health"], mistakes: ["Hips lifting off bench", "Partial range"], tips: ["Keep hips pressed down", "Squeeze at the top"] },
  { name: "Goblet Squat", search: "goblet squat", category: "legs", movement: "squat", compound: true, beginner: true, cautions: ["Wrist/Forearm fatigue"], mistakes: ["Rounding back", "Weight too far forward"], tips: ["Keep weight close to chest", "Elbows inside knees at bottom"] },
  { name: "Hip Thrust", search: "hip thrust", category: "legs", movement: "hinge", compound: true, beginner: true, cautions: ["Pelvic pressure"], mistakes: ["Arching lower back", "Not tucking chin"], tips: ["Drive through heels", "Squeeze glutes at top"] },
  { name: "Calf Raise", search: "calf raise", category: "legs", movement: "squat", compound: false, beginner: true, cautions: ["Achilles strain"], mistakes: ["Bouncing", "Partial range"], tips: ["Full stretch at bottom", "Hold peak at top"] },

  // ABS
  { name: "Hanging Leg Raise", search: "hanging leg raise", category: "pull", movement: "core", compound: true, beginner: false, cautions: ["Shoulder grip", "Hip flexor dominance"], mistakes: ["Swinging", "Not curling pelvis"], tips: ["Focus on bringing knees to chest", "Control the swing"] },
  { name: "Cable Crunch", search: "cable kneeling crunch", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Low back strain"], mistakes: ["Using arms to pull", "Sitting on heels"], tips: ["Crunch with your abs, not arms", "Keep hips high"] },
  { name: "Plank", search: "front plank", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Low back pain"], mistakes: ["Sagging hips", "Looking up"], tips: ["Squeeze glutes and core", "Keep body in straight line"] },
  { name: "Ab Wheel Rollout", search: "wheel rollout", category: "push", movement: "core", compound: true, beginner: false, cautions: ["Lower back injury risk"], mistakes: ["Arching back", "Going too far too soon"], tips: ["Tuck your chin", "Don't lose core tension"] },
  { name: "Reverse Crunch", search: "reverse crunch", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Low back"], mistakes: ["Using momentum", "Legs too straight"], tips: ["Curl your pelvis up", "Slowly lower legs"] },
  { name: "Russian Twist", search: "russian twist", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Spinal rotation risk"], mistakes: ["Only moving arms", "Rounding back"], tips: ["Rotate from the torso", "Keep back flat"] },
  { name: "Mountain Climbers", search: "mountain climber", category: "push", movement: "core", compound: true, beginner: true, cautions: ["Shoulder stability"], mistakes: ["Hips too high", "Short steps"], tips: ["Maintain plank position", "Move knees towards chest"] },
  { name: "Toe Touches", search: "toe touch", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Neck strain"], mistakes: ["Pulling on neck", "Legs not vertical"], tips: ["Reach for the toes", "Exhale on the way up"] },
  { name: "Bicycle Crunch", search: "bicycle crunch", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Neck/Low back"], mistakes: ["Going too fast", "Pulling neck"], tips: ["Shoulder to opposite knee", "Slow and steady"] },
  { name: "Dead Bug", search: "dead bug", category: "push", movement: "core", compound: false, beginner: true, cautions: ["Low back"], mistakes: ["Back coming off floor", "Moving too fast"], tips: ["Press low back into floor", "Opposite arm/leg movement"] },

  // CARDIO HD UPGRADES
  { name: "Treadmill Run", search: "treadmill", category: "cardio", movement: "cardio", compound: true, beginner: true, cautions: ["Impact on joints"], mistakes: ["Holding the rails", "Heel striking"], tips: ["Maintain a slight forward lean", "Focus on mid-foot landing"] },
  { name: "Stationary Bike", search: "stationary bike", category: "cardio", movement: "cardio", compound: true, beginner: true, cautions: ["Knee positioning"], mistakes: ["Seat too low", "Rounding the back"], tips: ["Keep a steady RPM", "Engage your core for stability"] },
  { name: "Rowing Machine", search: "rowing machine", category: "cardio", movement: "cardio", compound: true, beginner: true, cautions: ["Lower back strain"], mistakes: ["Pulling with arms only", "Bending knees too early"], tips: ["Drive with legs first", "Finish with a smooth pull to the ribs"] },
  { name: "Elliptical Trainer", search: "elliptical", category: "cardio", movement: "cardio", compound: true, beginner: true, cautions: ["Repetitive strain"], mistakes: ["Staying on toes", "Using only legs"], tips: ["Keep feet flat", "Use the handles for a full-body workout"] }
];

async function populateProLibrary() {
  const apiKey = process.env.EXERCISE_DB_API_KEY;
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";

  for (const item of proLibrary) {
    try {
      console.log(`Processing Pro Exercise: ${item.name}...`);
      
      // 1. Skip if already exists and is complete
      const existing = await prisma.exercise.findUnique({
        where: { slug: generateExerciseSlug(item.name) },
        include: { media: true }
      });
      if (existing && existing.media.length > 0) {
        console.log(`  Already exists with media. Skipping.`);
        continue;
      }

      // 2. Search by name with a broader term
      const searchTerms = item.search.split(' ');
      const mainTerm = searchTerms[searchTerms.length - 1]; // e.g. "press" or "row"
      
      console.log(`  Searching API for broad term: ${mainTerm}`);
      const response = await axios.get(`https://${apiHost}/exercises/name/${encodeURIComponent(mainTerm)}`, {
        headers: { 'x-rapidapi-host': apiHost, 'x-rapidapi-key': apiKey }
      });

      if (!response.data || response.data.length === 0) {
        console.warn(`  No API match found for ${item.name}`);
        continue;
      }

      // 3. Find the best match in the results (with safety filter)
      const matches = response.data.filter((ex: any) => 
        (ex.name.toLowerCase().includes(item.search.toLowerCase()) ||
        item.search.toLowerCase().split(' ').every((word: string) => ex.name.toLowerCase().includes(word))) &&
        (ex.target.toLowerCase().includes(item.category.toLowerCase()) || 
         ex.bodyPart.toLowerCase().includes(item.category.toLowerCase()) ||
         item.category === "push" || item.category === "pull") // Broaden for PPL
      );

      if (matches.length === 0) {
        console.warn(`  No precise match found for ${item.name} in broad results.`);
        continue;
      }

      const match = matches[0];
      console.log(`  Best Match Found: ${match.name} (${match.id})`);
      const slug = generateExerciseSlug(item.name);
      
      const exercise = await prisma.exercise.upsert({
        where: { slug },
        update: {
          name: item.name,
          bodyPart: match.bodyPart,
          targetMuscle: match.target,
          secondaryMuscles: match.secondaryMuscles,
          equipment: match.equipment,
          instructions: match.instructions,
          category: item.category,
          movementPattern: item.movement,
          isCompound: item.compound,
          isBeginnerFriendly: item.beginner,
          injuryCautions: item.cautions,
          commonMistakes: item.mistakes,
          aiCoachingTips: item.tips,
          sourceId: match.id,
          updatedAt: new Date(),
        },
        create: {
          slug,
          name: item.name,
          bodyPart: match.bodyPart,
          targetMuscle: match.target,
          secondaryMuscles: match.secondaryMuscles,
          equipment: match.equipment,
          instructions: match.instructions,
          category: item.category,
          movementPattern: item.movement,
          isCompound: item.compound,
          isBeginnerFriendly: item.beginner,
          injuryCautions: item.cautions,
          commonMistakes: item.mistakes,
          aiCoachingTips: item.tips,
          sourceProvider: "ExerciseDB",
          sourceId: match.id,
        }
      });

      // Mirror Media (Forcing HD Source)
      const sourceGifUrl = `https://${apiHost}/image?exerciseId=${match.id}&resolution=720`;
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
        console.log(`  HD Media mirrored.`);
      } catch (err) {
        console.error(`  Media mirroring failed.`);
      }
    } catch (err) {
      console.error(`  Failed to process ${item.name}:`, err);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

populateProLibrary();
