// app/api/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const animeSlug = searchParams.get('id'); 
  const episodeNumber = searchParams.get('ep') || '1';
  const server = searchParams.get('server') || 'vidstreaming';

  if (!animeSlug) {
    return NextResponse.json({ error: 'Missing media ID parameter' }, { status: 400 });
  }

  try {
    // 1. RESOLVER LAYER: Translate the human-readable slug into a provider episode ID
    // We use an aggregator API (like Consumet targeting Gogoanime) to find the correct hash.
    const searchRes = await fetch(`https://api.consumet.org/anime/gogoanime/${animeSlug}`);
    if (!searchRes.ok) throw new Error('Failed to locate anime in provider database');
    const searchData = await searchRes.json();
    
    const targetAnime = searchData.results[0];
    if (!targetAnime) throw new Error('Anime not found');

    const infoRes = await fetch(`https://api.consumet.org/anime/gogoanime/info/${targetAnime.id}`);
    const infoData = await infoRes.json();
    
    // Match the requested episode number to get the specific alphanumeric episode hash
    const episode = infoData.episodes.find((e: any) => e.number === Number(episodeNumber));
    if (!episode) throw new Error('Episode not found on provider');

    // 2. EXTRACTION LAYER: Fetch the actual M3U8 source payload using the resolved Episode ID
    const sourceRes = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${episode.id}?server=${server}`);
    if (!sourceRes.ok) {
      console.warn(`[Stream Proxy] Upstream server '${server}' returned ${sourceRes.status} for ep: ${episode.id}`);
      return NextResponse.json({ error: 'Source offline', status: 410 }, { status: 410 });
    }
    
    const sourceData = await sourceRes.json();
    
    // Extract the highest quality HLS stream or the default fallback
    const streamUrl = sourceData.sources.find((s: any) => s.quality === 'default' || s.quality === '1080p')?.url 
      || sourceData.sources[0]?.url;

    if (!streamUrl) {
      return NextResponse.json({ error: 'Source offline', status: 410 }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      server,
      streamUrl,
    });
  } catch (error) {
    console.error(`[Stream Proxy Error] Upstream resolution failed for '${server}':`, error);
    return NextResponse.json({ error: 'Source offline', status: 410 }, { status: 410 });
  }
}