import { NextRequest, NextResponse } from 'next/server';
import { decryptSource } from '@/lib/extractor';

interface ServerConfig {
  embedUrl: (id: string) => string;
  origin: string;
}

const SERVER_CONFIGS: Record<string, ServerConfig> = {
  megacloud: {
    embedUrl: (id) => `https://megacloud.tv/embed-2/e-1/${id}?k=1`,
    origin: 'https://megacloud.tv',
  },
  streamwish: {
    embedUrl: (id) => `https://streamwish.to/e/${id}`,
    origin: 'https://streamwish.to',
  },
  rapidcloud: {
    embedUrl: (id) => `https://rapid-cloud.ru/embed-6/${id}`,
    origin: 'https://rapid-cloud.ru',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const server = searchParams.get('server') || 'megacloud';

  if (!id) {
    return NextResponse.json({ error: 'Missing media ID parameter' }, { status: 400 });
  }

  const targetConfig = SERVER_CONFIGS[server];
  if (!targetConfig) {
    return NextResponse.json({ error: 'Invalid video server provider' }, { status: 400 });
  }

  const targetUrl = targetConfig.embedUrl(id);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Referer: targetConfig.origin,
        Origin: targetConfig.origin,
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json, text/plain, */*',
      },
      cache: 'no-store',
    });

    // Intercept 404/410 status responses before client crash
    if (upstreamResponse.status === 404 || upstreamResponse.status === 410) {
      console.warn(`[Stream Proxy] Upstream server '${server}' returned ${upstreamResponse.status} for ID: ${id}`);
      return NextResponse.json(
        { error: 'Source offline', status: upstreamResponse.status },
        { status: upstreamResponse.status }
      );
    }

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: 'Source offline', status: 410 },
        { status: 410 }
      );
    }

    const data = await upstreamResponse.json();

    let streamUrl = '';
    if (typeof data.sources === 'string') {
      const decrypted = decryptSource(data.sources, 'secret-key-placeholder');
      const parsed = JSON.parse(decrypted);
      streamUrl = parsed[0]?.file || '';
    } else if (Array.isArray(data.sources)) {
      streamUrl = data.sources[0]?.file || '';
    }

    if (!streamUrl) {
      return NextResponse.json({ error: 'Source offline', status: 410 }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      server,
      streamUrl,
      headers: {
        Referer: targetConfig.origin,
      },
    });
  } catch (error) {
    console.error(`[Stream Proxy Error] Upstream connection exception for '${server}':`, error);
    return NextResponse.json({ error: 'Source offline', status: 410 }, { status: 410 });
  }
}