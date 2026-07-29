import ServerSelector, { EpisodeSources } from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe";

// ----------------------------------------------------------------------
// 1. YOUR NORMAL DATA FETCHING
// (Replace the mock data inside here with your actual database/API fetch)
// ----------------------------------------------------------------------
async function fetchAnimeData(id: string) {
  // TODO: Replace these hardcoded values with your actual TMDB/MAL/Database call
  const animeTitle = "Fullmetal Alchemist";
  const totalEpisodes = 14;
  const trailerId = "dQw4w9WgXcQ"; // Example YouTube trailer ID

  // Generating mock episodes to simulate your working YouTube/Bilibili sources
  const mappedEpisodes: EpisodeSources[] = Array.from({ length: totalEpisodes }, (_, i) => ({
    episode: i + 1,
    sources: [
      {
        id: `yt-${i + 1}`,
        label: "YouTube",
        type: "youtube",
        videoId: "dQw4w9WgXcQ", // Replace with your real DB video ID
      },
      {
        id: `bili-${i + 1}`,
        label: "Bilibili",
        type: "bilibili",
        videoId: "BV1xx411c7mD", // Replace with your real DB bvid
        page: 1,
      }
    ],
  }));

  return {
    title: animeTitle,
    totalEpisodes,
    trailerId,
    episodes: mappedEpisodes,
  };
}

// ----------------------------------------------------------------------
// 2. MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default async function WatchPage({ params }: { params: { id: string } }) {
  // A. Fetch your base anime data (YouTube/Bilibili)
  const animeData = await fetchAnimeData(params.id);

  // B. Fetch the backup stream in the background from your deployed scraper API
  let backupUrl = null;
  try {
    const animepaheData = await searchAnimepahe(animeData.title);
    backupUrl = animepaheData?.streamUrl; 
  } catch (error) {
    console.error("Failed to fetch Animepahe backup:", error);
  }

  // C. Inject the Animepahe link into the episodes array so the frontend sees it
  // (In this example, we push it to Episode 1. If your scraper returns an array of 
  // episodes, you can map through all of them here!)
  if (backupUrl) {
    const ep1 = animeData.episodes.find((e) => e.episode === 1);
    if (ep1) {
      ep1.sources.push({
        id: "backup-animepahe",
        label: "Backup (Animepahe)",
        type: "m3u8",
        url: backupUrl,
      });
    }
  }
  console.log("YouTube ID:", animeData.episodes[0].sources[0].videoId);
console.log("Animepahe Backup URL:", backupUrl);

return (
  <main className="container mx-auto p-4 max-w-5xl mt-6">
      <ServerSelector
        animeTitle={animeData.title}
        malId={params.id}
        trailerId={animeData.trailerId}
        totalEpisodes={animeData.totalEpisodes}
        episodeSources={animeData.episodes} 
      />
    </main>
  );
}