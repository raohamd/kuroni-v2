import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe";

// Replace these with your real Supabase/DB/MAL lookups
async function getAnimeInfo(animeId: string): Promise<{
  title: string;
  malId: number;
  trailerId?: string;
  totalEpisodes: number;
}> {
  return {
    title: "Bleach", // Used a real anime title so the scraper has a better chance of finding it!
    malId: Number(animeId) || 269,
    trailerId: undefined, // Removed the broken trailer ID
    totalEpisodes: 14,
  };
}

async function getEpisodeSources(animeId: string): Promise<EpisodeSources[]> {
  // We removed YouTube and Bilibili completely!
  // The sources array starts empty and waits for Animepahe.
  return [
    { episode: 1, sources: [] },
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
  const episodeSources = await getEpisodeSources(params.id);
  const initialEpisode = Number(searchParams.ep) || 1;

  // --- ANIMEPAHE LOGIC START ---
  let backupUrl = null;
  try {
    const animepaheData = await searchAnimepahe(anime.title);
    backupUrl = animepaheData?.streamUrl;
  } catch (error) {
    console.error("Failed to fetch Animepahe backup:", error);
  }

  // Inject the Animepahe link into Episode 1
  const ep1 = episodeSources.find((e) => e.episode === 1);
  if (ep1) {
    if (backupUrl) {
      // If your scraper successfully found the video
      ep1.sources.push({
        id: "animepahe-stream",
        label: "Animepahe",
        type: "m3u8",
        url: backupUrl,
      });
    } else {
      // TEST FALLBACK: If the scraper fails, load a safe test video so you can see the player working!
      ep1.sources.push({
        id: "test-stream",
        label: "Animepahe (Test Mode)",
        type: "m3u8",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Standard open-source test video
      });
    }
  }
  // --- ANIMEPAHE LOGIC END ---

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ServerSelector
        animeTitle={anime.title}
        malId={anime.malId}
        trailerId={anime.trailerId}
        totalEpisodes={anime.totalEpisodes}
        episodeSources={episodeSources}
        initialEpisode={initialEpisode}
      />
    </div>
  );
}