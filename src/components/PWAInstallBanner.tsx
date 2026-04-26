"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone, Share, MoreVertical } from "lucide-react";
import InstorixLogo from "@/components/InstorixLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_banner_dismissed_v2";

type Platform = "android" | "ios" | "desktop" | "unknown";
type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isMobile = isIos || isAndroid;
  if (isIos) return "ios";
  if (isAndroid) return "android";
  if (!isMobile) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (isStandalone()) return;

    const detectedPlatform = detectPlatform();
    const frameId = window.requestAnimationFrame(() => {
      setPlatform(detectedPlatform);
      if (detectedPlatform === "ios") {
        setTimeout(() => setVisible(true), 3000);
      }
    });

    // Android / desktop Chrome: wait for browser install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 2500);
    };
    const installedHandler = () => {
      setInstalled(true);
      setVisible(false);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    // iOS: browser never fires beforeinstallprompt — show manual guide instead
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  if (installed || platform === "unknown") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:w-[360px]"
          role="dialog"
          aria-label="Install Instorix app"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-insta-orange via-insta-pink to-insta-purple" />

            <div className="p-4 flex items-start gap-3">
              {/* Logo */}
              <div className="shrink-0 mt-0.5">
                <InstorixLogo variant="icon" size={44} className="rounded-xl shadow-sm" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <Smartphone className="w-3.5 h-3.5 text-insta-pink" />
                  <p className="text-[11px] font-bold text-insta-pink uppercase tracking-wider">
                    Add to Home Screen
                  </p>
                </div>
                <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  Install Instorix for free
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                  Fast access, works offline, no browser UI clutter.
                </p>

                {/* iOS manual instructions */}
                {platform === "ios" && (
                  <div className="mt-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                      <span className="inline-flex items-center gap-1">
                        1. Tap <Share className="w-3.5 h-3.5 text-blue-500 inline" /> Share
                      </span>
                      <br />
                      2. Scroll &amp; tap{" "}
                      <span className="font-semibold">&quot;Add to Home Screen&quot;</span>
                    </p>
                  </div>
                )}

                {/* Desktop instructions */}
                {platform === "desktop" && !deferredPrompt && (
                  <div className="mt-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                      Click <MoreVertical className="w-3 h-3 inline" /> in the address bar, then{" "}
                      <span className="font-semibold">&quot;Install Instorix&quot;</span>
                    </p>
                  </div>
                )}

                {/* Android / Desktop with prompt: direct install button */}
                {(platform === "android" || (platform === "desktop" && deferredPrompt)) && (
                  <button
                    onClick={handleInstall}
                    className="cursor-pointer mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-insta-orange via-insta-pink to-insta-purple hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Install App
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  className="cursor-pointer mt-2 w-full text-center text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  Maybe later
                </button>
              </div>

              {/* Close X */}
              <button
                onClick={handleDismiss}
                aria-label="Close install banner"
                className="cursor-pointer shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
