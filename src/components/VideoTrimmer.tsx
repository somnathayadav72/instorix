"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Download, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface VideoTrimmerProps {
  proxyUrl: string;
  filename: string;
  onClose: () => void;
}

const IG_GRADIENT = "from-insta-orange via-insta-pink to-insta-purple";

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatDisplay(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const d = Math.floor((sec % 1) * 10);
  return `${pad(m)}:${pad(s)}.${d}`;
}

function toFfmpegTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(3).padStart(6, "0");
  return `${pad(h)}:${pad(m)}:${s}`;
}

// ── Custom dual-handle range slider ──────────────────────────────────────────

interface DualSliderProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartChange: (v: number) => void;
  onEndChange: (v: number) => void;
  disabled?: boolean;
}

function DualSlider({ duration, startTime, endTime, onStartChange, onEndChange, disabled }: DualSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | null>(null);

  const startPct = duration ? (startTime / duration) * 100 : 0;
  const endPct = duration ? (endTime / duration) * 100 : 100;

  const getTime = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * duration * 10) / 10;
  };

  const onMove = (clientX: number) => {
    if (!dragging.current || disabled) return;
    const t = getTime(clientX);
    if (dragging.current === "start") {
      onStartChange(Math.min(t, endTime - 0.5));
    } else {
      onEndChange(Math.max(t, startTime + 0.5));
    }
  };

  const stopDrag = () => { dragging.current = null; };

  return (
    <div
      className="relative h-10 flex items-center select-none px-3"
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={(e) => { e.preventDefault(); onMove(e.touches[0].clientX); }}
      onTouchEnd={stopDrag}
    >
      <div className="relative w-full h-full flex items-center" ref={trackRef}>
        {/* Track */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          {/* Active fill */}
          <div
            className={`absolute h-full rounded-full bg-gradient-to-r ${IG_GRADIENT}`}
            style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
          />
        </div>

        {/* Start thumb — pink */}
        <div
          className={`absolute top-1/2 -mt-3 w-6 h-6 rounded-full bg-white border-[3px] border-insta-pink shadow-lg z-20 ${disabled ? "opacity-40" : "cursor-grab active:cursor-grabbing"}`}
          style={{ left: `${startPct}%`, transform: "translateX(-50%)" }}
          onMouseDown={() => { if (!disabled) dragging.current = "start"; }}
          onTouchStart={() => { if (!disabled) dragging.current = "start"; }}
        />

        {/* End thumb — purple */}
        <div
          className={`absolute top-1/2 -mt-3 w-6 h-6 rounded-full bg-white border-[3px] border-insta-purple shadow-lg z-20 ${disabled ? "opacity-40" : "cursor-grab active:cursor-grabbing"}`}
          style={{ left: `${endPct}%`, transform: "translateX(-50%)" }}
          onMouseDown={() => { if (!disabled) dragging.current = "end"; }}
          onTouchStart={() => { if (!disabled) dragging.current = "end"; }}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function VideoTrimmer({ proxyUrl, filename, onClose }: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const [status, setStatus] = useState<"idle" | "loading-ffmpeg" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const mounted = typeof document !== "undefined";

  useEffect(() => {
    // Optional: lock body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const onMetadata = useCallback(() => {
    const dur = videoRef.current?.duration ?? 0;
    if (dur && isFinite(dur)) {
      setDuration(dur);
      setEndTime(dur);
    }
  }, []);

  const handleStartChange = (val: number) => {
    setStartTime(val);
    if (videoRef.current) videoRef.current.currentTime = val;
  };

  const handleEndChange = (val: number) => {
    setEndTime(val);
    if (videoRef.current) videoRef.current.currentTime = val;
  };

  const trimDuration = endTime - startTime;
  const busy = status === "loading-ffmpeg" || status === "processing";

  const handleTrim = async () => {
    if (startTime >= endTime) return;
    setStatus("loading-ffmpeg");
    setProgress(0);
    setErrorMsg("");

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));

      await ffmpeg.load({
        coreURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
          "application/wasm"
        ),
      });

      setStatus("processing");

      await ffmpeg.writeFile("input.mp4", await fetchFile(proxyUrl));
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-ss", toFfmpegTime(startTime),
        "-to", toFfmpegTime(endTime),
        "-c", "copy",
        "output.mp4",
      ]);

      const data = await ffmpeg.readFile("output.mp4");
      const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
      const arrayBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(arrayBuffer).set(bytes);
      const blob = new Blob([arrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.replace(".mp4", `_trim_${Math.round(startTime)}s-${Math.round(endTime)}s.mp4`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");
      setStatus("done");
    } catch {
      setErrorMsg("Trim failed. The video may be too large or your browser doesn't support WebAssembly.");
      setStatus("error");
    }
  };

  const statusLabel =
    status === "loading-ffmpeg" ? "Loading trimmer engine…" :
    status === "processing" ? `Trimming… ${progress}%` :
    status === "done" ? "Done! Check your downloads." : "";

  const content = (
    <AnimatePresence>
      <motion.div
        key="trimmer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${IG_GRADIENT} px-5 py-3.5 flex items-center justify-between shrink-0`}>
            <div className="flex items-center gap-2 text-white">
              <Scissors className="w-5 h-5" />
              <span className="font-bold text-[15px]">Video Trimmer</span>
            </div>
            <button onClick={onClose} className="cursor-pointer w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Video preview */}
            <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
              <video
                ref={videoRef}
                src={proxyUrl}
                onLoadedMetadata={onMetadata}
                className="w-full h-full object-contain"
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            {/* Slider section */}
            {duration > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Select Range
                </p>

                <DualSlider
                  duration={duration}
                  startTime={startTime}
                  endTime={endTime}
                  onStartChange={handleStartChange}
                  onEndChange={handleEndChange}
                  disabled={busy}
                />

                {/* Time labels */}
                <div className="flex items-center justify-between mt-1">
                  <div className="text-center">
                    <p className="text-[9px] text-insta-pink font-bold uppercase tracking-wide">● Start</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 font-mono">{formatDisplay(startTime)}</p>
                  </div>
                  <div className="text-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Duration</p>
                    <p className="text-[13px] font-bold text-gray-700 dark:text-gray-200 font-mono">{formatDisplay(trimDuration)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-insta-purple font-bold uppercase tracking-wide">● End</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 font-mono">{formatDisplay(endTime)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {busy && (
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${IG_GRADIENT}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${status === "loading-ffmpeg" ? 10 : progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[12px] text-center text-gray-500 dark:text-gray-400">{statusLabel}</p>
              </div>
            )}

            {/* Status messages */}
            {status === "done" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-[13px] text-green-700 dark:text-green-400 font-medium">Trimmed video downloaded!</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-[13px] text-red-700 dark:text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleTrim}
                disabled={busy || duration === 0 || startTime >= endTime}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-semibold text-[14px] text-white bg-gradient-to-r ${IG_GRADIENT} hover:opacity-90 transition-opacity shadow-md disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {busy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{status === "loading-ffmpeg" ? "Loading…" : "Trimming…"}</>
                ) : (
                  <><Download className="w-4 h-4" />Trim &amp; Download</>
                )}
              </button>
              {status === "done" && (
                <button
                  onClick={() => { setStatus("idle"); setProgress(0); }}
                  className="cursor-pointer px-4 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-[13px] hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Trim again
                </button>
              )}
            </div>


          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
