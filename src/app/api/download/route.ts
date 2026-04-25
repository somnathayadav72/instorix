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
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.includes('instagram.com')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Instagram URL' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Detect profile URLs (e.g. instagram.com/username/)
    const isProfileUrl = !/\/(p|reel|tv|stories)\//.test(url);
    let username: string | null = null;
    if (isProfileUrl) {
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/);
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
    const isReel = url.includes('/reel/');

    // ─────────────────────────────────────────────────────────────
    // Profile URL Strategy: Fetch Stories (Requires Session ID)
    // ─────────────────────────────────────────────────────────────
    if (isProfileUrl && username) {
      if (!process.env.INSTAGRAM_SESSION_ID) {
        return NextResponse.json(
          { success: false, error: 'Downloading stories from a profile requires INSTAGRAM_SESSION_ID in your .env configuration.' },
          { status: 401, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      try {
        // 1. Get user ID
        const profileRes = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
          headers: { ...headers, 'X-IG-App-ID': '936619743392459' },
          timeout: 8000
        });
        const userId = profileRes.data?.data?.user?.id;
        
        if (userId) {
          // 2. Fetch stories feed
          const storiesRes = await axios.get(`https://www.instagram.com/api/v1/feed/user/${userId}/story/`, {
            headers,
            timeout: 8000
          });
          const items = storiesRes.data?.reel?.items || [];
          if (items.length > 0) {
            const mediaItems: DirectMediaItem[] = [];
            items.forEach((item: any) => {
              const isVideo = item.media_type === 2;
              const imageUrl = item.image_versions2?.candidates?.[0]?.url;
              const videoUrl = item.video_versions?.[0]?.url;
              mediaItems.push({
                url: isVideo ? videoUrl : imageUrl,
                type: isVideo ? 'video' : 'image',
                thumbnail: imageUrl
              });
            });
            post = {
              id: username,
              shortcode: username,
              type: 'carousel', // Treat stories as a carousel of items
              author: username,
              caption: `${username}'s Stories`,
              mediaItems
            };
          } else {
             return NextResponse.json(
              { success: false, error: 'No active stories found for this user.' },
              { status: 404, headers: { 'Cache-Control': 'no-store' } }
            );
          }
        }
      } catch (error) {
        console.warn('Profile stories fetch failed:', error instanceof Error ? error.message : String(error));
        return NextResponse.json(
          { success: false, error: 'Failed to fetch stories. The account might be private or the session expired.' },
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
      if (post && post.mediaItems.length > 0) break;
      try {
        const graphqlUrl = `https://www.instagram.com/${path}/?__a=1&__d=dis`;
        const response = await axios.get(graphqlUrl, { headers, timeout: 5000 });
        if (response.data && !response.data.require_login) {
          const parsed = parseGraphQLResponse(response.data);
          if (parsed && parsed.mediaItems.length > 0) post = parsed;
        } else if (response.data?.require_login) {
          console.warn('GraphQL endpoint requires login');
          break;
        }
      } catch (error) {
        console.warn(`GraphQL strategy failed for /${path}/:`, error instanceof Error ? error.message : String(error));
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Strategy 2: instagram-url-direct — reliable for guests,
    // returns full-res URLs for both images and videos
    // ─────────────────────────────────────────────────────────────
    if (!post || post.mediaItems.length === 0) {
      try {
        const directResult = await instagramGetUrl(url);
        if (directResult?.media_details && directResult.media_details.length > 0) {
          const firstType = directResult.media_details[0].type;
          post = {
            id: shortcode || username || '',
            shortcode: shortcode || username || '',
            type: firstType === 'video'
              ? (isReel ? 'reel' : 'post')
              : (directResult.media_details.length > 1 ? 'carousel' : 'post'),
            author: directResult.post_info?.owner_username || 'Unknown',
            caption: directResult.post_info?.caption || '',
            mediaItems: directResult.media_details.map((m: DirectMediaItem) => ({
              url: m.url,
              type: m.type === 'video' ? 'video' : 'image',
              thumbnail: m.thumbnail || m.url,
            })),
          };
          console.log('instagram-url-direct succeeded:', post?.type, post?.mediaItems.length, 'items');
        }
      } catch (error) {
        console.warn('instagram-url-direct strategy failed:', error instanceof Error ? error.message : String(error));
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Strategy 3: Embed endpoint — good for video/reels without auth
    // ─────────────────────────────────────────────────────────────
    if (!post || post.mediaItems.length === 0 || (isReel && post.mediaItems[0]?.type === 'image')) {
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
                console.log('Embed JSON strategy succeeded');
              }
            }
          } catch (e) { /* ignore JSON parse errors */ }
        }

        // Fallback: regex scrape from embed HTML
        if (!post || (isReel && post.mediaItems[0]?.type === 'image')) {
          const videoMatch = html.match(/"video_url":"([^"]+)"/);
          const thumbMatch = html.match(/"display_url":"([^"]+)"/);
          const authorMatch = html.match(/"username":"([^"]+)"/);

          if (videoMatch) {
            const videoUrl = unescapeUrl(videoMatch[1]);
            const thumbUrl = thumbMatch ? unescapeUrl(thumbMatch[1]) : undefined;
            console.log('Embed video URL found:', videoUrl.substring(0, 80));
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
      } catch (error) {
        console.warn('Embed strategy failed:', error instanceof Error ? error.message : String(error));
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
        let sharedData: SharedData | null = null;
        $('script').each((_, el) => {
          const content = $(el).html();
          if (content && content.includes('window._sharedData = ')) {
            try {
              const jsonStr = content.split('window._sharedData = ')[1].split(';</script>')[0];
              sharedData = JSON.parse(jsonStr) as SharedData;
            } catch (e) { /* ignore */ }
          }
        });

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
      } catch (error) {
        console.warn('HTML scraping strategy failed:', error instanceof Error ? error.message : String(error));
      }
    }
    }

    if (!post || post.mediaItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media. The post might be private or removed.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ success: true, data: post }, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: unknown) {
    console.error('Download API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not connect. Please check your internet and try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
