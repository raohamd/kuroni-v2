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

  // 1. Fetch live streams from your primary scraper
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const scrapedSources = streamData?.sources || [];

  // 2. Define alternative video hosts and streaming servers commonly used in media platforms
  const alternativeMirrors = [
    {
      id: `server-rapid`,
      label: `RapidCloud / Vidstreaming`,
      type: "embed" as const,
      url: `https://megaplay.buzz/stream/mal/${animeId}/${currentEpisode}/sub`,
    },
    {
      id: `server-streamsb`,
      label: `StreamSB / StreamWish`,
      type: "embed" as const,
      url: `https://megaplay.buzz/stream/mal/${animeId}/${currentEpisode}/dub`,
    },
    {
      id: `server-mp4upload`,
      label: `Mp4Upload (Direct File)`,
      type: "embed" as const,
      url: `https://iframe.grandmaster.games/embed/mal/${animeId}/${currentEpisode}`,
    }
  ];

  // Merge live scraper results with alternative backend hosts to ensure high uptime
  const currentEpisodeSources = scrapedSources.length > 0 
    ? [...scrapedSources, ...alternativeMirrors] 
    : alternativeMirrors;

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
            id: `server-ep-${epNum}`,
            label: `Server 1 (Ep ${epNum})`,
            type: "embed" as const,
            url: `https://megaplay.buzz/stream/mal/${animeId}/${epNum}/sub`,
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