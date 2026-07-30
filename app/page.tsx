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

  // Fetch all active servers for the current episode from the scraper
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const currentEpisodeSources = streamData?.sources || [];

  // Build the episode sources array dynamically for the grid
  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;

    if (epNum === currentEpisode) {
      return {
        episode: epNum,
        sources: currentEpisodeSources,
      };
    } else {
      return {
        episode: epNum,
        sources: [
          {
            id: `placeholder-${epNum}`,
            label: "Server 1",
            type: "embed" as const,
            url: "pending",
          },
        ],
      };
    }
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