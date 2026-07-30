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
  
  // Change test title to "frieren" — currently airing shows have active, working streams
  const animeTitle = "frieren"; 
  const totalEpisodes = 12;
  const currentEpisode = Number(searchParams.ep) || 1;

  // Fetch the real stream URL from AnimeKAI
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const realVideoUrl = streamData?.streamUrl;

  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;
    const sources = [];

    if (epNum === currentEpisode && realVideoUrl) {
      sources.push({
        id: "animekai-server",
        label: "AnimeKai Server",
        type: "embed" as const,
        url: realVideoUrl,
      });
    }

    return {
      episode: epNum,
      sources,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ServerSelector
        animeTitle={animeTitle}
        malId={animeId}
        totalEpisodes={totalEpisodes}
        episodeSources={episodeSources}
        initialEpisode={currentEpisode}
      />
    </div>
  );
}