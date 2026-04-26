import { InstagramPost, MediaItem } from '@/types/instagram';

export function extractShortcode(url: string): string | null {
  const match = url.match(/(?:p|reels?|tv|stories(?:\/[^\/]+)?)\/([^\/?#&]+)/i);
  return match ? match[1] : null;
}


export function buildInstagramHeaders(): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  };
}

/**
 * Unescape JSON-encoded URL characters common in Instagram's embedded JSON.
 * e.g. \u0026 → & and \/ → /
 */
export function unescapeUrl(url: string): string {
  return url.replace(/\\u0026/g, '&').replace(/\\\//g, '/');
}


export function parseGraphQLResponse(data: unknown): InstagramPost | null {
  try {
    // Cast once at the boundary — the whole function works with loose shape objects
    // from Instagram's JSON, which we can't fully type statically.
    type Obj = Record<string, unknown>;
    const d = data as Obj;

    const postData: Obj = (
      ((d?.graphql as Obj)?.shortcode_media as Obj)
      || ((d?.items as Obj[]))?.[0] as Obj
      || d
    );
    if (!postData) return null;

    const typename = postData.__typename as string | undefined;
    const productType = postData.product_type as string | undefined;
    const mediaType = Number(postData.media_type);
    let type: 'post' | 'reel' | 'story' | 'igtv' | 'carousel' = 'post';

    if (typename === 'GraphVideo' || typename === 'GraphQLVideo' || postData.video_versions || postData.is_video || mediaType === 2 || productType === 'clips') {
      type = productType === 'clips' ? 'reel' : 'post';
    } else if (typename === 'GraphSidecar' || typename === 'GraphQLSidecar' || postData.carousel_media || mediaType === 8) {
      type = 'carousel';
    }

    const shortcode = (postData.shortcode || postData.code || 'unknown') as string;
    const owner = postData.owner as Obj | undefined;
    const user  = postData.user  as Obj | undefined;
    const author = (owner?.username || user?.username || 'unknown') as string;
    const authorAvatar = (owner?.profile_pic_url || user?.profile_pic_url) as string | undefined;

    const likeEdge = postData.edge_media_preview_like as Obj | undefined;
    const likeCount = ((likeEdge?.count || postData.like_count || 0)) as number;
    const timestamp = postData.taken_at_timestamp
      ? formatTimestamp(postData.taken_at_timestamp as number)
      : undefined;

    let caption = '';
    const captionEdges = ((postData.edge_media_to_caption as Obj)?.edges as Obj[]);
    if (captionEdges?.[0]) {
      caption = ((captionEdges[0].node as Obj)?.text as string) || '';
    } else {
      caption = ((postData.caption as Obj)?.text as string) || '';
    }

    const mediaItems: MediaItem[] = [];

    if (type === 'carousel') {
      const sidecar = postData.edge_sidecar_to_children as Obj | undefined;
      const edges: Obj[] = ((sidecar?.edges || postData.carousel_media || []) as Obj[]);
      edges.forEach((edge: Obj) => {
        const node = ((edge.node || edge) as Obj);
        const imageVersions = node.image_versions2 as Obj | undefined;
        const candidates = imageVersions?.candidates as Obj[] | undefined;
        const isVideo = node.is_video || node.video_versions || Number(node.media_type) === 2;
        const videoVersions = node.video_versions as Obj[] | undefined;
        mediaItems.push({
          url: (isVideo
            ? (node.video_url || videoVersions?.[0]?.url)
            : (node.display_url || candidates?.[0]?.url)) as string,
          type: isVideo ? 'video' : 'image',
          thumbnail: (node.display_url || candidates?.[0]?.url) as string | undefined,
        });
      });
    } else if (postData.is_video || postData.video_url || postData.video_versions || mediaType === 2 || productType === 'clips') {
      const videoVersions = postData.video_versions as Obj[] | undefined;
      const imageVersions = postData.image_versions2 as Obj | undefined;
      const candidates = imageVersions?.candidates as Obj[] | undefined;
      const videoUrl = (postData.video_url || videoVersions?.[0]?.url) as string | undefined;
      const imageUrl = (postData.display_url || candidates?.[0]?.url) as string | undefined;

      if (videoUrl) {
        mediaItems.push({ url: videoUrl, type: 'video', thumbnail: imageUrl });
      } else {
        mediaItems.push({ url: imageUrl as string, type: 'image', thumbnail: imageUrl });
      }
    } else {
      const imageVersions = postData.image_versions2 as Obj | undefined;
      const candidates = imageVersions?.candidates as Obj[] | undefined;
      const imageUrl = (postData.display_url || candidates?.[0]?.url) as string | undefined;
      mediaItems.push({ url: imageUrl as string, type: 'image', thumbnail: imageUrl });
    }

    return {
      id: (postData.id || shortcode) as string,
      shortcode,
      type,
      caption,
      author,
      authorAvatar,
      likeCount,
      timestamp,
      mediaItems,
    };
  } catch {
    return null;
  }
}


export function formatTimestamp(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} years ago`;
}
