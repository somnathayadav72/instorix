"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Heart, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Film, Copy, Hash, Check, Music } from "lucide-react";
import { InstagramPost, MediaItem } from "@/types/instagram";

const IG_GRADIENT = "from-[#F77737] via-[#E1306C] to-[#833AB4]";

export default function MediaCard({ post }: { post: InstagramPost }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const activeMedia = post.mediaItems[activeMediaIndex];
  const isVideo = activeMedia?.type === "video";
  const isCarousel = post.mediaItems.length > 1;

  const handleDownload = (media: MediaItem, index?: number, audioOnly = false) => {
    const ext = audioOnly ? "mp3" : media.type === "video" ? "mp4" : "jpg";
    const suffix = index !== undefined ? `_${index + 1}` : "";
    const filename = `instorix_${post.shortcode}${suffix}.${ext}`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(media.url)}&shortcode=${post.shortcode}&filename=${encodeURIComponent(filename)}${audioOnly ? '&audioOnly=true' : ''}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {post.authorAvatar ? (
              <img
                src={`/api/proxy?url=${encodeURIComponent(post.authorAvatar)}&inline=true`}
                alt={post.author}
                className="w-full h-full object-cover rounded-full"
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
          /* Video — no download control, custom styled */
          <video
            key={activeMedia.url}
            src={`/api/proxy?url=${encodeURIComponent(activeMedia.url)}&inline=true`}
            poster={
              activeMedia.thumbnail
                ? `/api/proxy?url=${encodeURIComponent(activeMedia.thumbnail)}&inline=true`
                : undefined
            }
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"       /* hide browser download button */
            onContextMenu={(e) => e.preventDefault()} /* disable right-click */
          />
        ) : (
          <img
            key={activeMedia.url}
            src={`/api/proxy?url=${encodeURIComponent(activeMedia.url)}&inline=true`}
            alt="Instagram post"
            className="w-full h-full object-contain"
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
            <Heart className="w-4 h-4 fill-[#E1306C] text-[#E1306C]" />
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
                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-gradient-to-r ${IG_GRADIENT} text-white font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm`}
              >
                <Download className="w-4 h-4" />
                Download This ({activeMediaIndex + 1}/{post.mediaItems.length})
              </button>
              <button
                onClick={() =>
                  post.mediaItems.forEach((m, i) =>
                    setTimeout(() => handleDownload(m, i), i * 600)
                  )
                }
                className="cursor-pointer flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-[13px] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                All
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(post.mediaItems[0])}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r ${IG_GRADIENT} text-white font-semibold text-[15px] hover:opacity-90 transition-opacity shadow-md`}
              >
                <Download className="w-5 h-5" />
                Download HD
              </button>
              {post.mediaItems[0].type === "video" && (
                <button
                  onClick={() => handleDownload(post.mediaItems[0], undefined, true)}
                  className="cursor-pointer flex items-center justify-center gap-1.5 h-12 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-[14px] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
                  title="Download Audio Only (MP3)"
                >
                  <Music className="w-5 h-5" />
                  MP3
                </button>
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
  );
}
