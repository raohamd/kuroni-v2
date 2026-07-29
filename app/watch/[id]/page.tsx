import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe"; // We'll keep the function name the same so it doesn't break

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ep?: string };
}) {
  const malId = Number(params.id) || 269;
  const animeTitle = "Bleach"; // Hardcoded just to test the scraper!
  const totalEpisodes = 14;
  
  // Get the current episode from the URL (defaults to 1)
  const currentEpisode = Number(searchParams.ep) || 1;

  // 1. Fetch the real stream URL for the specific episode we clicked!
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const realVideoUrl = streamData?.streamUrl;

  // 2. Build the episode list for the UI
  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;

    // If this is the episode we clicked AND the scraper found a video:
    if (epNum === currentEpisode && realVideoUrl) {
      return {
        episode: epNum,
        sources: [
          {
            id: "gogoanime-stream",
            label: "Gogoanime",
            type: "m3u8",
            url: realVideoUrl,
          }
        ]
      };
    }

    // Otherwise, fall back to the safe test video
    return {
      episode: epNum,
      sources: [
        {
          id: "test-stream",
          label: "Gogoanime (Test Mode)",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        }
      ]
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