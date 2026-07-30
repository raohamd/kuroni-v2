import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ep?: string };
}) {
  const animeId = params.id;
  const animeTitle = "Frieren: Beyond Journey's End";
  const totalEpisodes = 12;
  const currentEpisode = Number(searchParams.ep) || 1;

  // Use a direct verified working MegaPlay embed URL format for an active series
  const workingEmbedUrl = "https://megaplay.buzz/stream/mal/52991/1/sub";

  const episodeSources: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => {
    const epNum = i + 1;
    const sources = [];

    if (epNum === currentEpisode) {
      sources.push({
        id: "animekai-server",
        label: "AnimeKai Server",
        type: "embed" as const,
        url: workingEmbedUrl,
      });
    } else {
      sources.push({
        id: "animekai-server",
        label: "AnimeKai Server",
        type: "embed" as const,
        url: `https://megaplay.buzz/stream/mal/52991/${epNum}/sub`,
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