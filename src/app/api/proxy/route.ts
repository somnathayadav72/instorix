import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Simple in-memory rate limiting for proxy
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.timestamp > 60000 * 2) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip);
  
  if (!userRecord || now - userRecord.timestamp > 60000) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (userRecord.count >= 30) return false; // Allow up to 30 media fetches per minute per IP
  userRecord.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  // 1. Rate Limiting Protection
  // In production x-forwarded-for can be a comma-separated list; take the first (real client) IP
  const rawIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  // 2. Anti-Leeching Protection (block other sites from using our proxy)
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instorix.in';
  
  // Only enforce in production when APP_URL is defined as a real domain
  if (process.env.NODE_ENV === 'production' && !appUrl.includes('localhost')) {
    const cleanAppHost = appUrl.replace(/^https?:\/\/(www\.)?/, '');
    const isAllowed = referer.includes(cleanAppHost) || origin.includes(cleanAppHost);
    if (!isAllowed && (referer || origin)) { // If headers are present but don't match our domain
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const validDomains = ['instagram.com', 'cdninstagram.com', 'fbcdn.net'];
    const isValidDomain = validDomains.some(domain => 
      parsedTarget.hostname === domain || parsedTarget.hostname.endsWith('.' + domain)
    );

    if (parsedTarget.protocol !== 'https:' || !isValidDomain) {
      return NextResponse.json({ error: 'Invalid or unsupported media URL' }, { status: 403 });
    }

    // Strip Instagram's 640x640 size constraint so we serve full-resolution images
    const fetchUrl = targetUrl.replace(/(stp=[^&]*)s640x640([^&]*)/g, '$1$2');

    const response = await fetch(fetchUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/*,video/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }

    const rawContentType = response.headers.get('content-type') || 'application/octet-stream';
    const isVideo = rawContentType.includes('video') || targetUrl.includes('.mp4');
    
    const audioOnly = searchParams.get('audioOnly') === 'true';

    // Force correct MIME so browsers don't content-sniff to image/jpeg
    // If audioOnly, force audio/mpeg so it plays as an MP3 audio file
    const contentType = audioOnly ? 'audio/mpeg' : isVideo ? 'video/mp4' : 'image/jpeg';
    const extension = audioOnly ? 'mp3' : isVideo ? 'mp4' : 'jpg';

    const shortcodeParam = searchParams.get('shortcode') || 'media';
    const defaultFilename = `instorix_${shortcodeParam}.${extension}`;
    // Prefer filename passed explicitly from the client
    const rawFilename = searchParams.get('filename') || defaultFilename;
    // 3. Header Injection & Path Traversal Protection
    // Strip out newlines, carriage returns, quotes, and path separators
    const filename = rawFilename.replace(/[\r\n"/\\]/g, '_');

    const isInline = searchParams.get('inline') === 'true';
    const disposition = isInline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`;

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': disposition,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    };

    // Forward Content-Length so mobile browsers can show download progress
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    return new NextResponse(response.body, {
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to proxy the request' }, { status: 500 });
  }
}
