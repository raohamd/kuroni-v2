// lib/api/animepahe.ts

const KUUDERE_URL = 'https://kuudere-ogxv1uw2-raohamds-projects.vercel.app'; 

export async function searchAnimepahe(query: string, episodeNumber: number = 1) {
  console.log(`\n--- Searching Kuudere for ${query} Ep ${episodeNumber} ---`);

  try {
    // 1. Search for the anime 
    const searchRes = await fetch(`${KUUDERE_URL}/anime/gogoanime/${encodeURIComponent(query)}`);
    if (!searchRes.ok) {
      console.log(`Search failed with status: ${searchRes.status}`);
      return null;
    }
    const searchData = await searchRes.json();
    
    // Extract the anime ID from results
    const animeId = searchData.results?.[0]?.id;
    if (!animeId) {
      console.log("Anime not found in Kuudere search results.");
      return null;
    }
    console.log(`Found anime ID: ${animeId}`);

    // 2. Fetch the episode info list
    const infoRes = await fetch(`${KUUDERE_URL}/anime/gogoanime/info/${animeId}`);
    if (!infoRes.ok) {
      console.log(`Info fetch failed with status: ${infoRes.status}`);
      return null;
    }
    const infoData = await infoRes.json();

    // 3. Find the matching episode number
    const episode = infoData.episodes?.find((ep: any) => Number(ep.number) === Number(episodeNumber));
    if (!episode?.id) {
      console.log(`Episode ${episodeNumber} not found in episode list.`);
      return null;
    }
    console.log(`Found episode ID: ${episode.id}`);

    // 4. Fetch the actual video stream link
    const watchRes = await fetch(`${KUUDERE_URL}/anime/gogoanime/watch/${episode.id}`);
    if (!watchRes.ok) {
      console.log(`Watch fetch failed with status: ${watchRes.status}`);
      return null;
    }
    const watchData = await watchRes.json();

    // 5. Grab the m3u8 source
    const stream = watchData.sources?.find((s: any) => s.isM3U8 || s.quality === "default") || watchData.sources?.[0];

    if (stream?.url) {
      console.log("✅ Success! Got stream URL:", stream.url);
      return { streamUrl: stream.url };
    }

    console.log("No stream URL found in watch response.");
    return null;
  } catch (error) {
    console.error("Kuudere API Exception:", error);
    return null;
  }
}