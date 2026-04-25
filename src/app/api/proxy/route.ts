import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Strip Instagram's 640x640 size constraint so we serve full-resolution images
    const fetchUrl = targetUrl.replace(/(stp=[^&]*)s640x640([^&]*)/g, '$1$2');

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    const rawContentType = response.headers.get('content-type') || 'application/octet-stream';
    const isVideo = rawContentType.includes('video') || targetUrl.includes('.mp4');
    // Force correct MIME so browsers don't content-sniff to image/jpeg
    const contentType = isVideo ? 'video/mp4' : 'image/jpeg';
    const extension = isVideo ? 'mp4' : 'jpg';

    const shortcodeParam = searchParams.get('shortcode') || 'media';
    const defaultFilename = `instorix_${shortcodeParam}.${extension}`;
    // Prefer filename passed explicitly from the client (already has correct ext)
    const filename = searchParams.get('filename') || defaultFilename;

    const isInline = searchParams.get('inline') === 'true';
    const disposition = isInline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`;

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy the request' }, { status: 500 });
  }
}
