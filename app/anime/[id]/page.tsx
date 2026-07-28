import { getAnimeDetails } from '@/lib/api/anilist';
import Link from 'next/link';
import { Play, Star, Film } from 'lucide-react';

export default async function AnimeDetailsPage({ params }: { params: { id: string } }) {
  const anime = await getAnimeDetails(params.id);

  if (!anime) {
    return <div className="p-12 text-center text-gray-500">Anime details not found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 bg-[#121218] border border-gray-800 rounded-3xl p-6">
        <div className="w-full md:w-64 shrink-0">
          <img
            src={anime.coverImage.extraLarge}
            alt={anime.title.english || anime.title.romaji}
            className="w-full rounded-2xl shadow-xl border border-gray-800"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black mb-2 text-white">
            {anime.title.english || anime.title.romaji}
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4">
            <span className="flex items-center gap-1 text-yellow-400">
              <Star size={14} /> {(anime.averageScore / 10).toFixed(1)}
            </span>
            <span>{anime.episodes || '?'} Episodes</span>
            <span className="uppercase border border-gray-800 px-2 py-0.5 rounded text-purple-400">
              {anime.status}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {anime.description?.replace(/<[^>]*>?/gm, '')}
          </p>

          <Link
            href={`/watch/${anime.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition"
          >
            <Play size={18} /> Watch Legal Stream
          </Link>
        </div>
      </div>
    </div>
  );
}