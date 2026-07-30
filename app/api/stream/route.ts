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
    // (Using a generic Gogoanime URL structure as an example template)
    const baseUrl = 'https://gogoanime3.co'; 
    const searchRes = await fetch(`${baseUrl}/search.html?keyword=${encodeURIComponent(animeSlug)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    if (!searchRes.ok) throw new Error('Failed to fetch search page from provider');
    
    const searchHtml = await searchRes.text();
    const $search = cheerio.load(searchHtml);
    
    // Find the first anime result link
    const animePath = $search('.items li .name a').first().attr('href');
    if (!animePath) throw new Error('Anime not found in search results');

    // Step 2: Construct the episode path based on standard provider slugging
    // Usually formatted as /anime-name-episode-1
    const cleanSlug = animePath.replace('/category/', '');
    const episodePath = `/${cleanSlug}-episode-${episodeNumber}`;

    console.log(`[Native Scraper] 2. Scraping episode page: ${episodePath}`);
    const episodeRes = await fetch(`${baseUrl}${episodePath}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (!episodeRes.ok) throw new Error('Episode page not found (404/410)');
    
    const episodeHtml = await episodeRes.text();
    const $episode = cheerio.load(episodeHtml);

    // Step 3: Extract the embed iframe URL for the target server
    // (e.g., matching the 'vidstreaming' or 'streamsb' tab)
    let embedUrl = '';
    $episode('.anime_muti_link ul li').each((_, el) => {
      const className = $episode(el).attr('class') || '';
      if (className.includes(server.toLowerCase()) || className.includes('vidcdn')) {
        embedUrl = $episode(el).find('a').attr('data-video') || '';
      }
    });

    if (!embedUrl) {
        // Fallback to the default active server if the specific one isn't found
        embedUrl = $episode('.play-video iframe').attr('src') || '';
    }

    if (!embedUrl) throw new Error(`Could not locate embed URL for server: ${server}`);
    if (embedUrl.startsWith('//')) embedUrl = `https:${embedUrl}`;

    console.log(`[Native Scraper] 3. Found Embed URL: ${embedUrl}`);

    // Step 4: Scrape the actual .m3u8 file from the embed player page
    // (Note: Advanced providers encrypt this. This is a basic regex extraction for unencrypted scripts).
    const embedRes = await fetch(embedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': baseUrl }
    });
    
    const embedHtml = await embedRes.text();
    
    // Regex to find a standard .m3u8 URL buried inside the player's javascript variables
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
    
    // DEV FALLBACK: Keeps your UI functioning during development if DOM layout changes block the scraper
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