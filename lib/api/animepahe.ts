// lib/api/animepahe.ts
import * as cheerio from 'cheerio';

const ANIMEKAI_URL = 'https://animekai.be';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

export async function searchAnimepahe(query: string, episodeNumber: number = 1) {
  console.log(`\n--- Searching AnimeKAI for ${query} Ep ${episodeNumber} ---`);

  try {
    const searchRes = await fetch(`${ANIMEKAI_URL}/browse?keyword=${encodeURIComponent(query)}`, {
      headers: HEADERS,
    });
    if (!searchRes.ok) throw new Error(`Search failed with status ${searchRes.status}`);
    
    const searchHtml = await searchRes.text();
    const $search = cheerio.load(searchHtml);
    
    let targetHref = '';
    $search('a[href*="/watch/"]').each((_, el) => {
      const href = $search(el).attr('href');
      if (href && href.includes('/watch/') && !href.includes('/genres/') && !href.includes('/producers/')) {
        targetHref = href;
        return false;
      }
    });

    if (!targetHref) {
      targetHref = $search('a[href*="/watch/"]').first().attr('href') || '';
    }

    if (!targetHref) throw new Error('Anime not found in search results');
    
    const cleanHref = targetHref.includes('animekai.be') ? targetHref.split('animekai.be').pop() : targetHref;
    const slug = cleanHref?.replace('/watch/', '').replace('/anime/', '').replace(/\//g, '').trim();
    console.log(`Found Slug: ${slug}`);

    const watchUrl = `${ANIMEKAI_URL}/watch/${slug}/ep-${episodeNumber}`;
    console.log(`Fetching Watch Page: ${watchUrl}`);
    
    const watchRes = await fetch(watchUrl, { headers: HEADERS });
    if (!watchRes.ok) throw new Error(`Watch page failed with status ${watchRes.status}`);
    
    const watchHtml = await watchRes.text();
    const $watch = cheerio.load(watchHtml);

    let streamUrl = $watch('.server-items[data-id="sub"] .server').first().attr('data-url');
    if (!streamUrl) {
       streamUrl = $watch('.server-items[data-id="dub"] .server').first().attr('data-url');
    }
    if (!streamUrl) {
       streamUrl = $watch('.server[data-url]').first().attr('data-url');
    }

    if (streamUrl) {
      console.log("✅ Success! Got embed URL:", streamUrl);
      return { streamUrl };
    }

    console.log("❌ No stream URL found in HTML.");
    return null;
  } catch (error) {
    console.error("AnimeKAI Fetch Error:", (error as Error).message);
    return null;
  }
}