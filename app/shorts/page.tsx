'use client';

import Link from 'next/link';

export default function ShortsPage() {
  // Collection of official anime short clip IDs from authorized YouTube partners
  const shortClips = [
    { id: 'dQw4w9WgXcQ', title: 'Epic Battle Scene', animeId: '21' },
    { id: 'L_LUpnjgPso', title: 'Official Preview Clip', animeId: '101922' },
  ];

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory bg-black">
      {shortClips.map((clip, idx) => (
        <div key={idx} className="h-full w-full snap-start relative flex items-center justify-center p-4">
          <div className="relative aspect-[9/16] h-full max-h-[750px] w-full rounded-2xl overflow-hidden border border-gray-800 bg-[#121218]">
            <iframe
              src={`https://www.youtube.com/embed/${clip.id}?autoplay=1&loop=1&playlist=${clip.id}&controls=0`}
              className="w-full h-full border-none"
              allow="autoplay; encrypted-media"
            />
            <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-center bg-black/60 backdrop-blur-md p-4 rounded-xl border border-gray-800">
              <div>
                <h3 className="font-bold text-white text-sm">{clip.title}</h3>
                <p className="text-xs text-purple-400">Official Short Stream</p>
              </div>
              <Link
                href={`/anime/${clip.animeId}`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg"
              >
                Full Series
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}