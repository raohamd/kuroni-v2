import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";

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