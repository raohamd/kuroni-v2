// lib/api/animepahe.ts

const KUUDERE_URL = 'https://kuudere-api-one.vercel.app'; 
const ANIKOTO_URL = 'https://anikoto-api-five.vercel.app'; 

// A single helper function that works for BOTH of your APIs
async function fetchFromApi(baseUrl: string, query: string, episodeNumber: number) {
  try {
    // 1. Search for the anime using Gogoanime (much more reliable than Animepahe)
    const searchRes = await fetch(`${baseUrl}/anime/gogoanime/${encodeURIComponent(query)}`);
    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`);
    const searchData = await searchRes.json();
    
    const animeId = searchData.results?.[0]?.id;
    if (!animeId) throw new Error("Anime not found in search results");

    // 2. Fetch the episodes list
    const infoRes = await fetch(`${baseUrl}/anime/gogoanime/info/${animeId}`);
    if (!infoRes.ok) throw new Error(`Info failed: ${infoRes.status}`);
    const infoData = await infoRes.json();

    // 3. Find the specific episode ID
    const episode = infoData.episodes?.find((ep: any) => Number(ep.number) === Number(episodeNumber));
    if (!episode?.id) throw new Error(`Episode ${episodeNumber} not found`);

    // 4. Fetch the streaming links
    const watchRes = await fetch(`${baseUrl}/anime/gogoanime/watch/${episode.id}`);
    if (!watchRes.ok) throw new Error(`Watch failed: ${watchRes.status}`);
    const watchData = await watchRes.json();

    // 5. Find the highest quality stream (usually marked 'default', 'auto', or isM3U8)
    const stream = watchData.sources?.find((s: any) => s.quality === "default" || s.quality === "auto" || s.isM3U8) || watchData.sources?.[0];

    return stream?.url ? { streamUrl: stream.url } : null;
  } catch (error) {
    console.log(`Failed on ${baseUrl}:`, (error as Error).message);
    return null;
  }
}

// The master function your frontend calls
export async function searchAnimepahe(query: string, episodeNumber: number = 1) {
  console.log(`\n--- Searching for ${query} Ep ${episodeNumber} ---`);

  // Attempt 1: Try Kuudere API
  const kuudereResult = await fetchFromApi(KUUDERE_URL, query, episodeNumber);
  if (kuudereResult) {
    console.log("✅ Success! Found video via Kuudere API.");
    return kuudereResult;
  }

  console.log("⚠️ Kuudere failed. Trying Anikoto API as backup...");

  // Attempt 2: Try Anikoto API
  const anikotoResult = await fetchFromApi(ANIKOTO_URL, query, episodeNumber);
  if (anikotoResult) {
    console.log("✅ Success! Found video via Anikoto API.");
    return anikotoResult;
  }

  console.log("❌ Both APIs failed. Loading test video.");
  return null;
}