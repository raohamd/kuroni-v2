// components/AnimePlayer.tsx
export default function AnimePlayer({ streamUrl }: { streamUrl: string }) {
  // If no URL is provided, show a fallback
  if (!streamUrl) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg shadow-md flex items-center justify-center text-white">
        <p>No video source available.</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg shadow-md overflow-hidden bg-black relative">
      <iframe
        src={streamUrl}
        className="absolute top-0 left-0 w-full h-full border-none"
        allowFullScreen
        allow="autoplay; fullscreen"
      />
    </div>
  );
}