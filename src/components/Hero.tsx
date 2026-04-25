"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, ClipboardPaste, ArrowRight, Trash2, Link2, Play, Image as ImageIcon, Layers, UserCircle, Music } from "lucide-react";
import toast from "react-hot-toast";
import { InstagramPost } from "@/types/instagram";
import MediaCard from "@/components/MediaCard";
import InstorixLogo from "@/components/InstorixLogo";

const IG_GRADIENT = "from-[#F77737] via-[#E1306C] to-[#833AB4]";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InstagramPost | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [recentDownloads, setRecentDownloads] = useState<InstagramPost[]>([]);
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    try {
      const h = localStorage.getItem("insta_history");
      if (h) setRecentDownloads(JSON.parse(h));
    } catch {}
  }, []);

  const saveToHistory = (post: InstagramPost) => {
    const next = [post, ...recentDownloads.filter((p) => p.id !== post.id)].slice(0, 5);
    setRecentDownloads(next);
    localStorage.setItem("insta_history", JSON.stringify(next));
  };

  const clearHistory = () => {
    setRecentDownloads([]);
    localStorage.removeItem("insta_history");
  };

  const isProfileUrl = (v: string) =>
    v.includes("instagram.com") && !/\/(p|reel|tv|stories)\//.test(v);

  const validate = (value: string) => {
    if (!value.trim()) { setIsValid(null); setError(""); return; }
    if (!value.includes("instagram.com")) { setIsValid(false); setError(""); return; }
    // Removed profile url block so users can fetch HD Profile Pictures
    setIsValid(true);
    setError("");
    setIsValid(true);
    setError("");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    validate(e.target.value);
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      const pastedText = text.trim();
      setUrl(pastedText);
      validate(pastedText);
      setPasted(true);
      setTimeout(() => setPasted(false), 1500);

      if (pastedText.includes("instagram.com")) {
        handleSubmit(undefined, pastedText);
      }
    } catch {
      toast.error("Couldn't read clipboard. Please paste manually.");
    }
  };

  const handleSubmit = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = overrideUrl || url;
    if (!targetUrl.trim()) { setError("Please enter a URL"); return; }
    
    // Allow profile urls to fetch HD Profile Pictures
    if (!targetUrl.includes("instagram.com")) { setError("Please enter a valid Instagram URL"); return; }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch media");
      setResult(data.data);
      saveToHistory(data.data);
      setTimeout(() => {
        const element = document.getElementById("result-section");
        if (element) {
          // Adjust offset to account for sticky navbar and visual centering
          const y = element.getBoundingClientRect().top + window.scrollY - 800;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const hasContent = loading || result;

  return (
    <section className={`relative flex flex-col items-center px-4 overflow-hidden bg-[#fafafa] dark:bg-[#0A0A0F] transition-colors duration-500
      ${hasContent ? 'pt-24 pb-20' : 'min-h-screen pt-32 pb-20'}`}>
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F77737]/10 via-[#E1306C]/10 to-[#833AB4]/10 blur-3xl" />
      </div>

      <div className={`relative z-10 w-full max-w-lg mx-auto flex flex-col items-center ${!hasContent ? 'my-auto' : ''}`}>

        {/* ── Headline ── */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 w-full"
        >
          <h1 className="text-[40px] leading-[1.1] sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Download any <br className="hidden sm:block"/>
            <span className={`bg-gradient-to-r ${IG_GRADIENT} bg-clip-text text-transparent pr-1`}>
              Instagram
            </span> content
          </h1>
          <p className="text-[17px] text-gray-500 dark:text-[#8ba1ba] font-medium max-w-md mx-auto leading-relaxed">
            Save Reels, Posts, Stories, Profile Photos and Audio in high quality. — Fast, free and easy.
          </p>
        </motion.div>

        {/* ── Icons Row ── */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 sm:gap-6 mb-12 w-full"
        >
          {[
            { icon: Play, label: "Reels" },
            { icon: ImageIcon, label: "Posts" },
            { icon: Layers, label: "Stories" },
            { icon: UserCircle, label: "Profile Pics" },
            { icon: Music, label: "Audio" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12121A] flex items-center justify-center shadow-sm dark:shadow-lg">
                <item.icon className="w-[22px] h-[22px] text-[#E1306C]" strokeWidth={1.5} />
              </div>
              <span className="text-[12px] text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Input card ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-[540px] bg-white dark:bg-[#12121A] border border-gray-200 dark:border-gray-800 rounded-[28px] shadow-xl dark:shadow-2xl p-5 mb-6 relative z-20"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* URL field */}
            <div className="relative flex items-center h-[56px] bg-gray-50 dark:bg-[#1A1A24] border border-gray-200 dark:border-gray-800 focus-within:border-gray-400 dark:focus-within:border-gray-600 rounded-xl overflow-hidden transition-colors">
              <span className="pl-4 pr-2 text-gray-400 dark:text-gray-500">
                <Link2 className="w-[18px] h-[18px]" />
              </span>
              <input
                type="url"
                placeholder="Paste Instagram link here..."
                value={url}
                onChange={handleUrlChange}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text").trim();
                  if (text.includes("instagram.com")) {
                    setTimeout(() => handleSubmit(undefined, text), 10);
                  }
                }}
                className="flex-1 h-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[15px] outline-none pr-3"
              />
              <div className="pr-1.5 flex items-center gap-2">
                {isValid === true  && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {isValid === false && <AlertCircle  className="w-4 h-4 text-red-500 shrink-0" />}
                <button
                  type="button"
                  onClick={handlePasteClick}
                  className="cursor-pointer h-[44px] px-4 rounded-lg bg-white dark:bg-[#252533] hover:bg-gray-100 dark:hover:bg-[#2d2e3d] text-gray-700 dark:text-white text-[13px] font-semibold flex items-center gap-1.5 transition shrink-0 border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" /> Paste
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1.5 text-red-500 text-[12px] font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className={`cursor-pointer w-full h-[56px] rounded-xl font-bold text-[16px] text-white flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_-5px_rgba(225,48,108,0.4)]
                bg-gradient-to-r ${IG_GRADIENT}
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:opacity-95 active:scale-[0.98] mt-2`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Fetching…</>
              ) : (
                <><ArrowRight className="w-5 h-5" /> Download</>
              )}
            </button>
          </form>
        </motion.div>

        {/* ── Loading skeleton ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-5 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-28 h-3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="w-16 h-2.5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
              <div className="w-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse mb-4" style={{ aspectRatio: "4/5" }} />
              <div className="w-full h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <div id="result-section" className="w-full">
          <AnimatePresence mode="wait">
            {result && !loading && <MediaCard key={result.id} post={result} />}
          </AnimatePresence>
        </div>

        {/* ── Recent downloads ── */}
        <AnimatePresence>
          {!result && !loading && recentDownloads.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mt-10"
            >
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Recent</span>
                <button
                  onClick={clearHistory}
                  className="cursor-pointer flex items-center gap-1 text-gray-300 hover:text-red-400 transition-colors normal-case tracking-normal font-medium text-[11px]"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentDownloads.map((p, i) => (
                  <button
                    key={`${p.id}-${i}`}
                    onClick={() => setResult(p)}
                    className="cursor-pointer shrink-0 w-[100px] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition group"
                  >
                    <div className="w-full h-[100px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={p.mediaItems[0]?.thumbnail
                          ? `/api/proxy?url=${encodeURIComponent(p.mediaItems[0].thumbnail)}&inline=true`
                          : ""}
                        alt={p.author}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-gray-800 dark:text-gray-200 truncate">@{p.author}</p>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 capitalize">{p.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
