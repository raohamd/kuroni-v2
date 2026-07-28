'use client';

import { useState } from 'react';
import { Tv, Play, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  animeTitle: string;
  malId?: number;
  totalEpisodes?: number;
  trailerId?: string;
}

export default function ServerSelector({ animeTitle, malId, totalEpisodes = 12 }: Props) {
  const [currentEp, setCurrentEp] = useState(1);
  const tmdbId = 37854; 
  const season = 1;

  const servers = [
    { name: 'Stream Server 1', url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${currentEp}` },
    { name: 'Stream Server 2', url: `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${currentEp}` },
    { name: 'Stream Server 3', url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${currentEp}` }
  ];

  const [activeServer, setActiveServer] = useState(servers[0]);
  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div className="w-full bg-[#121218] border border-gray-800 rounded-2xl p-6 shadow-2xl text-center">
      <div className="py-12 bg-black/40 rounded-xl border border-gray-900 mb-6 flex flex-col items-center justify-center">
        <Tv size={48} className="text-purple-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white mb-2">{animeTitle} - Episode {currentEp}</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-md">
          Direct embedding is restricted by third-party servers. Click below to stream securely in a new tab.
        </p>
        <a
          href={activeServer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-purple-900/40"
        >
          <ExternalLink size={18} /> Open {activeServer.name} Player
        </a>
      </div>

      <div className="mb-6 text-left">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Tv size={14} /> Select Provider
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

      <div className="text-left">
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