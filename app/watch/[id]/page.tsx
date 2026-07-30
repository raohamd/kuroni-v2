'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { AlertCircle, RefreshCw, Server } from 'lucide-react';

const FALLBACK_SERVERS = ['megacloud', 'streamwish', 'rapidcloud'] as const;
type ServerName = typeof FALLBACK_SERVERS[number];

interface WatchPageProps {
  params: { id: string };
}

export default function WatchPage({ params }: WatchPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [activeServer, setActiveServer] = useState<ServerName | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allServersFailed, setAllServersFailed] = useState<boolean>(false);

  const loadHlsStream = useCallback((streamUrl: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay block handler
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('[HLS Fatal Playback Error]:', data);
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }
  }, []);

  const initializeSource = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAllServersFailed(false);

    // Sequential Automated Failover Loop
    for (const server of FALLBACK_SERVERS) {
      try {
        console.log(`[Failover Engine] Testing media source node: '${server}'...`);
        setActiveServer(server);

        const response = await fetch(`/api/stream?id=${params.id}&server=${server}`);
        const data = await response.json();

        if (!response.ok || data.error || !data.streamUrl) {
          console.warn(`[Failover Engine] Node '${server}' rejected (${data.status || response.status}). Rotating to next backup node.`);
          continue; // Seamlessly rotate to next server
        }

        // Active node found
        console.log(`[Failover Engine] Stream verified via node '${server}'`);
        loadHlsStream(data.streamUrl);
        setIsLoading(false);
        return; // Exit failover loop on success
      } catch (err) {
        console.error(`[Failover Engine] Request failed for node '${server}':`, err);
      }
    }

    // Exhausted all fallback nodes
    setIsLoading(false);
    setAllServersFailed(true);
    setError('All video streaming servers are currently offline or unavailable.');
  }, [params.id, loadHlsStream]);

  useEffect(() => {
    initializeSource();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [initializeSource]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full object-contain"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-10">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-sm font-medium">
              Checking available stream node ({activeServer || 'initializing'})...
            </p>
          </div>
        )}

        {/* Exhaustion Overlay (Clean Custom Empty State) */}
        {allServersFailed && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Streams Available</h3>
              <p className="text-xs text-slate-400 max-w-md">
                {error}
              </p>
            </div>
            <button
              onClick={initializeSource}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-run Provider Failover Loop
            </button>
          </div>
        )}
      </div>

      {/* Provider Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <span>
            Active Server Node:{' '}
            <strong className="text-slate-200 capitalize">
              {activeServer || 'Searching...'}
            </strong>
          </span>
        </div>
        {allServersFailed && (
          <span className="text-red-400 font-medium">Status: Exhausted (410)</span>
        )}
      </div>
    </div>
  );
}