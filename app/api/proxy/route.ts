// app/api/proxy/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://animekai.be/',
        'Origin': 'https://animekai.be',
      },
    });

    let html = await response.text();

    // INJECT BASE TAG: This forces all relative scripts/styles to load from megaplay.buzz, preventing infinite loops
    html = html.replace('<head>', '<head><base href="https://megaplay.buzz/">');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return new NextResponse('Error proxying stream', { status: 500 });
  }
}