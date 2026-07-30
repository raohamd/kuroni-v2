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

  // 1. Attempt to fetch live streams from the primary scraper
  const streamData = await searchAnimepahe(animeTitle, currentEpisode);
  const scrapedSources = streamData?.sources || [];

  // 2. Define robust high-availability 2026 backup embed mirrors
  // These serve as reliable alternative servers if the primary source fails or returns 410
  const fallbackMirrors = [
    {
      id: `server-backup-1-sub`,
      label: `Primary Mirror (SUB)`,
      type: "embed" as const,
      url: `https://megaplay.buzz/stream/mal/${animeId}/${currentEpisode}/sub`,
    },
    {
      id: `server-backup-2-dub`,
      label: `Backup Mirror (DUB)`,
      type: "embed" as const,
      url: `https://megaplay.buzz/stream/mal/${animeId}/${currentEpisode}/dub`,
    },
    {
      id: `server-backup-3`,
      label: `Community Mirror (HD)`,
      type: "embed" as const,
      url: `https://iframe.grandmaster.games/embed/mal/${animeId}/${currentEpisode}`,
    }
  ];

  // Merge scraped sources with fallback mirrors so users always have working options
  const currentEpisodeSources = scrapedSources.length > 0 
    ? [...scrapedSources, ...fallbackMirrors] 
    : fallbackMirrors;

  // Build the episode sources array dynamically for the grid
  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;

    if (epNum === currentEpisode) {
      return {
        episode: epNum,
        sources: currentEpisodeSources,
      };
    } else {
      // Light placeholder for other episodes so the episode grid remains fully interactive
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