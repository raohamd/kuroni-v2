"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Play, Youtube, Tv, Film, Sparkles, X } from "lucide-react";
import AIGuruModal from "@/components/AIGuruModal";

/* ---------------------------------------------------
   Types
--------------------------------------------------- */

type SourceType = "youtube" | "bilibili";

export type StreamSource = {
  id: string;
  label: string;
  type: SourceType;
  videoId: string; // YouTube videoId OR Bilibili bvid
  page?: number; // Bilibili multi-part page (defaults to 1)
};

export type EpisodeSources = {
  episode: number;
  sources: StreamSource[];
};

type ServerSelectorProps = {
  animeTitle: string;
  malId: number | string;
  trailerId?: string; // YouTube video id for the trailer
  totalEpisodes: number;
  episodeSources: EpisodeSources[]; // mapping table: episode -> available legal sources
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

function EmptySourceState() {
  return (
    <div className="w-full aspect-video rounded-md bg-[#1A1A24] border border-gray-800 flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm font-semibold text-gray-300">
        Not yet available officially
      </p>
      <p className="text-xs text-gray-500 mt-1 max-w-xs">
        This episode isn&apos;t up on YouTube or Bilibili yet. Check back once
        the official simulcast catches up.
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
   Header — title, trailer button, AI Guru trigger
--------------------------------------------------- */

function SelectorHeader({
  animeTitle,
  trailerId,
  onOpenTrailer,
  onOpenGuru,
}: {
  animeTitle: string;
  trailerId?: string;
  onOpenTrailer: () => void;
  onOpenGuru: () => void;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
      <h2 className="text-lg font-bold text-white truncate">{animeTitle}</h2>
      <div className="flex gap-2">
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
   Source (server) selector — YouTube / Bilibili tabs
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
        const Icon = s.type === "youtube" ? Youtube : Tv;
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
              title={hasSource ? `Episode ${ep}` : `Episode ${ep} — not yet available`}
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

  // Keep state in sync if the URL's ?ep= changes externally (e.g. back/forward nav)
  useEffect(() => {
    const epFromUrl = Number(searchParams.get("ep"));
    if (epFromUrl && epFromUrl !== currentEp && availableEpisodes.has(epFromUrl)) {
      setCurrentEp(epFromUrl);
      const sources = episodeSources.find((e) => e.episode === epFromUrl)?.sources ?? [];
      setActiveSourceId(sources[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      {/* Header: title + trailer + AI Guru trigger */}
      <SelectorHeader
        animeTitle={animeTitle}
        trailerId={trailerId}
        onOpenTrailer={() => setShowTrailer(true)}
        onOpenGuru={() => setShowGuru(true)}
      />

      {/* Player */}
      {activeSource ? (
        activeSource.type === "youtube" ? (
          <YouTubePlayer videoId={activeSource.videoId} />
        ) : (
          <BilibiliPlayer bvid={activeSource.videoId} page={activeSource.page} />
        )
      ) : (
        <EmptySourceState />
      )}

      {/* Attribution */}
      {activeSource && (
        <p className="text-[11px] text-gray-500 -mt-2">
          Watching via official{" "}
          <span className="text-gray-300 font-medium">
            {activeSource.type === "youtube" ? "YouTube" : "Bilibili"}
          </span>{" "}
          embed — no ads or redirects added by this site.
        </p>
      )}

      {/* Source tabs (only shown if the current episode has multiple legal sources) */}
      <SourceTabs
        sources={currentSources}
        activeId={activeSourceId}
        onSelect={(s) => setActiveSourceId(s.id)}
      />

      {/* Episode Grid */}
      <EpisodeGrid
        totalEpisodes={totalEpisodes}
        currentEp={currentEp}
        availableEpisodes={availableEpisodes}
        onSelect={handleEpisodeSelect}
      />

      {/* Trailer modal */}
      {showTrailer && trailerId && (
        <TrailerModal trailerId={trailerId} onClose={() => setShowTrailer(false)} />
      )}

      {/* AI Guru modal — adjust props below to match your actual AIGuruModal signature */}
      {showGuru && (
        <AIGuruModal
          malId={malId}
          animeTitle={animeTitle}
          onClose={() => setShowGuru(false)}
        />
      )}
    </div>
  );
}