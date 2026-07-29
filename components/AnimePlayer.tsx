// components/AnimePlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function AnimePlayer({ streamUrl }: { streamUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  return <video ref={videoRef} controls className="w-full rounded-lg shadow-md" />;
}
