"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, Heart, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Film, Copy, Hash, Check, Music, Scissors, Loader2 } from "lucide-react";
import { InstagramPost, MediaItem } from "@/types/instagram";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";

const VideoTrimmer = dynamic(() => import("@/components/VideoTrimmer"), { ssr: false });

const IG_GRADIENT = "from-insta-orange via-insta-pink to-insta-purple";
const proxiedMediaUrl = (url?: string) =>
  url ? `/api/proxy?url=${encodeURIComponent(url)}&inline=true` : "";

export default function MediaCard({ post }: { post: InstagramPost }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const activeMedia = post.mediaItems[activeMediaIndex];
  const isVideo = activeMedia?.type === "video";
  const isCarousel = post.mediaItems.length > 1;
  /**
   * Build the proxy download URL for a given media item.
   */
  const buildProxyUrl = useCallback((media: MediaItem, index?: number, audioOnly = false) => {
    const ext = audioOnly ? "mp3" : media.type === "video" ? "mp4" : "jpg";
    const suffix = index !== undefined ? `_${index + 1}` : "";
    const filename = `instorix_${post.shortcode}${suffix}.${ext}`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(media.url)}&shortcode=${post.shortcode}&filename=${encodeURIComponent(filename)}${audioOnly ? '&audioOnly=true' : ''}`;
    return { filename, proxyUrl };
  }, [post.shortcode]);

  /**
   * Blob-based download — works from any context (setTimeout, loops, etc.)
   * Used for "Download All" on every platform and as desktop single-download.
   */
  const blobDownload = useCallback(async (media: MediaItem, index?: number, audioOnly = false) => {
    const { filename, proxyUrl } = buildProxyUrl(media, index, audioOnly);
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  }, [buildProxyUrl]);

  /**
   * Cross-platform download handler — called from DIRECT user click only.
   *
   * MOBILE (iOS Safari/Chrome, Android Chrome):
   *   Opens the proxy URL in a new tab. The proxy returns
   *   Content-Disposition: attachment which triggers native download.
   *   Must be synchronous from click (no await before window.open).
   *
   * DESKTOP:
   *   fetch → Blob → Object URL for better UX (toast, no new tab).
   */
  const handleDownload = useCallback(async (media: MediaItem, index?: number, audioOnly = false) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const { proxyUrl } = buildProxyUrl(media, index, audioOnly);
      window.open(proxyUrl, '_blank');
      toast.success("Download started!");
      return;
    }

    // Desktop: blob approach
    setDownloading(true);
    const toastId = toast.loading("Preparing download…");
    try {
      await blobDownload(media, index, audioOnly);
      toast.success("Download started!", { id: toastId });
    } catch {
      toast.error("Download failed. Please try again.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  }, [buildProxyUrl, blobDownload]);

  /**
   * Download all carousel items sequentially using blob approach.
   * Works on all platforms including mobile (no window.open, no popup block).
   */
  const handleDownloadAll = useCallback(async () => {
    setDownloading(true);
    const toastId = toast.loading(`Downloading ${post.mediaItems.length} items…`);
    try {
      for (let i = 0; i < post.mediaItems.length; i++) {
        toast.loading(`Downloading ${i + 1}/${post.mediaItems.length}…`, { id: toastId });
        await blobDownload(post.mediaItems[i], i);
        // Small delay between downloads so browser processes each one
        if (i < post.mediaItems.length - 1) {
          await new Promise(r => setTimeout(r, 800));
        }
      }
      toast.success("All downloads complete!", { id: toastId });
    } catch {
      toast.error("Some downloads failed. Try downloading individually.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  }, [post.mediaItems, blobDownload]);

  const handleCopyCaption = () => {
    if (post.caption) {
      navigator.clipboard.writeText(post.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleCopyHashtags = () => {
    if (post.caption) {
      const hashtags = post.caption.match(/#[\w]+/g) || [];
      if (hashtags.length > 0) {
        navigator.clipboard.writeText(hashtags.join(" "));
        setCopiedHashtags(true);
        setTimeout(() => setCopiedHashtags(false), 2000);
      }
    }
  };

  const prev = () => setActiveMediaIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveMediaIndex((i) => Math.min(post.mediaItems.length - 1, i + 1));

  const captionTrimmed =
    post.caption && post.caption.length > 120
      ? post.caption.substring(0, 120) + "…"
      : post.caption;

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl max-w-[480px] mx-auto w-full"
    >
      {/* ── Header (Instagram-style) ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${IG_GRADIENT} p-[2px] shrink-0`}
        >
          <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {post.authorAvatar ? (
              <Image
                src={proxiedMediaUrl(post.authorAvatar)}
                alt={post.author ? `@${post.author}` : "Instagram profile"}
                fill
                sizes="36px"
                unoptimized
                className="object-cover rounded-full"
              />
            ) : (
              <span className="text-sm font-bold text-gray-700">
                {post.author?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">
            @{post.author}
          </p>
          {post.timestamp && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{post.timestamp}</p>
          )}
        </div>

        {/* Type badge */}
        <span
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${IG_GRADIENT} text-white shrink-0`}
        >
          {isVideo ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          {post.type === "reel" ? "Reel" : post.type === "carousel" ? "Carousel" : isVideo ? "Video" : "Post"}
        </span>
      </div>

      {/* ── Media Viewer ── */}
      <div className="relative bg-black select-none" style={{ aspectRatio: "4/5" }}>
        {isVideo ? (
          /* Video — proxy needed for same-origin streaming */
          <video
            key={activeMedia.url}
            src={`/api/proxy?url=${encodeURIComponent(activeMedia.url)}&inline=true`}
            poster={
              activeMedia.thumbnail
                ? proxiedMediaUrl(activeMedia.thumbnail)
                : undefined
            }
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="auto"
            controlsList="nodownload"
            crossOrigin="anonymous"
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          /* Images: proxy Instagram CDN media to avoid same-origin response blocking */
          <Image
            key={activeMedia.url}
            src={proxiedMediaUrl(activeMedia.url)}
            alt="Instagram post"
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            unoptimized
            className="object-contain"
            draggable={false}
          />
        )}

        {/* Play overlay for video poster */}
        {isVideo && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0">
            <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Carousel arrows */}
        {isCarousel && (
          <>
            <button
              onClick={prev}
              disabled={activeMediaIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30 hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            <button
              onClick={next}
              disabled={activeMediaIndex === post.mediaItems.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30 hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.mediaItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMediaIndex(i)}
                  className={`cursor-pointer w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeMediaIndex
                      ? "bg-white w-3"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {/* Stats row */}
        {(post.likeCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-[13px] font-semibold text-gray-800 dark:text-gray-200">
            <Heart className="w-4 h-4 fill-insta-pink text-insta-pink" />
            {post.likeCount?.toLocaleString()} likes
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
            <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1">@{post.author}</span>
            {expanded ? post.caption : captionTrimmed}
            {(post.caption?.length ?? 0) > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="cursor-pointer text-gray-400 dark:text-gray-500 ml-1 hover:text-gray-600 dark:hover:text-gray-300 text-[12px]"
              >
                {expanded ? "less" : "more"}
              </button>
            )}
            
            {/* Action Tools for Caption (Always Visible) */}
            <div className="flex gap-2 mt-3 mb-1">
              <button
                onClick={handleCopyCaption}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[12px] font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
                {copiedCaption ? "Copied!" : "Copy Caption"}
              </button>
              
              {(post.caption?.match(/#[\w]+/g) || []).length > 0 && (
                <button
                  onClick={handleCopyHashtags}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[12px] font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {copiedHashtags ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Hash className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
                  {copiedHashtags ? "Copied!" : "Extract Hashtags"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Download Section ── */}
        <div className="pt-1 space-y-2">
          {isCarousel ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(activeMedia, activeMediaIndex)}
                disabled={downloading}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-gradient-to-r ${IG_GRADIENT} text-white font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? "Downloading…" : `Download This (${activeMediaIndex + 1}/${post.mediaItems.length})`}
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={downloading}
                className="cursor-pointer flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-[13px] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                All
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Primary download */}
              <button
                onClick={() => handleDownload(activeMedia)}
                disabled={downloading}
                className={`cursor-pointer w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r ${IG_GRADIENT} text-white font-semibold text-[15px] hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {downloading ? "Downloading…" : "Download HD"}
              </button>

              {/* Secondary actions — only for videos/reels */}
              {(activeMedia.type === "video" || post.type === "reel") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(activeMedia, undefined, true)}
                    disabled={downloading}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 h-10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-[13px] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download Audio Only (MP3)"
                  >
                    <Music className="w-4 h-4" />
                    MP3
                  </button>
                  <button
                    onClick={() => setShowTrimmer(true)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 h-10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-[13px] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    title="Trim Video"
                  >
                    <Scissors className="w-4 h-4" />
                    Trim
                  </button>
                </div>
              )}
            </div>
          )}


          {/* Open on IG */}
          <a
            href={`https://www.instagram.com/p/${post.shortcode}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 h-9 text-[12px] text-gray-400 hover:text-gray-600 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on Instagram
          </a>
        </div>
      </div>
    </motion.div>

    {showTrimmer && post.mediaItems[0]?.type === "video" && (
      <VideoTrimmer
        proxyUrl={`/api/proxy?url=${encodeURIComponent(post.mediaItems[0].url)}&shortcode=${post.shortcode}&filename=${encodeURIComponent(`instorix_${post.shortcode}.mp4`)}&inline=true`}
        filename={`instorix_${post.shortcode}.mp4`}
        onClose={() => setShowTrimmer(false)}
      />
    )}
    </>
  );
}
