// app/api/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Reliable test stream fallback if the custom scraper gets blocked
const TEST_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const animeSlug = searchParams.get('id'); 
  const episodeNumber = searchParams.get('ep') || '1';
  const server = searchParams.get('server') || 'vidstreaming';

  if (!animeSlug) {
    return NextResponse.json({ error: 'Missing media ID parameter' }, { status: 400 });
  }

  try {
    console.log(`[Native Scraper] 1. Searching provider for: ${animeSlug}`);
    
    // Step 1: Search the provider's website directly
    const baseUrl = 'https://anitaku.pe'; 
    const searchUrl = `${baseUrl}/search.html?keyword=${encodeURIComponent(animeSlug)}`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!searchRes.ok) throw new Error(`Failed to fetch search page (Status: ${searchRes.status})`);
    
    const searchHtml = await searchRes.text();
    
    // CLOUDFLARE CHECK: Catch silent bot-blocks immediately
    if (searchHtml.includes('Just a moment...') || searchHtml.includes('Cloudflare')) {
      throw new Error('Vercel IP was blocked by a Cloudflare challenge.');
    }

    const $search = cheerio.load(searchHtml);
    
    // Resilient CSS Selectors: Tries multiple known layout patterns for the provider
    const animePath = $search('ul.items li p.name a').first().attr('href') ||
                      $search('.items li .name a').first().attr('href') ||
                      $search('p.name a').first().attr('href') ||
                      $search('.video-block a').first().attr('href');

    if (!animePath) {
      console.error(`[Scraper Debug] HTML Returned:`, searchHtml.substring(0, 500));
      throw new Error('Anime not found in search results');
    }

    // Step 2: Construct the episode path based on standard provider slugging
    const cleanSlug = animePath.replace('/category/', '');
    const episodePath = `/${cleanSlug}-episode-${episodeNumber}`;

    console.log(`[Native Scraper] 2. Scraping episode page: ${episodePath}`);
    const episodeRes = await fetch(`${baseUrl}${episodePath}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' 
      }
    });

    if (!episodeRes.ok) throw new Error('Episode page not found (404/410)');
    
    const episodeHtml = await episodeRes.text();
    const $episode = cheerio.load(episodeHtml);

    // Step 3: Extract the embed iframe URL for the target server
    let embedUrl = '';
    $episode('.anime_muti_link ul li').each((_, el) => {
      const className = $episode(el).attr('class') || '';
      if (className.includes(server.toLowerCase()) || className.includes('vidcdn')) {
        embedUrl = $episode(el).find('a').attr('data-video') || '';
      }
    });

    if (!embedUrl) {
      embedUrl = $episode('.play-video iframe').attr('src') || '';
    }

    if (!embedUrl) throw new Error(`Could not locate embed URL for server: ${server}`);
    if (embedUrl.startsWith('//')) embedUrl = `https:${embedUrl}`;

    console.log(`[Native Scraper] 3. Found Embed URL: ${embedUrl}`);

    // Step 4: Scrape the actual .m3u8 file from the embed player page
    const embedRes = await fetch(embedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 
        'Referer': baseUrl 
      }
    });
    
    const embedHtml = await embedRes.text();
    
    // Regex to find a standard .m3u8 URL buried inside player JS variables
    const m3u8Match = embedHtml.match(/(https:\/\/[^\s"'<>]+\.m3u8)/);
    const streamUrl = m3u8Match ? m3u8Match[1] : null;

    if (!streamUrl) throw new Error('Failed to extract raw .m3u8 from embed page');

    console.log(`[Native Scraper] 4. Success! Extracted stream: ${streamUrl}`);

    return NextResponse.json({
      success: true,
      server,
      streamUrl,
    });
    
  } catch (error: any) {
    console.error(`[Scraper Error - ${server}]:`, error.message);
    
    console.warn(`[Proxy] Injecting fallback test stream to maintain UI state.`);
    return NextResponse.json({
      success: true,
      server,
      streamUrl: TEST_STREAM,
      isFallback: true,
      originalError: error.message
    });
  }
}