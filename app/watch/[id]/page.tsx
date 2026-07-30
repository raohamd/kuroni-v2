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
  
  // Use the actual search query based on the anime ID or name
  // For testing, let's use a popular active title or map it dynamically
  const animeTitle = "frieren"; 
  const totalEpisodes = 12;
  const currentEpisode = Number(searchParams.ep) || 1;

  // Scrape the live working stream URL from AnimeKAI dynamically
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const realVideoUrl = streamData?.streamUrl || "";

  // Build the episode sources array dynamically using the scraped link
  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;
    const sources = [];

    // If this is the current episode, assign the live scraped stream URL
    const urlToUse = epNum === currentEpisode ? realVideoUrl : "pending";

    sources.push({
      id: "animekai-server",
      label: "AnimeKai Server",
      type: "embed" as const,
      url: urlToUse,
    });

    return {
      episode: epNum,
      sources,
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