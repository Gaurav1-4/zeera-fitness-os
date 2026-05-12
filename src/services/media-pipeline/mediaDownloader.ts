import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Downloads a media file from a URL to a temporary local file.
 * Handles the RapidAPI ExerciseDB image endpoint which requires headers.
 */
export async function downloadMedia(url: string, exerciseId: string): Promise<string> {
  const tempDir = path.join(os.tmpdir(), 'zeera-imports');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.join(tempDir, `${exerciseId}.gif`);
  
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";
  const apiKey = process.env.EXERCISE_DB_API_KEY;

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: {
      'x-rapidapi-host': apiHost,
      'x-rapidapi-key': apiKey
    }
  });

  const writer = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error: Error | null = null;
    writer.on('error', (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) {
        resolve(filePath);
      }
    });
  });
}
