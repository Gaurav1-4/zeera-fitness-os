import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const apiKey = process.env.EXERCISE_DB_API_KEY;
  const apiHost = process.env.EXERCISE_DB_HOST || "exercisedb.p.rapidapi.com";

  if (!apiKey) {
    return new Response('API Key missing', { status: 500 });
  }

  // Use the discovered image endpoint for the justin-WFnsXH_t6 API
  const url = `https://${apiHost}/image?exerciseId=${id}&resolution=360`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`ExerciseDB Media Error: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/gif';
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Failed to proxy media:', error);
    return new Response('Failed to load media', { status: 500 });
  }
}
