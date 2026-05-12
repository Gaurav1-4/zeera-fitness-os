
import dotenv from 'dotenv';
dotenv.config();

async function testProxy() {
  const apiKey = process.env.EXERCISE_DB_API_KEY;
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";
  const id = "0011";
  const url = `https://${apiHost}/image?exerciseId=${id}&resolution=360`;

  console.log(`Testing proxy to: ${url}`);
  console.log(`Using API Key: ${apiKey?.substring(0, 5)}...`);

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey || ''
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('Success! Image fetched.');
    } else {
      const text = await response.text();
      console.log(`Error body: ${text}`);
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testProxy();
