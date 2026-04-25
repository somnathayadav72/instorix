export interface MediaItem {
  url: string;
  type: 'video' | 'image';
  thumbnail?: string;
  quality?: string;
  width?: number;
  height?: number;
}

export interface InstagramPost {
  id: string;
  shortcode: string;
  type: 'post' | 'reel' | 'story' | 'igtv' | 'carousel';
  caption?: string;
  author?: string;
  authorAvatar?: string;
  likeCount?: number;
  timestamp?: string;
  mediaItems: MediaItem[];
}

export interface ApiResponse {
  success: boolean;
  data?: InstagramPost;
  error?: string;
}
