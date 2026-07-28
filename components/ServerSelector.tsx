'use client';

import { useState } from 'react';
import { Tv, Play, Film } from 'lucide-react';

interface Props {
  animeTitle: string;
  totalEpisodes?: number;
  youtubeId?: string;    // Official YouTube video/trailer ID
  bilibiliId?: string;   // Official Bilibili BV or AID format
}

export default function ServerSelector({ animeTitle, totalEpisodes = 12, youtubeId, bilibiliId }: Props) {
  const [currentEp, setCurrentEp] = useState(1);
  const [activeTab, setActiveTab] = useState<'youtube' | 'bilibili'>('youtube');

  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div className="w-full bg-[#121218] border border-gray-800 rounded-2xl p-4 shadow-2xl">
      
      {/* Native Embedded Legal Player */}
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-6 border border-gray-900 shadow-lg">
        {activeTab === 'youtube' && youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title={`${animeTitle} - YouTube Player`}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : activeTab === 'bilibili' && bilibiliId ? (
          <iframe
            src={`https://player.bilibili.com/player.html?bvid=${bilibiliId}&page=${currentEp}&high_quality=1&danmaku=0`}
            title={`${animeTitle} - Bilibili Player`}
            className="w-full h-full border-none"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
            <Film size={40} className="mb-3 text-purple-500" />
            <p className="font-semibold text-white mb-1">Official Stream Available</p>
            <p className="text-xs text-gray-500 max-w-sm">
              Select an official legal source tab below to watch Episode {currentEp}.
            </p>
          </div>
        )}
      </div>

      {/* Official Platform Switcher */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Tv size={14} className="text-purple-400" /> Legal Sources:
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition ${
              activeTab === 'youtube'
                ? 'bg-red-600 border-red-500 text-white shadow-md'
                : 'bg-[#1A1A24] border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            YouTube Official
          </button>
          <button
            onClick={() => setActiveTab('bilibili')}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition ${
              activeTab === 'bilibili'
                ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                : 'bg-[#1A1A24] border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Bilibili Official
          </button>
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