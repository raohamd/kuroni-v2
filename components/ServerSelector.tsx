'use client';

import { useState } from 'react';
import { Tv, Play, ExternalLink, Film } from 'lucide-react';

interface Props {
  animeTitle: string;
  malId?: number;
  totalEpisodes?: number;
  trailerId?: string;
}

export default function ServerSelector({ animeTitle, malId, totalEpisodes = 12, trailerId }: Props) {
  const [currentEp, setCurrentEp] = useState(1);
  const tmdbId = 37854; 
  const season = 1;

  // Expanded list of alternative stream servers
  const servers = [
    { name: 'VidSrc TO', url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${currentEp}` },
    { name: 'VidSrc IN', url: `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${currentEp}` },
    { name: 'VidSrc PRO', url: `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${currentEp}` },
    { name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${currentEp}` },
    { name: 'EmbedSu', url: `https://embed.su/embed/tv/${tmdbId}/${season}/${currentEp}` },
    { name: 'SuperEmbed', url: `https://getsuperembed.link/?video_id=${tmdbId}&tmdb=1&season=${season}&episode=${currentEp}` }
  ];

  const [activeServer, setActiveServer] = useState(servers[0]);
  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div className="w-full bg-[#121218] border border-gray-800 rounded-2xl p-4 shadow-2xl">
      
      {/* Player Frame / Redirect Box */}
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-6 border border-gray-900 shadow-lg flex flex-col items-center justify-center p-6 text-center">
        <Film size={40} className="mb-3 text-purple-500" />
        <p className="font-semibold text-white mb-1">{animeTitle} - Episode {currentEp}</p>
        <p className="text-xs text-gray-400 max-w-sm mb-4">
          Streaming hosts require external player windows to bypass CORS restrictions. Click below to launch <span className="text-purple-400 font-bold">{activeServer.name}</span>.
        </p>
        <a
          href={activeServer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-purple-900/40"
        >
          <ExternalLink size={16} /> Open {activeServer.name}
        </a>
      </div>

      {/* Server Selection Grid */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Tv size={14} /> Choose Server ({servers.length} Available)
        </h4>
        <div className="flex flex-wrap gap-2">
          {servers.map((srv, idx) => (
            <button
              key={idx}
              onClick={() => setActiveServer(srv)}
              className={`py-2 px-4 text-xs font-bold rounded-lg border transition ${
                activeServer.name === srv.name
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                  : 'bg-[#1A1A24] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {srv.name}
            </button>
          ))}
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