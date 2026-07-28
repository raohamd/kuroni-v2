import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";

// Replace these with your real Supabase/DB lookups
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

async function getTotalEpisodes(animeId: string): Promise<number> {
  return 14;
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ep?: string };
}) {
  const episodeSources = await getEpisodeSources(params.id);
  const totalEpisodes = await getTotalEpisodes(params.id);
  const initialEpisode = Number(searchParams.ep) || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ServerSelector
        totalEpisodes={totalEpisodes}
        episodeSources={episodeSources}
        initialEpisode={initialEpisode}
      />
    </div>
  );
}