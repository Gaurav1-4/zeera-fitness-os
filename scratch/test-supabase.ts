export {};

async function testSupabaseMedia() {
  const url = "https://zzwyxdegwtpsuipfvbch.supabase.co/storage/v1/object/public/exercise-media/thumbnails/0011.jpg";
  console.log(`Testing Supabase Media: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('Success! Media is public.');
    } else {
      console.log('Error: Media is not accessible.');
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

testSupabaseMedia();
