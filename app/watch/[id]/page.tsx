import { getAnimeDetails } from '@/lib/api/anilist';
import ServerSelector from '@/components/ServerSelector';

export default async function WatchPage({ params }: { params: { id: string } }) {
  const anime = await getAnimeDetails(params.id);

  if (!anime) {
    return <div className="p-12 text-center text-gray-500">Anime stream unavailable.</div>;
  }

  const title = anime.title.english || anime.title.romaji;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black mb-6 text-white">{title}</h1>
      
      <ServerSelector 
        animeTitle={title} 
        malId={anime.idMal} 
        trailerId={anime.trailer?.id} // Make sure this is passed!
      />
    </div>
  );
}