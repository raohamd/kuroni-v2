'use client';

import { useEffect, useState } from 'react';
import { getTrendingAnime } from '@/lib/api/anilist';
import Link from 'next/link';
import { Sparkles, Play } from 'lucide-react';
import AIGuruModal from '@/components/AIGuruModal';
import TierBadge from '@/components/TierBadge';

export default function HomePage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    getTrendingAnime().then((data) => setTrending(data));
  }, []);

  const heroAnime = trending[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      {heroAnime && (
        <div className="relative rounded-3xl overflow-hidden mb-12 border border-gray-800 bg-[#121218]">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0B0E] via-transparent to-transparent" />
          {heroAnime.bannerImage && (
            <img
              src={heroAnime.bannerImage}
              alt="Hero"
              className="w-full h-80 object-cover opacity-40"
            />
          )}
          <div className="relative z-20 p-8 -mt-24">
            <div className="mb-3">
              <TierBadge episodesWatched={60} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-3 text-white">
              {heroAnime.title.english || heroAnime.title.romaji}
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl line-clamp-2 mb-6">
              {heroAnime.description?.replace(/<[^>]*>?/gm, '')}
            </p>
            <div className="flex gap-4">
              <Link
                href={`/watch/${heroAnime.id}`}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2 transition"
              >
                <Play size={18} /> Watch Legal Stream
              </Link>
              <button
                onClick={() => setIsAiOpen(true)}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-purple-400 border border-purple-500/30 font-bold rounded-xl flex items-center gap-2 transition"
              >
                <Sparkles size={18} /> Ask AI Guru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          🔥 Popular Legal Series
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trending.map((anime) => (
            <Link key={anime.id} href={`/anime/${anime.id}`} className="group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-[#121218] border border-gray-800">
                <img
                  src={anime.coverImage.extraLarge}
                  alt={anime.title.english || anime.title.romaji}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-yellow-400">
                  ★ {(anime.averageScore / 10).toFixed(1)}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-gray-200 group-hover:text-purple-400 truncate">
                {anime.title.english || anime.title.romaji}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Guru Modal */}
      <AIGuruModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}