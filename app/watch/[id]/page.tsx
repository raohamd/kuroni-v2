// app/watch/[id]/page.tsx (or your exact watch path)

import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";

// Replace this with your actual deployed AnimepaheApi backend base URL
const ANIMEPAHE_API_URL = "https://vercel.app";

// Helper function to resolve Animepahe links for a specific anime query and episode
async function fetchAnimepaheSources(searchQuery: string, currentEpisode: number) {
  try {
    // 1. Search for the anime ID on Animepahe using the title string
    const searchRes = await fetch(`${ANIMEPAHE_API_URL}/api/search?q=${encodeURIComponent(searchQuery)}`, { next: { revalidate: 3600 } });
    if (!searchRes.ok) return [];
    
    const searchData = await searchRes.json();
    const primaryResult = searchData?.results?.[0]; // Grab the best match match
    if (!primaryResult) return [];

    // 2. Fetch the concrete streaming link for the current required episode
    const streamRes = await fetch(`${ANIMEPAHE_API_URL}/api/watch/${primaryResult.session}/${currentEpisode}`);
    if (!streamRes.ok) return [];

    const streamData = await streamRes.json();
    
    // 3. Map the scraped .m3u8 stream options into your existing array structure
    return streamData.sources.map((src: any, index: number) => ({
      id: `pahe-${currentEpisode}-${index}`,
      label: `Animepahe (${src.resolution}p)`,
      type: "hls", // Mark it as an HLS video stream instead of a platform embed
      videoId: src.url, // Pass the .m3u8 source URL directly down as the videoId
    }));
  } catch (err) {
    console.error("Failed to fetch alternative Animepahe streams:", err);
    return [];
  }
}

// Replace these with your real Supabase/DB/MAL lookups
async function getAnimeInfo(animeId: string): Promise<{
  title: string;
  malId: number;
  trailerId?: string;
  totalEpisodes: number;
}> {
  return {
    title: "Example Anime Title",
    malId: 12345,
    trailerId: "dQw4w9WgXcQ", 
    totalEpisodes: 14,
  };
}

async function getEpisodeSources(animeId: string): Promise<EpisodeSources[]> {
  return [
    {
      episode: 1,
      sources: [
        { id: "yt-1", label: "YouTube", type: "youtube", videoId: "dQw4w9WgXcQ" },
        { id: "bili-1", label: "Bilibili", type: "bilibili", videoId: "BV1xx411c7XX" },
      ],
    },
    { episode: 2, sources: [] }, 
  ];
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ep?: string };
}) {
  const anime = await getAnimeInfo(params.id);
  const dbEpisodeSources = await getEpisodeSources(params.id);
  const initialEpisode = Number(searchParams.ep) || 1;

  // 1. Fetch Animepahe stream sources on the server for the currently requested episode
  const paheSources = await fetchAnimepaheSources(anime.title, initialEpisode);

  // 2. Inject Animepahe streams dynamically into your episode lookup mapping array
  const combinedEpisodeSources = dbEpisodeSources.map((epSource) => {
    if (epSource.episode === initialEpisode) {
      return {
        ...epSource,
        sources: [...epSource.sources, ...paheSources], // Append new scraper links to YouTube/Bilibili array
      };
    }
    return epSource;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ServerSelector
        animeTitle={anime.title}
        malId={anime.malId}
        trailerId={anime.trailerId}
        totalEpisodes={anime.totalEpisodes}
        episodeSources={combinedEpisodeSources} // Pass the newly combined stream array here
        initialEpisode={initialEpisode}
      />
    </div>
  );
}
