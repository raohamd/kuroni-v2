'use client';

import { useState } from 'react';
import { Tv, Play, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  animeTitle: string;
  malId?: number;
  totalEpisodes?: number;
  trailerId?: string;
}

export default function ServerSelector({ animeTitle, malId, totalEpisodes = 12 }: Props) {
  const [currentEp, setCurrentEp] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Using One Piece's TMDB ID (37854)
  const tmdbId = 37854; 
  const season = 1;

  // Clean alternative embed providers that do not hijack top-level window navigation
  const servers = [
    { name: 'MultiEmbed', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${currentEp}` },
    { name: 'SuperEmbed', url: `https://getsuperembed.link/?video_id=${tmdbId}&tmdb=1&season=${season}&episode=${currentEp}` },
    { name: 'Apimdb', url: `https://v2.apimdb.net/e/tmdb/tv/${tmdbId}/${season}/${currentEp}` }
  ];

  const [activeServer, setActiveServer] = useState(servers[0]);

  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  const handleServerChange = (srv: any) => {
    setIsLoading(true);
    setActiveServer(srv);
  };

  const handleEpisodeChange = (ep: number) => {
    setIsLoading(true);
    setCurrentEp(ep);
  };

  return (
    <div className="w-full bg-[#121218] border border-gray-800 rounded-2xl p-4 shadow-2xl">
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-6 border border-gray-900 shadow-lg">
        {!malId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <AlertCircle size={32} className="mb-2 text-gray-600" />
            <p>Stream not available for this title yet.</p>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-purple-400">
                <RefreshCw size={32} className="animate-spin mb-3" />
                <p className="text-sm font-bold animate-pulse">Connecting to {activeServer.name}...</p>
                <p className="text-xs text-gray-500 mt-2">If player stays blank, click a different server below.</p>
              </div>
            )}
            <iframe
              src={activeServer.url}
              title={`${animeTitle} - Episode ${currentEp}`}
              className="w-full h-full border-none relative z-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={() => setIsLoading(false)}
            />
          </>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Tv size={14} /> Video Server (Click to Switch if Blank/Broken)
        </h4>
        <div className="flex flex-wrap gap-2">
          {servers.map((srv, idx) => (
            <button
              key={idx}
              onClick={() => handleServerChange(srv)}
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

      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Play size={14} /> Episodes ({totalEpisodes})
        </h4>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto pr-2">
          {episodeList.map((ep) => (
            <button
              key={ep}
              onClick={() => handleEpisodeChange(ep)}
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