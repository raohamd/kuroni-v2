import ServerSelector from "@/components/ServerSelector";
import { searchAnimepahe } from "@/lib/api/animepahe"; // 1. Import your new helper

export default async function WatchPage({ params }: { params: { id: string } }) {
  // 2. Fetch your normal YouTube/Bilibili data (however you currently do it)
  // Let's pretend it's stored in a variable called `mappedEpisodes`
  const mappedEpisodes = await getYourNormalAnimeData(params.id); 
  const animeTitle = "Fullmetal Alchemist"; // Get the actual title

  // 3. Fetch the backup stream in the background
  const animepaheData = await searchAnimepahe(animeTitle);
  const backupUrl = animepaheData?.streamUrl; // Adjust based on exactly what your API returns!

  // 4. Inject the Animepahe link into Episode 1's sources (or map through all episodes)
  if (backupUrl) {
    const ep1 = mappedEpisodes.find((e: any) => e.episode === 1);
    if (ep1) {
      ep1.sources.push({
        id: "backup-animepahe",
        label: "Backup (Animepahe)",
        type: "m3u8", // This tells the UI to use your new HLS Player!
        url: backupUrl,
      });
    }
  }

  // 5. Pass the updated data to the selector
  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <ServerSelector
        animeTitle={animeTitle}
        malId={params.id}
        totalEpisodes={14}
        episodeSources={mappedEpisodes} // <--- Animepahe is now secretly inside here!
      />
    </main>
  );
}