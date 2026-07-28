'use client';

export default function TierBadge({ episodesWatched }: { episodesWatched: number }) {
  let tier = '🥚 Filthy Casual';
  let color = 'text-gray-400 border-gray-700 bg-gray-900/50';

  if (episodesWatched >= 1000) {
    tier = '👑 Otaku Overlord';
    color = 'text-yellow-400 border-yellow-500/50 bg-yellow-950/30';
  } else if (episodesWatched >= 251) {
    tier = '🏮 Sensei';
    color = 'text-purple-400 border-purple-500/50 bg-purple-950/30';
  } else if (episodesWatched >= 51) {
    tier = '⚔️ Shonen Protagonist';
    color = 'text-blue-400 border-blue-500/50 bg-blue-950/30';
  }

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${color} inline-flex items-center gap-1`}>
      {tier}
    </span>
  );
}