"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Play, Youtube, Tv, Film, Sparkles, X, ExternalLink, Database } from "lucide-react";
import AIGuruModal from "@/components/AIGuruModal";
import Hls from "hls.js"; 

/* ---------------------------------------------------
   Types
--------------------------------------------------- */

type SourceType = "youtube" | "bilibili" | "m3u8" | "embed";

export type StreamSource = {
  id: string;
  label: string;
  type: SourceType;
  videoId?: string; 
  url?: string;     
  page?: number;    
};

export type EpisodeSources = {
  episode: number;
  sources: StreamSource[];
};

type ServerSelectorProps = {
  animeTitle: string;
  malId: number | string;
  trailerId?: string;
  totalEpisodes: number;
  episodeSources: EpisodeSources[]; 
  initialEpisode?: number;
};

/* ---------------------------------------------------
   Players
--------------------------------------------------- */

function YouTubePlayer({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-[#1A1A24]">
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube player"
      />
    </div>
  );
}

function BilibiliPlayer({ bvid, page = 1 }: { bvid: string; page?: number }) {
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-[#1A1A24]">
      <iframe
        key={bvid}
        src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1&danmaku=0`}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        scrolling="no"
        frameBorder={0}
        title="Bilibili player"
      />
    </div>
  );
}

function HlsPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url]);

  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
      <video
        ref={videoRef}
        controls
        autoPlay
        className="absolute inset-0 w-full h-full outline-none"
        crossOrigin="anonymous"
      />
    </div>
  );
}

function EmbedPlayer({ url }: { url: string }) {
  const validUrl = url && url !== "pending" ? url : "https://megaplay.buzz/stream/mal/52991/1/sub";

  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
      <iframe
        src={validUrl}
        className="absolute inset-0 w-full h-full border-none"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        title="Embedded Anime Player"
      />
    </div>
  );
}

function EmptySourceState() {
  return (
    <div className="w-full aspect-video rounded-md bg-[#1A1A24] border border-gray-800 flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm font-semibold text-gray-300">
        No streams available
      </p>
      <p className="text-xs text-gray-500 mt-1 max-w-xs">
        This episode is not up on official channels or our backup servers yet. Check back later!
      </p>
    </div>
  );
}

/* ---------------------------------------------------
   Trailer modal
--------------------------------------------------- */

function TrailerModal({ trailerId, onClose }: { trailerId: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-300 hover:text-white"
          aria-label="Close trailer"
        >
          <X size={22} />
        </button>
        <YouTubePlayer videoId={trailerId} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   Header
--------------------------------------------------- */

function SelectorHeader({
  animeTitle,
  malId,
  trailerId,
  onOpenTrailer,
  onOpenGuru,
}: {
  animeTitle: string;
  malId: number | string;
  trailerId?: string;
  onOpenTrailer: () => void;
  onOpenGuru: () => void;
}) {
  function openMal() {
    const url = "https://myanimelist.net/anime/" + malId;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-white truncate">{animeTitle}</h2>
        <button
          type="button"
          onClick={openMal}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-purple-400 transition"
        >
          View on MyAnimeList <ExternalLink size={11} />
        </button>
      </div>
      <div className="flex gap-2 shrink-0">
        {trailerId && (
          <button
            onClick={onOpenTrailer}
            className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-md border bg-[#1A1A24] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <Film size={14} />
            Trailer
          </button>
        )}
        <button
          onClick={onOpenGuru}
          className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-md border bg-[#1A1A24] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition"
        >
          <Sparkles size={14} />
          AI Guru
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   Source (server) selector
--------------------------------------------------- */

function SourceTabs({
  sources,
  activeId,
  onSelect,
}: {
  sources: StreamSource[];
  activeId: string | null;
  onSelect: (s: StreamSource) => void;
}) {
  if (sources.length === 0) return null;

  return (
    <div className="flex gap-2 mb-3">
      {sources.map((s) => {
        const isActive = s.id === activeId;
        const Icon = s.type === "youtube" ? Youtube : (s.type === "m3u8" || s.type === "embed") ? Database : Tv;
        
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`flex items-center gap-1.5 py-2 px-4 text-xs font-bold rounded-md border transition ${
              isActive
                ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : "bg-[#1A1A24] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon size={14} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------
   Episode grid
--------------------------------------------------- */

function EpisodeGrid({
  totalEpisodes,
  currentEp,
  availableEpisodes,
  onSelect,
}: {
  totalEpisodes: number;
  currentEp: number;
  availableEpisodes: Set<number>;
  onSelect: (ep: number) => void;
}) {
  const episodeList = useMemo(
    () => Array.from({ length: totalEpisodes }, (_, i) => i + 1),
    [totalEpisodes]
  );

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
        <Play size={14} /> Episodes ({totalEpisodes})
      </h4>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto">
        {episodeList.map((ep) => {
          const hasSource = availableEpisodes.has(ep);
          return (
            <button
              key={ep}
              onClick={() => onSelect(ep)}
              disabled={!hasSource}
              title={hasSource ? `Episode ${ep}` : `Episode ${ep} — no streams found`}
              className={`py-2 text-xs font-bold rounded-md border transition ${
                currentEp === ep
                  ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : hasSource
                  ? "bg-[#1A1A24] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "bg-[#141419] border-gray-900 text-gray-700 cursor-not-allowed"
              }`}
            >
              {ep}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   Main export
--------------------------------------------------- */

export default function ServerSelector({
  animeTitle,
  malId,
  trailerId,
  totalEpisodes,
  episodeSources,
  initialEpisode = 1,
}: ServerSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentEp, setCurrentEp] = useState(initialEpisode);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showGuru, setShowGuru] = useState(false);

  const availableEpisodes = useMemo(
    () => new Set(episodeSources.filter((e) => e.sources.length > 0).map((e) => e.episode)),
    [episodeSources]
  );

  const currentSources = useMemo(
    () => episodeSources.find((e) => e.episode === currentEp)?.sources ?? [],
    [episodeSources, currentEp]
  );

  const [activeSourceId, setActiveSourceId] = useState<string | null>(
    currentSources[0]?.id ?? null
  );

  useEffect(() => {
    const epFromUrl = Number(searchParams.get("ep"));
    if (epFromUrl && epFromUrl !== currentEp && availableEpisodes.has(epFromUrl)) {
      setCurrentEp(epFromUrl);
      const sources = episodeSources.find((e) => e.episode === epFromUrl)?.sources ?? [];
      setActiveSourceId(sources[0]?.id ?? null);
    }
  }, [searchParams, currentEp, availableEpisodes, episodeSources]);

  function updateUrl(ep: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ep", String(ep));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleEpisodeSelect(ep: number) {
    setCurrentEp(ep);
    const sources = episodeSources.find((e) => e.episode === ep)?.sources ?? [];
    setActiveSourceId(sources[0]?.id ?? null);
    updateUrl(ep);
  }

  const activeSource =
    currentSources.find((s) => s.id === activeSourceId) ?? currentSources[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <SelectorHeader
        animeTitle={animeTitle}
        malId={malId}
        trailerId={trailerId}
        onOpenTrailer={() => setShowTrailer(true)}
        onOpenGuru={() => setShowGuru(true)}
      />

      {activeSource ? (
        activeSource.type === "youtube" ? (
          <YouTubePlayer videoId={activeSource.videoId!} />
        ) : activeSource.type === "bilibili" ? (
          <BilibiliPlayer bvid={activeSource.videoId!} page={activeSource.page} />
        ) : activeSource.type === "embed" ? (
          <EmbedPlayer url={activeSource.url!} /> 
        ) : (
          <HlsPlayer url={activeSource.url!} />
        )
      ) : (
        <EmptySourceState />
      )}

      {activeSource && (
        <p className="text-[11px] text-gray-500 -mt-2">
          {activeSource.type === "embed" ? (
            <>
              Watching via <span className="text-gray-300 font-medium">AnimeKai Server</span> — Custom scraped stream.
            </>
          ) : activeSource.type === "m3u8" ? (
            <>
              Watching via <span className="text-gray-300 font-medium">Backup Server (Animepahe)</span> — Official streams missing.
            </>
          ) : (
            <>
              Watching via official <span className="text-gray-300 font-medium">
                {activeSource.type === "youtube" ? "YouTube" : "Bilibili"}
              </span> embed — no ads or redirects.
            </>
          )}
        </p>
      )}

      <SourceTabs
        sources={currentSources}
        activeId={activeSourceId}
        onSelect={(s) => setActiveSourceId(s.id)}
      />

      <EpisodeGrid
        totalEpisodes={totalEpisodes}
        currentEp={currentEp}
        availableEpisodes={availableEpisodes}
        onSelect={handleEpisodeSelect}
      />

      {showTrailer && trailerId && (
        <TrailerModal trailerId={trailerId} onClose={() => setShowTrailer(false)} />
      )}

      <AIGuruModal isOpen={showGuru} onClose={() => setShowGuru(false)} />
    </div>
  );
}