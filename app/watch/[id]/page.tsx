import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe"; // <-- 1. Import added here

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
    trailerId: "dQw4w9WgXcQ", // YouTube trailer video id, or undefined if none
    totalEpisodes: 14,
  };
}

async function getEpisodeSources(animeId: string): Promise<EpisodeSources[]> {
  // Example shape — fetch this from your DB mapping table instead
  return [
    {
      episode: 1,
      sources: [
        { id: "yt-1", label: "YouTube", type: "youtube", videoId: "dQw4w9WgXcQ" },
        { id: "bili-1", label: "Bilibili", type: "bilibili", videoId: "BV1xx411c7XX" },
      ],
    },
    { episode: 2, sources: [] }, // not yet officially available
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

  // --- NEW ANIMEPAHE LOGIC START ---
  let backupUrl = null;
  try {
    const animepaheData = await searchAnimepahe(anime.title);
    backupUrl = animepaheData?.streamUrl;
  } catch (error) {
    console.error("Failed to fetch Animepahe backup:", error);
  }

  // Inject the Backup link into Episode 1
  if (backupUrl) {
    const ep1 = episodeSources.find((e) => e.episode === 1);
    if (ep1) {
      ep1.sources.push({
        id: "backup-animepahe",
        label: "Backup (Animepahe)",
        type: "m3u8",
        url: backupUrl,
      });
    }
  }
  // --- NEW ANIMEPAHE LOGIC END ---

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