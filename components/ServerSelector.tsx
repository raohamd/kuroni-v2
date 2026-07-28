'use client';

import { useState } from 'react';
import { Tv, Play, ExternalLink, Film } from 'lucide-react';

interface Props {
  animeTitle: string;
  malId?: number;
  totalEpisodes?: number;
  trailerId?: string; // YouTube Trailer ID
}

export default function ServerSelector({ animeTitle, malId, totalEpisodes = 12, trailerId }: Props) {
  const [currentEp, setCurrentEp] = useState(1);
  const tmdbId = 37854; 
  const season = 1;

  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div className="w-full bg-[#121218] border border-gray-800 rounded-2xl p-4 shadow-2xl">
      
      {/* Video Player / Official Trailer Container */}
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-6 border border-gray-900 shadow-lg">
        {trailerId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=0&rel=0`}
            title={`${animeTitle} Trailer`}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
            <Film size={40} className="mb-3 text-purple-500" />
            <p className="font-semibold text-white mb-1">Streaming Embed Restricted</p>
            <p className="text-xs text-gray-500 max-w-sm mb-4">
              Third-party hosts block direct embedding on Vercel. Use the secure player links below to watch Episode {currentEp}.
            </p>
            <a
              href={`https://vidsrc.to/embed/tv/${tmdbId}/${season}/${currentEp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition shadow-md"
            >
              <ExternalLink size={14} /> Open Episode {currentEp} in Player Window
            </a>
          </div>
        )}
      </div>

      {/* Quick External Fallback Links */}
      <div className="mb-6 bg-[#1A1A24] p-3 rounded-xl border border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <Tv size={14} className="text-purple-400" /> External Stream Providers:
        </span>
        <div className="flex gap-2">
          <a 
            href={`https://vidsrc.to/embed/tv/${tmdbId}/${season}/${currentEp}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-xs bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white px-3 py-1.5 rounded-md border border-purple-500/30 transition"
          >
            VidSrc TO ↗
          </a>
          <a 
            href={`https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${currentEp}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-xs bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white px-3 py-1.5 rounded-md border border-purple-500/30 transition"
          >
            MultiEmbed ↗
          </a>
        </div>
      </div>

      {/* Episode Grid */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Play size={14} /> Episodes ({totalEpisodes})
        </h4>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto pr-2">
          {episodeList.map((ep) => (
            <button
              key={ep}
              onClick={() => setCurrentEp(ep)}
              className={`py-2 text-xs font-bold rounded-md border transition ${
                currentEp === ep
                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-[#1A1A24] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {ep}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}