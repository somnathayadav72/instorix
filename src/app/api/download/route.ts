import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { instagramGetUrl } from 'instagram-url-direct';
import { extractShortcode, buildInstagramHeaders, parseGraphQLResponse, unescapeUrl } from '@/lib/instagram';
import { InstagramPost } from '@/types/instagram';

interface DirectMediaItem {
  url: string;
  type: 'video' | 'image';
  thumbnail?: string;
}

interface SharedData {
  entry_data?: {
    PostPage?: Array<{
      graphql?: { shortcode_media?: unknown };
    }>;
  };
}

export const runtime = 'nodejs';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.timestamp > windowMs * 2) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const userRecord = rateLimitMap.get(ip);
  if (!userRecord) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - userRecord.timestamp > windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (userRecord.count >= maxRequests) {
    return false;
  }

  userRecord.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // In production x-forwarded-for can be a comma-separated list; take the first (real client) IP
    const rawIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Anti-Leeching Protection
    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instorix.in';
    
    if (process.env.NODE_ENV === 'production' && !appUrl.includes('localhost')) {
      const cleanAppHost = appUrl.replace(/^https?:\/\/(www\.)?/, '');
      const isAllowed = referer.includes(cleanAppHost) || origin.includes(cleanAppHost);
      if (!isAllowed && (referer || origin)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized access.' },
          { status: 403, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

    const body = await request.json();
    const { url } = body;

    // Strict Instagram URL validation — prevents instagram.com.evil.com tricks
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Instagram URL' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    if (hostname !== 'instagram.com') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Instagram URL' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const pathname = parsedUrl.pathname.toLowerCase();

    // Detect profile URLs (e.g. instagram.com/username/)
    const isProfileUrl = !/\/(p|reels?|tv|stories)\//.test(pathname);
    let username: string | null = null;
    if (isProfileUrl) {
      const match = parsedUrl.pathname.match(/^\/([a-zA-Z0-9._]+)/);
      if (match && match[1] && !['explore', 'reels', 'stories'].includes(match[1])) {
        username = match[1];
      }
    }

    const shortcode = isProfileUrl ? null : extractShortcode(url);
    
    if (!shortcode && !username) {
      return NextResponse.json(
        { success: false, error: 'Could not extract post shortcode or username. Make sure you copied the full URL.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const headers = buildInstagramHeaders();
    if (process.env.INSTAGRAM_SESSION_ID) {
      headers['Cookie'] = `sessionid=${process.env.INSTAGRAM_SESSION_ID};`;
    }

    let post: InstagramPost | null = null;
    const isReel = /\/reels?\//.test(pathname);
    const hasVideoMedia = (candidate: InstagramPost | null) =>
      Boolean(candidate?.mediaItems.some((item) => item.type === 'video'));

    // ─────────────────────────────────────────────────────────────
    // Profile URL Strategy: Fetch Stories (Requires Session ID)
    // ─────────────────────────────────────────────────────────────
    if (isProfileUrl && username) {
      try {
        // 1. Get user ID & Profile Pic
        const profileRes = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
          headers: { ...headers, 'X-IG-App-ID': '936619743392459' },
          timeout: 8000
        });
        
        const user = profileRes.data?.data?.user;
        const userId = user?.id;
        const hdProfilePic = user?.hd_profile_pic_url_info?.url || user?.profile_pic_url_hd || user?.profile_pic_url;
        
        // 2. Fetch stories feed if session exists
        const mediaItems: DirectMediaItem[] = [];
        let type: 'post' | 'carousel' = 'post';
        let caption = `${username}'s Profile Picture`;

        if (userId && process.env.INSTAGRAM_SESSION_ID) {
          try {
            const storiesRes = await axios.get(`https://www.instagram.com/api/v1/feed/user/${userId}/story/`, {
              headers,
              timeout: 8000
            });
            const items = storiesRes.data?.reel?.items || [];
            if (items.length > 0) {
              items.forEach((item: { media_type: number; image_versions2?: { candidates?: { url: string }[] }; video_versions?: { url: string }[] }) => {
                const isVideoItem = item.media_type === 2;
                const imageUrl = item.image_versions2?.candidates?.[0]?.url;
                const videoUrl = item.video_versions?.[0]?.url;
                // Only push items where we have a valid URL
                const mediaUrl = isVideoItem ? videoUrl : imageUrl;
                if (mediaUrl) {
                  mediaItems.push({
                    url: mediaUrl,
                    type: isVideoItem ? 'video' : 'image',
                    thumbnail: imageUrl
                  });
                }
              });
              type = 'carousel';
              caption = `${username}'s Stories`;
            }
          } catch {
          }
        }

        // 3. If no stories found or no session, return the HD Profile Pic
        if (mediaItems.length === 0 && hdProfilePic) {
          mediaItems.push({
            url: hdProfilePic,
            type: 'image',
            thumbnail: hdProfilePic
          });
          type = 'post';
        } else if (mediaItems.length === 0 && !hdProfilePic) {
           return NextResponse.json(
            { success: false, error: 'Could not find profile information or stories.' },
            { status: 404, headers: { 'Cache-Control': 'no-store' } }
          );
        }

        post = {
          id: username,
          shortcode: username,
          type,
          author: username,
          caption,
          authorAvatar: hdProfilePic,
          mediaItems
        };
      } catch {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch profile. The account might be private.' },
          { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    } else {
    // ─────────────────────────────────────────────────────────────
    // Standard Media Strategies
    // ─────────────────────────────────────────────────────────────
      const graphqlPaths = isReel
      ? [`reel/${shortcode}`, `p/${shortcode}`]
      : [`p/${shortcode}`, `reel/${shortcode}`];

    for (const path of graphqlPaths) {
      const shouldTryReelPath =
        path.startsWith('reel/') && Boolean(post?.mediaItems.length) && !hasVideoMedia(post);
      if (post && post.mediaItems.length > 0 && !shouldTryReelPath) break;
      try {
        const graphqlUrl = `https://www.instagram.com/${path}/?__a=1&__d=dis`;
        const response = await axios.get(graphqlUrl, { headers, timeout: 5000 });
        if (response.data && !response.data.require_login) {
          const parsed = parseGraphQLResponse(response.data);
          if (parsed && parsed.mediaItems.length > 0) post = parsed;
        } else if (response.data?.require_login) {
          break;
        }
      } catch {
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Strategy 2: instagram-url-direct — reliable for guests,
    // returns full-res URLs for both images and videos
    // ─────────────────────────────────────────────────────────────
    if (!post || post.mediaItems.length === 0 || !hasVideoMedia(post)) {
      try {
        const directResult = await instagramGetUrl(url);
        if (directResult?.media_details && directResult.media_details.length > 0) {
          const mediaItems = directResult.media_details.map((m) => ({
            url: m.url,
            type: (m.type === 'video' ? 'video' : 'image') as 'video' | 'image',
            thumbnail: m.thumbnail || m.url,
          }));
          const directHasVideo = mediaItems.some((item) => item.type === 'video');

          if (!post || post.mediaItems.length === 0 || directHasVideo) {
            post = {
              id: shortcode || username || '',
              shortcode: shortcode || username || '',
              type: directHasVideo
                ? (isReel || post?.type === 'reel' ? 'reel' : 'post')
                : (mediaItems.length > 1 ? 'carousel' : 'post'),
              author: directResult.post_info?.owner_username || post?.author || 'Unknown',
              caption: directResult.post_info?.caption || post?.caption || '',
              mediaItems,
            };
          }
        }
      } catch {
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Strategy 3: Embed endpoint — good for video/reels without auth
    // ─────────────────────────────────────────────────────────────
    if (!post || post.mediaItems.length === 0 || ((isReel || post.type === 'reel') && !hasVideoMedia(post))) {
      try {
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
        const embedResponse = await axios.get(embedUrl, {
          headers: {
            ...headers,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Sec-Fetch-Dest': 'iframe',
            'Sec-Fetch-Mode': 'navigate',
          },
          timeout: 6000,
        });
        const html = embedResponse.data as string;

        // Try structured JSON blob first (use [\s\S] instead of /s flag for ES2017 compat)
        const jsonMatch = html.match(/window\.__additionalDataLoaded\s*\(\s*['"][^'"]*['"]\s*,\s*(\{[\s\S]+?\})\s*\);/)
          || html.match(/window\["__additionalDataLoaded"\]\s*\([^,]+,\s*(\{[\s\S]+?\})\s*\);/);

        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            const media = data?.shortcode_media;
            if (media) {
              const parsed = parseGraphQLResponse({ graphql: { shortcode_media: media } });
              if (parsed && parsed.mediaItems.length > 0) {
                post = parsed;
              }
            }
          } catch { /* ignore JSON parse errors */ }
        }

        // Fallback: regex scrape from embed HTML
        if (!post || ((isReel || post.type === 'reel') && !hasVideoMedia(post))) {
          const videoMatch = html.match(/"video_url":"([^"]+)"/);
          const thumbMatch = html.match(/"display_url":"([^"]+)"/);
          const authorMatch = html.match(/"username":"([^"]+)"/);

          if (videoMatch) {
            const videoUrl = unescapeUrl(videoMatch[1]);
            const thumbUrl = thumbMatch ? unescapeUrl(thumbMatch[1]) : undefined;
            post = {
              id: shortcode || username || '',
              shortcode: shortcode || username || '',
              type: 'reel',
              author: authorMatch?.[1] || post?.author || 'Unknown',
              caption: post?.caption || '',
              mediaItems: [{ url: videoUrl, type: 'video', thumbnail: thumbUrl }],
            };
          }
        }
      } catch {
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Strategy 4: HTML meta tag scraping — last resort, thumbnail only
    // ─────────────────────────────────────────────────────────────
    if (!post || post.mediaItems.length === 0) {
      try {
        const pageUrl = `https://www.instagram.com/p/${shortcode}/`;
        const response = await axios.get(pageUrl, { headers, timeout: 5000 });
        const $ = cheerio.load(response.data);

        // Try window._sharedData
        let sharedDataRaw: unknown = null;
        $('script').each((_, el) => {
          const content = $(el).html();
          if (content && content.includes('window._sharedData = ')) {
            try {
              const jsonStr = content.split('window._sharedData = ')[1].split(';</script>')[0];
              sharedDataRaw = JSON.parse(jsonStr);
            } catch { /* ignore */ }
          }
        });
        const sharedData = sharedDataRaw as SharedData | null;

        if (sharedData?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media) {
          post = parseGraphQLResponse(sharedData.entry_data.PostPage[0] as unknown);
        }

        if (!post) {
          // Try regex video_url in raw HTML
          const videoMatch = response.data.match(/"video_url":"([^"]+)"/);
          const ogVideo = $('meta[property="og:video"]').attr('content')
            || (videoMatch ? unescapeUrl(videoMatch[1]) : null);
          const ogImage = $('meta[property="og:image"]').attr('content');
          const title = $('meta[property="og:title"]').attr('content') || '';

          if (ogVideo || ogImage) {
            post = {
              id: shortcode as string,
              shortcode: shortcode as string,
              type: ogVideo ? 'reel' : 'post',
              author: title.split(' on Instagram')[0] || 'Unknown',
              caption: title,
              mediaItems: [{
                url: (ogVideo || ogImage) as string,
                type: ogVideo ? 'video' : 'image',
                thumbnail: ogImage || undefined,
              }],
            };
          }
        }
      } catch {
      }
    }
    }

    if (!post || post.mediaItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media. The post might be private or removed.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Allow both www. and non-www. variants of the app origin
    return NextResponse.json({ success: true, data: post }, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*', // CDN media URLs are fetched client-side via proxy; allow all
      },
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not connect. Please check your internet and try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
