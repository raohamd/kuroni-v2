import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ep?: string };
}) {
  const malId = Number(params.id) || 269;
  const animeTitle = "Bleach"; // Hardcoded title to test your scraper
  const totalEpisodes = 14;
  
  // Get the current episode from the URL (defaults to 1)
  const currentEpisode = Number(searchParams.ep) || 1;

  // Fetch the real stream URL from your deployed Kuudere API for this specific episode
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const realVideoUrl = streamData?.streamUrl;

  // Build the episode sources array dynamically
  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;
    const sources = [];

    // If this episode has a real video URL from your scraper, add it!
    if (epNum === currentEpisode && realVideoUrl) {
      sources.push({
        id: "gogoanime-stream",
        label: "Gogoanime",
        type: "m3u8" as const,
        url: realVideoUrl,
      });
    } 
    // OPTIONAL: If you want to keep the test video fallback just in case an episode fails, keep this block. Otherwise, leave sources empty `[]`.
    else if (epNum === 1 && !realVideoUrl) {
      sources.push({
        id: "test-stream",
        label: "Gogoanime (Test Mode)",
        type: "m3u8" as const,
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
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
        malId={malId}
        totalEpisodes={totalEpisodes}
        episodeSources={episodeSources}
        initialEpisode={currentEpisode}
      />
    </div>
  );
}