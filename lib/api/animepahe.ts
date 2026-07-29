// lib/api/animepahe.ts

// TODO: Put your two deployed Vercel URLs here!
const KUUDERE_URL = 'https://kuroni-v2-muf2-gr62rd122-raohamds-projects.vercel.app/'; 
const ANIKOTO_URL = 'https://kuroni-v2-muf2-gr62rd122-raohamds-projects.vercel.app/'; 

// --- 1. Helper function for Kuudere ---
async function fetchFromKuudere(query: string, episodeNumber: number) {
  try {
    const searchRes = await fetch(`${KUUDERE_URL}/animepahe/search?query=${encodeURIComponent(query)}`);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    
    const animeId = searchData.results?.[0]?.id;
    if (!animeId) return null;

    const infoRes = await fetch(`${KUUDERE_URL}/animepahe/info/${animeId}`);
    if (!infoRes.ok) return null;
    const infoData = await infoRes.json();

    const episode = infoData.episodes?.find((ep: any) => ep.number === episodeNumber);
    if (!episode?.id) return null;

    const watchRes = await fetch(`${KUUDERE_URL}/animepahe/watch/${episode.id}`);
    if (!watchRes.ok) return null;
    const watchData = await watchRes.json();

    const stream = watchData.sources?.find((s: any) => s.isM3U8) || watchData.sources?.[0];
    return stream?.url ? { streamUrl: stream.url } : null;
  } catch (error) {
    console.error("Kuudere failed:", error);
    return null;
  }
}

// --- 2. Helper function for Anikoto ---
async function fetchFromAnikoto(query: string, episodeNumber: number) {
  try {
    const searchRes = await fetch(`${ANIKOTO_URL}/anime/animepahe/${encodeURIComponent(query)}`);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    
    const animeId = searchData.results?.[0]?.id;
    if (!animeId) return null;

    const infoRes = await fetch(`${ANIKOTO_URL}/anime/animepahe/info/${animeId}`);
    if (!infoRes.ok) return null;
    const infoData = await infoRes.json();

    const episode = infoData.episodes?.find((ep: any) => ep.number === episodeNumber);
    if (!episode?.id) return null;

    const watchRes = await fetch(`${ANIKOTO_URL}/anime/animepahe/watch/${episode.id}`);
    if (!watchRes.ok) return null;
    const watchData = await watchRes.json();

    const stream = watchData.sources?.find((s: any) => s.isM3U8) || watchData.sources?.[0];
    return stream?.url ? { streamUrl: stream.url } : null;
  } catch (error) {
    console.error("Anikoto failed:", error);
    return null;
  }
}

// --- 3. Main Exported Function (The Master Switch) ---
export async function searchAnimepahe(query: string, episodeNumber: number = 1) {
  console.log(`Searching for ${query} Episode ${episodeNumber}...`);

  // Attempt 1: Try Kuudere API
  const kuudereResult = await fetchFromKuudere(query, episodeNumber);
  if (kuudereResult) {
    console.log("Success! Found video via Kuudere API.");
    return kuudereResult;
  }

  console.log("Kuudere missed. Trying Anikoto API as backup...");

  // Attempt 2: If Kuudere fails, try Anikoto API
  const anikotoResult = await fetchFromAnikoto(query, episodeNumber);
  if (anikotoResult) {
    console.log("Success! Found video via Anikoto API.");
    return anikotoResult;
  }

  // If both fail, return null (which triggers your test video)
  console.log("Both APIs failed to find the video.");
  return null;
}