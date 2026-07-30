// app/api/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
    console.log(`[Native Scraper] 1. Searching JS-Free Provider for: ${animeSlug}`);
    
    // Step 1: Search using AnimeKai (No FingerprintJS walls)
    const baseUrl = 'https://animekai.be'; 
    const searchRes = await fetch(`${baseUrl}/browse?keyword=${encodeURIComponent(animeSlug)}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });
    
    if (!searchRes.ok) throw new Error(`Search page failed (Status: ${searchRes.status})`);
    const searchHtml = await searchRes.text();
    const $search = cheerio.load(searchHtml);
    
    // Find the first valid watch link
    let targetHref = '';
    $search('a[href*="/watch/"]').each((_, el) => {
      const href = $search(el).attr('href');
      if (href && !href.includes('/genres/') && !href.includes('/producers/')) {
        targetHref = href;
        return false; // break loop
      }
    });

    if (!targetHref) throw new Error('Anime not found in search results');

    // Step 2: Construct the episode page path
    const cleanHref = targetHref.includes('animekai.be') ? targetHref.split('animekai.be').pop() : targetHref;
    const slug = cleanHref?.replace('/watch/', '').replace('/anime/', '').replace(/\//g, '').trim();
    const episodePath = `/watch/${slug}/ep-${episodeNumber}`;

    console.log(`[Native Scraper] 2. Scraping episode page: ${episodePath}`);
    const episodeRes = await fetch(`${baseUrl}${episodePath}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (!episodeRes.ok) throw new Error('Episode page not found (404/410)');
    
    const episodeHtml = await episodeRes.text();
    const $episode = cheerio.load(episodeHtml);

    // Step 3: Extract the embed iframe URL from the active server tabs
    let embedUrl = $episode('.server').first().attr('data-url') || '';

    if (!embedUrl) {
      embedUrl = $episode('iframe').attr('src') || '';
    }

    if (!embedUrl) throw new Error(`Could not locate embed URL on episode page`);
    if (embedUrl.startsWith('//')) embedUrl = `https:${embedUrl}`;

    console.log(`[Native Scraper] 3. Found Embed URL: ${embedUrl}`);

    // Step 4: Scrape the actual .m3u8 file from the embed provider's iframe
    const embedRes = await fetch(embedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
        'Referer': baseUrl 
      }
    });
    
    const embedHtml = await embedRes.text();
    
    // Regex to locate the HLS stream URL hidden in the player's source code
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
    
    return NextResponse.json({
      success: true,
      server,
      streamUrl: TEST_STREAM,
      isFallback: true,
      originalError: error.message
    });
  }
}