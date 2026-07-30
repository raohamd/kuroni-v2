// app/watch/[id]/page.tsx
import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ep?: string };
}) {
  const animeId = params.id;
  const animeTitle = "frieren"; 
  const totalEpisodes = 12;
  const currentEpisode = Number(searchParams.ep) || 1;

  // 1. Fetch live active streams dynamically from the scraper
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const currentEpisodeSources = streamData?.sources || [];

  // 2. Build the episode sources array cleanly without hardcoded dead links
  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;

    return {
      episode: epNum,
      // Only populate sources for the active episode; leave others empty until selected
      sources: epNum === currentEpisode ? currentEpisodeSources : [],
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ServerSelector
        animeTitle="Frieren: Beyond Journey's End"
        malId={animeId}
        totalEpisodes={totalEpisodes}
        episodeSources={episodeSources}
        initialEpisode={currentEpisode}
      />
    </div>
  );
}